<template>
    <el-dialog v-model="dialogVisible" :title="title" width="500px" :before-close="handleClose">
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
                <el-input v-model="formData.returnType" placeholder="请输入返回类型" :disabled="isView" />
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
            <el-form-item label="公式" >
                <el-select v-model="formData.formula" :disabled="isView">
                    <el-option label="and" value="and" />
                    <el-option label="or" value="or" />
                    <el-option label="min" value="min" />
                    <el-option label="max" value="max" />
                    <el-option label="avg" value="avg" />
                </el-select>
            </el-form-item>
            <el-form-item label="策略选择" prop="selectedStrategies">
                <el-select v-model="selectedStrategies" multiple placeholder="请选择策略" style="width: 100%" collapse-tags
                    collapse-tags-tooltip :disabled="isView" :max-collapse-tags="4">
                    <el-option v-for="strategy in strategiesList" :key="strategy.id" :label="strategy.name"
                        :value="strategy.id?.toString() || ''" />
                </el-select>
            </el-form-item>
        </el-form>

        <template #footer v-if="!isView">
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
                保存
            </el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { reqStrategyList } from '@/api/strategyAutoDelivery/strategyPage/index'
import { reqCreateOrUpdate } from '@/api/strategyAutoDelivery/groups'
import type { Groups } from '@/api/strategyAutoDelivery/groups/type'
import type { Strategy } from '@/api/strategyAutoDelivery/strategyPage/type'

const props = defineProps({
    modelValue: { // 使用v-model标准命名
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    form: {
        type: Object as () => Partial<Groups>,
        default: () => ({})
    },
    isView: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'submit'])

// 使用计算属性实现v-model双向绑定
const dialogVisible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

// 表单相关
const formRef = ref<FormInstance>()
const submitLoading = ref(false)
const formData = ref<Partial<Groups>>({ operator: 'big', status: 'enabled',cutoff:0,formula:'and', ...props.form })
const selectedStrategies = ref<string[]>([])

// 策略列表
const strategiesList = ref<Strategy[]>([])

// 表单验证规则
const formRules: FormRules = {
    name: [{ required: true, message: '请输入Group名称', trigger: 'blur' }],
    returnType: [{ required: true, message: '请输入返回类型', trigger: 'blur' }],
    formula: [{ required: true, message: '请输入公式', trigger: 'blur' }],
}

// 获取策略列表
const getStrategiesList = async () => {
    try {
        const response = await reqStrategyList()
        strategiesList.value = response.data || []
    } catch (error) {
        ElMessage.error('获取策略列表失败')
    }
}

// 关闭弹窗
const handleClose = () => {
    dialogVisible.value = false
    formRef.value?.resetFields()  // 新增重置表单
    formData.value = { operator: 'big', status: 'enabled',cutoff: 0,formula:'and'}  // 清空表单数据
    selectedStrategies.value = []
}

// 表单提交
const handleSubmit = async () => {
    try {
        submitLoading.value = true

        // 表单验证
        const valid = await formRef.value?.validate()
        if (!valid) return
        if(selectedStrategies.value.length === 0){
            ElMessage.error('请选择策略')
            return
        }
        // 处理策略IDs
        const formToSubmit = {
            ...formData.value,
            strategyIds: selectedStrategies.value.join(',')
        } as Groups

        const response = await reqCreateOrUpdate(formToSubmit)
        if (response.code === 200 || response.success === true) {
            ElMessage.success(`${props.title}成功`)
            emit('submit')
            handleClose()
        } else {
            ElMessage.error(response.errMsg || `${props.title}失败`)
        }
    } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error(`${props.title}失败`)
    } finally {
        submitLoading.value = false
    }
}

// 监听props.form变化，更新表单数据
watch(
    () => props.form,
    (newVal) => {
        formData.value = { ...newVal }
        // 处理策略IDs
        if (newVal.strategyIds) {
            selectedStrategies.value = newVal.strategyIds.split(',')
        } else {
            selectedStrategies.value = []
        }
    },
    { immediate: true, deep: true }
)

// 当弹窗显示时获取策略列表
watch(
    () => props.modelValue,
    (val) => {
        if (val) {
            getStrategiesList()
        }
    }
)
</script>