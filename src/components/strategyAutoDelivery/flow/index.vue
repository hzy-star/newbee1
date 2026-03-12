<template>
    <div class="strategy-page">
        <div class="page-header">
            <el-button type="primary" @click="handleDataeye">DATAEYE</el-button>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button type="primary" @click="handleAddFlow">新增</el-button>
        </div>
        <div class="page-content" >
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
            <vxe-select v-model="detailFormula" type="search" placeholder="公式" clearable size="mini">
                <vxe-option label="and" value="and" />
                <vxe-option label="or" value="or" />
                <vxe-option label="min" value="min" />
                <vxe-option label="max" value="max" />
                <vxe-option label="avg" value="avg" />
            </vxe-select>
            <KeepAlive>
                <DetailPage ref="detailRef" :filterName="filterNameDetail" :detailOption="detailOption" :detailDeviceStatus="detailDeviceStatus"
                    :detailFormula="detailFormula"
                    :isSuperAdmin="props.isSuperAdmin" :mode="props.mode" @view="handleView" @edit="handleEditFlow" @delete="handleDelete"
                    @copy="handleCopy" />
            </KeepAlive>
        </div>

        <!-- 新增/编辑弹窗 -->
        <FlowModel v-model="dialogVisible" :title="dialogTitle" :form="currentFlow" :is-view="isView"
            :edit-view="editView" @submit="handleSubmit" :isSuperAdmin="props.isSuperAdmin"/>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed , watch } from 'vue'
import type { Flows } from '@/api/strategyAutoDelivery/flow/type'
import { ElMessage, ElMessageBox } from 'element-plus'
import {  reqDeleteFlow,  } from '@/api/strategyAutoDelivery/flow/index'
import FlowModel from './model.vue'
import DetailPage from './detail.vue' // 新建的详情组件
import type Detail from './detail.vue'
import { ThresholdPinia } from '@/store/strategyAutoDelivery/threshold'
import { deleteAlgDataCheck } from '@/utils/common'

const thresholdStore = ThresholdPinia()

// 获取父级传递的 isSuperAdmin，mode 属性
const props = defineProps<{
  isSuperAdmin: boolean,
  mode: 'click' | 'imp' | 'all'
}>()

// 响应式数据
const strategyListBackUp = ref<Flows[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isView = ref(false)
const editView = ref(false)
const currentFlow = ref<Partial<Flows>>({})

// 新增：设备来源筛选值（此前未定义导致 TS 报错）
const detailOption = ref('online')  // 详情页设备来源筛选值
const detailDeviceStatus = ref('enabled')  // 详情页启用/禁用筛选值
const detailFormula = ref('')  // 详情页公式筛选值

// 关键词
const filterNameDetail = ref('')


// 查询按钮：总是重新获取，再做视图附加操作
const handleSearch = async () => {
    await detailRef.value?.loadDataProgressively()
}



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
    currentFlow.value = { ...row,syncFile: row.syncFile ? row.syncFile : '' }
    dialogTitle.value = '查看Flow'
    isView.value = true
    editView.value = false
    dialogVisible.value = true
}

// 编辑Flow
const handleEditFlow = (row: Flows) => {
    currentFlow.value = { ...row ,syncFile: row.syncFile ? row.syncFile : ''}
    dialogTitle.value = '编辑Flow'
    isView.value = false
    // 编辑弹窗不可编辑flowName
    editView.value = true
    dialogVisible.value = true
}
// 复制Flow
const handleCopy = (row: Flows) => {
    const { id, name, ...rest } = row
    currentFlow.value = { ...rest , name: `${name}-copy`, syncFile: row.syncFile ? row.syncFile : ''} // 复制时清除id，避免冲突
    dialogTitle.value = '复制Flow'
    isView.value = false
    editView.value = false
    dialogVisible.value = true
}

// 删除Flow
const handleDelete = async (row: Flows) => {
    // 删除之前判断isusing字段 是否为true，如果是true则不允许删除
    if (!deleteAlgDataCheck(row,'Flow')) return
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
    await detailRef.value?.loadDataProgressively()
}

// 表单提交处理
const handleSubmit = async () => {
  await refreshByView()
}

const detailRef = ref<InstanceType<typeof Detail>>()

// 打开dataeye
const handleDataeye = async() => {
    await thresholdStore.openDataeye()
}

// 监听 mode 变化，重置获取列表
watch(() => props.mode, async (newVal) => {
    // 清空详情页筛选条件
    filterNameDetail.value = ''
    detailOption.value = 'online'
    detailDeviceStatus.value = 'enabled'
    detailFormula.value = ''
    // 清空表格
    strategyListBackUp.value = []
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
        // overflow: auto;
    }
}



:deep(.el-divider) {
    margin: 6px 0;
}
</style>