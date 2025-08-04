<template>
    <div class="strategy-page">
        <div class="page-header">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="primary" @click="handleAddFlow">新增</el-button>
        </div>

        <!-- Flow列表表格 -->
        <vxe-table :data="strategyList"  border style="width: 100%"
            size="small" stripe height="90%">
            <vxe-column field="xh" type="seq" align="center" title="序号" width="5%" ></vxe-column>
            <vxe-column field="name" title="Flow名称" min-width="50" align="center" />
            <vxe-column field="status" title="状态" min-width="20" align="center">
                <template #default="{ row }">
                    <el-tag v-if="row.status" :type="row.status === 'enabled' ? 'success' : 'danger'">
                        {{ row.status === 'enabled' ? '启用' : '禁用' }}
                    </el-tag>
                </template>
            </vxe-column>
            <vxe-column field="pkgName" title="pkg" min-width="20" align="center" />
            <vxe-column field="country" title="国家" min-width="20" align="center" />
            <vxe-column field="os" title="操作系统" min-width="20" align="center" />
            <vxe-column field="returnType" title="返回类型" min-width="30" align="center" />
            <vxe-column field="cutoff" title="截止值" min-width="50" align="center" />
            <vxe-column field="formula" title="公式配置" min-width="300" align="left">
                <template #default="{ row }">
                    <div v-if="row.formula" class="formula-container">
                        <div v-for="(item, index) in parseFormula(row.formula)" :key="index" class="formula-item">
                            <div class="formula-grid">
                                <!-- 公式字段 -->
                                <div class="formula-cell">
                                    <span class="formula-label">公式:</span>
                                    <el-tooltip :content="item.formula" placement="top"
                                        :disabled="!item.formula || item.formula.length <= 15">
                                        <span class="formula-value text-ellipsis">
                                            {{ item.formula || '-' }}
                                        </span>
                                    </el-tooltip>
                                </div>

                                <!-- 截止值字段 -->
                                <div class="formula-cell">
                                    <span class="formula-label">截止值:</span>
                                    <span class="formula-value">{{ item.cutoff }}</span>
                                </div>

                                <!-- 操作符字段 -->
                                <div class="formula-cell">
                                    <span class="formula-label">操作符:</span>
                                    <span class="formula-value" :class="getOperatorClass(item.operator)">
                                        {{ formatOperator(item.operator) }}
                                    </span>
                                </div>
                            </div>
                            <el-divider v-if="index < parseFormula(row.formula).length - 1" />
                        </div>
                    </div>
                    <span v-else>-</span>
                </template>
            </vxe-column>
            <vxe-column title="操作" width="200" fixed="right" align="center">
                <template #default="{ row }">
                    <el-button size="small" @click="handleView(row)">查看</el-button>
                    <el-button size="small" type="primary" @click="handleEditFlow(row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                </template>
            </vxe-column>
        </vxe-table>

        <!-- 新增/编辑弹窗 -->
        <FlowModel v-model="dialogVisible" :title="dialogTitle" :form="currentFlow" :is-view="isView"
            @submit="handleSubmit" />
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import type { Flows } from '@/api/strategyAutoDelivery/flow/type'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reqFlow, reqDeleteFlow, reqFlowId, } from '@/api/strategyAutoDelivery/flow/index'
import FlowModel from './model.vue'


// 响应式数据
const strategyList = ref<Flows[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isView = ref(false)
const currentFlow = ref<Partial<Flows>>({})

// 获取Flow列表
const getStrategyFlowsList = async () => {
    try {
        const response = await reqFlow()
        strategyList.value = response.data || []
    } catch (error) {
        ElMessage.error('获取Flow列表失败')
    }
}

// 添加Flow
const handleAddFlow = () => {
    currentFlow.value = { operator: 'big', status: 'enabled', cutoff: 0 } // 默认操作符
    dialogTitle.value = '新增Flow'
    isView.value = false
    dialogVisible.value = true
}

// 查看Flow
const handleView = (row: Flows) => {
    currentFlow.value = { ...row }
    dialogTitle.value = '查看Flow'
    isView.value = true
    dialogVisible.value = true
}

// 编辑Flow
const handleEditFlow = (row: Flows) => {
    currentFlow.value = { ...row }
    dialogTitle.value = '编辑Flow'
    isView.value = false
    dialogVisible.value = true
}

// 删除Flow
const handleDelete = async (row: Flows) => {
    try {
        await ElMessageBox.confirm(`确定删除Flow: ${row.name} ?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        const response = await reqDeleteFlow({ id: row.id })
        if (response.code === 200 || response.success === true) {
            ElMessage.success('删除成功')
            getStrategyFlowsList()
        } else {
            ElMessage.error(response.errMsg || '删除失败')
        }
    } catch (error) {
        console.error('删除操作异常:', error)
    }
}

// 表单提交处理
const handleSubmit = () => {
    getStrategyFlowsList()
}

// 查询Flow列表
const handleSearch = () => {
    getStrategyFlowsList()
}
// 添加的方法
const parseFormula = (formulaStr: string) => {
    try {
        return JSON.parse(formulaStr)
    } catch (e) {
        console.error('解析公式失败:', e)
        return []
    }
}

const formatOperator = (operator: string) => {
    const operatorMap: Record<string, string> = {
        big: '>',
        small: '<',
        equal: '='
    }
    return operatorMap[operator] || operator
}
// 操作符颜色分类方法
const getOperatorClass = (operator: string) => {
    return {
        big: 'operator-big',
        small: 'operator-small',
        equal: 'operator-equal'
    }[operator] || ''
}
// 页面初始化
onMounted(() => {
    // getStrategyFlowsList()
})
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
.formula-container {
  padding: 8px;
}

.formula-grid {
  display: grid;
  grid-template-columns: 150px 80px 80px; /* 三列固定宽度 */
  gap: 10px;
  align-items: center;
}

.formula-cell {
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 28px; /* 固定高度保持对齐 */
}

.formula-label {
  font-weight: bold;
  color: #606266;
  font-size: 12px;
  flex-shrink: 0;
}

.formula-value {
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

/* 操作符颜色 */
.operator-big { color: #67c23a; }
.operator-small { color: #f56c6c; }
.operator-equal { color: #e6a23c; }

:deep(.el-divider) {
  margin: 6px 0;
}
</style>