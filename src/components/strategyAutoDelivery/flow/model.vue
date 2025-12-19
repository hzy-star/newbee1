<template>
  <el-dialog v-model="dialogVisible" :title="title" width="800px" top="6vh" :before-close="handleClose">
    <div class="right-panel">
      <div class="flow-form-container">
        <el-form ref="formRef" :model="flowForm" :rules="rules" label-width="120px" size="large">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Flow名称" prop="name">
                <el-input v-model="flowForm.name" placeholder="请输入Flow名称" :disabled="isView || editView" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-select v-model="flowForm.status" style="width: 100%" :disabled="isView">
                  <el-option label="启用" value="enabled" />
                  <el-option label="禁用" value="disabled" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="公式配置" prop="formulaConfigs">
            <div class="formula-configs-container">
              <div class="formula-configs" :class="{ 'has-scroll': formulaConfigs.length > 3 }">
                <div v-for="(config, index) in formulaConfigs" :key="index" class="formula-config-item">
                  <el-row :gutter="24">
                    <el-col :span="7">
                      <!-- 关键点：当用户手动修改 formula 时，立即与 group 解绑（删除 groupId） -->
                      <el-input
                        v-model="config.formula"
                        placeholder="公式"
                        size="small"
                        :disabled="isView"
                        @input="onFormulaChanged(index)"
                      />
                    </el-col>
                    <el-col :span="4">
                      <el-select v-model="config.operator" placeholder="操作符" size="small" style="width: 100%" :disabled="isView">
                        <el-option label=">" value="big" />
                        <el-option label="<" value="small" />
                        <el-option label="=" value="equal" />
                      </el-select>
                    </el-col>
                    <el-col :span="9">
                      <el-input-number v-model="config.cutoff" placeholder="截止值" size="small" style="width: 100%" :disabled="isView" />
                    </el-col>
                  </el-row>
                  <el-row :gutter="24" justify="end">
                    
                    <el-col :span="9">
                      <el-select v-model="config.thresholdId" placeholder="阈值配置" size="small" style="width: 100%" :disabled="isView" clearable filterable>
                        <el-option v-for="item in thresholdList" :key="item.id" :label="item.name" :value="item.id" />
                      </el-select>
                    </el-col>
                    <el-col :span="4" v-if="!isView">
                      <el-button v-if="index === formulaConfigs.length - 1" type="primary" size="small" @click="addFormulaConfig" circle>
                        <el-icon><Plus /></el-icon>
                      </el-button>
                      <el-button v-if="formulaConfigs.length > 1" type="danger" size="small" @click="removeFormulaConfig(index)" circle>
                        <el-icon><Minus /></el-icon>
                      </el-button>
                    </el-col>
                  </el-row>
                  <div v-if="(config as any).groupId !== undefined" style="margin-top: 4px; color: #909399; font-size: 12px;">
                    自动生成（Group ID: {{ (config as any).groupId }}）
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="是否落盘" prop="flowType">
            <el-select v-model="flowForm.flowType" :disabled="isView">
              <el-option label="是" value="writeToDisk" />
              <el-option label="否" value="normal" />
            </el-select>
          </el-form-item>

          <el-form-item label="同异步策略" prop="syncFile">
            <el-select v-model="flowForm.syncFile" placeholder="选择同异步策略" :disabled="isView" filterable >
              <el-option v-for="item in syncFileOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>

          <!-- 实时/离线 -->
          <el-form-item label="设备来源" prop="deviceSource">
            <el-select v-model="flowForm.deviceSource" :disabled="isView">
              <el-option label="离线" value="offline" />
              <el-option label="实时" value="online" />
            </el-select>
          </el-form-item>
          <el-form-item label="事件类型" prop="eventType">
              <el-select v-model="flowForm.eventType" placeholder="请选择事件类型" :disabled="true">
                <el-option label="点击" value="click" />
                <el-option label="展示" value="imp" />
                <el-option label="全部" value="all" />
              </el-select>
          </el-form-item>

          <el-form-item label="关联Groups">
            <el-select
              v-model="flowForm.strategyGroupIds"
              multiple
              placeholder="选择Groups"
              :disabled="isView"
              style="width: 100%; margin-top: 10px;"
              filterable
            >
              <el-option v-for="group in strategyList" :key="group.id" :label="group.name" :value="group.id" />
            </el-select>
          </el-form-item>

          <!-- 描述 -->
          <el-form-item label="描述" prop="description">
            <el-input type="textarea" v-model="flowForm.description" placeholder="请输入描述" :disabled="isView" />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer v-if="!isView">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { reqCreateOrUpdatFlow } from '@/api/strategyAutoDelivery/flow'
import type { Flows } from '@/api/strategyAutoDelivery/flow/type'
import { reqStrategyGroupList } from '@/api/strategyAutoDelivery/groups'
import type { StrategyThreshold } from '@/api/strategyAutoDelivery/threshold/type'
import { ThresholdPinia } from '@/store/strategyAutoDelivery/threshold'
import { reqStrategyList } from '@/api/strategyAutoDelivery/strategyPage/index'

const thresholdStore = ThresholdPinia()

type OperatorValue = 'big' | 'small' | 'equal'
interface FormulaConfig {
  formula: string
  cutoff: number
  operator: OperatorValue
  thresholdId: string | number | ''
  groupId?: number // 仅自动添加的配置拥有，用于与 group 关联
}

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: '' },
  form: { type: Object as () => Partial<Flows>, default: () => ({}) },
  isView: { type: Boolean, default: false },
  editView: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'submit'])

// 表单相关
const formRef = ref<FormInstance>()
const flowForm = ref<Partial<Flows>>({
  name: '',
  status: 'enabled',
  strategyGroupIds: [],
  formula: '',
  flowType: 'normal',
  syncFile: '',
  description: '',
  deviceSource: 'online',
  eventType: props.form.eventType
})

const DEFAULT_CONFIG = (): FormulaConfig => ({
  formula: '',
  cutoff: 70,
  operator: 'big',
  thresholdId: ''
})

const formulaConfigs = ref<FormulaConfig[]>([
  DEFAULT_CONFIG()
])

// 程序化更新保护（用于避免在我们自动写入时被当作“手动修改”）
const programmaticUpdating = ref(false)

// 记录“用户手动删除”的自动生成配置对应的 groupId：
// 仅在该 group 保持选中期间抑制再次自动添加；一旦取消该 group 的选中，将清除此记录。
const removedAutoGroups = ref<Set<number>>(new Set())

// 表单验证规则
const rules = ref<FormRules>({
  name: [
    { required: true, message: '请输入Flow名称', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const v = String(value ?? '').trim()
        if (!v.startsWith('alg')) {
          callback(new Error('Flow名称必须以 alg 开头'))
          return
        }
        // 禁止中文字符和下划线
        if (/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF_]/.test(v)) {
          callback(new Error('不能包含中文字符和下划线（可含字母/数字/符号）'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  formulaConfigs: [
    {
      validator: (rule, value, callback) => {
        if (formulaConfigs.value.length === 0) {
          callback(new Error('至少需要添加一个公式'))
          return
        }
        if (formulaConfigs.value.some(item => !String(item.formula ?? '').trim())) {
          callback(new Error('所有公式不能为空'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ],
  strategyGroupIds: [
    {
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('至少需要选择一个Group'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  flowType: [{ required: true, message: '请选择是否落盘', trigger: 'blur' }],
  syncFile: [
    {
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('至少需要选择一个同异步策略'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
})

// 动态配置项操作
const addFormulaConfig = () => {
  formulaConfigs.value.push(DEFAULT_CONFIG())
}

const removeFormulaConfig = (index: number) => {
  const target = formulaConfigs.value[index] as FormulaConfig
  // 若删除的是自动生成项，则记录该 groupId（仅在依然选中时抑制自动回填）
  if (target && typeof (target as any).groupId === 'number') {
    removedAutoGroups.value.add((target as any).groupId as number)
  }
  formulaConfigs.value.splice(index, 1)
  // 保底：确保至少留一条默认配置
  if (formulaConfigs.value.length === 0) {
    formulaConfigs.value.push(DEFAULT_CONFIG())
  }
}

// 手动修改 formula 时，解除和 group 的绑定（删除 groupId）
const onFormulaChanged = (index: number) => {
  if (programmaticUpdating.value) return
  const cfg = formulaConfigs.value[index]
  if (!cfg) return
  if (typeof (cfg as any).groupId === 'number') {
    delete (cfg as any).groupId
  }
}

// 工具函数
const normalizeOperator = (op: any): OperatorValue => {
  const o = String(op ?? '').toLowerCase()
  if (o === 'big' || o === '>' || o === 'gt') return 'big'
  if (o === 'small' || o === '<' || o === 'lt') return 'small'
  if (o === 'equal' || o === '=' || o === 'eq') return 'equal'
  return 'big'
}
const isDefaultEmptyConfig = (cfg: FormulaConfig) => {
  return (
    cfg.groupId === undefined &&
    (!String(cfg.formula ?? '').trim()) &&
    (cfg.thresholdId === '' || cfg.thresholdId === undefined || cfg.thresholdId === null)
  )
}

// 表单提交
const handleSubmit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return

    if (formulaConfigs.value.length === 0) {
      ElMessage.warning('至少需要添加一个公式')
      return
    }
    if (formulaConfigs.value.some(item => !String(item.formula ?? '').trim())) {
      ElMessage.warning('公式不能为空')
      return
    }
    if (formulaConfigs.value.some(item => item.cutoff === undefined || item.cutoff === null)) {
      ElMessage.warning('截止值不能为空')
      return
    }
    if (!flowForm.value.strategyGroupIds || flowForm.value.strategyGroupIds.length === 0) {
      ElMessage.warning('至少需要选择一个Group')
      return
    }
    if (!flowForm.value.syncFile || (flowForm.value.syncFile as any).length === 0) {
      ElMessage.warning('至少需要选择一个同异步策略')
      return
    }

    // 提交时去掉 groupId 字段
    const submitFormula = formulaConfigs.value.map(({ groupId, ...rest }) => rest)

    const submitData = {
      id: flowForm.value.id,
      name: flowForm.value.name,
      status: flowForm.value.status,
      flowType: flowForm.value.flowType,
      formula: JSON.stringify(submitFormula),
      strategyGroupIds: flowForm.value.strategyGroupIds?.join(',') || '',
      syncFile: flowForm.value.syncFile,
      description: flowForm.value.description,
      deviceSource: flowForm.value.deviceSource,
      eventType: props.form.eventType
    }

    const response = await reqCreateOrUpdatFlow(submitData)
    if (response.success === true) {
      ElMessage.success('保存成功')
      emit('submit')
      handleClose()
    }else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error:any) {
    console.error('保存失败:', error.message)
    ElMessage.error('保存失败')
  }
}

// 获取groups列表
const strategyList = ref<Array<{ id: number; name: string }>>([])
const allStrategies = ref<any[]>([]) // 全量（用于过滤和映射）
const groupsLoaded = ref(false) // 选项是否已加载（用于 watcher 护栏）

const getGroupsList = async () => {
  groupsLoaded.value = false
  const response = await reqStrategyGroupList({ eventType: props.form.eventType })
  response.data = (response.data || []).filter((item: any) => item.status === 'enabled')
  allStrategies.value = response.data || []
  applyDeviceFilter()
  groupsLoaded.value = true
}

// 设备来源过滤 + 清理不合法选择
const applyDeviceFilter = () => {
  const ds = flowForm.value.deviceSource
  const list = ds ? allStrategies.value.filter((s: any) => s.deviceSource === ds) : allStrategies.value
  strategyList.value = list
  console.log('应用设备来源过滤，当前列表：', strategyList.value)
}

// 监听设备来源切换：过滤 group 选择，并清理对应的自动公式配置；同时释放 removedAutoGroups 记录
watch(
  () => flowForm.value.deviceSource,
  () => {
    const before = new Set<number>(flowForm.value.strategyGroupIds || [])
    applyDeviceFilter()
    if (!groupsLoaded.value) return

    // 过滤不可用的 groups
    const allowedIds = new Set<number>(strategyList.value.map((g: any) => g.id))
    const afterIds = (flowForm.value.strategyGroupIds || []).filter((id: number) => allowedIds.has(id))
    flowForm.value.strategyGroupIds = afterIds

    // 清理因设备来源切换导致的无效 group 的自动公式配置
    const removedDueToDevice = [...before].filter(id => !allowedIds.has(id))
    if (removedDueToDevice.length) {
      // 同时释放这些 group 的“手动删除抑制”记录，使得重新选中时可再自动添加
      removedDueToDevice.forEach(id => removedAutoGroups.value.delete(id))

      programmaticUpdating.value = true
      try {
        const after = formulaConfigs.value.filter(cfg => !removedDueToDevice.includes((cfg as any).groupId as number))
        formulaConfigs.value = after.length ? after : [DEFAULT_CONFIG()]
      } finally {
        programmaticUpdating.value = false
      }
    }

    // 可选：清理校验提示
    formRef.value?.clearValidate?.(['strategyGroupIds'])
  }
)

// 初始化表单数据
watch(
  () => props.form,
  async (newVal) => {
    // 重置“手动删除”的记录
    removedAutoGroups.value = new Set<number>()

    flowForm.value = {
      ...newVal,
      strategyGroupIds: newVal.strategyGroupIds ? String(newVal.strategyGroupIds).split(',').map(Number) : [],
      deviceSource: newVal.deviceSource || 'online'
    }

    programmaticUpdating.value = true
    try {
      if (newVal.formula) {
        try {
          const parsed = JSON.parse(newVal.formula) as Partial<FormulaConfig>[]
          formulaConfigs.value = (parsed || []).map((c) => ({
            formula: String(c.formula ?? ''),
            cutoff: Number(c.cutoff ?? 70),
            operator: normalizeOperator((c as any).operator),
            thresholdId: (c as any).thresholdId ?? '',
            // 历史数据无 groupId，为手动/未知来源配置
          }))
          if (formulaConfigs.value.length === 0) {
            formulaConfigs.value = [DEFAULT_CONFIG()]
          }
        } catch {
          formulaConfigs.value = [DEFAULT_CONFIG()]
        }
      } else {
        formulaConfigs.value = [DEFAULT_CONFIG()]
      }
    } finally {
      programmaticUpdating.value = false
    }
    console.log('当前公式配置：',formulaConfigs.value)
    await getGroupsList()
  },
  { immediate: true }
)

// 弹窗显隐
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields?.()
  flowForm.value = {
    id: undefined,
    name: '',
    status: '',
    flowType: '',
    formula: '',
    strategyGroupIds: [],
    syncFile: '',
    description: '',
    deviceSource: 'online',
    eventType: props.form.eventType
  }
  formulaConfigs.value = [DEFAULT_CONFIG()]
  removedAutoGroups.value = new Set<number>()
}

// 获取阈值列表
const thresholdList = ref<StrategyThreshold[]>([])
watch(
  () => thresholdStore.ThresholdList,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      thresholdList.value = newVal
    }
  },
  { immediate: true }
)

// 获取同异步策略
const syncFileOptions = ref<any[]>()
watch(
  () => dialogVisible.value,
  (val) => {
    if (val) {
      fetchSyncFileOptions()
    }
  }
)
const fetchSyncFileOptions = async () => {
  try {
    const data = await reqStrategyList({ returnType: 's2s', eventType: (props.form.eventType == 'click' ? 'click,all' : props.form.eventType == 'imp' ? 'imp,all' : 'click,imp,all') })
    syncFileOptions.value = data.data || []
  } catch (e) {
    console.error('获取s2s策略失败', e)
  }
}

/**
 * 需求要点：
 * - 选中 groups 时：将 group.name 填充到 config.formula；cutoff 固定 70；自动项带 groupId
 * - 取消 groups 时：删除对应的自动项；若删除后为空，保留一条默认空配置
 * - 手动删除自动项：仅在该 group 仍选中期间抑制再次自动填充；一旦取消选中该 group，将释放抑制，从而“重新选择可再次自动填充”
 * - 手动编辑自动项 formula：立即删除 groupId，解除关联；后续取消该 group 不会再自动删除这条手动配置
 * - rank 仅能选择一个；flag 不生成配置
 */
export interface Root {
  groupType: string
  name: string
  deviceSource: string
  formula: string
  description: any
  id: number
  strategyIds: string
  cutoff: number
  returnType: string // rank | score | flag
  operator: string   // big/small/equal 或符号形式
  status: string
}

// 获取当前已选Groups对应的信息
const selectedGroups = computed<Root[]>(() => {
  const selectedIds = new Set<number>(flowForm.value.strategyGroupIds || [])
  return (strategyList.value as any[]).filter(g => selectedIds.has(g.id)) as Root[]
})

// 监听 group 选择变化，自动维护公式配置
watch(
  () => flowForm.value.strategyGroupIds,
  (newVal: number[] = [], oldVal: number[] = []) => {
    if (!groupsLoaded.value) return

    // 限制 rank 类型只能选一个
    const rankGroups = selectedGroups.value.filter(g => g.returnType === 'rank')
    if (rankGroups.length > 1) {
      ElMessage.warning('只能选择一个 rank 类型的 Group')
      programmaticUpdating.value = true
      try {
        flowForm.value.strategyGroupIds = oldVal || []
      } finally {
        programmaticUpdating.value = false
      }
      return
    }

    const selectedGroupIds = new Set<number>(newVal || [])
    const existingGroupIds = new Set<number>(
      formulaConfigs.value
        .map(cfg => (cfg as any).groupId)
        .filter((id: number | undefined): id is number => typeof id === 'number')
    )

    // 关键修复1：真正的“取消选择”的集合（基于选择差集，而不是已存在配置）
    const removedFromSelection = (oldVal || []).filter(id => !(newVal || []).includes(id))
    // 取消选择这些 group 时，释放“手动删除抑制”记录，使得后续重新选择可以重新添加
    removedFromSelection.forEach(id => removedAutoGroups.value.delete(id))

    // 需要物理移除的自动配置（仅对已生成的自动项）
    const removedGroupIds = Array.from(existingGroupIds).filter(id => !selectedGroupIds.has(id))
    // 需要新增自动配置的 group
    const newGroupIds = Array.from(selectedGroupIds).filter(id => !existingGroupIds.has(id))

    programmaticUpdating.value = true
    try {
      // 处理删除的 groupId：移除对应的自动配置（但若移除后为空，则保留一条默认配置）
      if (removedGroupIds.length) {
        let after = formulaConfigs.value.filter(cfg => !removedGroupIds.includes((cfg as any).groupId as number))
        if (after.length === 0) {
          after = [DEFAULT_CONFIG()]
        }
        formulaConfigs.value = after
      }

      // 处理新增的 groupId：添加对应的默认配置
      if (newGroupIds.length) {
        // 先占用一个“默认空配置”进行填充（如有）
        let emptyIndex = formulaConfigs.value.findIndex(isDefaultEmptyConfig)

        for (const gid of newGroupIds) {
          // 若此前在“当前选中期间”被手动删除过，则抑制；一旦取消选中，该记录已在 removedFromSelection 释放
          if (removedAutoGroups.value.has(gid)) continue

          const group = selectedGroups.value.find(g => g.id === gid)
          if (!group) continue

          if (!['rank', 'score'].includes(String(group.returnType))) {
            continue // flag 类型不生成
          }
          const groupName = String(group.name ?? '')
          const autoCfg: FormulaConfig = {
            formula: String(group.name ?? ''), // 按需求：用 group.name 填充
            cutoff: 70,                        // 固定默认 70
            operator: normalizeOperator(group.operator),
            thresholdId: '',
            groupId: gid
          }

          // 避免重复（双保险）
          if (formulaConfigs.value.some(c => (c as any).groupId === gid)) continue
          // ② 新增逻辑：按 name 去重
          //    如果已经有 formula 等于当前 group.name 的配置（无论是否有 groupId），就不再添加
          if (formulaConfigs.value.some(c => String(c.formula ?? '') === groupName)) {
            continue
          }
          if (emptyIndex !== -1) {
            formulaConfigs.value.splice(emptyIndex, 1, autoCfg)
            // 继续寻找是否还有其它空位可复用
            emptyIndex = formulaConfigs.value.findIndex(isDefaultEmptyConfig)
          } else {
            formulaConfigs.value.push(autoCfg)
          }
        }
      }
    } finally {
      programmaticUpdating.value = false
    }

    // 清理表单校验
    formRef.value?.clearValidate?.(['formulaConfigs'])
  },
  { deep: false }
)
</script>

<style scoped>
.formula-configs-container {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  width: 100%;
}
.formula-config-item {
  margin-bottom: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}
.has-scroll {
  max-height:220px;
}
</style>