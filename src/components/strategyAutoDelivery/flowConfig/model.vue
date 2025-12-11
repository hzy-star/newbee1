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
                                <el-select v-model="flowForm.eventType" placeholder="请选择事件类型" disabled="true">
                                    <el-option label="点击" value="click" />
                                    <el-option label="展示" value="imp" />
                                    <el-option label="全部" value="all" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="flow配置" prop="formulaConfigs">
                        <div class="formula-configs-container">
                            <div class="formula-configs" :class="{ 'has-scroll': formulaConfigs.length > 3 }">
                                <div v-for="(config, index) in formulaConfigs" :key="index" class="formula-config-item">
                                    <el-row :gutter="24">
                                        <el-col :span="12">
                                            <label class="cfg-label">Config Name</label>
                                            <!-- 原选择框 -->
                                            <el-select v-model="config.configName" placeholder="configName" size="small"
                                                style="width: 100%" :disabled="isView" filterable>
                                                <el-option v-for="item in flowList" :key="item.id" :label="item.name"
                                                    :value="item.name" />
                                            </el-select>
                                        </el-col>

                                        <el-col :span="12">
                                            <label class="cfg-label">Config Value</label>
                                            <el-input v-model="config.configValue" placeholder="configValue"
                                                size="small" style="width: 100%" :disabled="isView" />
                                        </el-col>

                                        <el-col :span="12">
                                            <label class="cfg-label">KP</label>
                                            <el-input v-model="config.configKp" placeholder="configKp" size="small" style="width: 100%" :disabled="isView" />
                                        </el-col>

                                        <el-col :span="12">
                                            <label class="cfg-label">KI</label>
                                            <el-input v-model="config.configKi" placeholder="configKi" size="small" style="width: 100%" :disabled="isView" />
                                        </el-col>

                                        <el-col :span="12">
                                            <label class="cfg-label">KD</label>
                                            <el-input v-model="config.configKd" placeholder="configKd" size="small" style="width: 100%" :disabled="isView" />
                                        </el-col>

                                        <el-col :span="12">
                                            <label class="cfg-label">Step</label>
                                            <el-input v-model="config.configStep" placeholder="configStep" size="small" style="width: 100%" :disabled="isView" />
                                        </el-col>

                                        <el-col :span="12">
                                            <label class="cfg-label">去重等级</label>
                                            <el-select v-model="config.dupCheck" placeholder="dupCheck" size="small" style="width: 100%" :disabled="isView">
                                                <el-option label="less" value="less" />
                                                <el-option label="pri" value="pri" />
                                                <el-option label="sec" value="sec" />
                                            </el-select>
                                        </el-col>

                                        <el-col :span="12">
                                            <label class="cfg-label">erase比例</label>
                                            <el-input v-model="config.eraseIfa" placeholder="eraseIfa" size="small" style="width: 100%" :disabled="isView" />
                                        </el-col>

                                        <el-col :span="12">
                                            <label class="cfg-label">点击倍数</label>
                                            <el-input v-model="config.times" placeholder="点击倍数" size="small" style="width: 100%" :disabled="isView" />
                                        </el-col>
                                        <el-col :span="12">
                                            <label class="cfg-label">实时/离线 分配</label>
                                            <!-- 原选择框 -->
                                            <el-select v-model="config.distribute" placeholder="distribute" size="small"
                                                style="width: 100%" :disabled="isView" filterable clearable>
                                                <el-option v-for="item in distributeList" :key="item.id" :label="item.name"
                                                    :value="item.id" />
                                            </el-select>
                                        </el-col>
                                    </el-row>
                                    <el-row :gutter="24">
                                        <!-- isAuto是Switch开关 如果isAuto自动化开启，则kp:ki:kd:step必填 -->
                                        <el-col :span="14" style="display: flex; align-items: center;">
                                            <span>是否开启自动化PID控量：</span>
                                            <el-switch
                                                v-model="config.isAuto"
                                                active-value="true"
                                                inactive-value="false"
                                                :disabled="isView"
                                                active-text="ON"
                                                inactive-text="OFF"
                                                />
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
    }
})

const emit = defineEmits(['update:modelValue', 'submit'])

// 表单相关
const formRef = ref<FormInstance>()
const flowForm = ref<Partial<any>>({
    pkgName: '',
    country: '',
    config: '',
    eventType: props.form.eventType
})

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
    times:number,
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
    dupCheck: 'less',
    eraseIfa: '0',
    times:1.2,
    distribute:null
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
        const submitData = {
            id: flowForm.value.id,
            pkgName: flowForm.value.pkgName,
            country: flowForm.value.country,
            config: formulaConfigs.value.map(item => `${item.configName}:${item.configValue}:${item.configKp}:${item.configKi}:${item.configKd}:${item.configStep}:${item.isAuto}:${item.dupCheck}:${item.eraseIfa}:${item.times}:${item.distribute ?? ''}`).join(','),
            eventType: props.form.eventType
        }
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
const flowList = ref<Array<{ id: number, name: string }>>([])
const getFlowList = async () => {
    const response: any = await reqFlow({eventType: props.form.eventType})
    response.data = (response.data || []).filter((item: any) => item.status === 'enabled' && item.deviceSource === 'online') // 只获取启用的Flow
    flowList.value = response.data || []
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
    if (props.form.eventType !== 'all' && props.form.eventType) {
        params.eventType = [props.form.eventType, 'all']
    } else {
        params.eventType = ['click', 'imp', 'all']
    }
    const response: any = await reqManualStrategyList({...params})
    // const result:any = await reqManualStrategyList({...params,sourceType: 'system'})
    // 合并自定义和系统策略列表
    // const data  = (response.data.data || []).concat(result.data.data || [])
    distributeList.value = response.data.data
}

// 解析字符串为规范化配置
const parseConfigString = (configStr: string): FormulaConfig[] => {
    if (!configStr) return [emptyConfig()]
    return configStr.split(',').map(item => {
        const [configName = '', configValue = '', configKp = '', configKi = '', configKd = '', configStep = '' ,isAutoRaw = 'false', dupCheck = 'less', eraseIfa = '0', times = '1.2', distribute = ''] = item.split(':')
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
            distribute:normalizedDistribute
        }
    })
}

// 初始化表单数据时处理 config
watch(() => props.form, (newVal) => {
    flowForm.value = {
        ...newVal
    }
    const cfg = (newVal as any)?.config as string | undefined
    if (cfg) {
        formulaConfigs.value = parseConfigString(cfg)
    } else {
        formulaConfigs.value = [emptyConfig()]
    }
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