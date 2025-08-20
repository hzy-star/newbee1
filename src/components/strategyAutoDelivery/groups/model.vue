<template>
  <el-dialog v-model="dialogVisible" :title="title" width="600px" :before-close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="Group名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入Group名称" :disabled="isView" />
      </el-form-item>

      <el-form-item label="操作符">
        <el-select v-model="formData.operator" :disabled="isView">
          <el-option label=">" value="big" />
          <el-option label="<" value="small" />
          <el-option label="=" value="equal" />
        </el-select>
      </el-form-item>

      <el-form-item label="返回类型" prop="returnType">
        <el-select v-model="formData.returnType" placeholder="请选择返回类型" :disabled="isView" @change="returnTypeHand">
          <el-option label="RANK" value="rank" />
          <el-option label="FLAG" value="flag" />
          <el-option label="SCORE" value="score" />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" :disabled="isView">
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
        </el-select>
      </el-form-item>

      <el-form-item label="截止值" prop="cutoff">
        <el-input v-model="formData.cutoff" type="number" placeholder="请输入截止值" :disabled="isView" />
      </el-form-item>

      <el-form-item label="公式" prop="formula">
        <el-select v-model="formData.formula" :disabled="isView">
          <el-option label="and" value="and" :disabled="formData.returnType != 'flag'" />
          <el-option label="or" value="or" :disabled="formData.returnType != 'flag'" />
          <el-option label="min" value="min" :disabled="formData.returnType === 'flag'" />
          <el-option label="max" value="max" :disabled="formData.returnType === 'flag'" />
          <el-option label="avg" value="avg" :disabled="formData.returnType === 'flag'" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="是否落盘" prop="writeToDisk">
        <el-select v-model="formData.writeToDisk" :disabled="isView">
          <el-option label="是" value="y" />
          <el-option label="否" value="n" />
        </el-select>
      </el-form-item> -->

      <!-- 策略 + 阈值绑定（放到 formData.strategySelections 里，方便 rules 校验） -->
      <el-form-item label="策略与阈值" prop="strategySelections">
        <el-table :data="formData.strategySelections" border style="width: 100%">
          <el-table-column label="策略" prop="strategyId">
            <template #default="{ row }">
              <el-select v-model="row.strategyId" placeholder="选择策略" :disabled="isView" style="width: 100%">
                <el-option
                  v-for="strategy in strategiesList"
                  :key="strategy.id"
                  :label="strategy.name"
                  :value="String(strategy.id)"
                  :disabled="isStrategyDisabled(strategy.id, row)"
                />
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="阈值" prop="thresholdId">
            <template #default="{ row }">
              <el-select v-model="row.thresholdId" placeholder="可选阈值" clearable :disabled="isView" style="width: 100%">
                <el-option
                  v-for="th in thresholdStore.ThresholdList"
                  :key="th.id"
                  :label="th.name"
                  :value="String(th.id)"
                />
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="100" v-if="!isView">
            <template #default="{ $index }">
              <el-button type="danger" text @click="formData.strategySelections.splice($index, 1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" text @click="addStrategyRow" v-if="!isView">+ 添加策略</el-button>
      </el-form-item>
    </el-form>

    <template #footer v-if="!isView">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading">保存</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { reqStrategyList } from '@/api/strategyAutoDelivery/strategyPage/index'
import { reqCreateOrUpdate } from '@/api/strategyAutoDelivery/groups'
import { ThresholdPinia } from '@/store/strategyAutoDelivery/threshold'

// 一刀切 any，眼不见为净
const thresholdStore: any = ThresholdPinia()

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: '' },
  form: { type: Object as () => any, default: () => ({}) },
  isView: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'submit'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref<any>(null)
const submitLoading = ref<boolean>(false)

// 把 strategySelections 放到 formData 里，便于 rules 直接校验
const formData = ref<any>({
  operator: 'big',
  returnType: 'rank',
  status: 'enabled',
  cutoff: 0,
  // writeToDisk: 'n',
  strategySelections: [] as any[],
  ...props.form
})

const strategiesList = ref<any[]>([])

const formRules: any = {
  name: [{ required: true, message: '请输入Group名称', trigger: 'blur' }],
  returnType: [{ required: true, message: '请输入返回类型', trigger: 'change' }],
  formula: [{ required: true, message: '请输入公式', trigger: 'change' }],
  // writeToDisk: [{ required: true, message: '请选择是否落盘', trigger: 'change' }],
  strategySelections: [
    {
      required: true,
      validator: (_rule: any, value: any[], callback: any) => {
        if (!value || value.length === 0) {
          return callback(new Error('请至少选择一个策略'))
        }
        const ids = value.map((s: any) => s.strategyId).filter((v: any) => !!v)
        const set = new Set(ids)
        if (ids.length !== set.size) {
          return callback(new Error('不能选择重复的策略'))
        }
        callback()
      },
      trigger: 'change'
    }
  ]
}

const getStrategiesList = async () => {
  try {
    const response: any = await reqStrategyList()
    strategiesList.value = response?.data || []
  } catch (_e) {
    ElMessage.error('获取策略列表失败')
  }
}

const addStrategyRow = () => {
  formData.value.strategySelections.push({ strategyId: '', thresholdId: undefined })
}

const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields?.()
  formData.value = {
    operator: 'big',
    returnType: 'rank',
    status: 'enabled',
    cutoff: 0,
    // writeToDisk: 'n',
    strategySelections: []
  }
}

const isStrategyDisabled = (id: any, row: any) => {
  const sid = String(id)
  return formData.value.strategySelections.some((item: any) => item !== row && String(item.strategyId) === sid)
}

const handleSubmit = async () => {
  try {
    submitLoading.value = true
    const valid = await formRef.value?.validate?.()
    if (!valid) return

    // 拼接 strategyIds: "1:1,2:2,3,4:4"
    const parts = (formData.value.strategySelections || []).map((item: any) =>
      item.thresholdId ? `${item.strategyId}:${item.thresholdId}` : String(item.strategyId)
    )
    const formToSubmit: any = {
      ...formData.value,
      strategyIds: parts.join(',')
    }

    const response: any = await reqCreateOrUpdate(formToSubmit)
    if (response?.code === 200 || response?.success === true) {
      ElMessage.success(`${props.title}成功`)
      emit('submit')
      handleClose()
    } else {
      ElMessage.error(response?.errMsg || `${props.title}失败`)
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error(`${props.title}失败`)
  } finally {
    submitLoading.value = false
  }
}

// 回显与打开弹窗逻辑
watch(
  () => props.form,
  (newVal: any) => {
    formData.value = {
      operator: 'big',
      returnType: 'rank',
      status: 'enabled',
      cutoff: 0,
      // writeToDisk: 'n',
      strategySelections: [],
      ...newVal
    }
    if (newVal?.strategyIds) {
      formData.value.strategySelections = String(newVal.strategyIds)
        .split(',')
        .filter((s: string) => s !== '')
        .map((str: string) => {
          const [sid, tid] = str.split(':')
          return { strategyId: sid, thresholdId: tid }
        })
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => props.modelValue,
  (val: boolean) => {
    if (val) getStrategiesList()
  }
)

const returnTypeHand = (val: string) => {
  formData.value.formula = val === 'flag' ? 'and' : 'min'
}
</script>
