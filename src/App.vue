<script setup lang="ts">
import { RouterView } from 'vue-router';
import { onMounted } from 'vue';
import useLayOutSettingStore from '@/store/modules/setting';
import { VxeUI } from 'vxe-table';

// 应用启动时恢复暗黑模式
onMounted(() => {
  const settingStore = useLayOutSettingStore();
  if (settingStore.dark) {
    document.documentElement.className = 'dark';
    VxeUI.setTheme('dark');
  }
});
</script>

<template>
  <RouterView />
</template>

<style scoped lang="scss"></style>
