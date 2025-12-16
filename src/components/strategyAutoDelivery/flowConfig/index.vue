<template>
    <div class="strategy-page">
        <div class="page-header">
            <el-button type="primary" @click="handleDataeye">DATAEYE</el-button>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="primary" @click="handleAddFlowConfig">新增</el-button>
        </div>
        <div class="page-content">
            <p>
                <vxe-input v-model="filterName" type="search" placeholder="搜索pkg, country, config" clearable
                    @change="searchEvent" size="mini"></vxe-input>
            </p>
            <!-- FlowConfig列表表格 -->
            <div style="height: 90%;">
                <vxe-table :data="strategyList" border round style="width: 100%" size="small" stripe height="auto" :scroll-y="{ enabled: true, gt: 10 }" :column-config="{ resizable: true }">
                <vxe-column field="xh" type="seq" align="center" title="序号" width="5%"></vxe-column>
                <vxe-column field="pkgName" title="pkg" min-width="20" width="160" align="center" />
                <vxe-column field="country" title="国家" min-width="20" width="120" align="center" />
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
                <vxe-column field="config" title="config"  align="center" class-name="config-col">
                    <template #default="{ row }">
                        <div v-if="row.config" class="config-container">
                            <div v-for="(item, index) in parseFormula(row.config)" :key="index" class="config-item">
                                <div class="config-grid">
                                    <!-- 监控按钮（固定在右上角） -->
                                    <svg-icon
                                        name="monitoring"
                                        width="18px"
                                        height="18px"
                                        @click="handleMonitor(row,item.flowName)"
                                        title="监控"
                                        class="monitor-icon"
                                    ></svg-icon>

                                    <!-- Flow -->
                                    <div class="config-cell flow-cell">
                                        <span class="config-label">Flow</span>
                                        <el-tooltip :content="item.flowName" placement="top">
                                            <span class="config-value text-ellipsis">{{ item.flowName }}</span>
                                        </el-tooltip>
                                    </div>

                                    <!-- Config -->
                                    <div class="config-cell config-text-cell">
                                        <span class="config-label">号段</span>
                                        <el-tooltip :content="item.flowConfig" placement="top">
                                            <span class="config-value text-ellipsis" style="color: red;">{{ item.flowConfig }}</span>
                                        </el-tooltip>
                                    </div>
                                    <div class="config-cell config-text-cell">
                                        <span class="config-label">去重等级</span>
                                        <el-tooltip :content="item.dupCheck" placement="top">
                                            <span class="config-value text-ellipsis">{{ item.dupCheck }}</span>
                                        </el-tooltip>
                                    </div>
                                    <div class="config-cell config-text-cell">
                                        <span class="config-label">erase比例</span>
                                        <el-tooltip :content="item.eraseIfa" placement="top">
                                            <span class="config-value text-ellipsis">{{ item.eraseIfa }}</span>
                                        </el-tooltip>
                                    </div>
                                    <div class="config-cell config-text-cell">
                                        <span class="config-label">点击倍数</span>
                                        <el-tooltip :content="item.times" placement="top">
                                            <span class="config-value text-ellipsis">{{ item.times }}</span>
                                        </el-tooltip>
                                    </div>
                                    <div class="config-cell config-text-cell">
                                        <!-- <el-tooltip :content="item.distribute" placement="top"> -->
                                            <span class="config-value text-ellipsis" :class="item.distribute?'blueSpan':'redSpan'">{{ item.distribute? '已分配': '未分配' }}</span>
                                        <!-- </el-tooltip> -->
                                    </div>


                                    <!-- isAuto -->
                                    <div class="config-cell isAuto-cell">
                                        <span class="config-label">Auto</span>
                                        <template v-if="item.isAuto == 'true'">
                                            <el-tag type="success" size="small" effect="light">
                                                <el-icon style="margin-right:4px;display:inline;"><CircleCheck /></el-icon>开
                                            </el-tag>
                                        </template>
                                        <template v-else>
                                            <el-tag type="danger" size="small" effect="light">
                                                <el-icon style="margin-right:4px;display:inline;"><CircleClose /></el-icon>关
                                            </el-tag>
                                        </template>
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
                        <el-button size="small" type="primary" plain @click="handleView(row)">查看</el-button>
                        <el-button size="small" type="success" plain @click="handleEditFlowConfig(row)">编辑</el-button>
                        <el-button size="small" type="danger" plain @click="handleDelete(row)" :disabled="!props.isSuperAdmin">删除</el-button>
                    </template>
                </vxe-column>
            </vxe-table>
            </div>
        </div>
        <!-- 新增/编辑弹窗 -->
        <ConfigModel v-model="dialogVisible" :title="dialogTitle" :form="currentFlowConfig" :is-view="isView"
            @submit="handleSubmit" />
        <!-- 监控弹窗 设置宽高 -->
        <MonitorModel v-model="monitorVisible" :data="monitorData" :style="{ height: '90vh', overflowY: 'auto' }" />
    </div>
</template>

<script lang="ts" setup>
import { ref,watch,onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { reqFlowConfig, reqDeleteFlowConfig } from '@/api/strategyAutoDelivery/flowConfig/index';
import ConfigModel from './model.vue'
import MonitorModel from './monitorModel.vue'
import XEUtils from 'xe-utils'
import { CircleCheck, CircleClose } from '@element-plus/icons-vue' // 新增：图标
import { ThresholdPinia } from '@/store/strategyAutoDelivery/threshold'
const thresholdStore = ThresholdPinia()

// 获取父级传递的 isSuperAdmin，mode 属性
const props = defineProps<{
  isSuperAdmin: boolean,
  mode: 'click' | 'imp' | 'all'
}>()
// 响应式数据
const strategyList = ref<any[]>([])
const strategyListBackUp = ref<any[]>([])
const dialogVisible = ref(false)
const monitorVisible = ref(false)
const dialogTitle = ref('')
const isView = ref(false)
const currentFlowConfig = ref<Partial<any>>({})
const monitorData = ref<Partial<any>>({})

// 获取FlowConfig列表
const getStrategyFlowConfigsList = async () => {
    try {
        const response = await reqFlowConfig({eventType: (props.mode == 'click' ? 'click' : props.mode == 'imp' ? 'imp' : 'click,imp') })
        strategyList.value = response.data || []
        strategyListBackUp.value = response.data || []
        handleSearchInput()
    } catch (error) {
        ElMessage.error('获取FlowConfig列表失败')
    }
}

// 添加FlowConfig
const handleAddFlowConfig = () => {
    currentFlowConfig.value = { operator: 'big', status: 'enabled', cutoff: 0 ,eventType: props.mode == 'all' ? 'click' : props.mode} // 默认操作符
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
            const [flowName, flowConfig,kp, ki, kd, step, isAuto,dupCheck,eraseIfa,times,distribute] = item.split(':');
            let distributeIndex = item.split(':')[10] || ''
            return {
                flowName: flowName || '-',
                flowConfig: flowConfig || '-',
                kp: kp || '-',
                ki: ki || '-',
                kd: kd || '-',
                step: step || '-',
                isAuto: isAuto || '-',
                dupCheck: dupCheck || '-',
                eraseIfa: eraseIfa || '-',
                times: times || 1.2,
                distribute: distributeIndex != '' ? true : false
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

const filterName = ref('')
// const handleSearchInput = () => {
//     const filterVal = String(filterName.value).trim().toLowerCase()
//     if (filterVal) {
//         const filterRE = new RegExp(filterVal, 'gi')
//         const searchProps = ['pkgName', 'country', 'config']
//         const rest = strategyListBackUp.value.filter((item: any) => searchProps.some(key => String(item[key]).toLowerCase().indexOf(filterVal) > -1))
//         strategyList.value = rest.map(row => {
//             // 搜索为克隆数据，不会污染源数据
//             const item = XEUtils.clone(row) as any
//             searchProps.forEach((key: any) => {
//                 item[key] = String(item[key]).replace(filterRE, match => `${match}`)
//             })
//             return item
//         })
//     } else {
//         strategyList.value = strategyListBackUp.value
//     }
// }
const handleSearchInput = () => {
  const filterVal = String(filterName.value).trim().toLowerCase()
  if (filterVal) {
    const filterRE = new RegExp(filterVal, 'gi')
    // 原来只搜这几个字段
    const searchProps = ['pkgName', 'country', 'config']

    const rest = strategyListBackUp.value.filter((item: any) => {
      // 1. 原有字段的匹配
      const baseMatch = searchProps.some(key =>
        String(item[key]).toLowerCase().includes(filterVal)
      )

      // 2. distribute 映射为汉字后的匹配
      // 这里根据你 parseFormula 里对 distribute 的规则自行调整
      // 你目前的 parseFormula 是：distribute != '' ? true : false
      // 页面上显示：true -> "已分配"  false -> "未分配"
      let distributeText = ''
      // 如果 distribute 在 row.config 里，你可以把 row.config 里所有 flow 的 distribute 合并成文本：
      // 如：有任意一个是 true 就认为包含“分配”，否则“未分配”
      try {
        if (item.config) {
          const flows = parseFormula(item.config)
          const hasDistribute = flows.some((f: any) => f.distribute) // true/false
          distributeText = hasDistribute ? '已分配' : '未分配'
        }
      } catch (e) {
        console.error('distribute 解析失败', e)
      }

      const distributeMatch = distributeText.toLowerCase().includes(filterVal)

      return baseMatch || distributeMatch
    })

    strategyList.value = rest.map(row => {
      // 克隆数据，不污染源数据
      const item = XEUtils.clone(row) as any

      // 原有高亮逻辑
      const searchProps = ['pkgName', 'country', 'config']
      searchProps.forEach((key: any) => {
        item[key] = String(item[key]).replace(filterRE, match => `${match}`)
      })

      // 如果你也想对 config 文本里出现的“分配 / 未分配”做高亮，可以在这里额外处理
      // 比如：item.config = String(item.config).replace(filterRE, match => `${match}`)

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

// 监控按钮点击事件
const handleMonitor = (row: any, flowName: string) => {
    console.log('监控按钮点击，row数据:', row,flowName);
    // 打开弹窗，将当前点击的 flow 一并传递给弹窗
    monitorData.value = { ...row, flow: flowName }
    monitorVisible.value = true

}
// 打开dataeye
const handleDataeye = async() => {
    await thresholdStore.openDataeye()
}
// 监听父组件 mode 变化，刷新列表
watch(() => props.mode, () => {
    debugger
    filterName.value = ''
    strategyList.value = []
    strategyListBackUp.value = []
}, { immediate: true })
// 组件挂载时获取列表
onMounted(() => {
    getStrategyFlowConfigsList()
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
    }
}

.config-container {
    padding: 8px;

    .config-item {}
}

/* 仅放开 config 列换行并左对齐，提高可读性 */
:deep(td.config-col .vxe-cell) {
    white-space: normal;
    text-align: left;
}

/* 卡片式容器（每个 flow 配置） */
.config-item {
    background: #f8fafc;
    border: 1px solid #eef1f6;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 8px;
    transition: background 0.2s ease, border-color 0.2s ease;
}
.config-item:hover {
    background: #f5f8ff;
    border-color: #e3e8f5;
}

/* 自适应网格，自动换行；Flow/Config 更宽 */
.config-grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 5px;
    align-items: start;
}

/* 监控图标固定在右上角，不占据网格宽度 */
.monitor-icon {
    position: absolute;
    top: 8px;
    right: 8px;
    cursor: pointer;
    opacity: 0.75;
    transition: opacity .15s ease, transform .15s ease;
}
.monitor-icon:hover {
    opacity: 1;
    transform: scale(1.05);
}

/* 统一的字段块样式，去掉固定宽度，随布局收缩 */
.config-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 26px;
    width: auto !important;
}

/* 长文本字段占两列，提高可读性 */
.flow-cell,
.config-text-cell {
    // min-width: 240px;
}

/* 数值类紧凑些 */
.isAuto-cell {
    grid-column: span 1;
    min-width: 120px;
}

/* 标签与文本的层次感 */
.config-label {
    // color: #909399;
    font-weight: 500;
    font-size: 12px;
    // 微软雅黑
    font-family: 'Microsoft YaHei', sans-serif;
}
.config-value {
    color: #0b22f2;
    // font-size: 15px;
    // font-weight: 600;
}
.blueSpan {
    color: #007bff;
    font-weight: 600;
}
.redSpan {
    color: #ff4d4f;
    font-weight: 600;
}

/* 省略在自身可用宽度内处理 */
.text-ellipsis {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 更轻的分隔线 */
:deep(.el-divider) {
    margin: 8px 0 0;
    --el-border-color: #eef1f6;
}

/* 小屏：Flow/Config 不再跨两列，整体更紧凑 */
@media (max-width: 768px) {
    .flow-cell,
    .config-text-cell {
        grid-column: span 1;
        min-width: 160px;
    }
}
</style>