from typing import List, Union
from app.core.parse_layer import (
    Add,
    parse_add_layer,
    parse_concatenate_layer,
    parse_layer,
)
import networkx as nx
from app.core.parse_graph import AddNode, ConcatenateNode, DatasetNode, OutputNode
from app.utils.logger import logger
import torch


def get_classification_model(
    graph: nx.DiGraph,
    path: List[Union[str, dict]],
    dataset_node: DatasetNode,
    output_node: OutputNode,
):
    input_data_shape = (
        output_node.batch_size,
        dataset_node.channels,
        dataset_node.dimension.x,
        dataset_node.dimension.y,
    )

    result, result_strings, in_channels, layer_data = parse_network(
        path, graph, dataset_node.channels, layer_data_shape=input_data_shape
    )

    return torch.nn.Sequential(*result), result_strings


def parse_network(network, graph: nx.DiGraph, in_channels, layer_data_shape):
    layers = []
    layer_strings = []
    current_in_channels = in_channels
    current_shape = layer_data_shape

    for element in network:
        if isinstance(element, dict):
            for node_id, paths in element.items():
                node_data = graph.nodes[node_id]["data"]
                (
                    splitting_layer_data,
                    splitting_in_channels,
                    splitting_shape,
                ) = parse_layer(node_data, current_in_channels, current_shape)
                if splitting_layer_data is not None:
                    layers += splitting_layer_data
                    for layer in splitting_layer_data:
                        layer_strings.append("torch.nn." + str(layer))

                path_layers = []
                combined_in_channels = 0
                for path in paths["paths"]:
                    path_in_channels = current_in_channels
                    path_shape = current_shape
                    (
                        path_layer,
                        path_layer_strings,
                        new_in_channels,
                        new_shape,
                    ) = parse_network(
                        path, graph, splitting_in_channels, splitting_shape
                    )
                    path_layers.append(torch.nn.Sequential(*path_layer))
                    seq_string = "torch.nn.Sequential(\n"
                    for layer in path_layer:
                        if isinstance(layer, Add):
                            prefix = ""
                        else:
                            prefix = "torch.nn."
                        seq_string += "    " + prefix + str(layer) + ",\n"
                    seq_string += ")"

                    combined_in_channels += new_in_channels
                combine_node_id = paths["combine"]

                combine_node_data = graph.nodes[combine_node_id]["data"]
                if isinstance(combine_node_data, AddNode):
                    combined_layer, channels, shape = parse_add_layer(
                        path_layers, splitting_shape
                    )
                if isinstance(combine_node_data, ConcatenateNode):
                    logger.debug(f"New shape before concat: {new_shape}")
                    combined_layer, channels, shape = parse_concatenate_layer(
                        path_layers, splitting_shape
                    )
                    logger.debug(f"New shape after concat: {shape}")

                current_in_channels = channels
                current_shape = shape
                layers.append(combined_layer)
                layer_strings.append(str(combined_layer))
                # current_in_channels = combined_in_channels
                # current_shape = new_shape

        else:
            node_id = element
            node_data = graph.nodes[node_id]["data"]

            layer_data, current_in_channels, current_shape = parse_layer(
                node_data, current_in_channels, current_shape
            )

            if layer_data is not None:
                layers += layer_data
                for layer in layer_data:
                    layer_strings.append("torch.nn." + str(layer))

    return layers, layer_strings, current_in_channels, current_shape
