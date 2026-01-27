<template>
    <div class="strategy-page">
        <div class="page-header">
            <el-button type="primary" @click="handleDataeye">DATAEYE</el-button>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="primary" @click="handleAddFlowConfig">新增</el-button>
        </div>
        <div class="page-content">
            <p>
                <vxe-input v-model="filterName" type="search" placeholder="搜索pkg, country, pkg配置" clearable
                    @change="searchEvent" size="mini"></vxe-input>
            </p>
            <!-- FlowConfig列表表格 -->
            <div style="height: 90%;">
                <vxe-table :data="strategyList" border round style="width: 100%" size="small" stripe height="auto" :scroll-y="{ enabled: true, gt: 10 }" :column-config="{ resizable: true }">
                <vxe-column field="xh" type="seq" align="center" title="序号" width="5%"></vxe-column>
                <vxe-column field="pkgName" title="pkg" min-width="20" width="360" align="center">
                    <template #default="{row}">
                        <el-tooltip :content="row.pkgName" placement="top" :disabled="!row.pkgName">
                            <div class="cell-ellipsis-2" @click="handleModelEdit('pkg',row)">
                                {{ row.pkgName }}
                            </div>
                        </el-tooltip>
                    </template>
                </vxe-column>
                <vxe-column field="country" title="国家" min-width="20" width="320" align="center">
                    <template #default="{row}">
                        <el-tooltip :content="row.country" placement="top" :disabled="!row.country">
                            <div class="cell-ellipsis-2" @click="handleModelEdit('country',row)">
                                {{ row.country }}
                            </div>
                        </el-tooltip>
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
                <vxe-column field="pkgConfig" title="pkg配置" min-width="180"  align="center" >
                    <template #default="{row}">
                        <!-- pkgConfig内容是json字符串 转换为对象后，匹配kvMap展示对应的名称和值 -->
                        <div v-if="row.pkgConfig" class="pkgconfig-container" :class="{ 'expanded': expandedRows[row.id] }">
                            <div class="pkgconfig-list">
                               <div class="kvmap_css" v-for="(value, key) in JSON.parse(row.pkgConfig)" :key="key">
                                    <span class="kvmap_css_span" :title="String(kvLabelMap[key] || key)">{{ kvLabelMap[key] || key }}:</span>
                                    <!-- 只要有值，就显示 options 中 value 为 true 的 label -->
                                    <template v-if="value && getOptionLabel(key,value)">
                                        <el-tag type="success" size="small" effect="plain">{{ getOptionLabel(key,value) }}</el-tag>
                                    </template>
                                    <!-- 如果没有值或没有匹配的 options -->
                                    <template v-else>
                                        <el-tag type="info" size="small" effect="plain">{{ value }}</el-tag>
                                    </template>
                                </div>
                            </div>
                            <!-- 展开/收起按钮 -->
                            <div v-if="Object.keys(JSON.parse(row.pkgConfig)).length > 4" class="expand-btn" @click="toggleExpand(row.id)">
                                <span v-if="!expandedRows[row.id]">
                                    <el-icon><ArrowDown /></el-icon> 展开
                                </span>
                                <span v-else>
                                    <el-icon><ArrowUp /></el-icon> 收起
                                </span>
                            </div>
                        </div>
                        <span v-else class="empty-text">-</span>
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
        <ConfigModel v-model="dialogVisible" :title="dialogTitle" :form="currentFlowConfig" :is-view="isView" :kv-map="kvMap"
            @submit="handleSubmit" />
        <!-- 监控弹窗 设置宽高 -->
        <MonitorModel v-model="monitorVisible" :data="monitorData" :style="{ height: '90vh', overflowY: 'auto' }" />
        <!-- 公共抽屉组件 -->
        <PublicDrawer 
            v-model="drawerVisible" 
            :type="drawerType" 
            :row="drawerRow" 
            @save="handleDrawerSave" 
        />
    </div>
</template>

<script lang="ts" setup>
import { ref,watch,onMounted ,computed} from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { reqFlowConfig, reqDeleteFlowConfig, reqCreateOrUpdatFlowConfig } from '@/api/strategyAutoDelivery/flowConfig/index';
import ConfigModel from './model.vue'
import MonitorModel from './monitorModel.vue'
import PublicDrawer from '@/components/publicDrawer/index.vue'
import XEUtils from 'xe-utils'
import { ThresholdPinia } from '@/store/strategyAutoDelivery/threshold'
import { reqManualStrategyList } from '@/api/strategyAutoDelivery/manualStrategy/index'
import { CircleCheck, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
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
// 记录每行的展开状态
const expandedRows = ref<Record<number, boolean>>({})
const toggleExpand = (rowId: number) => {
    expandedRows.value[rowId] = !expandedRows.value[rowId]
}

// 提前声明 distributeList，供 kvMap 使用
const distributeList = ref<Array<{ label: string; value: any }>>([])

// 封装键值对
// kvMap 包含显示名称和选项配置
// options: 静态选项数组
// optionsKey: 动态选项的数据源名称（在子组件中映射到实际数据）
const kvMap = computed(() => ({
//   unifiedValue: {
//     label: '统一价值',
//     options: [
//       { label: '开', value: true },
//       { label: '关', value: false }
//     ]
//   },
  distribute: {
    label: '流量分配',
    optionsKey: 'distributeList',  // 指向动态数据源
    filterable: true,
    clearable: true,
    options: distributeList.value
  }
  // 可以添加更多配置
  // otherKey: { label: '其他', options: [...] }
}))
// 获取显示名称的简化版本（用于表格展示）
const kvLabelMap = computed(() => {
  const result: { [key: string]: string } = {}
  Object.entries(kvMap.value).forEach(([key, config]) => {
    result[key] = config.label
  })
  return result
})

// 根据 key 从 kvMap 的 options 中获取 value 为 true 的 label
const getOptionLabel = (key: string | number,value:any): string | null => {
    debugger
  const keyStr = String(key)
  const config = kvMap.value[keyStr as keyof typeof kvMap.value]
  if (config && config.options) {
    const option = config.options.find(opt => opt.value === value)
    return option ? option.label : null
  }
  return null
}

// 获取FlowConfig列表
const getStrategyFlowConfigsList = async () => {
    try {
        const response = await reqFlowConfig({eventType: (props.mode == 'click' ? 'click' : props.mode == 'imp' ? 'imp' : 'click,imp'),deviceSource:'distribute' })
        strategyList.value = response.data || []
        strategyListBackUp.value = response.data || []
        handleSearchInput()
    } catch (error) {
        ElMessage.error('获取FlowConfig列表失败')
    }
}

// 添加FlowConfig
const handleAddFlowConfig = () => {
    currentFlowConfig.value = { operator: 'big', status: 'enabled', cutoff: 0 ,eventType: props.mode } // 默认操作符
    dialogTitle.value = '新增FlowConfig'
    isView.value = false
    dialogVisible.value = true
}

// 查看FlowConfig
const handleView = (row: any) => {
    // 安全解析 pkgConfig
    let pkgConfigObj = {}
    if (row.pkgConfig) {
        try {
            pkgConfigObj = JSON.parse(row.pkgConfig)
            // 如果是数组，转换为对象
            if (Array.isArray(pkgConfigObj)) {
                const result: Record<string, any> = {}
                for (let i = 0; i < pkgConfigObj.length; i += 2) {
                    if (i + 1 < pkgConfigObj.length) {
                        result[pkgConfigObj[i]] = pkgConfigObj[i + 1]
                    }
                }
                pkgConfigObj = result
            }
        } catch (error) {
            console.error('解析 pkgConfig 失败:', error)
            pkgConfigObj = {}
        }
    }
    
    currentFlowConfig.value = { 
        ...row,
        pkgConfig: pkgConfigObj  // 传递解析后的对象
    }
    dialogTitle.value = '查看FlowConfig'
    isView.value = true
    dialogVisible.value = true
}

// 编辑FlowConfig
const handleEditFlowConfig = (row: any) => {
    // 安全解析 pkgConfig
    let pkgConfigObj = {}
    if (row.pkgConfig) {
        try {
            pkgConfigObj = JSON.parse(row.pkgConfig)
            // 如果是数组，转换为对象
            if (Array.isArray(pkgConfigObj)) {
                const result: Record<string, any> = {}
                for (let i = 0; i < pkgConfigObj.length; i += 2) {
                    if (i + 1 < pkgConfigObj.length) {
                        result[pkgConfigObj[i]] = pkgConfigObj[i + 1]
                    }
                }
                pkgConfigObj = result
            }
        } catch (error) {
            console.error('解析 pkgConfig 失败:', error)
            pkgConfigObj = {}
        }
    }
    
    currentFlowConfig.value = { 
        ...row,
        pkgConfig: pkgConfigObj  // 传递解析后的对象
    }
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

      // 3. pkgConfig 搜索：搜索 key 的 label 和 value 的 label
      let pkgConfigMatch = false
      try {
        if (item.pkgConfig) {
          const pkgConfigObj = JSON.parse(item.pkgConfig)
          for (const [key, value] of Object.entries(pkgConfigObj)) {
            // 搜索 key 对应的 label
            const keyLabel = String(kvLabelMap.value[key] || key).toLowerCase()
            if (keyLabel.includes(filterVal)) {
              pkgConfigMatch = true
              break
            }
            // 搜索 value 对应的 label
            const valueLabel = getOptionLabel(key, value)
            if (valueLabel && valueLabel.toLowerCase().includes(filterVal)) {
              pkgConfigMatch = true
              break
            }
            // 搜索原始值
            if (String(value).toLowerCase().includes(filterVal)) {
              pkgConfigMatch = true
              break
            }
          }
        }
      } catch (e) {
        console.error('pkgConfig 解析失败', e)
      }

      return baseMatch || distributeMatch || pkgConfigMatch
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

// 
const getDistributeList = async () => {
    const params = {
        //   eventType: [props.mode, 'all'],
        eventType: [] as string[],
        page: 1,
        limit: 9999999,
        returnType: 'distribute',// 获取distribute类型列表
        deviceSource: 'offline',// 离线策略
    }
    // if (props.mode !== 'all' && props.mode) {
    //     params.eventType = [props.mode, 'all']
    // } else {
        params.eventType = ['click', 'imp', 'all']
    // }
    const response: any = await reqManualStrategyList({ ...params })
    distributeList.value = response.data.data.map((item:any) => ({ label: item.name, value: item.id }))
    console.log(distributeList.value)
}
// 抽屉相关
const drawerVisible = ref(false)
const drawerType = ref<'pkg' | 'country'>('pkg')
const drawerRow = ref<any>({})

const handleModelEdit = (type: 'pkg' | 'country', row: any) => {
    drawerType.value = type
    drawerRow.value = { ...row }
    drawerVisible.value = true
}

// 抽屉保存回调
const handleDrawerSave = async (updatedRow: any) => {
    try {
        const response: any = await reqCreateOrUpdatFlowConfig(updatedRow)
        if (response?.code === 200 || response?.success === true) {
            ElMessage.success('保存成功')
            getStrategyFlowConfigsList()
        } else {
            ElMessage.error(response?.errMsg || '保存失败')
        }
    } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
    }
}

// 组件挂载时获取列表
onMounted(() => {
    // getStrategyFlowConfigsList()
    getDistributeList()
})
</script>

<style lang="scss" scoped>
.cell-ellipsis-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    cursor: pointer;
}

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
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
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
    min-width: 40px;
}
.kvmap_css{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    margin: 4px 0;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
}
.kvmap_css:hover {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    border-color: #cbd5e1;
}
.kvmap_css_span{
    flex: 1;
    max-width: 100px;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #64748b;
    font-size: 12px;
    font-weight: 500;
}
.kvmap_css_val {
    flex-shrink: 0;
    margin-left: 8px;
}
.kvmap_css_val .el-tag {
    font-weight: 500;
    border-radius: 4px;
}
.kvmap_css_val span {
    color: #334155;
    font-size: 12px;
    font-weight: 500;
}
.pkgconfig-container {
    padding: 4px;
}
.empty-text {
    color: #94a3b8;
    font-size: 12px;
}
.expand-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 8px;
    margin-top: 4px;
    color: #409eff;
    font-size: 12px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
}
.expand-btn:hover {
    background: #ecf5ff;
    color: #337ecc;
}
.expand-btn .el-icon {
    margin-right: 4px;
    font-size: 14px;
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
// =============================================================
/* 省略在自身可用宽度内处理 */
.text-ellipsis {
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
/* 小屏幕适配 */
@media (max-width: 1524px) {
  .text-ellipsis {
    max-width: 65px;
  }
}

@media (max-width: 768px) {
  .text-ellipsis {
    max-width: 50px;
  }
  
  .flow-cell,
  .config-text-cell {
    grid-column: span 1;
    min-width: 160px;
  }
}

@media (max-width: 480px) {
  .text-ellipsis {
    max-width: 40px;
  }
}
// ============================================================
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