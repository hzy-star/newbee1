<!-- components/AlgorithmAbTestToolbar.vue -->
<template>
    <div class="toolbar">
        <div class="title-wrapper">
            <h2>AlgrithmAbTest</h2>
        </div>
        <div class="button-group">
            <el-button type="info" @click="handleFind(true)">Find</el-button>
            <el-input v-model="form.algConfig" type="textarea" :rows="2" placeholder="Enter content..." clearable />
            <el-button type="primary" v-if="RolePermissions.showBtn" @click="handleSave">Save</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { reqAlgconfigGetUrl, reqAlgconfigSaveUrl } from '@/api/setting/filterRule'
import { ElMessage } from 'element-plus'
import RolePermission from '@/store/modules/rolePermission'
const RolePermissions = RolePermission()

const form = ref({
    algConfig: ''
})
// 查询
const handleFind = async (type?: boolean) => {
    // 处理find逻辑
    try {
        const data = await reqAlgconfigGetUrl()
        form.value.algConfig = data.toString()
        if (type) {
            ElMessage({
                message: 'find was successful',
                type: 'success',
            })
        }

    } catch (err) {
        form.value.algConfig = ''
    }
}

const handleSave = async () => {
    // 处理save逻辑
    try {
        await reqAlgconfigSaveUrl(form.value)
        ElMessage({
            message: 'save was successful',
            type: 'success',
        })
        handleFind(false)
    } catch (err) {
        console.log(err)
    }
}
</script>

<style scoped lang="scss">
.toolbar {
    background: #fff;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .title-wrapper {
        margin-bottom: 1.2rem;
    }

    .button-group {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
}
</style>