<template>
    <div class="strategy-page">
        <div class="page-header">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="primary" @click="handleAddFlowConfig">新增</el-button>
        </div>

        <!-- FlowConfig列表表格 -->
        <vxe-table :data="strategyList" border style="width: 100%" size="small" stripe height="90%">
            <vxe-column field="xh" type="seq" align="center" title="序号" width="5%"></vxe-column>
            <vxe-column field="pkgName" title="pkg" min-width="20" align="center" />
            <vxe-column field="country" title="国家" min-width="20" align="center" />
            <vxe-column field="config" title="config" min-width="300" align="center">
                <template #default="{ row }">
                    <div v-if="row.config" class="config-container">
                        <div v-for="(item, index) in parseFormula(row.config)" :key="index" class="config-item">
                            <div class="config-grid">
                                <!-- 公式字段 -->
                                <div class="config-cell">
                                    <span class="config-label">flow:</span>
                                    <el-tooltip :content="item.flowName" placement="top"
                                        :disabled="!item.flowName || item.flowName.length <= 15">
                                        <span class="config-value text-ellipsis">
                                            {{ item.flowName }}
                                        </span>
                                    </el-tooltip>
                                </div>

                                <!-- 截止值字段 -->
                                <div class="config-cell">
                                    <span class="config-label">config:</span>
                                    <span class="config-value">{{ item.flowConfig }}</span>
                                </div>
                            </div>
                            <el-divider v-if="index < parseFormula(row.config).length - 1" />
                        </div>
                    </div>
                    <span v-else>-</span>
                </template>
            </vxe-column>
            <vxe-column title="操作" width="200" fixed="right" align="center">
                <template #default="{ row }">
                    <el-button size="small" @click="handleView(row)">查看</el-button>
                    <el-button size="small" type="primary" @click="handleEditFlowConfig(row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                </template>
            </vxe-column>
        </vxe-table>

        <!-- 新增/编辑弹窗 -->
        <ConfigModel v-model="dialogVisible" :title="dialogTitle" :form="currentFlowConfig" :is-view="isView"
            @submit="handleSubmit" />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { reqCreateOrUpdatFlowConfig, reqFlowConfig, reqFlowConfigId, reqDeleteFlowConfig } from '@/api/strategyAutoDelivery/flowConfig/index';
import ConfigModel from './model.vue'

// 响应式数据
const strategyList = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isView = ref(false)
const currentFlowConfig = ref<Partial<any>>({})

// 获取FlowConfig列表
const getStrategyFlowConfigsList = async () => {
    try {
        const response = await reqFlowConfig()
        strategyList.value = response.data || []
    } catch (error) {
        ElMessage.error('获取FlowConfig列表失败')
    }
}

// 添加FlowConfig
const handleAddFlowConfig = () => {
    currentFlowConfig.value = { operator: 'big', status: 'enabled', cutoff: 0 } // 默认操作符
    dialogTitle.value = '新增FlowConfig'
    isView.value = false
    dialogVisible.value = true
}

// 查看FlowConfig
const handleView = (row: any) => {
    currentFlowConfig.value = { ...row }
    dialogTitle.value = '查看FlowConfig'
    isView.value = true
    dialogVisible.value = true
}

// 编辑FlowConfig
const handleEditFlowConfig = (row: any) => {
    currentFlowConfig.value = { ...row }
    dialogTitle.value = '编辑FlowConfig'
    isView.value = false
    dialogVisible.value = true
}

// 删除FlowConfig
const handleDelete = async (row: any) => {
    try {
        await ElMessageBox.confirm(`确定删除FlowConfig: ${row.pkgName} ?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        const response = await reqDeleteFlowConfig({ id: row.id })
        if (response.code === 200 || response.success === true) {
            ElMessage.success('删除成功')
            getStrategyFlowConfigsList()
        } else {
            ElMessage.error(response.errMsg || '删除失败')
        }
    } catch (error) {
        console.error('删除操作异常:', error)
    }
}
// 添加的方法
const parseFormula = (formulaStr: string) => {
    if (!formulaStr) return [];

    try {
        return formulaStr.split(',').map(item => {
            const [flowName, flowConfig] = item.split(':');
            return {
                flowName: flowName || '-',
                flowConfig: flowConfig || '-'
            };
        });
    } catch (e) {
        console.error('解析公式失败:', e);
        return [];
    }
}
// 表单提交处理
const handleSubmit = () => {
    getStrategyFlowConfigsList()
}
// 查询FlowConfig列表
const handleSearch = () => {
    getStrategyFlowConfigsList()
}
</script>

<style lang="scss" scoped>
.strategy-page {
    height: calc(100vh - #{$base-tabbar-height} - 60px);

    .page-header {
        display: flex;
        justify-content: end;
        align-items: center;
        margin-bottom: 10px;

        h2 {
            margin: 0;
            color: #303133;
        }
    }
}

.config-container {
    padding: 8px;
    .config-item{
    }
}

.config-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    align-items: center;
}

.config-cell {
    display: flex;
    align-items: center;
    gap: 5px;
    min-height: 28px;
}

.config-label {
    font-weight: bold;
    color: #606266;
    font-size: 12px;
    flex-shrink: 0;
}

.config-value {
    color: #303133;
    font-size: 13px;
}

.text-ellipsis {
    display: inline-block;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

:deep(.el-divider) {
    margin: 6px 0;
}
</style>