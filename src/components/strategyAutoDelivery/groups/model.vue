<template>
  <el-dialog v-model="dialogVisible" :title="title" width="800px" :before-close="handleClose">
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

      <el-form-item label="是否落盘" prop="groupType">
        <el-select v-model="formData.groupType" :disabled="isView">
          <el-option label="是" value="writeToDisk" />
          <el-option label="否" value="normal" />
        </el-select>
      </el-form-item>

      <!-- 实时/离线 -->
      <el-form-item label="设备来源" prop="deviceSource">
        <el-select v-model="formData.deviceSource" :disabled="isView">
          <el-option label="离线" value="offline" />
          <el-option label="实时" value="online" />
        </el-select>
      </el-form-item>

      <!-- 策略 + 阈值绑定（放到 formData.strategySelections 里，方便 rules 校验） -->
      <el-form-item label="策略与阈值" prop="strategySelections">
        <el-table :data="formData.strategySelections" border style="width: 100%">
          <el-table-column label="策略" prop="strategyId">
            <template #default="{ row }">
              <el-tooltip :content="getStrategyLabel(row.strategyId)" placement="top">
                <el-select v-model="row.strategyId" placeholder="选择策略" :disabled="isView" style="width: 100%">
                  <el-option
                    v-for="strategy in strategiesForUI"
                    :key="strategy.id"
                    :label="strategy.name"
                    :value="String(strategy.id)"
                    :disabled="strategy.__disabled || isStrategyDisabled(strategy.id, row)"
                  />
                </el-select>
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column label="阈值" prop="thresholdId">
            <template #default="{ row }">
              <el-tooltip :content="getThresholdLabel(row.thresholdId)" placement="top">
                <el-select v-model="row.thresholdId" placeholder="可选阈值" clearable :disabled="isView" style="width: 100%">
                  <el-option v-for="th in thresholdStore.ThresholdList" :key="th.id" :label="th.name" :value="String(th.id)" />
                </el-select>
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column prop="leftRank">
            <template #header>
              <span class="col-label">
                leftRank
                <el-tooltip content="Rank压缩值" placement="top">
                  <el-icon class="tip-icon">
                    <WarningFilled />
                  </el-icon>
                </el-tooltip>
              </span>
            </template>
            <template #default="{ row }">
              <el-input v-model="row.leftRank" placeholder="leftRank" :disabled="isView" style="width: 100%" />
            </template>
          </el-table-column>

          <el-table-column prop="rightRank">
            <template #header>
              <span class="col-label">
                rightRank
                <el-tooltip content="Rank压缩值" placement="top">
                  <el-icon class="tip-icon">
                    <WarningFilled />
                  </el-icon>
                </el-tooltip>
              </span>
            </template>
            <template #default="{ row }">
              <el-input v-model="row.rightRank" placeholder="rightRank" :disabled="isView" style="width: 100%" />
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
import { ref, watch, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { reqStrategyList } from '@/api/strategyAutoDelivery/strategyPage/index'
import { reqCreateOrUpdate } from '@/api/strategyAutoDelivery/groups'
import { ThresholdPinia } from '@/store/strategyAutoDelivery/threshold'
import { WarningFilled } from '@element-plus/icons-vue'

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
  groupType: 'normal',
  deviceSource: 'offline',
  strategySelections: [] as any[],
  ...props.form
})

const strategiesList = ref<any[]>([])          // 当前用于展示的（按设备来源过滤）
const allStrategies = ref<any[]>([])           // 全量列表（用于 label 映射、合并已选项）

const formRules: any = {
  name: [{ required: true, message: '请输入Group名称', trigger: 'blur' }],
  returnType: [{ required: true, message: '请输入返回类型', trigger: 'change' }],
  formula: [{ required: true, message: '请输入公式', trigger: 'change' }],
  groupType: [{ required: true, message: '请选择是否落盘', trigger: 'blur' }],
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
        // 2. 每行校验 leftRank / rightRank
        for (let i = 0; i < value.length; i++) {
          const row = value[i]
          const lr = row.leftRank
          const rr = row.rightRank
          const hasL = lr !== '' && lr !== undefined && lr !== null
          const hasR = rr !== '' && rr !== undefined && rr !== null
          if (hasL || hasR) {
            // 必须两者都填写
            if (!hasL || !hasR) {
              return callback(new Error(`第 ${i + 1} 行：leftRank 和 rightRank 需要同时填写`))
            }
            // 数字 & 范围
            const lrNum = Number(lr)
            const rrNum = Number(rr)
            if (!Number.isInteger(lrNum) || !Number.isInteger(rrNum)) {
              return callback(new Error(`第 ${i + 1} 行：leftRank / rightRank 需为整数`))
            }
            if (lrNum < 1 || lrNum > 100 || rrNum < 1 || rrNum > 100) {
              return callback(new Error(`第 ${i + 1} 行：leftRank / rightRank 需在 1-100 范围内`))
            }
            if (lrNum > rrNum) {
              return callback(new Error(`第 ${i + 1} 行：leftRank 不可大于 rightRank`))
            }
          }
        }
        callback()
      },
      trigger: 'change'
    }
  ]
}

// 
const getStrategiesList = async () => {
  try {
    const response: any = await reqStrategyList()
    allStrategies.value = response?.data || []
    applyDeviceFilter() // 拉取后按当前设备来源过滤
  } catch (_e) {
    ElMessage.error('获取策略列表失败')
  }
}
// 设备来源过滤 + 清理不合法选择（可选）
const applyDeviceFilter = () => {
  const ds = formData.value.deviceSource
  const list = ds ? allStrategies.value.filter((s: any) => s.deviceSource === ds) : allStrategies.value
  strategiesList.value = list

  // 如果不想清理已选中但不在当前过滤集的项，可以注释掉下面逻辑
  const validIds = new Set(list.map((s: any) => String(s.id)))
  formData.value.strategySelections.forEach((row: any) => {
    if (row.strategyId && !validIds.has(String(row.strategyId))) {
      row.strategyId = ''
      row.thresholdId = undefined
      row.leftRank = ''
      row.rightRank = ''
    }
  })
}

// UI 用的 options：在过滤结果前面合并“当前已选但不在过滤集”的项（禁用显示）
const strategiesForUI = computed(() => {
  const ds = formData.value.deviceSource
  const filtered = ds ? allStrategies.value.filter((s: any) => s.deviceSource === ds) : allStrategies.value

  const selectedIds = new Set(
    (formData.value.strategySelections || []).map((s: any) => String(s.strategyId)).filter(Boolean)
  )
  const missing = allStrategies.value
    .filter((s: any) => selectedIds.has(String(s.id)) && !filtered.some((f: any) => String(f.id) === String(s.id)))
    .map((m: any) => ({ ...m, __disabled: true }))

  return [...missing, ...filtered]
})

// 选择变化时自动过滤（双保险）
watch(() => formData.value.deviceSource, () => applyDeviceFilter())

const addStrategyRow = () => {
  formData.value.strategySelections.push({
    strategyId: '',
    thresholdId: undefined,
    leftRank: '',
    rightRank: ''
  })
}

const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields?.()
  formData.value = {
    operator: 'big',
    returnType: 'rank',
    status: 'enabled',
    cutoff: 0,
    groupType: 'normal',
    deviceSource: 'offline',
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

    // 拼接 strategyIds: 支持 三种：sid、sid:tid、sid:tid:left:right、sid::left:right
    const parts = (formData.value.strategySelections || []).map((item: any) => {
      const hasL = item.leftRank !== '' && item.leftRank !== undefined && item.leftRank !== null
      const hasR = item.rightRank !== '' && item.rightRank !== undefined && item.rightRank !== null
      const bothRank = hasL && hasR
      let seg = String(item.strategyId)

      if (item.thresholdId && !bothRank) {
        seg += `:${item.thresholdId}`
      } else if (item.thresholdId && bothRank) {
        seg += `:${item.thresholdId}:${item.leftRank}:${item.rightRank}`
      } else if (!item.thresholdId && bothRank) {
        seg += `::${item.leftRank}:${item.rightRank}`
      }
      return seg
    })
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
      groupType: 'normal',
      deviceSource: 'offline',
      strategySelections: [],
      ...newVal
    }
    if (newVal?.strategyIds) {
      formData.value.strategySelections = String(newVal.strategyIds)
        .split(',')
        .filter((s: string) => s !== '')
        .map((str: string) => {
          const arr = str.split(':')
          if (arr.length === 1) {
            return { strategyId: arr[0], thresholdId: undefined, leftRank: '', rightRank: '' }
          } else if (arr.length === 2) {
            return { strategyId: arr[0], thresholdId: arr[1], leftRank: '', rightRank: '' }
          } else if (arr.length === 4) {
            return { strategyId: arr[0], thresholdId: arr[1], leftRank: arr[2], rightRank: arr[3] }
          } else {
            return { strategyId: arr[0], thresholdId: arr[1], leftRank: '', rightRank: '' }
          }
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

// 兼容“组件初次挂载时弹窗已是打开态”的情况
onMounted(() => {
  if (props.modelValue) getStrategiesList()
})

const returnTypeHand = (val: string) => {
  formData.value.formula = val === 'flag' ? 'and' : 'min'
}

// helper: label 用全量列表找，避免过滤后 tooltip 为空
const getStrategyLabel = (id: any) => {
  if (!id) return ''
  const s = allStrategies.value.find((it: any) => String(it.id) === String(id))
  return s ? s.name : ''
}

const getThresholdLabel = (id: any) => {
  if (!id) return ''
  const th = (thresholdStore.ThresholdList || []).find((it: any) => String(it.id) === String(id))
  return th ? th.name : ''
}
</script>

<style scoped>
.col-label {
  display: inline-flex;
  align-items: center;
}
.tip-icon {
  margin-left: 4px;
  font-size: 14px;
  cursor: pointer;
  color: #e6a23c;
}
</style>