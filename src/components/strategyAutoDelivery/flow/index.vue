<template>
    <div class="strategy-page">
        <div class="page-header">
            <el-button type="primary" @click="handleDataeye">DATAEYE</el-button>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="primary" @click="handleAddFlow">新增</el-button>
            <el-button type="success" @click="toggleDetail">
                {{ showDetail ? '显示列表' : '切换详情' }}
            </el-button>
        </div>
        <div class="page-content" v-show="!showDetail">
            <p>
                <vxe-input v-model="filterName" type="search" placeholder="模糊搜索flow名称" clearable @change="searchEvent"
                    size="mini" />
                <vxe-select v-model="deviceSourceOption" type="search" placeholder="实时/离线" clearable size="mini"
                    @change="handleDeviceSource">
                    <vxe-option label="实时" value="online" />
                    <vxe-option label="离线" value="offline" />
                </vxe-select>
                <vxe-select v-model="deviceStatus" type="search" placeholder="启用/禁用" clearable size="mini"
                    @change="handleDeviceStatus">
                    <vxe-option label="启用" value="enabled" />
                    <vxe-option label="禁用" value="disabled" />
                </vxe-select>
            </p>
            <!-- 列表表格 -->
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
                                :show-header="true" :row-style="rowStyleGroups"
                                :header-cell-style="headerCellStyleGroups">
                                <vxe-column field="xh" type="seq" align="center" title="序号" width="100">
                                    <template #default="{ row, rowIndex }">
                                        <h2 style="font-size: medium;font-weight: 700;">G{{ rowIndex + 1 }}</h2>
                                    </template>
                                </vxe-column>
                                <vxe-column type="expand" width="40">
                                    <template #content="{ row }">
                                        <div class="expand-wrapper">
                                            <vxe-table :data="row.subInfoChild" :seq-config="seqConfigStrategy"
                                                :show-header="true" :row-style="rowStyleStrategy"
                                                :header-cell-style="headerCellStyleStrategy">
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
                                                <vxe-column field="eventType" title="事件类型" min-width="50" width="80" align="center">
                                                    <template #default="{ row }">
                                                        <span v-if="row.eventType === 'click'" class="tag tag-click">
                                                        点击
                                                        </span>
                                                        <span v-else-if="row.eventType === 'imp'" class="tag tag-imp">
                                                        展示
                                                        </span>
                                                        <span v-else class="tag tag-default">全部</span>
                                                    </template>
                                                </vxe-column>
                                                <vxe-column field="ruleFile" title="规则文件" min-width="220" />
                                                <!-- <vxe-column field="returnType" title="返回类型" width="200"
                                                    align="center" /> -->
                                                    
                                                <vxe-column field="returnType" title="返回类型" min-width="30" width="80" align="center">
                                                    <template #default="{ row }">
                                                        <span v-if="row.returnType === 'rank'" class="tag tag-rank">
                                                        RANK
                                                        </span>
                                                        <span v-else-if="row.returnType === 'score'" class="tag tag-score">
                                                        SCORE
                                                        </span>
                                                        <span v-else-if="row.returnType === 'flag'" class="tag tag-flag">
                                                        FLAG
                                                        </span>
                                                        <span v-else-if="row.returnType === 's2s'" class="tag tag-s2s">
                                                        S2S
                                                        </span>
                                                        <span v-else-if="row.returnType === 'json'" class="tag tag-json">
                                                        JSON
                                                        </span>
                                                        <span v-else class="tag tag-default">-</span>
                                                    </template>
                                                </vxe-column>
                                                <vxe-column field="description" title="描述" width="250"
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
                                <vxe-column field="eventType" title="事件类型" min-width="50" width="80" align="center">
                                    <template #default="{ row }">
                                        <span v-if="row.eventType === 'click'" class="tag tag-click">
                                        点击
                                        </span>
                                        <span v-else-if="row.eventType === 'imp'" class="tag tag-imp">
                                        展示
                                        </span>
                                        <span v-else class="tag tag-default">全部</span>
                                    </template>
                                </vxe-column>
                                <vxe-column field="operator" title="操作符" min-width="50" align="center">
                                    <template #default="{ row }">
                                        {{ row.operator === 'big' ? '>' : row.operator === 'small' ? '<' : '=' }}
                                            </template>
                                </vxe-column>
                                <!-- <vxe-column field="returnType" title="返回类型" min-width="30" align="center" /> -->
                                 <vxe-column field="returnType" title="返回类型" min-width="30" width="80" align="center">
                                    <template #default="{ row }">
                                        <span v-if="row.returnType === 'rank'" class="tag tag-rank">
                                        RANK
                                        </span>
                                        <span v-else-if="row.returnType === 'score'" class="tag tag-score">
                                        SCORE
                                        </span>
                                        <span v-else-if="row.returnType === 'flag'" class="tag tag-flag">
                                        FLAG
                                        </span>
                                        <span v-else-if="row.returnType === 's2s'" class="tag tag-s2s">
                                        S2S
                                        </span>
                                        <span v-else-if="row.returnType === 'json'" class="tag tag-json">
                                        JSON
                                        </span>
                                        <span v-else class="tag tag-default">-</span>
                                    </template>
                                </vxe-column>
                                <vxe-column field="cutoff" title="截止值" width="200" align="center" />
                                <vxe-column field="formula" title="公式" width="250" align="center" />
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
                <vxe-column field="eventType" title="事件类型" min-width="50" width="80" align="center">
                    <template #default="{ row }">
                        <span v-if="row.eventType === 'click'" class="tag tag-click">
                        点击
                        </span>
                        <span v-else-if="row.eventType === 'imp'" class="tag tag-imp">
                        展示
                        </span>
                        <span v-else class="tag tag-default">全部</span>
                    </template>
                </vxe-column>
                <!-- 实时/离线 -->
                <vxe-column field="deviceSource" title="设备来源" width="80" align="center">
                    <template #default="{ row }">
                        <el-tag v-if="row.deviceSource === 'offline'" type="danger" size="small">离线</el-tag>
                        <el-tag v-else-if="row.deviceSource === 'online'" type="primary" size="small">实时</el-tag>
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
                <vxe-column field="description" title="描述" width="200" align="center" show-overflow />
                <vxe-column title="操作" width="250" fixed="right" align="center">
                    <template #default="{ row }">
                        <el-button size="small" type="primary" plain @click="handleView(row)">查看</el-button>
                        <el-button size="small" type="success" plain @click="handleEditFlow(row)">编辑</el-button>
                        <el-button size="small" type="danger" plain @click="handleDelete(row)"
                            :disabled="!props.isSuperAdmin">删除</el-button>
                        <el-button size="small" type="warning" plain @click="handleCopy(row)">复制</el-button>
                    </template>
                </vxe-column>
            </vxe-table>
        </div>
        <div class="page-content" v-show="showDetail">
            <!-- 详情页搜索：把关键词传给子组件，子组件内部过滤 Flow / Groups / tagTexts -->
            <vxe-input v-model="filterNameDetail" type="search" placeholder="搜索 Flow / Group / Tag" clearable
                size="mini" />
            <vxe-select v-model="detailOption" type="search" placeholder="实时/离线" clearable size="mini">
                <vxe-option label="实时" value="online" />
                <vxe-option label="离线" value="offline" />
            </vxe-select>

            <vxe-select v-model="detailDeviceStatus" type="search" placeholder="启用/禁用" clearable size="mini">
                <vxe-option label="启用" value="enabled" />
                <vxe-option label="禁用" value="disabled" />
            </vxe-select>
            <KeepAlive>
                <DetailPage ref="detailRef" :filterName="filterNameDetail" :detailOption="detailOption" :detailDeviceStatus="detailDeviceStatus"
                    :isSuperAdmin="props.isSuperAdmin" :mode="props.mode" @view="handleView" @edit="handleEditFlow" @delete="handleDelete"
                    @copy="handleCopy" />
            </KeepAlive>
        </div>

        <!-- 新增/编辑弹窗 -->
        <FlowModel v-model="dialogVisible" :title="dialogTitle" :form="currentFlow" :is-view="isView"
            :edit-view="editView" @submit="handleSubmit" />
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

// 获取父级传递的 isSuperAdmin，mode 属性
const props = defineProps<{
  isSuperAdmin: boolean,
  mode: 'click' | 'imp' | 'all'
}>()

// 响应式数据
const strategyList = ref<Flows[]>([])
const strategyListBackUp = ref<Flows[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isView = ref(false)
const editView = ref(false)
const currentFlow = ref<Partial<Flows>>({})
const showDetail = ref(true) // 是否显示详情页

// 新增：设备来源筛选值（此前未定义导致 TS 报错）
const deviceSourceOption = ref('online')  // 可取 'online' | 'offline' 或空字符串
const deviceStatus = ref('enabled')  // 启用/禁用筛选值
const detailOption = ref('online')  // 详情页设备来源筛选值
const detailDeviceStatus = ref('enabled')  // 详情页启用/禁用筛选值

// 关键词
const filterName = ref('')
const filterNameDetail = ref('')

// 获取 Flow 列表
const getStrategyFlowsList = async () => {
  try {
    const res = await reqFlow({eventType: (props.mode == 'click' ? 'click,all' : props.mode == 'imp' ? 'imp,all' : 'click,imp,all')}, false)
    const priority: Record<string, number> = { online: 0, offline: 1 }
    const data = (res.data || []).sort((a: any, b: any) => {
      const cmp = String(a.name || '').localeCompare(String(b.name || ''), 'zh', { sensitivity: 'base' })
      if (cmp !== 0) return cmp
      return (priority[a.deviceSource] ?? 99) - (priority[b.deviceSource] ?? 99)
    })
    strategyListBackUp.value = data
    applyDeviceSource(String(deviceSourceOption.value || ''),String(deviceStatus.value || ''))
  } catch {
    ElMessage.error('获取Flow列表失败')
  }
}

// 查询按钮：总是重新获取，再做视图附加操作
const handleSearch = async () => {
  await getStrategyFlowsList()
//   if (showDetail.value) {
    await detailRef.value?.loadDataProgressively()
//   }
}
// 切换详情/列表
const toggleDetail = async () => {
  showDetail.value = !showDetail.value
  if(!showDetail.value){
    applyDeviceSource(String(deviceSourceOption.value || ''),String(deviceStatus.value || ''))
  }
  
}


// 仅列表页使用：按 deviceSource + filterName 过滤
const applyDeviceSource = (val: string, status: string) => {
  // 规范化输入（非期望值视为“不筛选”）
  const source = val === 'online' || val === 'offline' ? val : ''
  const stat = status === 'enabled' || status === 'disabled' ? status : ''
  const kw = filterName.value.trim().toLowerCase()

  const propsForSearch = ['name'] as const

  strategyList.value = strategyListBackUp.value.filter((i: any) => {
    const okSource = !source || i.deviceSource === source
    const okStatus = !stat || i.status === stat
    const okKw =
      !kw ||
      propsForSearch.some(k => String(i[k] ?? '').toLowerCase().includes(kw))
    return okSource && okStatus && okKw
  })
}
// const applyDeviceSource = (val: string, status: string) => {
//     let arr: any[] = []
//     //在详情页不需要过滤实时
//     debugger
//     // 列表页
//         if (val === 'online') arr = strategyListBackUp.value.filter(i => i.deviceSource === 'online')
//         else if (val === 'offline') arr = strategyListBackUp.value.filter(i => i.deviceSource === 'offline')
//         else arr = strategyListBackUp.value
//     // 按启用禁用过滤
//     if (status === 'enabled') {
//         arr = arr.filter(i => i.status === 'enabled')
//     } else if (status === 'disabled') {
//         arr = arr.filter(i => i.status === 'disabled')
//     } else {
//         arr = arr
//     }

//     const kw = filterName.value.trim().toLowerCase()
//     if (kw) {
//         const props = ['name']
//         strategyList.value = arr.filter(item =>
//             props.some(k => String(item[k] ?? '').toLowerCase().includes(kw))
//         )
//     } else {
//         strategyList.value = arr
//     }
// }

// 列表搜索节流
const searchEvent = XEUtils.throttle(() => {
  if (!showDetail.value) applyDeviceSource(String(deviceSourceOption.value || ''), String(deviceStatus.value || ''))
}, 400, { leading: true, trailing: true })

// deviceSource 改变刷新列表
const handleDeviceSource: VxeSelectEvents.Change = ({ value }) => {
  if (!showDetail.value) applyDeviceSource(String(value || ''), String(deviceStatus.value || ''))
}
// deviceStatus 改变刷新列表
const handleDeviceStatus: VxeSelectEvents.Change = ({ value }) => {
  if (!showDetail.value) applyDeviceSource(String(deviceSourceOption.value || ''), String(value || ''))
}

watch(deviceSourceOption, (v) => {
  if (!showDetail.value) applyDeviceSource(String(v || ''), String(deviceStatus.value || '') )
}, { immediate: true })

// 添加Flow
const handleAddFlow = () => {
    currentFlow.value = { operator: 'big', status: 'enabled', cutoff: 70,flowType:'normal',syncFile: '',description: '',deviceSource:'online',eventType: props.mode } // 默认操作符
    // currentFlow.value = { operator: 'big', status: 'enabled', cutoff: 0 } // 默认操作符
    dialogTitle.value = '新增Flow'
    isView.value = false
    editView.value = false
    dialogVisible.value = true
}

// 查看Flow
const handleView = (row: Flows) => {
    currentFlow.value = { ...row,syncFile: row.syncFile ? row.syncFile : '',eventType: props.mode }
    dialogTitle.value = '查看Flow'
    isView.value = true
    editView.value = false
    dialogVisible.value = true
}

// 编辑Flow
const handleEditFlow = (row: Flows) => {
    currentFlow.value = { ...row ,syncFile: row.syncFile ? row.syncFile : '',eventType: props.mode}
    dialogTitle.value = '编辑Flow'
    isView.value = false
    // 编辑弹窗不可编辑flowName
    editView.value = true
    dialogVisible.value = true
}
// 复制Flow
const handleCopy = (row: Flows) => {
    const { id, name, ...rest } = row
    currentFlow.value = { ...rest , name: `${name}-copy`, syncFile: row.syncFile ? row.syncFile : '', eventType: props.mode} // 复制时清除id，避免冲突
    dialogTitle.value = '复制Flow'
    isView.value = false
    editView.value = false
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
            await refreshByView() // 根据当前视图刷新
        } else {
            ElMessage.error(response.errMsg || '删除失败')
        }
    } catch (error) {
        console.error('删除操作异常:', error)
    }
}

// 根据当前视图刷新
const refreshByView = async () => {
//   if (showDetail.value) {
    await detailRef.value?.loadDataProgressively()
//   }
  await getStrategyFlowsList() // 总是刷新备份与列表
}

// 表单提交处理
const handleSubmit = async () => {
  await refreshByView()
}

const detailRef = ref<InstanceType<typeof Detail>>()
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

// 监听 mode 变化，重置获取列表
watch(() => props.mode, async (newVal) => {
    filterName.value = ''
    deviceSourceOption.value = 'online'
    deviceStatus.value = 'enabled'
    // 清空详情页筛选条件
    filterNameDetail.value = ''
    detailOption.value = 'online'
    detailDeviceStatus.value = 'enabled'
    // 清空表格
    strategyListBackUp.value = []
    strategyList.value = []
})
</script>

<style lang="scss" scoped>
.strategy-page {
    height: $base-alg-platform-height;

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