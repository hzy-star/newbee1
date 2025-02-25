<template>
    <el-dialog :model-value="props.modelValue" :title="props.title" width="60%" align-center draggable
        @update:model-value="$emit('update:modelValue', $event)" @close="handleClose">
        <el-form ref="formRef" :model="formData" label-width="auto"  :validate-on-rule-change="false" label-position="right">
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-form-item label="Pkg" prop="pkg_name" required
                    :rules="[{ required: true, message: 'pkg_name is required', trigger: 'blur' }]">
                        <el-input v-model="formData.pkg_name" placeholder="eg. com.lazada.android" />
                    </el-form-item>
                </el-col>

                <el-col :span="8">
                    <el-form-item label="AdvId" prop="advs" required
                    :rules="[{ required: true, message: 'AdvId is required', trigger: 'blur' }]">
                        <el-input v-model="formData.advs" placeholder="eg. 123123,234234" />
                    </el-form-item>
                </el-col>

                <el-col :span="8">
                    <el-form-item label="Country" prop="country" required
                    :rules="[{ required: true, message: 'Country is required', trigger: 'blur' }]">
                        <el-input v-model="formData.country" placeholder="eg. us" />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="8">
                    <el-form-item label="TopBundleRange">
                        <el-input v-model="formData.top_bundle_range" placeholder="eg. 0-10" />
                    </el-form-item>
                </el-col>

                <el-col :span="8">
                    <el-form-item label="NearGatewayRange">
                        <el-input v-model="formData.near_gateway_range" placeholder="eg. 0-10" />
                    </el-form-item>
                </el-col>

                <el-col :span="8">
                    <el-form-item label="CommonRange">
                        <el-input v-model="formData.common_gateway_range" placeholder="eg. 0-10" />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="8">
                    <el-form-item label="Status">
                        <el-select v-model="formData.status" placeholder="Select status">
                            <el-option label="Enable" :value="1" />
                            <el-option label="Disable" :value="0" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <!-- 底部按钮 -->
        <template #footer>
            <div class="dialog-footer">
                <el-row justify="end">
                    <el-col :span="24" class="button-group">
                        <el-button type="primary" @click="handleSave('save')">Save</el-button>
                        <el-button type="primary" @click="handleSave('new')">New</el-button>
                    </el-col>
                </el-row>
            </div>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import type { FormInstance } from 'element-plus'
const formRef = ref<FormInstance>() // 添加表单引用

// 定义 props
const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    title: {
        type: String
    },
    formData: {
        type: Object,
        required: true
    }
})

const handleClose = () => {
  formRef.value?.resetFields() // 重置表单验证状态
  emit('close')
}
// 定义 emits
const emit = defineEmits(['update:modelValue', 'saveSplit', 'queryList','close'])

// 处理保存逻辑
const handleSave = (type: 'save' | 'new') => {
    emit('saveSplit', type)
}
</script>
<style scoped>
.dialog-footer {
    text-align: right;
}

.button-group {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    /* 按钮之间的间距 */
}
</style>