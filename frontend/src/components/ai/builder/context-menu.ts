import { BaseSchemes } from 'rete';
import { RenderPreset } from 'rete-vue-render-plugin';
import { ContextMenuRender } from 'rete-vue-render-plugin/_types/presets/context-menu/types';
import ContextMenu from './components/context-menu/ContextMenu.vue';

export function setupContext<Schemes extends BaseSchemes, K extends ContextMenuRender>(props?: {
  delay?: number;
}): RenderPreset<Schemes, K> {
  const delay = typeof props?.delay === 'undefined' ? 1000 : props.delay;

  return {
    update(context) {
      if (context.data.type === 'contextmenu') {
        return {
          items: context.data.items,
          delay,
          searchBar: context.data.searchBar,
          onHide: context.data.onHide
        };
      }
    },
    render(context) {
      if (context.data.type === 'contextmenu') {
        return {
          component: ContextMenu,
          props: {
            items: context.data.items,
            delay,
            searchBar: context.data.searchBar,
            onHide: context.data.onHide
          }
        };
      }
    }
  };
}
