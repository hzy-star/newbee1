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
                    </el-row>

                    <el-form-item label="flow配置" prop="formulaConfigs">
                        <div class="formula-configs-container">
                            <div class="formula-configs" :class="{ 'has-scroll': formulaConfigs.length > 3 }">
                                <div v-for="(config, index) in formulaConfigs" :key="index" class="formula-config-item">
                                    <el-row :gutter="24">
                                        <el-col :span="9">
                                            <!-- <el-input v-model="config.configName" placeholder="configName" size="small" :disabled="isView" /> -->
                                            <el-select v-model="config.configName" placeholder="configName" size="small"
                                                style="width: 100%" :disabled="isView">
                                                <el-option v-for="item in flowList" :key="item.id" :label="item.name"
                                                    :value="item.name" />
                                            </el-select>
                                        </el-col>
                                        <el-col :span="9">
                                            <el-input v-model="config.configValue" placeholder="configValue"
                                                size="small" style="width: 100%" :disabled="isView" />
                                        </el-col>
                                        <!-- 新增kp, ki, kd, step, isAuto -->
                                        <el-col :span="9">
                                            <el-input v-model="config.configKp" placeholder="configKp" size="small" style="width: 100%" :disabled="isView" />
                                        </el-col>
                                        <el-col :span="9">
                                            <el-input v-model="config.configKi" placeholder="configKi" size="small" style="width: 100%" :disabled="isView" />
                                        </el-col>
                                        <el-col :span="9">
                                            <el-input v-model="config.configKd" placeholder="configKd" size="small" style="width: 100%" :disabled="isView" />
                                        </el-col>
                                        <el-col :span="9">
                                            <el-input v-model="config.configStep" placeholder="configStep" size="small" style="width: 100%" :disabled="isView" />
                                        </el-col>
                                        <el-col :span="9">
                                            <el-select v-model="config.dupCheck" placeholder="dupCheck" size="small" style="width: 100%" :disabled="isView">
                                                <el-option label="less" value="less" />
                                                <el-option label="pri" value="pri" />
                                                <el-option label="sec" value="sec" />
                                            </el-select>
                                        </el-col>
                                        <el-col :span="9">
                                            <el-input v-model="config.eraseIfa" placeholder="eraseIfa" size="small" style="width: 100%" :disabled="isView" />
                                        </el-col>
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
    config: ''
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
    dupCheck: string
    eraseIfa: string
    isAuto: BoolString
}
const emptyConfig = (): FormulaConfig => ({
    configName: '',
    configValue: '',
    configKp: '0.5',
    configKi: '0.11',
    configKd: '1',
    configStep: '1',
    dupCheck: 'less',
    eraseIfa: '0',
    isAuto: 'false'
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
                    callback(new Error('所有配置不能为空'))
                    return
                }
                if (formulaConfigs.value.some(item => item.isAuto === 'true' && (!item.configKp || !item.configKi || !item.configKd || !item.configStep || !item.dupCheck || !item.eraseIfa))) {
                    callback(new Error('自动化开启时，kp, ki, kd, step, dupCheck, eraseIfa均为必填'))
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
            config: formulaConfigs.value.map(item => `${item.configName}:${item.configValue}:${item.configKp}:${item.configKi}:${item.configKd}:${item.configStep}:${item.isAuto}:${item.dupCheck}:${item.eraseIfa}`).join(','),
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
    const response: any = await reqFlow()
    response.data = (response.data || []).filter((item: any) => item.status === 'enabled' && item.deviceSource === 'online') // 只获取启用的Flow
    flowList.value = response.data || []
}

// 解析字符串为规范化配置
const parseConfigString = (configStr: string): FormulaConfig[] => {
    if (!configStr) return [emptyConfig()]
    return configStr.split(',').map(item => {
        const [configName = '', configValue = '', configKp = '', configKi = '', configKd = '', configStep = '', dupCheck = 'less', eraseIfa = '0', isAutoRaw = 'false'] = item.split(':')
        const isAuto: BoolString = isAutoRaw === 'true' ? 'true' : 'false'
        return {
            configName,
            configValue,
            configKp,
            configKi,
            configKd,
            configStep,
            dupCheck,
            eraseIfa,
            isAuto
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