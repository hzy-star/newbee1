<template>
    <el-dialog v-model="dialogVisible" :title="title" width="800px" :before-close="handleClose">
        <div class="right-panel">

            <div class="flow-form-container">
                <el-form ref="formRef" :model="flowForm" :rules="rules" label-width="140px" size="large">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="pkgName" prop="pkgName">
                                <el-input v-model="flowForm.pkgName" placeholder="请输入pkgName" :disabled="isView" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="country" prop="country">
                                <el-input v-model="flowForm.country" placeholder="请输入country" :disabled="isView" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="事件类型" prop="eventType">
                                <el-select v-model="flowForm.eventType" placeholder="请选择事件类型" :disabled="isView">
                                    <el-option label="点击" value="click" />
                                    <el-option label="展示" value="imp" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item label="pkg配置" prop="pkgConfig">
                        <div class="formula-configs-container">
                            <div  class="config-item">
                                <el-row :gutter="20" >
                                    <el-col :span="8" v-for="(config, key) in kvMap" :key="key">
                                        <label class="cfg-label">{{ config.label }}</label>
                                        <el-select v-model="pkgConfig[key]" placeholder="请选择" style="width: 100%" size="small"
                                            :disabled="isView" @change="handlePkgConfigChange(key, $event)" 
                                            :filterable="config.filterable" :clearable="config.clearable !== false">
                                            <!-- 静态选项（有 options 且没有 optionsKey） -->
                                            <template v-if="config.options && !config.optionsKey">
                                                <el-option v-for="option in config.options" :key="option.value"
                                                    :label="option.label" :value="option.value"  />
                                            </template>
                                            <!-- 动态选项 -->
                                            <template v-else-if="config.optionsKey">
                                                <el-option v-for="option in getDynamicOptions(config.optionsKey)" :key="option.value"
                                                    :label="option.label" :value="option.value"  />
                                            </template>
                                        </el-select>
                                    </el-col>
                                </el-row>
                            </div>
                        </div>
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
import { reqCreateOrUpdatFlowConfig } from '@/api/strategyAutoDelivery/flowConfig'
import { reqManualStrategyList } from '@/api/strategyAutoDelivery/manualStrategy/index'

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
        type: Object as () => Partial<any>,
        default: () => ({})
    },
    isView: {
        type: Boolean,
        default: false
    },
    kvMap: {
        type: Object as () => {
            [key: string]: {
                label: string
                options?: Array<{ label: string; value: any }>
                optionsKey?: string  // 动态选项的数据源名称
                filterable?: boolean
                clearable?: boolean
            }
        },
        default: () => ({})
    }
})

const emit = defineEmits(['update:modelValue', 'submit'])

// 表单相关
const formRef = ref<FormInstance>()
const flowForm = ref<Partial<any>>({
    pkgName: '',
    country: '',
    config: '',
    eventType: props.form.eventType == 'all' ? 'click' : props.form.eventType,
    pkgConfig: {}
})
// 确保 pkgConfig 对象存在
const pkgConfig = computed({
    get: () => {
        console.log('get pkgConfig:', flowForm.value.pkgConfig)
        
        // 如果 pkgConfig 是字符串，尝试解析
        if (typeof flowForm.value.pkgConfig === 'string') {
            try {
                const parsed = JSON.parse(flowForm.value.pkgConfig)
                console.log('parsed pkgConfig:', parsed)
                
                // 如果是数组，转换为对象（修复错误格式）
                if (Array.isArray(parsed)) {
                    const result: Record<string, any> = {}
                    // 尝试从数组重建对象
                    for (let i = 0; i < parsed.length; i += 2) {
                        if (i + 1 < parsed.length) {
                            result[parsed[i]] = parsed[i + 1]
                        }
                    }
                    return result
                }
                return parsed || {}
            } catch (error) {
                console.error('解析 pkgConfig 失败:', error)
                return {}
            }
        }
        
        // 如果 pkgConfig 是对象，直接返回
        return flowForm.value.pkgConfig || {}
    },
    set: (value) => {
        console.log('set pkgConfig:', value)
        flowForm.value.pkgConfig = value
    }
})
// 修改 handlePkgConfigChange 方法
const handlePkgConfigChange = (key: string, value: any) => {
    console.log('pkgConfig change:', key, value)
    
    // 创建一个新的对象，确保是纯对象
    const newConfig = { ...pkgConfig.value }
    newConfig[key] = value
    
    // 删除可能的数字索引（防止错误序列化）
    Object.keys(newConfig).forEach(k => {
        if (!isNaN(Number(k))) {
            delete newConfig[k]
        }
    })
    
    flowForm.value.pkgConfig = newConfig
}

// 表单验证规则
const rules = ref<FormRules>({
    pkgName: [{ required: true, message: '请输入pkgName', trigger: 'blur' }],
    country: [{ required: true, message: '请输入country', trigger: 'blur' }]
})


// 表单提交
const handleSubmit = async () => {
    try {
        const valid = await formRef.value?.validate()
        if (!valid) return
        console.log('提交前的 pkgConfig:', flowForm.value.pkgConfig)
        console.log('提交前的 pkgConfig 类型:', typeof flowForm.value.pkgConfig)
        // 清理 pkgConfig 对象，移除所有数字索引
        const cleanPkgConfig: Record<string, any> = {}
        if (flowForm.value.pkgConfig && typeof flowForm.value.pkgConfig === 'object') {
            Object.entries(flowForm.value.pkgConfig).forEach(([key, value]) => {
                // 只保留非数字键
                if (isNaN(Number(key))) {
                    cleanPkgConfig[key] = value
                }
            })
        }
        const submitData = {
            id: flowForm.value.id,
            pkgName: flowForm.value.pkgName,
            country: flowForm.value.country,
            eventType: flowForm.value.eventType,
            pkgConfig: Object.keys(cleanPkgConfig).length > 0 
                ? JSON.stringify(cleanPkgConfig) 
                : '',
            deviceSource:'distribute'
        }
        
        console.log('提交的数据:', submitData)

        const response: any = await reqCreateOrUpdatFlowConfig(submitData)
        if (response?.code === 200 || response?.success === true) {
            ElMessage.success('保存成功')
            emit('submit')
            handleClose()
        }
    } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
    }
}

// 获取distribute列表
const distributeList = ref<Array<{ id: number, name: string }>>([])
const getDistributeList = async () => {
    const params = {
        //   eventType: [props.form.eventType, 'all'],
        eventType: [] as string[],
        page: 1,
        limit: 9999999,
        returnType: 'distribute',// 获取distribute类型列表
        deviceSource: 'offline',// 离线策略
    }
    // if (props.form.eventType !== 'all' && props.form.eventType) {
    //     params.eventType = [props.form.eventType, 'all']
    // } else {
        params.eventType = ['click', 'imp', 'all']
    // }
    const response: any = await reqManualStrategyList({ ...params })
    // const result:any = await reqManualStrategyList({...params,sourceType: 'system'})
    // 合并自定义和系统策略列表
    // const data  = (response.data.data || []).concat(result.data.data || [])
    distributeList.value = response.data.data
}

// 动态选项映射：根据 optionsKey 返回对应的选项数组
const getDynamicOptions = (optionsKey: string): Array<{ label: string; value: any }> => {
    debugger
    const optionsMap: Record<string, () => Array<{ label: string; value: any }>> = {
        distributeList: () => distributeList.value.map(item => ({ label: item.name, value: item.id }))
        // 可以继续添加其他动态数据源
    }
    return optionsMap[optionsKey]?.() || []
}


// 初始化表单数据时处理 config
watch(() => props.form, (newVal) => {
    console.log('接收到 form 数据:', newVal)
    flowForm.value = {
        ...newVal
    }
     // 专门处理 pkgConfig
    let pkgConfigValue = {}
    if (newVal.pkgConfig) {
        console.log('原始 pkgConfig:', newVal.pkgConfig)
        
        if (typeof newVal.pkgConfig === 'string') {
            try {
                const parsed = JSON.parse(newVal.pkgConfig)
                console.log('解析后的 pkgConfig:', parsed)
                pkgConfigValue = cleanObject(parsed)
            } catch (error) {
                console.error('JSON 解析失败，尝试其他方式:', error)
                // 如果 JSON 解析失败，可能是格式错误的字符串
                pkgConfigValue = {}
            }
        } else if (typeof newVal.pkgConfig === 'object') {
            pkgConfigValue = cleanObject(newVal.pkgConfig)
        }
    }
    
    console.log('处理后的 pkgConfig:', pkgConfigValue)
    flowForm.value.pkgConfig = pkgConfigValue
    flowForm.value.eventType = newVal.eventType == 'all' ? 'click' : newVal.eventType
    getDistributeList()
})

const dialogVisible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const isView = computed(() => props.isView)

const handleClose = () => {
    dialogVisible.value = false
    formRef.value?.resetFields()  // 新增重置表单
}

// 在 model.vue 中添加工具函数
const cleanObject = (obj: any): Record<string, any> => {
    if (!obj || typeof obj !== 'object') {
        return {}
    }
    
    const result: Record<string, any> = {}
    
    // 处理不同情况
    if (Array.isArray(obj)) {
        // 如果是数组，尝试转换为键值对
        for (let i = 0; i < obj.length; i += 2) {
            if (i + 1 < obj.length && typeof obj[i] === 'string') {
                result[obj[i]] = obj[i + 1]
            }
        }
    } else {
        // 如果是对象，过滤掉数字键
        Object.entries(obj).forEach(([key, value]) => {
            if (!isNaN(Number(key))) {
                // 如果是数字键，尝试判断是否为字符串的一部分
                if (typeof value === 'string') {
                    // 这可能是一个被错误拆分的 JSON 字符串
                    // 我们会在其他地方处理
                }
            } else {
                result[key] = value
            }
        })
    }
    
    return result
}
</script>

<style scoped>
.formula-configs-container {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 10px;
    width: 100%;
    line-height: 30px;
}

.formula-config-item {
    margin-bottom: 10px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
}

.cfg-label {
    display: block;
    font-size: 12px;
    color: #606266;
    line-height: 1;
}

.has-scroll {
    /* max-height: 200px; */
    /* overflow-y: auto; */
}
</style>