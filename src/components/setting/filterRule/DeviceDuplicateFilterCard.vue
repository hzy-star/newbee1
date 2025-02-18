<!-- components/DeviceDuplicateFilterCard.vue -->
<template>
    <div class="card">
        <div class="card-header">
            <h2>DeviceDuplicateFilter</h2>
            <div class="action-button">
                <el-icon @click="handleRefresh" title="Refresh">
                    <RefreshRight />
                </el-icon>
                <el-button type="primary" @click="handleQuery">Query</el-button>
            </div>
        </div>

        <div class="input-group">
            <label>deviceIdDual (minute)</label>
            <el-input v-model="form.adxDeviceDualMin" clearable />
        </div>

        <div class="input-group">
            <label>maxDisableDays (day)</label>
            <el-input v-model="form.maxDisableDays" clearable />
        </div>

        <div class="input-group">
            <label>adxNames</label>
            <el-input v-model="form.adxFilterList" :rows="3" type="textarea" clearable />
        </div>

        <div class="input-group">
            <label>primaryPkgDeviceDual (minute)</label>
            <el-input v-model="form.pkgDeviceDualMin" clearable />
        </div>

        <div class="input-group">
            <label>secondPkgDeviceDual (minute)</label>
            <el-input v-model="form.secondaryPkgDeviceDualMin" clearable />
        </div>

        <div class="input-group">
            <label>ShortTimePkgDeviceDual (minute)</label>
            <el-input v-model="form.shortTimePkgDeviceDualMin" clearable />
        </div>

        <div class="action-buttons">
            <el-button type="primary" v-if="showBtn" @click="handleConfig">Config</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive ,inject } from 'vue'
import { reqIfaGetUrl, reqIfaSaveUrl } from '@/api/setting/filterRule'
import { FilterForm } from '@/api/setting/filterRule/type'
import { ElMessage } from 'element-plus'
const showBtn = inject('showBtn') as boolean


const form = reactive<FilterForm>({
    adxDeviceDualMin: '',
    maxDisableDays: '',
    adxFilterList: '',
    pkgDeviceDualMin: '',
    secondaryPkgDeviceDualMin: '',
    shortTimePkgDeviceDualMin: ''
})
// 配置
const handleConfig = async () => {
    try {
        // 过滤掉值为空的字段
        const filteredForm = Object.fromEntries(
            Object.entries(form).filter(([_, value]) => value !== '')
        )
        // 发送请求
        const response = await reqIfaSaveUrl(filteredForm)
        console.log(response)
        ElMessage({
            message: 'config was successful',
            type: 'success',
        })
    } catch (error) {
        console.error(error)
    }
}

// 查询
const handleQuery = async () => {
    try {
        const response = await reqIfaGetUrl()
        console.log(response)
        ElMessage({
            message: 'query was successful',
            type: 'success',
        })
        // 遍历 form 的 key，自动赋值
        Object.keys(form).forEach((key) => {
            // @ts-ignore 忽略 TS 类型检查
            form[key] = response[key] !== undefined ? response[key].toString() : ''
        })
    } catch (error) {
        console.error(error)
    }
}
// 刷新
const handleRefresh = () => {
    // 清空表单
    Object.keys(form).forEach((key) => {
        // @ts-ignore 忽略 TS 类型检查
        form[key] = ''
    })
}
</script>

<style scoped lang="scss">
.card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.2rem;

        h2 {
            flex: 1;
            /* 让标题占据可用空间，推开右侧按钮 */
        }

        .action-button {
            display: flex;
            align-items: center;
            gap: 1rem;
            /* 调整图标和按钮的间距 */
            justify-content: flex-end;
            /* 让内容靠右对齐 */
            flex-shrink: 0;
            /* 防止按钮被挤压 */
        }
    }
}

.input-group {
    margin-bottom: 1.2rem;
}

.input-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #666;
    font-size: 0.9rem;
}



.action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
}
</style>