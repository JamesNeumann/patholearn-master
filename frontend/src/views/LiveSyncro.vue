<script setup lang="ts">
import { onMounted } from 'vue';
import { usePresenceChannel } from '../composables/ws/usePresenceChannel';
import MouseCursors from '../components/ai/MouseCursors.vue';
import ContentContainer from '../components/containers/ContentContainer.vue';
import LockableInput from '../components/ws/LockableInput.vue';
import UserList from '../components/ws/UserList.vue';

import { getTextColor } from '../utils/colors';
import { useService } from '../composables/useService';
import { AiService } from '../services/ai.service';

const { channel, me, isConnected, members, connect } = usePresenceChannel('live');

const { result: state, loading, run } = useService(AiService.getBuilderState);

onMounted(async () => {
  await run();
  connect();
});
</script>
<template>
  <content-container :loading="loading">
    <template #header> Live Synchronisierung </template>
    <template #content>
      <div class="flex flex-col">
        <user-list :members="members" :me="me"></user-list>

        <div class="w-full h-96 rounded-2xl overflow-hidden">
          <mouse-cursors
            v-if="channel && me"
            :channel="channel"
            :members="members"
            :me="me"
            :rate-limit="50"
          ></mouse-cursors>
        </div>

        <div v-if="channel && me && state">
          <div v-for="field in state.fields">
            <lockable-input
              :type="field.type"
              :initial-value="field.value"
              :initial-locked-by="field.lockedBy"
              :id="field.id"
              :channel="channel"
              :me="me"
              :members="members"
              :label="field.label"
              :tip="field.tip"
            ></lockable-input>
          </div>
        </div>
      </div>
    </template>
  </content-container>
</template>
