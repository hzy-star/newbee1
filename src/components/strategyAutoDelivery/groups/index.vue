<template>
    <div class="strategy-page">
        <div class="page-header">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="primary" @click="handleAddGroup">新增</el-button>
        </div>

        <!-- Group列表表格 -->
        <vxe-table :data="strategyList" border style="width: 100%" size="small" stripe height="90%">
            <vxe-column field="xh" type="seq" align="center" title="序号" width="5%"></vxe-column>
            <vxe-column field="name" title="Group名称" min-width="50" align="center" />
            <vxe-column field="status" title="状态" min-width="110" align="center">
                <template #default="{ row }">
                    <el-tag v-if="row.status" :type="row.status === 'enabled' ? 'success' : 'danger'">
                        {{ row.status === 'enabled' ? '启用' : '禁用' }}
                    </el-tag>
                </template>
            </vxe-column>
            <vxe-column field="operator" title="操作符" min-width="50" align="center">
                <template #default="{ row }">
                    {{ row.operator === 'big' ? '>' : row.operator === 'small' ? '<' : '=' }} </template>
            </vxe-column>
            <vxe-column field="returnType" title="返回类型" min-width="30" align="center" />
            <vxe-column field="cutoff" title="截止值" min-width="50" align="center" />
            <vxe-column field="formula" title="公式" min-width="50" align="center" />
            <vxe-column title="操作" width="200" fixed="right" align="center">
                <template #default="{ row }">
                    <el-button size="small" @click="handleView(row)">查看</el-button>
                    <el-button size="small" type="primary" @click="handleEditGroup(row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
                </template>
            </vxe-column>
        </vxe-table>

        <!-- 新增/编辑弹窗 -->
        <GroupModel v-model="dialogVisible" :title="dialogTitle" :form="currentGroup" :is-view="isView"
            @submit="handleSubmit" />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import type { Groups } from '@/api/strategyAutoDelivery/groups/type'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reqStrategyGroupList, reqDeleteStrategyGroup } from '@/api/strategyAutoDelivery/groups/index'
import GroupModel from './model.vue'

// 响应式数据
const strategyList = ref<Groups[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isView = ref(false)
const currentGroup = ref<Partial<Groups>>({})

// 获取Group列表
const getStrategyGroupsList = async () => {
    try {
        const response = await reqStrategyGroupList()
        strategyList.value = response.data || []
    } catch (error) {
        ElMessage.error('获取Group列表失败')
    }
}

// 添加Group
const handleAddGroup = () => {
    currentGroup.value = { operator: 'big',status:'enabled',cutoff:0,formula:'and' } // 默认操作符
    dialogTitle.value = '新增Group'
    isView.value = false
    dialogVisible.value = true
}

// 查看Group
const handleView = (row: Groups) => {
    currentGroup.value = { ...row }
    dialogTitle.value = '查看Group'
    isView.value = true
    dialogVisible.value = true
}

// 编辑Group
const handleEditGroup = (row: Groups) => {
    currentGroup.value = { ...row }
    dialogTitle.value = '编辑Group'
    isView.value = false
    dialogVisible.value = true
}

// 删除Group
const handleDelete = async (row: Groups) => {
    try {
        await ElMessageBox.confirm(`确定删除Group: ${row.name} ?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        const response = await reqDeleteStrategyGroup({ id: row.id })
        if (response.code === 200 || response.success === true) {
            ElMessage.success('删除成功')
            getStrategyGroupsList()
        } else {
            ElMessage.error(response.errMsg || '删除失败')
        }
    } catch (error) {
        console.error('删除操作异常:', error)
    }
}

// 表单提交处理
const handleSubmit = () => {
    getStrategyGroupsList()
}

// 查询Group列表
const handleSearch = () => {
    getStrategyGroupsList()
}

// 页面初始化
onMounted(() => {
    // getStrategyGroupsList()
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
</style>