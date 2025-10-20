<template>
    <div class="strategy-page">
        <div class="page-header">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="primary" @click="handleAddGroup">新增</el-button>
        </div>

        <div class="page-content">
            <p>
                <vxe-input v-model="filterName" type="search" placeholder="模糊搜索groups名称" clearable
                    @change="searchEvent" size="mini"></vxe-input>
                <vxe-select v-model="deviceSourceOption" type="search" placeholder="实时/离线" clearable size="mini"
                @change="handleDeviceSource">
                <vxe-option label="实时" value="online" />
                <vxe-option label="离线" value="offline" />
                </vxe-select>
            </p>
            <!-- Group列表表格 -->
            <vxe-table :data="strategyList" border round style="width: 100%" size="small" height="90%"
                :seq-config="seqConfigGroups" :expand-config="expandConfig" :row-style="rowStyleGroups" :header-cell-style="headerCellStyleGroups">
                <vxe-column field="xh" type="seq" align="center" title="序号" width="80"></vxe-column>
                <vxe-column type="expand" width="40">
                    <template #content="{ row }">
                        <div class="expand-wrapper">
                            <vxe-table :data="row.subInfoChild" :seq-config="seqConfigStrategy" :show-header="false" :row-style="rowStyleStrategy" :header-cell-style="headerCellStyleStrategy">
                                <vxe-column field="xh" type="seq" align="center" title="序号" width="120"></vxe-column>
                                <vxe-column field="name" title="策略名称" width="150" align="center" />
                                <vxe-column field="ruleFile" title="规则文件" min-width="220" />
                                <vxe-column field="returnType" title="返回类型" width="200" align="center" />
                                <vxe-column field="description" title="描述" width="200" show-header-overflow
                                    show-overflow />
                            </vxe-table>
                        </div>
                    </template>
                </vxe-column>
                <vxe-column field="name" title="Group名称" width="150" align="center" />
                <vxe-column field="status" title="状态" width="80" align="center">
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
                <vxe-column field="cutoff" title="截止值" mwidth="150" align="center" />
                <vxe-column field="formula" title="公式" width="200" align="center" />
                <!-- 实时/离线 -->
                <vxe-column field="deviceSource" title="设备来源" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag v-if="row.deviceSource === 'offline'" type="danger" size="small" >离线</el-tag>
                        <el-tag v-else-if="row.deviceSource === 'online'" type="primary" size="small" >实时</el-tag>
                        <el-tag v-else type="info" size="small" >未知</el-tag>
                    </template>
                </vxe-column>
                <!-- 是否落盘 -->
                <vxe-column field="groupType" title="是否落盘" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag v-if="row.groupType === 'writeToDisk'" type="success">是</el-tag>
                        <el-tag v-else type="info">否</el-tag>
                    </template>
                </vxe-column>
                <vxe-column title="操作" width="200" fixed="right" align="center">
                    <template #default="{ row }">
                        <el-button size="small" type="primary" plain @click="handleView(row)">查看</el-button>
                        <el-button size="small" type="success" plain @click="handleEditGroup(row)">编辑</el-button>
                        <el-button size="small" type="danger" plain @click="handleDelete(row)" :disabled="!isSuperAdmin">删除</el-button>
                    </template>
                </vxe-column>
            </vxe-table>
        </div>
        <!-- 新增/编辑弹窗 -->
        <GroupModel v-model="dialogVisible" :title="dialogTitle" :form="currentGroup" :is-view="isView"
            @submit="handleSubmit" />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive,watch } from 'vue'
import type { Groups } from '@/api/strategyAutoDelivery/groups/type'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reqStrategyGroupList, reqDeleteStrategyGroup } from '@/api/strategyAutoDelivery/groups/index'
import GroupModel from './model.vue'
import type { VxeTablePropTypes } from 'vxe-table'
import { reqStrategys } from '@/api/strategyAutoDelivery/strategyPage/index'
import XEUtils from 'xe-utils'
import type { VxeSelectEvents } from 'vxe-table'

// 获取父级传递的 isSuperAdmin 属性
defineProps<{
  isSuperAdmin: boolean
}>()
// 响应式数据
const strategyList = ref<Groups[]>([])
const strategyListBackUp = ref<Groups[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isView = ref(false)
const currentGroup = ref<Partial<Groups>>({})
const deviceSourceOption = ref('online') // 设备来源选项，默认值为 'online'

// 获取Group列表
const getStrategyGroupsList = async () => {
    try {
        const response = await reqStrategyGroupList()
        // strategyList.value = response.data || []
        strategyListBackUp.value = response.data || []
        applyDeviceSource(String(deviceSourceOption.value || ''))
    } catch (error) {
        ElMessage.error('获取Group列表失败')
    }
}

// 抽出通用过滤逻辑（接收字符串）
const applyDeviceSource = (val: string) => {
  if (val === 'online') {
    strategyList.value = strategyListBackUp.value.filter(item => item.deviceSource === 'online')
  } else if (val === 'offline') {
    strategyList.value = strategyListBackUp.value.filter(item => item.deviceSource === 'offline')
  } else {
    strategyList.value = strategyListBackUp.value
  }
}
// vxe-select 的 change 事件签名：({ value, $event, ... })
const handleDeviceSource: VxeSelectEvents.Change = ({ value }) => {
  applyDeviceSource(String(value || ''))
}
watch(deviceSourceOption, (newVal) => {
  applyDeviceSource(String(newVal || ''))
}, { immediate: true })
// 添加Group
const handleAddGroup = () => {
    currentGroup.value = { operator: 'big', returnType:'rank',status: 'enabled', cutoff: 0,groupType: 'normal', deviceSource: 'offline'} // 默认操作符
    // currentGroup.value = { operator: 'big', returnType:'rank',status: 'enabled', cutoff: 0} // 默认操作符
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
const findSubInfoChild = async (ids: number) => {
    try {
        const response = await reqStrategys({ ids })
        return response.data || []
    } catch (error) {
        ElMessage.error('获取子信息失败')
        return []
    }

}
const expandConfig = ref<VxeTablePropTypes.ExpandConfig<any>>({
    lazy: true,
    loadMethod({ row }) {
        const p: any = (row as any).strategyIds.split(',').map((item: any) => (item as any).split(':')[0]).join(',')
        // 调用接口
        return findSubInfoChild(p).then(data => {
            row.subInfoChild = data
        })
    }
})
const seqConfigGroups = reactive<VxeTablePropTypes.SeqConfig<any>>({
    seqMethod({ rowIndex }) {
        return `G${rowIndex + 1}`
    }
})
const seqConfigStrategy = reactive<VxeTablePropTypes.SeqConfig<any>>({
    seqMethod({ rowIndex }) {
        return `S${rowIndex + 1}`
    }
})





const filterName = ref('')
const handleSearchInput = () => {
  const filterVal = String(filterName.value).trim().toLowerCase()
  if (filterVal) {
    const filterRE = new RegExp(filterVal, 'gi')
    const searchProps = ['name']
    const rest = strategyListBackUp.value.filter((item: any) => searchProps.some(key => String(item[key]).toLowerCase().indexOf(filterVal) > -1))
    strategyList.value = rest.map(row => {
      // 搜索为克隆数据，不会污染源数据
      const item = XEUtils.clone(row) as any
      searchProps.forEach((key: any) => {
        item[key] = String(item[key]).replace(filterRE, match => `${match}`)
      })
      return item
    })
  } else {
    strategyList.value = strategyListBackUp.value
  }
}

// 节流函数,间隔500毫秒触发搜索
const searchEvent = XEUtils.throttle(function () {
  handleSearchInput()
}, 500, { trailing: true, leading: true })

const rowStyleGroups: VxeTablePropTypes.RowStyle<any> = ({ rowIndex }) => {
    return {
        backgroundColor: '#f0f9eb',
        // background: 'linear-gradient(to left, #f0f9eb, #d8edc8, #c0e1a5)'
    }
}
const headerCellStyleGroups: VxeTablePropTypes.HeaderCellStyle<any> = ({ column }) => {
    return {
        backgroundColor: '#f0f9eb',
    }
}
const rowStyleStrategy: VxeTablePropTypes.RowStyle<any> = ({ rowIndex }) => {
    return {
        backgroundColor: '#fffbf4',
        // background: 'linear-gradient(to left, #f0f9eb, #f8f7f0, #fffbf4)'
    }
}
const headerCellStyleStrategy: VxeTablePropTypes.HeaderCellStyle<any> = ({ column }) => {
    return {
        backgroundColor: '#fffbf4',
    }
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
        // margin-bottom: 10px;
        height: 5%;

        h2 {
            margin: 0;
            color: #303133;
        }
    }
    .page-content {
        height: 95%;
    }
}
</style>