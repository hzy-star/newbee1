<template>
  <div class="qb-wrap">

    <div v-for="f in fields" :key="f.field" class="qb-row">

      <!-- 字段名 -->
      <div class="label">{{ f.label }}</div>

      <!-- 操作符 -->
      <el-select v-model="form[f.field].op" placeholder="操作符" style="width:120px">
        <el-option label="=" value="=" />
        <el-option label="!=" value="!=" />
        <el-option label="包含 (LIKE)" value="like" />
        <el-option label=">" value=">" />
        <el-option label="<" value="<" />
        <el-option label=">=" value=">=" />
        <el-option label="<=" value="<=" />
      </el-select>

      <!-- 值 -->
      <el-input
        v-model="form[f.field].value"
        placeholder="值"
        style="width:200px;margin-left:6px"
      />

    </div>

  </div>
</template>

<script setup>
import { reactive, watch } from "vue"

const props = defineProps({
  fields: { type: Array, required: true },      // 固定字段
  modelValue: { type: Object, default: () => ({}) }
})

const emits = defineEmits(["update:modelValue"])

// 初始化表单结构   { country: {op:"",value:""}, pkg:{...} }
const form = reactive({})

props.fields.forEach(f => {
  form[f.field] = props.modelValue[f.field]
    ? { ...props.modelValue[f.field] }
    : { op: "", value: "" }
})

// 每次改变都发给父组件
watch(
  form,
  () => {
    emits("update:modelValue", form)
  },
  { deep: true }
)
</script>

<style scoped>
.qb-row {
  display: flex;
  align-items: center;
  margin: 10px 0;
}
.label {
  width: 120px;
  font-weight: 600;
  color: #333;
}
</style>
