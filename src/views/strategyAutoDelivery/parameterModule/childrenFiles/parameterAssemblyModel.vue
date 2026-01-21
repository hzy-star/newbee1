<!-- 参数装配模块 - 新增/编辑弹窗 -->
<template>
  <el-dialog v-model="dialogVisible" :title="title" width="700px" :before-close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" size="default">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="pkgName" prop="pkg">
            <el-input v-model="form.pkg" placeholder="请输入包名" :disabled="isView" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="country" prop="country">
            <el-input v-model="form.country" placeholder="请输入国家" :disabled="isView" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="事件类型" prop="eventType">
            <el-select v-model="form.eventType" placeholder="请选择事件类型" :disabled="isView" style="width: 100%" @change="handleEventTypeChange">
              <el-option label="点击" value="click" />
              <el-option label="展示" value="imp" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="实时/离线" prop="deviceSource">
            <el-select v-model="form.deviceSource" placeholder="请选择实时/离线" :disabled="isView" style="width: 100%" @change="handleEventTypeChange">
              <el-option label="实时" value="online" />
              <el-option label="离线" value="offline" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="功能配置" prop="functionTypes">
        <div class="function-configs-container">
          <div class="function-configs">
            <div v-for="(config, index) in form.functionTypes" :key="index" class="function-config-item">
              <el-row :gutter="20">
                <el-col :span="12">
                  <label class="cfg-label">功能名</label>
                  <el-select v-model="config.name" placeholder="请选择功能名" size="small" :disabled="isView" filterable style="width: 100%">
                    <el-option v-for="item in functionOptions" :key="item.id || item.name" :label="item.name" :value="item.name" />
                  </el-select>
                </el-col>
                <el-col :span="12">
                  <label class="cfg-label">号段</label>
                  <el-row :gutter="10">
                    <el-col :span="11">
                      <el-input-number 
                        v-model="config.start" 
                        placeholder="起始" 
                        size="small" 
                        :min="0" 
                        :max="100"
                        :disabled="isView"
                        :controls="false"
                        style="width: 100%"
                      />
                    </el-col>
                    <el-col :span="2" style="text-align: center; line-height: 32px;">-</el-col>
                    <el-col :span="11">
                      <el-input-number 
                        v-model="config.end" 
                        placeholder="结束" 
                        size="small" 
                        :min="0" 
                        :max="100"
                        :disabled="isView"
                        :controls="false"
                        style="width: 100%"
                      />
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>

              <el-row :gutter="20" style="margin-top: 10px" v-if="!isView">
                <el-col :span="24" style="text-align: right;">
                  <el-button v-show="index === form.functionTypes.length - 1" type="primary" size="small" @click="addConfig" circle>
                    <el-icon><Plus /></el-icon>
                  </el-button>
                  <el-button v-show="form.functionTypes.length > 1" type="danger" size="small" @click="removeConfig(index)" circle>
                    <el-icon><Minus /></el-icon>
                  </el-button>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer v-if="!isView">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Minus } from '@element-plus/icons-vue'
import { reqCreateOrUpdate, reqOptions } from '@/api/strategyAutoDelivery/parameterModule/parameterAssembly/index'

// 获取用户信息(新)
import useCookie from '@/store/modules/cookie'
const cookieStore = useCookie()

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
    type: Object as () => any,
    default: () => ({})
  },
  isView: {
    type: Boolean,
    default: false
  },
  ftype: {
    type: String,
    default: ''
  },
  eventType: {
    type: String,
    default: 'all'
  },
  deviceSource: {
    type: String,
    default: ''
  },
  status:{
    type:String,
    default:''
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

// 功能名选项列表（本地状态）
const functionOptions = ref<any[]>([])

// 获取功能名选项
const getFunctionOptions = async () => {
  if (!props.ftype) return
  debugger
  try {
    // 如果 eventType 是 undefined 或 'all'，默认使用 'click'
    const eventType = form.value.eventType === 'all' || !form.value.eventType 
      ? 'click' 
      : form.value.eventType
    const params = {
      ftype: props.ftype,
      eventType: eventType=='click' ? 'click,all':'imp,all',
      deviceSource: form.value.deviceSource || '',
      status:'enabled'
    }
    
    const response = await reqOptions(params)
    if (response.success) {
      functionOptions.value = response.data || []
    }
  } catch (error) {
    console.error('获取功能名选项失败:', error)
  }
}

// 表单相关
const formRef = ref<FormInstance>()
const form = ref<any>({
  pkg: '',
  country: '',
  eventType: 'click',
  deviceSource: '',
  status:'',
  functionTypes: [
    {
      name: '',
      start: 0,
      end: 100
    }
  ]
})

// 表单验证规则
const rules = ref<FormRules>({
  pkg: [{ required: true, message: '请输入包名', trigger: 'blur' }],
  country: [{ required: true, message: '请输入国家', trigger: 'blur' }],
  eventType: [{ required: true, message: '请选择事件类型', trigger: 'change' }],
  deviceSource: [{ required: true, message: '请选择实时/离线', trigger: 'change' }],
  status: [{ required: true, message: '请选择启用/禁用', trigger: 'change' }],
  functionTypes: [
    {
      validator: (_rule, _value, callback) => {
        if (form.value.functionTypes.length === 0) {
          callback(new Error('至少需要添加一个配置'))
          return
        }
        if (form.value.functionTypes.some((item: any) => !item.name.trim())) {
          callback(new Error('功能名不能为空'))
          return
        }
        if (form.value.functionTypes.some((item: any) => Number(item.start) >= Number(item.end))) {
          callback(new Error('起始值必须小于结束值'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
})

// 添加配置
const addConfig = () => {
  form.value.functionTypes.push({
    name: '',
    start: 0,
    end: 100
  })
}

// 删除配置
const removeConfig = (index: number | string) => {
  const idx = typeof index === 'string' ? parseInt(index) : index
  form.value.functionTypes.splice(idx, 1)
}

// 事件类型改变时，重新获取功能名选项并清空已选择的功能名
const handleEventTypeChange = async () => {
  if (!props.isView) {
    // 清空已选择的功能名
    form.value.functionTypes.forEach((item: any) => {
      item.name = ''
    })
    // 重新获取功能名选项
    await getFunctionOptions()
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return

    // 处理 functionTypes，为每个添加 ftid
    const functionTypesWithId = form.value.functionTypes.map((item: any) => {
      // 从 functionOptions 中找到对应的 id
      const option = functionOptions.value.find((opt: any) => opt.name === item.name)
      return {
        name: item.name,
        start: item.start,
        end: item.end,
        ftid: option?.id || item.ftid || null
      }
    })

    const submitData = {
      id: form.value.id,
      pkg: form.value.pkg,
      country: form.value.country,
      os: form.value.os || null,
      ftype: props.ftype,
      status: form.value.status || 'enabled',
      eventType: form.value.eventType,
      deviceSource: form.value.deviceSource,
      functionTypes: functionTypesWithId,
      lastUpdateUser:cookieStore.username
    }

    const response: any = await reqCreateOrUpdate(submitData)
    if (response?.success === true) {
      ElMessage.success('保存成功')
      emit('submit')
      handleClose()
    } else {
      ElMessage.error(response?.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

// 监听表单数据变化
watch(() => props.form, (newVal) => {
  if (newVal) {
    form.value = {
      ...newVal,
      // 如果 eventType 是 all，默认改为 click
      eventType: newVal.eventType === 'all' ? 'click' : newVal.eventType,
      functionTypes: newVal.functionTypes && newVal.functionTypes.length > 0 
        ? JSON.parse(JSON.stringify(newVal.functionTypes))
        : [{ name: '', start: 0, end: 100 }]
    }
  }
}, { immediate: true, deep: true })

// 监听弹窗打开，先更新表单数据，再获取功能名选项
watch(() => props.modelValue, async (newVal) => {
  if (newVal) {
    // 使用 nextTick 确保 form.value 已经更新
    await nextTick()
    // 弹窗打开时，获取功能名选项
    getFunctionOptions()
  }
})

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
  form.value = {
    pkg: '',
    country: '',
    eventType: 'click',
    deviceSource: '',
    status:'',
    functionTypes: [{ name: '', start: 0, end: 100 }]
  }
}
</script>

<style scoped lang="scss">
.function-configs-container {
  width: 100%;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.function-config-item {
  margin-bottom: 15px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.cfg-label {
  display: block;
  font-size: 12px;
  color: #606266;
  margin-bottom: 5px;
  font-weight: 500;
}
</style>
