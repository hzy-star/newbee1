<template>
    <div class="algtask">
        <!-- 查询条件 -->
        <div class="algtask_header">
            <el-row :gutter="20" type="flex" justify="start" style="margin: 0;">
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">pkgName</div>
                        <el-input v-model="searchForm.pkgName" clearable />
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">country</div>
                        <el-input v-model="searchForm.country" clearable />
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">etype</div>
                        <el-select v-model="searchForm.etype" placeholder="请选择" clearable>
                            <el-option label="click" value="click" />
                            <el-option label="imp" value="imp" />
                        </el-select>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">os</div>
                        <el-select v-model="searchForm.os" placeholder="请选择" clearable>
                            <el-option label="android" value="android" />
                            <el-option label="ios" value="ios" />
                        </el-select>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">status</div>
                        <el-select v-model="searchForm.status" placeholder="请选择" clearable>
                            <el-option label="enabled" value="enabled" />
                            <el-option label="disabled" value="disabled" />
                        </el-select>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">appId</div>
                        <el-input v-model="searchForm.appId" clearable />
                    </div>
                </el-col>
            </el-row>
            <div class="form-item-buttons">
                <div></div>
                <div class="form-item-right">
                    <el-button type="primary" @click="handleSearch">查询</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </div>
            </div>
        </div>

        <!-- 数据表格 -->
        <div class="algtask_table">
            <div class="vxe-table-div">
                <vxe-table border round size="small" height="100%"
                    :column-config="{ resizable: true }"
                    :cell-config="{ verticalAlign: 'center' }"
                    :row-config="{ isCurrent: false, isHover: true }"
                    :scroll-y="{ enabled: true, gt: 50 }"
                    :data="tableDataList"
                    :loading="loading"
                    >
                    <vxe-column type="seq" title="#" width="60" align="center" />
                    <vxe-column field="pkgName" title="pkgName" width="160" show-overflow align="center" />
                    <vxe-column field="os" title="os" width="80" align="center" />
                    <vxe-column field="country" title="country" width="80" align="center" />
                    <vxe-column field="status" title="status" width="90" align="center">
                        <template #default="{ row }">
                            <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'" size="small">
                                {{ row.status }}
                            </el-tag>
                        </template>
                    </vxe-column>
                    <vxe-column field="etype" title="etype" width="80" align="center" />
                    <vxe-column field="flow" title="flow" width="120" show-overflow align="center">
                        <template #default="{ row }">{{ row.flow ?? '-' }}</template>
                    </vxe-column>
                    <vxe-column field="rtaName" title="rtaName" width="120" show-overflow align="center">
                        <template #default="{ row }">{{ row.rtaName ?? '-' }}</template>
                    </vxe-column>
                    <vxe-column field="ruleFile" title="ruleFile" width="120" show-overflow align="center">
                        <template #default="{ row }">{{ row.ruleFile ?? '-' }}</template>
                    </vxe-column>
                    <vxe-column field="configs" title="configs" min-width="280" :show-overflow="false">
                        <template #default="{ row }">
                            <div v-if="parseConfigs(row.configs)" class="configs-box">
                                <div v-for="(val, key) in parseConfigs(row.configs)" :key="key" class="configs-item">
                                    <span class="configs-key">{{ key }}:</span> {{ val }}
                                </div>
                            </div>
                            <span v-else>-</span>
                        </template>
                    </vxe-column>
                    <vxe-column field="updated" title="updated" width="160" align="center">
                        <template #default="{ row }">
                            {{ row.updated ? dayjs(row.updated).format('YYYY-MM-DD HH:mm:ss') : '-' }}
                        </template>
                    </vxe-column>
                    <vxe-column title="操作" width="80" align="center" fixed="right">
                        <template #default="{ row }">
                            <el-button link type="primary" @click="openHistory(row)">
                                <el-icon><Clock /></el-icon>
                            </el-button>
                        </template>
                    </vxe-column>
                </vxe-table>
            </div>
        </div>

        <!-- 历史记录弹窗 -->
         <AlgHistoryTaskTable v-model="showHistoryModal" :title="historyTitle" :historyId="String(historyId)" />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { Clock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { reqPkgTaskUrl } from '@/api/pushtask/algtask'
import AlgHistoryTaskTable from '@/components/task/AlgTask/AlgTaskHistory.vue'

// ---------- 搜索 ----------
const searchForm = ref({
    pkgName: '',
    country: '',
    etype: '',
    os: '',
    status: '',
    appId: '',
})

/** 构建非空参数 */
const buildParams = () => {
    const params: Record<string, string> = {}
    Object.entries(searchForm.value).forEach(([k, v]) => {
        if (v) params[k] = v
    })
    return Object.keys(params).length ? params : undefined
}

// ---------- 表格 ----------
const loading = ref(false)
const tableDataList = ref<any[]>([])

const fetchList = async () => {
    loading.value = true
    try {
        const res = await reqPkgTaskUrl(buildParams())
        if (res?.success) {
            tableDataList.value = res.data || []
        } else {
            ElMessage.error(res?.message || '查询失败')
        }
    } catch {
        ElMessage.error('查询失败')
    } finally {
        loading.value = false
    }
}

const handleSearch = () => {
    fetchList()
}

const handleReset = () => {
    searchForm.value = { pkgName: '', country: '', etype: '', os: '', status: '', appId: '' }
    fetchList()
}

/** 解析 configs JSON 字符串 */
const parseConfigs = (configs: string | null | undefined): Record<string, any> | null => {
    if (!configs) return null
    try {
        return JSON.parse(configs)
    } catch {
        return null
    }
}

// ---------- 历史记录 ----------
const showHistoryModal = ref<boolean>(false)
const historyTitle = ref<string>('')
const historyId = ref<string>('')



const openHistory = async (row: any) => {
    showHistoryModal.value = true
    historyTitle.value = `TaskDetail [${row.id}]`
    historyId.value = row.id
}

onMounted(() => {
    fetchList()
})
</script>

<style scoped lang="scss">
.algtask {
    width: 100%;
    height: calc(100vh - $base-tabbar-height - 10px);
    display: flex;
    flex-direction: column;
    padding: 10px;
    box-sizing: border-box;
}

.algtask_header {
    margin-bottom: 10px;
}

.algtask_table {
    flex: 1;
    overflow: hidden;

    .vxe-table-div {
        height: 100%;
    }
}

.el-col {
    margin: 2px 0;
}

.form-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
}

.form-item-label {
    font-weight: bold;
    color: #606266;
    margin: 0 10px;
    text-align: left;
    width: 80px;
    white-space: nowrap;
}

.form-item-buttons {
    display: flex;
    justify-content: space-between;
    padding-top: 8px;
}

.form-item-right {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.configs-box {
    text-align: left;
    line-height: 1.6;

    .configs-item {
        word-break: break-all;
        white-space: normal;
    }

    .configs-key {
        font-weight: bold;
        color: #4b5563;
    }
}
</style>
