<template>
    <div class="strategy-page">
        <div class="page-header">
            <el-button type="primary" @click="handleDataeye">DATAEYE</el-button>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="primary" @click="handleAddFlow" v-if="!showDetail" >新增</el-button>
            <el-button type="success" @click="toggleDetail">
                {{ showDetail ? '返回列表' : '切换详情' }}
            </el-button>
        </div>
        <div class="page-content"  v-show="!showDetail">
            <p>
                <vxe-input v-model="filterName" type="search" placeholder="模糊搜索flow名称" clearable @change="searchEvent"
                    size="mini"></vxe-input>
                <vxe-select v-model="deviceSourceOption" type="search" placeholder="实时/离线" clearable size="mini"
                @change="handleDeviceSource">
                <vxe-option label="实时" value="online" />
                <vxe-option label="离线" value="offline" />
                </vxe-select>
            </p>
            <!-- Flow列表表格 -->
            <vxe-table :data="strategyList" border round style="width: 100%" size="small" height="90%"
                :expand-config="expandConfig" :row-style="rowStyle" :header-cell-style="headerCellStyle">
                <vxe-column field="xh" type="seq" align="center" title="序号" width="80">
                    <template #default="{ row, rowIndex }">
                        <h1 style="font-size: large;font-weight: 900;">F{{ rowIndex + 1 }}</h1>
                    </template>
                </vxe-column>
                <vxe-column type="expand" width="60">
                    <template #content="{ row }">
                        <div class="expand-wrapper">
                            <vxe-table :data="row.subInfo" :expand-config="expandConfig" :seq-config="seqConfigGroups"
                                :show-header="true" :row-style="rowStyleGroups" :header-cell-style="headerCellStyleGroups">
                                <vxe-column field="xh" type="seq" align="center" title="序号" width="100">
                                    <template #default="{ row, rowIndex }">
                                        <h2 style="font-size: medium;font-weight: 700;">G{{ rowIndex + 1 }}</h2>
                                    </template>
                                </vxe-column>
                                <vxe-column type="expand" width="40">
                                    <template #content="{ row }">
                                        <div class="expand-wrapper">
                                            <vxe-table :data="row.subInfoChild" :seq-config="seqConfigStrategy"
                                                :show-header="true" :row-style="rowStyleStrategy" :header-cell-style="headerCellStyleStrategy">
                                                <vxe-column field="xh" type="seq" align="center" title="序号" width="140">
                                                    <template #default="{ row, rowIndex }">
                                                        <h3 style="font-size: small;font-weight: 500;">S{{ rowIndex + 1
                                                            }}</h3>
                                                    </template>
                                                </vxe-column>
                                                <vxe-column field="name" title="策略名称" width="150" align="center">
                                                    <template #default="{ row }">
                                                        <span style="font-weight: 500;">{{ row.name }}</span>
                                                    </template>
                                                </vxe-column>
                                                <vxe-column field="ruleFile" title="规则文件" min-width="220" />
                                                <vxe-column field="returnType" title="返回类型" width="200"
                                                    align="center" />
                                                <vxe-column field="description" title="描述" width="200"
                                                    show-header-overflow align="center" show-overflow />
                                            </vxe-table>
                                        </div>
                                    </template>
                                </vxe-column>
                                <vxe-column field="name" title="Group名称" width="150" align="center">

                                    <!-- 加粗字体 -->
                                    <template #default="{ row }">
                                        <span style="font-weight: 600;">{{ row.name }}</span>
                                    </template>
                                </vxe-column>
                                <vxe-column field="status" title="状态" width="80" align="center">
                                    <template #default="{ row }">
                                        <el-tag v-if="row.status"
                                            :type="row.status === 'enabled' ? 'success' : 'danger'">
                                            {{ row.status === 'enabled' ? '启用' : '禁用' }}
                                        </el-tag>
                                    </template>
                                </vxe-column>
                                <vxe-column field="operator" title="操作符" min-width="50" align="center">
                                    <template #default="{ row }">
                                        {{ row.operator === 'big' ? '>' : row.operator === 'small' ? '<' : '=' }}
                                            </template>
                                </vxe-column>
                                <vxe-column field="returnType" title="返回类型" min-width="30" align="center" />
                                <vxe-column field="cutoff" title="截止值" width="200" align="center" />
                                <vxe-column field="formula" title="公式" width="200" align="center" />
                            </vxe-table>
                        </div>
                    </template>
                </vxe-column>
                <vxe-column field="name" title="Flow名称" width="150" align="center">
                    <!-- 加粗字体 -->
                    <template #default="{ row }">
                        <span style="font-weight: 900;font-style: italic;">{{ row.name }}</span>
                    </template>
                </vxe-column>
                <vxe-column field="status" title="状态" width="80" align="center">
                    <template #default="{ row }">
                        <el-tag v-if="row.status" :type="row.status === 'enabled' ? 'success' : 'danger'">
                            {{ row.status === 'enabled' ? '启用' : '禁用' }}
                        </el-tag>
                    </template>
                </vxe-column>
                <!-- 实时/离线 -->
                <vxe-column field="deviceSource" title="设备来源" width="80" align="center">
                    <template #default="{ row }">
                        <el-tag v-if="row.deviceSource === 'offline'" type="danger" size="small" >离线</el-tag>
                        <el-tag v-else-if="row.deviceSource === 'online'" type="primary" size="small" >实时</el-tag>
                        <el-tag v-else type="info" size="small" effect="plain">未知</el-tag>
                    </template>
                </vxe-column>
                <vxe-column field="formula" title="公式配置" min-width="300" align="center">
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
                                    <div class="formula-cell" style="width: 100px;">
                                        <span class="formula-label">截止值:</span>
                                        <span class="formula-value">{{ item.cutoff }}</span>
                                    </div>

                                    <!-- 操作符字段 -->
                                    <div class="formula-cell" style="width: 100px;">
                                        <span class="formula-label">操作符:</span>
                                        <span class="formula-value" :class="getOperatorClass(item.operator)">
                                            {{ formatOperator(item.operator) }}
                                        </span>
                                    </div>
                                    <!-- 阈值配置字段 -->
                                    <div class="formula-cell">
                                        <span class="formula-label">阈值配置:</span>
                                        <el-tooltip :content="thresholdMap[item.thresholdId]" placement="top"
                                            :disabled="!thresholdMap[item.thresholdId] || thresholdMap[item.thresholdId].length <= 15">
                                            <span class="formula-value text-ellipsis">
                                                {{ thresholdMap[item.thresholdId] || '-' }}
                                            </span>
                                        </el-tooltip>
                                    </div>
                                </div>
                                <el-divider v-if="index < parseFormula(row.formula).length - 1" border-style="dashed" />
                            </div>
                        </div>
                        <span v-else>-</span>
                    </template>
                </vxe-column>
                <vxe-column field="description" title="描述" width="200" align="center"  show-overflow/>
                <vxe-column title="操作" width="200" fixed="right" align="center">
                    <template #default="{ row }">
                        <el-button size="small" type="primary" plain @click="handleView(row)">查看</el-button>
                        <el-button size="small" type="success" plain @click="handleEditFlow(row)">编辑</el-button>
                        <el-button size="small" type="danger" plain @click="handleDelete(row)" :disabled="!isSuperAdmin">删除</el-button>
                    </template>
                </vxe-column>
            </vxe-table>
        </div>
        <div class="page-content" v-show="showDetail">
            <KeepAlive>
                <DetailPage  ref="detailRef"/>
            </KeepAlive>
        </div>

        <!-- 新增/编辑弹窗 -->
        <FlowModel v-model="dialogVisible" :title="dialogTitle" :form="currentFlow" :is-view="isView"
            @submit="handleSubmit" />
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted,computed , watch } from 'vue'
import type { Flows } from '@/api/strategyAutoDelivery/flow/type'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reqFlow, reqDeleteFlow, reqFlowId, } from '@/api/strategyAutoDelivery/flow/index'
import { reqStrategyGroup } from '@/api/strategyAutoDelivery/groups/index'
import { reqStrategys } from '@/api/strategyAutoDelivery/strategyPage/index'
import FlowModel from './model.vue'
import type { VxeTablePropTypes } from 'vxe-table'
import XEUtils from 'xe-utils'
import DetailPage from './detail.vue' // 新建的详情组件
import type Detail from './detail.vue'
import { ThresholdPinia } from '@/store/strategyAutoDelivery/threshold'
import type { VxeSelectEvents } from 'vxe-table'
const thresholdStore = ThresholdPinia()

// 获取父级传递的 isSuperAdmin 属性
defineProps<{
  isSuperAdmin: boolean
}>()

// 响应式数据
const strategyList = ref<Flows[]>([])
const strategyListBackUp = ref<Flows[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isView = ref(false)
const currentFlow = ref<Partial<Flows>>({})
const showDetail = ref(false)
const deviceSourceOption = ref('online') // 设备来源选项，默认值为 'online'

const toggleDetail = () => {
  showDetail.value = !showDetail.value
}

// 获取Flow列表
const getStrategyFlowsList = async () => {
    try {
        const response = await reqFlow()
        // response.data = response.data.sort((a:any,b:any) => a.name.localeCompare(b.name)) // 按name排序
        const priority: Record<string, number> = { online: 0, offline: 1 }
        response.data = (response.data || []).sort((a: any, b: any) => {
            const nameCmp = String(a.name || '').localeCompare(String(b.name || ''), 'zh', { sensitivity: 'base' })
            if (nameCmp !== 0) return nameCmp
            const pa = priority[String(a.deviceSource)] ?? 99
            const pb = priority[String(b.deviceSource)] ?? 99
            return pa - pb
        })
        // strategyList.value = response.data || []
        // strategyList 通过相同name排序 
        // strategyList.value =  strategyList.value.sort((a, b) => a.name.localeCompare(b.name))
        strategyListBackUp.value = response.data || []
        applyDeviceSource(String(deviceSourceOption.value || ''))
    } catch (error) {
        ElMessage.error('获取Flow列表失败')
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
// 添加Flow
const handleAddFlow = () => {
    currentFlow.value = { operator: 'big', status: 'enabled', cutoff: 0,flowType:'normal',syncFile: '',description: '',deviceSource:'offline' } // 默认操作符
    // currentFlow.value = { operator: 'big', status: 'enabled', cutoff: 0 } // 默认操作符
    dialogTitle.value = '新增Flow'
    isView.value = false
    dialogVisible.value = true
}

// 查看Flow
const handleView = (row: Flows) => {
    currentFlow.value = { ...row,syncFile: row.syncFile ? row.syncFile : '' }
    dialogTitle.value = '查看Flow'
    isView.value = true
    dialogVisible.value = true
}

// 编辑Flow
const handleEditFlow = (row: Flows) => {
    currentFlow.value = { ...row ,syncFile: row.syncFile ? row.syncFile : ''}
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
const detailRef = ref<InstanceType<typeof Detail>>()
// 查询Flow列表
const handleSearch = () => {
    if (!showDetail.value) {
        getStrategyFlowsList()
        // detailRef.value?.loadDataProgressively()
    }else{
        // loadDataProgressively()
        detailRef.value?.loadDataProgressively() // 调用子组件的方法
    }
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
const expandConfig = ref<VxeTablePropTypes.ExpandConfig<any>>({
    lazy: true,
    loadMethod({ row }) {
        // 判断row里面是否包含strategyGroupIds字段
        if (row.strategyGroupIds) {
            // 调用接口
            return findSubInfo(row.strategyGroupIds).then(data => {
                row.subInfo = data
            })
        } else if (row.strategyIds) { // 判断row里面是否包含strategyIds字段
            // 调用接口
            const p: any = (row as any).strategyIds.split(',').map((item: any) => (item as any).split(':')[0]).join(',')
            return findSubInfoChild(p).then(data => {
                row.subInfoChild = data
            })
        }
        return Promise.resolve()
    }
})
const findSubInfo = async (ids: number) => {
    try {
        const response = await reqStrategyGroup({ ids })
        return response.data || []
    } catch (error) {
        ElMessage.error('获取子信息失败')
        return []
    }

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


const rowStyle: VxeTablePropTypes.RowStyle<any> = ({ rowIndex }) => {
    return {
        // 背景渐变色
        backgroundColor: '#f0f7ff',
        // background: "linear-gradient(to left, #f0f7ff, #a8d0ff, #6fb1ff)"
    }
}
const headerCellStyle: VxeTablePropTypes.HeaderCellStyle<any> = ({ column }) => {
    return {
      backgroundColor: '#f0f7ff',
    }
  
}
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

const thresholdMap = computed(() => {
  const map: Record<string, string> = {}
  thresholdStore.ThresholdList.forEach((item: any) => {
    map[item.id] = item.name
  })
  return map
})

// 打开dataeye
const handleDataeye = async() => {
    await thresholdStore.openDataeye()
}
// 页面初始化
onMounted(() => {
    // getStrategyFlowsList()
    handleSearchInput()

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
        overflow: auto;
    }
}

.formula-container {
    // padding: 8px;
    // background-color: aliceblue;
}

.formula-grid {
    // display: grid;
    // grid-template-columns: 260px 200px 200px;
    display: flex;
    justify-content: space-evenly;
    /* 三列固定宽度 */
    gap: 10px;
    align-items: center;
}

.formula-cell {
    display: flex;
    align-items: center;
    gap: 5px;
    min-height: 28px;
    /* 固定高度保持对齐 */
    // flex: 1;
    width: 220px;
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
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 操作符颜色 */
.operator-big {
    color: #67c23a;
}

.operator-small {
    color: #f56c6c;
}

.operator-equal {
    color: #e6a23c;
}

:deep(.el-divider) {
    margin: 6px 0;
}
.expand-wrapper{
    // padding: 0  0 0 40px ;
    background-color: #f5f5f5;
    border-radius: 4px;
}
</style>