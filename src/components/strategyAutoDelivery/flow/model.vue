<template>
  <el-dialog v-model="dialogVisible" :title="title" width="800px" :before-close="handleClose">
    <div class="right-panel">

      <div class="flow-form-container">
        <el-form ref="formRef" :model="flowForm" :rules="rules" label-width="120px" size="large">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Flow名称" prop="name">
                <el-input v-model="flowForm.name" placeholder="请输入Flow名称" :disabled="isView" />
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
                    <el-col :span="4">
                      <el-input v-model="config.formula" placeholder="公式" size="small" :disabled="isView" />
                    </el-col>
                    <el-col :span="6">
                      <el-input-number v-model="config.cutoff" placeholder="截止值" size="small" style="width: 100%"
                        :disabled="isView" />
                    </el-col>
                    <el-col :span="3">
                      <el-select v-model="config.operator" placeholder="操作符" size="small" style="width: 100%"
                        :disabled="isView">
                        <el-option label=">" value="big" />
                        <el-option label="<" value="small" />
                        <el-option label="=" value="equal" />
                      </el-select>
                    </el-col>
                    <el-col :span="6">
                      <el-select v-model="config.thresholdId" placeholder="阈值配置" size="small" style="width: 100%"
                        :disabled="isView">
                        <el-option v-for="item in thresholdList" :key="item.id" :label="item.name" :value="item.id" />
                      </el-select>
                    </el-col>
                    <el-col :span="4" v-if="!isView">
                      <el-button v-if="index === formulaConfigs.length - 1" type="primary" size="small"
                        @click="addFormulaConfig" circle>
                        <el-icon>
                          <Plus />
                        </el-icon>
                      </el-button>
                      <el-button v-if="formulaConfigs.length > 1" type="danger" size="small"
                        @click="removeFormulaConfig(index)" circle>
                        <el-icon>
                          <Minus />
                        </el-icon>
                      </el-button>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </div>
          </el-form-item>
          <!-- <el-form-item label="是否落盘" prop="writeToDisk">
            <el-select v-model="flowForm.writeToDisk" :disabled="isView">
              <el-option label="是" value="y" />
              <el-option label="否" value="n" />
            </el-select>
          </el-form-item> -->

          <el-form-item label="关联Groups">
            <el-select v-model="flowForm.strategyGroupIds" multiple placeholder="选择Groups" :disabled="isView"
              style="width: 100%; margin-top: 10px;" value-key="id">
              <el-option v-for="group in strategyList" :key="group.id" :label="group.name" :value="group.id" />
            </el-select>
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
const thresholdStore = ThresholdPinia()

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  form: {
    type: Object as () => Partial<Flows>,
    default: () => ({})
  },
  isView: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

// 表单相关
const formRef = ref<FormInstance>()
const flowForm = ref<Partial<Flows>>({
  name: '',
  status: 'enabled',
  strategyGroupIds: [], // 确保初始化为空数组
  formula: '',
  // writeToDisk: 'n',
})

const formulaConfigs = ref([
  { formula: '', cutoff: 0, operator: 'big', thresholdId: '' }
])

// 表单验证规则
const rules = ref<FormRules>({
  name: [{ required: true, message: '请输入Flow名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  formulaConfigs: [
    {
      validator: (rule, value, callback) => {
        if (formulaConfigs.value.some(item => !item.formula.trim())) {
          callback(new Error('所有公式不能为空'))
        } else if (formulaConfigs.value.length === 0) {
          callback(new Error('至少需要添加一个公式'))
        } else {
          callback()
        }
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
  // writeToDisk: [{ required: true, message: '请选择是否落盘', trigger: 'change' }]
})


// 动态配置项操作
const addFormulaConfig = () => {
  formulaConfigs.value.push({ formula: '', cutoff: 0, operator: 'big', thresholdId: '' })
}

const removeFormulaConfig = (index: number) => {
  formulaConfigs.value.splice(index, 1)
}

// 表单提交
const handleSubmit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return
    // 手动校验公式配置
    if (formulaConfigs.value.length === 0) {
      ElMessage.warning('至少需要添加一个公式')
      return
    }

    if (formulaConfigs.value.some(item => !item.formula.trim())) {
      ElMessage.warning('公式不能为空')
      return
    }
    // 截止值不能为空
    if (formulaConfigs.value.some(item => item.cutoff === undefined || item.cutoff === null)) {
      ElMessage.warning('截止值不能为空')
      return
    }

    // 手动校验Groups选择
    if (!flowForm.value.strategyGroupIds || flowForm.value.strategyGroupIds.length === 0) {
      ElMessage.warning('至少需要选择一个Group')
      return
    }
    const submitData = {
      id: flowForm.value.id,
      name: flowForm.value.name,
      status: flowForm.value.status,
      // writeToDisk: flowForm.value.writeToDisk,
      formula: JSON.stringify(formulaConfigs.value),
      strategyGroupIds: flowForm.value.strategyGroupIds?.join(',') || '', // 添加空数组回退
    }

    const response = await reqCreateOrUpdatFlow(submitData)
    if (response.code === 200 || response.success === true) {
      ElMessage.success('保存成功')
      emit('submit')
      handleClose()
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

// 获取groups列表
const strategyList = ref<Array<{ id: number, name: string }>>([])
const getGroupsList = async () => {
  const response = await reqStrategyGroupList()
  response.data = response.data.filter((item: any) => item.status === 'enabled') // 只显示启用的Groups
  strategyList.value = response.data || []

}
// 初始化表单数据时处理groupIds
watch(() => props.form, (newVal) => {
  flowForm.value = {
    ...newVal,
    strategyGroupIds: newVal.strategyGroupIds ? newVal.strategyGroupIds.split(',').map(Number) : []// 添加空数组回退
  }
  if (newVal.formula) {
    formulaConfigs.value = JSON.parse(newVal.formula)
  }
  getGroupsList()
})


const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()  // 新增重置表单
  formulaConfigs.value = [{ formula: '', cutoff: 0, operator: 'big', thresholdId: '' }] // 重置公式配置
}



// 获取阈值列表
const thresholdList = ref<StrategyThreshold[]>([])
watch(() => thresholdStore.ThresholdList, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    thresholdList.value = newVal
  }
  // 如果阈值列表为空，则调用接口
  // if (newVal.length === 0) {
  //     thresholdStore.getThreshold()
  // }
}, { immediate: true })
</script>

<style scoped>
.formula-configs-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
}

.formula-config-item {
  margin-bottom: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.has-scroll {
  max-height: 200px;
  overflow-y: auto;
}
</style>