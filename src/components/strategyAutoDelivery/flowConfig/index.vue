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
            <vxe-table :data="strategyList" border round style="width: 100%" size="small" stripe height="90%" :column-config="{ resizable: true }">
                <vxe-column field="xh" type="seq" align="center" title="序号" width="5%"></vxe-column>
                <vxe-column field="pkgName" title="pkg" min-width="20" width="240" align="center" />
                <vxe-column field="country" title="国家" min-width="20" width="240" align="center" />
                <vxe-column field="config" title="config" min-width="300" align="center">
                    <template #default="{ row }">
                        <div v-if="row.config" class="config-container">
                            <div v-for="(item, index) in parseFormula(row.config)" :key="index" class="config-item">
                                <div class="config-grid">
                                    <!-- 公式字段 -->
                                    <div class="config-cell flow-cell">
                                        <span class="config-label">Flow:</span>
                                        <el-tooltip :content="item.flowName" placement="top">
                                            <span class="config-value text-ellipsis">
                                                {{ item.flowName }}
                                            </span>
                                        </el-tooltip>
                                    </div>

                                    <!-- 截止值字段 -->
                                    <div class="config-cell config-cell">
                                        <span class="config-label">Config:</span>
                                        <el-tooltip :content="item.flowConfig" placement="top">
                                            <span class="config-value text-ellipsis">
                                                {{ item.flowConfig }}
                                            </span>
                                        </el-tooltip>
                                    </div>
                                    <!-- kp:pid kp系数-->
                                    <div class="config-cell kp-cell">
                                        <span class="config-label">Kp:</span>
                                        <el-tooltip :content="item.kp" placement="top">
                                            <span class="config-value text-ellipsis">{{ item.kp }}</span>
                                        </el-tooltip>
                                    </div>
                                    <!-- ki: pid ki系数 -->
                                    <div class="config-cell ki-cell">
                                        <span class="config-label">Ki:</span>
                                        <el-tooltip :content="item.ki" placement="top">
                                            <span class="config-value text-ellipsis">{{ item.ki }}</span>
                                        </el-tooltip>
                                    </div>
                                    <!-- kd: pid kd系数 -->
                                    <div class="config-cell kd-cell">
                                        <span class="config-label">Kd:</span>
                                        <el-tooltip :content="item.kd" placement="top">
                                            <span class="config-value text-ellipsis">{{ item.kd }}</span>
                                        </el-tooltip>
                                    </div>
                                    <!-- step:pid 调整步长 -->
                                    <div class="config-cell step-cell">
                                        <span class="config-label">Step:</span>
                                        <el-tooltip :content="item.step" placement="top">
                                            <span class="config-value text-ellipsis">{{ item.step }}</span>
                                        </el-tooltip>
                                    </div>
                                    <!-- isAuto 显示为带颜色的图标 + 标签 -->
                                    <div class="config-cell isAuto-cell">
                                        <span class="config-label">isAuto:</span>
                                        <template v-if="item.isAuto == 'true'">
                                            <el-tag type="success" size="small" effect="dark">
                                                <el-icon style="margin-right: 4px;" ><CircleCheck /></el-icon>
                                                开
                                            </el-tag>
                                        </template>
                                        <template v-else>
                                            <el-tag type="danger" size="small" effect="dark">
                                                <el-icon style="margin-right: 4px;"><CircleClose /></el-icon>
                                                关
                                            </el-tag>
                                        </template>
                                    </div>
                                    <!-- 监控按钮 -->
                                    <svg-icon
                                        name="monitoring"
                                        width="20px"
                                        height="20px"
                                        @click="handleMonitor(row,item.flowName)"
                                        title="监控"
                                        class="monitor-icon"
                                    ></svg-icon>
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
                        <el-button size="small" type="danger" plain @click="handleDelete(row)" :disabled="!isSuperAdmin">删除</el-button>
                    </template>
                </vxe-column>
            </vxe-table>
        </div>
        <!-- 新增/编辑弹窗 -->
        <ConfigModel v-model="dialogVisible" :title="dialogTitle" :form="currentFlowConfig" :is-view="isView"
            @submit="handleSubmit" />
        <!-- 监控弹窗 设置宽高 -->
        <MonitorModel v-model="monitorVisible" :data="monitorData" :style="{ height: '90vh', overflowY: 'auto' }" />
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { reqFlowConfig, reqDeleteFlowConfig } from '@/api/strategyAutoDelivery/flowConfig/index';
import ConfigModel from './model.vue'
import MonitorModel from './monitorModel.vue'
import XEUtils from 'xe-utils'
import { CircleCheck, CircleClose } from '@element-plus/icons-vue' // 新增：图标
import { ThresholdPinia } from '@/store/strategyAutoDelivery/threshold'
const thresholdStore = ThresholdPinia()

// 获取父级传递的 isSuperAdmin 属性
defineProps<{
  isSuperAdmin: boolean
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
        const response = await reqFlowConfig()
        strategyList.value = response.data || []
        strategyListBackUp.value = response.data || []
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
            const [flowName, flowConfig,kp, ki, kd, step, isAuto] = item.split(':');
            return {
                flowName: flowName || '-',
                flowConfig: flowConfig || '-',
                kp: kp || '-',
                ki: ki || '-',
                kd: kd || '-',
                step: step || '-',
                isAuto: isAuto || '-'
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
const handleSearchInput = () => {
    const filterVal = String(filterName.value).trim().toLowerCase()
    if (filterVal) {
        const filterRE = new RegExp(filterVal, 'gi')
        const searchProps = ['pkgName', 'country', 'config']
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

// 监控按钮点击事件
const handleMonitor = (row: any, flowName: string) => {
    console.log('监控按钮点击，row数据:', row,flowName);
    // 打开弹窗，将当前点击的 flow 一并传递给弹窗
    monitorData.value = { ...row, flow: flowName }
    debugger
    monitorVisible.value = true

}
// 打开dataeye
const handleDataeye = async() => {
    await thresholdStore.openDataeye()
}
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

.config-container {
    padding: 8px;

    .config-item {}
}

.config-grid {
    display: flex;
    justify-content: space-between;
}

.config-cell {
    display: flex;
    align-items: center;
    gap: 5px;
    min-height: 28px;
    // width: 120px;
}
.flow-cell{
    width: 280px;
}
.config-cell{
    width: 150px;
}
.kp-cell{
    width: 60px;
}
.ki-cell{
    width: 60px;
}
.kd-cell{
    width: 60px;
}
.step-cell{
    width: 60px;
}
.isAuto-cell{
    width: 110px; /* 略微加宽以容纳标签 */
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
.monitor-icon {
    cursor: pointer;
}
</style>