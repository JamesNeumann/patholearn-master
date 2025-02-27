<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { TooltipGenerator } from '../../utils/tooltips/tooltip-generator';
import ModalDialog from '../containers/ModalDialog.vue';
import InputField from '../form/InputField.vue';
import Icon from './Icon.vue';
import LazyImage from './LazyImage.vue';
import ConfirmButtons from './ConfirmButtons.vue';

const props = defineProps({
  index: Number,

  imgSrc: {
    type: String,
    required: true
  },
  image: {
    type: File
  },
  imageName: {
    type: String
  },
  preview: {
    type: Boolean,
    default: false
  },
  size: {
    type: [Number, String],
    default: 20
  }
});

const emit = defineEmits(['deleteImage', 'imageChanged']);

const showEdit = ref(false);

const splittedName = computed(() => {
  if (props.imageName || props.image) {
    const name = props.imageName ? props.imageName : props.image!.name;

    const arr = name.split('.');
    const extension = arr.pop();
    return [arr.join('.'), extension];
  } else {
    return '';
  }
});

const newImageName = ref(splittedName.value[0]);

const truncatedName = computed(() => {
  const concated = newImageName.value! + '.' + splittedName.value[1];
  const isLonger = concated.length > (props.size as number) - 6;

  return isLonger ? concated.substring(0, (props.size as number) - 6) + '...' : concated;
});

onMounted(() => {
  TooltipGenerator.addGeneralTooltip({
    target: `#previewImage-${props.index}`,
    content: props.imageName ? props.imageName : props.image!.name,
    placement: 'top',
    delay: [500, 0]
  });
});

const updateImage = () => {
  let image: any;
  if (props.imageName) {
    image = newImageName.value + '.' + splittedName.value[1];
  } else {
    image = new File([props.image!], newImageName.value + '.' + splittedName.value[1], {
      type: props.image!.type,
      lastModified: props.image!.lastModified
    });
  }

  emit('imageChanged', {
    image: image,
    index: props.index
  });
  showEdit.value = false;
};
</script>
<template>
  <div class="flex flex-col justify-center items-center">
    <div class="flex justify-center items-center gap-4">
      <div :class="`h-${size} w-${size}`">
        <div class="h-full">
          <lazy-image
            v-viewer
            :imageClasses="'h-full w-full object-cover cursor-pointer'"
            :imageUrl="imgSrc"
          ></lazy-image>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div
          class="bg-gray-600 hover:bg-gray-500 p-1 rounded-md cursor-pointer hover:ring-2 ring-gray-100 transition-all"
          @click="$emit('deleteImage')"
        >
          <Icon class="text-red-500" name="trash"></Icon>
        </div>
        <div
          class="bg-gray-600 hover:bg-gray-500 p-1 rounded-md cursor-pointer hover:ring-2 ring-gray-100 transition-all"
        >
          <Icon
            class="text-white"
            name="pencil"
            @click="
              showEdit = true;
              newImageName = splittedName[0] || '';
            "
          ></Icon>
        </div>
      </div>
    </div>
    <p :id="`previewImage-${index}`" class="mt-1 select-none">{{ truncatedName }}</p>
  </div>

  <modal-dialog :show="showEdit" customClasses="w-[30rem]">
    <h2 class="text-3xl">Bild bearbeiten</h2>

    <input-field v-model="newImageName" :required="true" label="Bildname" type="text"></input-field>
    <confirm-buttons
      confirm-text="Speichern"
      reject-text="Abbrechen"
      @confirm="updateImage"
      @reject="
        showEdit = false;
        newImageName = splittedName[0];
      "
    ></confirm-buttons>
  </modal-dialog>
</template>
