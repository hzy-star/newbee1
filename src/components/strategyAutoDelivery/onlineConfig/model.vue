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
                                <el-select v-model="flowForm.eventType" placeholder="请选择事件类型" @change="eventTypeHandle">
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
                                            :disabled="isView" @change="handlePkgConfigChange(key, $event)" clearable>
                                            <el-option v-for="option in config.options" :key="option.value"
                                                :label="option.label" :value="option.value"  />
                                        </el-select>
                                    </el-col>
                                </el-row>
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item label="flow配置" prop="formulaConfigs">
                        <div class="formula-configs-container">
                            <div class="formula-configs" :class="{ 'has-scroll': formulaConfigs.length > 3 }">
                                <div v-for="(config, index) in formulaConfigs" :key="index" class="formula-config-item">
                                    <el-row :gutter="24">
                                        <el-col :span="12">
                                            <label class="cfg-label">Flow Name</label>
                                            <!-- 原选择框 -->
                                            <el-select v-model="config.configName" placeholder="configName" size="small"
                                                style="width: 100%" :disabled="isView" filterable>
                                                <el-option v-for="item in flowList" :key="item.id" :label="item.name"
                                                    :value="item.name" />
                                            </el-select>
                                        </el-col>

                                        <el-col :span="12">
                                            <label class="cfg-label">号段</label>
                                            <el-input v-model="config.configValue" placeholder="configValue"
                                                size="small" style="width: 100%" :disabled="isView" />
                                        </el-col>

                                        <el-col :span="12">
                                            <label class="cfg-label">KP</label>
                                            <el-input v-model="config.configKp" placeholder="configKp" size="small"
                                                style="width: 100%" :disabled="isView" />
                                        </el-col>

                                        <el-col :span="12">
                                            <label class="cfg-label">KI</label>
                                            <el-input v-model="config.configKi" placeholder="configKi" size="small"
                                                style="width: 100%" :disabled="isView" />
                                        </el-col>

                                        <el-col :span="12">
                                            <label class="cfg-label">KD</label>
                                            <el-input v-model="config.configKd" placeholder="configKd" size="small"
                                                style="width: 100%" :disabled="isView" />
                                        </el-col>

                                        <el-col :span="12">
                                            <label class="cfg-label">Step</label>
                                            <el-input v-model="config.configStep" placeholder="configStep" size="small"
                                                style="width: 100%" :disabled="isView" />
                                        </el-col>

                                        <el-col :span="12">
                                            <label class="cfg-label">去重等级</label>
                                            <el-select v-model="config.dupCheck" placeholder="dupCheck" size="small"
                                                style="width: 100%" :disabled="isView">
                                                <el-option label="mini" value="mini" />
                                                <el-option label="less" value="less" />
                                                <el-option label="sec" value="sec" />
                                                <el-option label="pri" value="pri" />
                                            </el-select>
                                        </el-col>

                                        <el-col :span="12">
                                            <label class="cfg-label">erase比例</label>
                                            <el-input v-model="config.eraseIfa" placeholder="eraseIfa" size="small"
                                                style="width: 100%" :disabled="isView" />
                                        </el-col>

                                        <el-col :span="12">
                                            <label class="cfg-label">点击倍数</label>
                                            <el-input v-model="config.times" placeholder="点击倍数" size="small"
                                                style="width: 100%" :disabled="isView" />
                                        </el-col>
                                        <el-col :span="12">
                                            <label class="cfg-label">实时/离线 分配</label>
                                            <!-- 原选择框 -->
                                            <el-select v-model="config.distribute" placeholder="distribute" size="small"
                                                style="width: 100%" :disabled="isView" filterable clearable>
                                                <el-option v-for="item in distributeList" :key="item.id"
                                                    :label="item.name" :value="item.id" />
                                            </el-select>
                                        </el-col>
                                    </el-row>
                                    <el-row :gutter="24">
                                        <!-- isAuto是Switch开关 如果isAuto自动化开启，则kp:ki:kd:step必填 -->
                                        <el-col :span="14" style="display: flex; align-items: center;">
                                            <span>是否开启自动化PID控量：</span>
                                            <el-switch v-model="config.isAuto" active-value="true"
                                                inactive-value="false" :disabled="isView" active-text="ON"
                                                inactive-text="OFF" />
                                        </el-col>
                                        <el-col :span="6" v-if="!isView">
                                            <el-button v-if="index === formulaConfigs.length - 1" type="primary"
                                                size="small" @click="addFormulaConfig" circle>
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
import { Plus, Minus } from '@element-plus/icons-vue'
import { reqCreateOrUpdatFlowConfig } from '@/api/strategyAutoDelivery/flowConfig'
import { reqFlow } from '@/api/strategyAutoDelivery/flow'
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
                options: Array<{ label: string; value: any }>
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
// 统一强类型，避免 string | undefined
type BoolString = 'true' | 'false'
interface FormulaConfig {
    configName: string
    configValue: string
    configKp: string
    configKi: string
    configKd: string
    configStep: string
    isAuto: BoolString
    dupCheck: string
    eraseIfa: string
    times: number,
    distribute: number | null
}
const emptyConfig = (): FormulaConfig => ({
    configName: '',
    configValue: '',
    configKp: '0.5',
    configKi: '0.11',
    configKd: '1',
    configStep: '1',
    isAuto: 'false',
    dupCheck: 'mini',
    eraseIfa: '0',
    times: 1.2,
    distribute: null
})

const formulaConfigs = ref<FormulaConfig[]>([emptyConfig()])

// 表单验证规则
const rules = ref<FormRules>({
    pkgName: [{ required: true, message: '请输入pkgName', trigger: 'blur' }],
    country: [{ required: true, message: '请输入country', trigger: 'blur' }],
    // 如果isAuto自动化开启，则kp:ki:kd:step必填
    formulaConfigs: [
        {
            validator: (_rule, _value, callback) => {
                if (formulaConfigs.value.length === 0) {
                    callback(new Error('至少需要添加一个配置'))
                    return
                }
                if (formulaConfigs.value.some(item => !item.configName.trim())) {
                    callback(new Error('配置不能为空'))
                    return
                }
                // 出现空格的情况也要报错
                if (formulaConfigs.value.some(item => item.configName.includes(' ') || item.configValue.includes(' ') || item.configKp.includes(' ') || item.configKi.includes(' ') || item.configKd.includes(' ') || item.configStep.includes(' ') || item.dupCheck.includes(' ') || item.eraseIfa.includes(' ') || item.times.toString().includes(' '))) {
                    callback(new Error('配置项不能包含空格'))
                    return
                }
                if (formulaConfigs.value.some(item => item.isAuto === 'true' && (!item.configKp || !item.configKi || !item.configKd || !item.configStep || !item.dupCheck || !item.eraseIfa || !item.times))) {
                    callback(new Error('自动化开启时，kp, ki, kd, step, dupCheck, eraseIfa, times均为必填'))
                    return
                }
                callback()
            },
            trigger: 'blur'
        }
    ]
})

// 动态配置项操作
const addFormulaConfig = () => {
    formulaConfigs.value.push(emptyConfig())
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
            ElMessage.warning('至少需要添加一个配置')
            return
        }

        if (formulaConfigs.value.some(item => !item.configName.trim())) {
            ElMessage.warning('配置不能为空')
            return
        }
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
            config: formulaConfigs.value.map(item => `${item.configName}:${item.configValue}:${item.configKp}:${item.configKi}:${item.configKd}:${item.configStep}:${item.isAuto}:${item.dupCheck}:${item.eraseIfa}:${item.times}:${item.distribute ?? ''}`).join(','),
            eventType: flowForm.value.eventType,
            pkgConfig: Object.keys(cleanPkgConfig).length > 0 
                ? JSON.stringify(cleanPkgConfig) 
                : '',
            deviceSource:'online'
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

// 获取groups列表
const allFlowList = ref<Array<{ id: number, name: string }>>([])
const getFlowList = async () => {
    const response: any = await reqFlow({ eventType: props.form.eventType =  'click,imp,all'  })
    allFlowList.value = (response.data || []).filter((item: any) => item.status === 'enabled' && item.deviceSource === 'online') // 只获取启用的Flow
}
const flowList = computed(() => {
    const eventType = flowForm.value.eventType
    if (!eventType || eventType === 'all') {
        return allFlowList.value
    }
    debugger
    // 过滤出匹配当前 eventType 或 'all' 的 flow
    return allFlowList.value.filter(item => 
        (item as any).eventType === eventType || (item as any).eventType === 'all'
    )
})

const eventTypeHandle = () => {
    if(!isView.value){
        formulaConfigs.value.forEach(config => {
            config.configName = ''
        })
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
    debugger
    if (props.form.eventType !== 'all' && props.form.eventType) {
        params.eventType = [props.form.eventType, 'all']
    } else {
        params.eventType = ['click', 'imp', 'all']
    }
    const response: any = await reqManualStrategyList({ ...params })
    // const result:any = await reqManualStrategyList({...params,sourceType: 'system'})
    // 合并自定义和系统策略列表
    // const data  = (response.data.data || []).concat(result.data.data || [])
    distributeList.value = response.data.data
}

// 解析字符串为规范化配置
const parseConfigString = (configStr: string): FormulaConfig[] => {
    if (!configStr) return [emptyConfig()]
    return configStr.split(',').map(item => {
        const [configName = '', configValue = '', configKp = '', configKi = '', configKd = '', configStep = '', isAutoRaw = 'false', dupCheck = 'mini', eraseIfa = '0', times = '1.2', distribute = ''] = item.split(':')
        const isAuto: BoolString = isAutoRaw === 'true' ? 'true' : 'false'
        // 这里要把 'null'、'undefined' 之类也当成空
        const normalizedDistribute =
            distribute && distribute !== 'null' && distribute !== 'undefined'
                ? Number(distribute)
                : null
        return {
            configName,
            configValue,
            configKp,
            configKi,
            configKd,
            configStep,
            isAuto,
            dupCheck,
            eraseIfa,
            times: Number(times),
            distribute: normalizedDistribute
        }
    })
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
    const cfg = (newVal as any)?.config as string | undefined
    if (cfg) {
        formulaConfigs.value = parseConfigString(cfg)
    } else {
        formulaConfigs.value = [emptyConfig()]
    }
    flowForm.value.eventType = newVal.eventType == 'all' ? 'click' : newVal.eventType
    getFlowList()
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
    formulaConfigs.value = [emptyConfig()] // 重置动态配置项
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