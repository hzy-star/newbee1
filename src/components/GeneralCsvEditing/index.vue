<template>
  <!-- 弹窗模式 -->
  <el-dialog
    v-if="isDialog"
    :model-value="innerVisible"
    :title="title || 'CSV 编辑'"
    width="80%"
    top="1vh"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="dialog-body">
      <CsvEditingContent v-model:path="innerPath" />
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 页面模式：直接渲染内容 -->
  <CsvEditingContent
    v-else
    v-model:path="innerPath"
  />
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import CsvEditingContent from './CsvEditingContent.vue'

const props = defineProps<{
  /** 展示模式：page = 普通页面；dialog = 弹窗 */
  mode?: 'page' | 'dialog'
  /** 弹窗模式下使用的 v-model:visible */
  visible?: boolean
  /** 初始 CSV 地址（两种模式都可用） */
  csvPath?: string
  /** 弹窗标题（仅 dialog 模式生效） */
  title?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'update:csvPath', v: string): void
}>()

const isDialog = computed(() => props.mode === 'dialog')

// 内部 visible，只在 dialog 模式有意义
const innerVisible = computed({
  get: () => props.visible ?? false,
  set: (v: boolean) => emit('update:visible', v),
})

// 内部 path，与外部 csvPath 同步（可选）
const innerPath = ref(props.csvPath || '')

watch(
  () => props.csvPath,
  v => {
    if (v !== undefined && v !== innerPath.value) {
      innerPath.value = v
    }
  },
  { immediate: true }
)

watch(innerPath, v => {
  emit('update:csvPath', v)
})

const handleClose = () => {
  innerVisible.value = false
}
</script>

<style scoped lang="scss">
.dialog-body {
  height: 80vh; /* 高度按浏览器 80% */
  display: flex;
  flex-direction: column;
}

</style>