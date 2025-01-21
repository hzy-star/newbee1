<template>
    <div class="pushtask">
        <div class="pushtask_header">
            <!-- 查询条件 -->
            <el-row :gutter="20" type="flex" justify="start">
                <!-- Etype -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Etype</div>
                        <el-select v-model="propFrom.etypes" placeholder="Please select">
                            <el-option label="click" value="click" />
                            <el-option label="imp" value="imp" />
                            <el-option label="all" value="all" />
                        </el-select>
                    </div>
                </el-col>
                <!-- Offers -->
                <el-col :span="7">
                    <div class="form-item">
                        <div class="form-item-label">Offers</div>
                        <el-input v-model="propFrom.offerIds" />
                    </div>
                </el-col>

                <!-- Pkgs -->
                <el-col :span="7">
                    <div class="form-item">
                        <div class="form-item-label">Pkgs</div>
                        <el-input v-model="propFrom.pkgNames" />
                    </div>
                </el-col>
                <!-- Apps -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Apps</div>
                        <el-input v-model="propFrom.apps" />
                    </div>
                </el-col>
                <!-- Countries -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Countries</div>
                        <el-input v-model="propFrom.countries" />
                    </div>
                </el-col>
                <!-- 其他字段 -->
                <el-col :span="4">
                    <div class="form-item">
                        <el-input v-model="filterName" clearable @change="searchEvent(1)" />
                    </div>
                </el-col>
                <!-- Status -->
                <el-col :span="7">
                    <div class="form-item">
                        <el-radio-group v-model="propFrom.status" @change="handleStatusChange">
                            <el-radio value="enabled">Enabled</el-radio>
                            <el-radio value="disabled">Disabled</el-radio>
                            <el-radio value="terminated">Terminated</el-radio>
                        </el-radio-group>
                    </div>
                </el-col>
            </el-row>
        </div>

        <div class="pushtask_btn">
            <!-- 操作按钮 -->
            <el-row class="form-item-buttons">
                <!-- 左侧按钮 -->
                <el-col :span="12" class="form-item-left">
                    <el-button type="primary" @click="BatchEdit">BatchEdit</el-button>
                    <el-button type="success" v-show="propFrom.status != 'enabled'"
                        @click="BatchEnable">BatchEnable</el-button>
                    <el-button type="danger" v-show="propFrom.status == 'enabled'"
                        @click="BatchDisable">BatchTerminated</el-button>
                </el-col>

                <!-- 右侧按钮 -->
                <el-col :span="12" class="form-item-right">
                    <el-button type="primary" @click="addJob">Add Job</el-button>
                    <el-button type="primary" @click="findJob(true)">Find Job</el-button>
                </el-col>
            </el-row>
        </div>

        <!-- 数据表格 -->
        <div class="pushtask_table">
            <vxe-table border auto-resize height="auto" :column-config="{ resizable: true }"
                :cell-config="{ verticalAlign: 'center' }" :row-config="{ isCurrent: true, isHover: true, }"
                :scroll-y="{enabled: true, gt: 0}" 
                :data="tableDataList" ref="tableRef">
                <vxe-column field="#" type="checkbox" title="" align="center" width="2%">
                    <template #header="{ checked, indeterminate }">
                        <span class="custom-checkbox" @click.stop="toggleAllCheckboxEvent">
                            <i v-if="indeterminate" class="vxe-icon-square-minus-fill"></i>
                            <i v-else-if="checked" class="vxe-icon-square-checked-fill"></i>
                            <i v-else class="vxe-icon-checkbox-unchecked"></i>
                        </span>
                    </template>
                    <template #checkbox="{ row, checked, indeterminate }">
                        <span class="custom-checkbox" @click.stop="toggleCheckboxEvent(row)">
                            <i v-if="indeterminate" class="vxe-icon-square-minus-fill"></i>
                            <i v-else-if="checked" class="vxe-icon-square-checked-fill"></i>
                            <i v-else class="vxe-icon-checkbox-unchecked"></i>
                        </span>
                    </template>
                </vxe-column>
                <vxe-column field="xh" type="seq" align="center" title=" " width="3%"></vxe-column>
                <vxe-column field="etype" title="event" align="center" width="4%">
                    <template #default="{ row }">
                        {{ row.type == 0 ? "click" : 'imp' }}
                    </template>
                </vxe-column>
                <vxe-column field="appId" title="app" align="center" width="5%"></vxe-column>
                <vxe-column field="country" title="country" align="center" width="4%"></vxe-column>
                <vxe-column field="offerId" title="offer" align="center" width="8%"></vxe-column>
                <vxe-column field="pkg_name" title="pkg" align="center" width="18%"></vxe-column>
                <vxe-column field="source" title="source" align="center" width="5%"></vxe-column>
                <vxe-column field="fill_type" title="fillType" align="center" width="4%">
                    <template #default="{ row }">
                        {{ row.fill_type == null ? 'top' : row.fill_type }}
                    </template>
                </vxe-column>
                <vxe-column field="bsclick" title="bsclick" align="center" width="4%">
                    <template #default="{ row }">
                        {{ row.bsclick == null ? 'false' : row.bsclick }}
                    </template>
                </vxe-column>
                <vxe-column field="send_plan" title="sendPlan" align="center" width="5%">
                    <template #default="{ row }">
                        {{ row.send_plan == "" ? row.clickTarget : row.send_plan }}
                    </template>
                </vxe-column>
                <vxe-column field="succ/sent/result" title="succ/sent/result" align="center" width="10%">
                    <template #default="{ row }">
                        <div >
                            <div>
                                {{ row?.clickSuccess + '/'}}
                            </div>
                            <div>
                                {{ row?.clickSent }}
                            </div>
                        </div>
                    </template>
                </vxe-column>
                <vxe-column field="cr" title="cr" align="center" width="8%">
                    <template #default="{ row }" >
                        <!-- 检查 taskCr 是否存在且不为 null -->
                        <div class="device-box" v-if="group == 'ym'">
                            <div class="device-text"><span class="device-span">cr:</span>
                                {{ (((row?.crInfo?.ctr ? row?.crInfo?.ctr : 0) + (row?.crInfo?.ivr ? row?.crInfo?.ivr :
                                    0)) * 100).toFixed(4) }}%</div>
                            <div class="device-text"><span class="device-span">ecpc:</span>
                                {{ (((row?.crInfo?.ecpc ? row?.crInfo?.ecpc : 0)) * 100).toFixed(4) }}%</div>
                            <div class="device-text"><span class="device-span">roi:</span>
                                {{ (((row?.crInfo?.roi ? row?.crInfo?.roi : 0)) * 100).toFixed(2) }}%</div>
                        </div>
                        <div v-else>
                            {{ '' }}
                        </div>
                    </template>
                </vxe-column>
                <vxe-column field="updatedTime" title="mdate" align="center" width="100">
                    <template #default="{ row }">
                        {{ formatDateToSimple(row?.updatedTime) }}
                    </template>
                </vxe-column>
                <vxe-column field="Action" align="center" fixed="right" width="220">
                    <template #header>
                        <div style="display: flex; align-items: center; justify-content: center;">
                            <span>Action</span>
                            <el-button type="primary" size="small" @click="exportToCSV">csv</el-button>
                        </div>
                    </template>
                    <template #default="scope">
                        <el-button class="btn_table" size="small" type="primary"
                            @click="showTask(scope.row)">show</el-button>
                        <el-button class="btn_table" size="small" type="success" v-if="scope.row.status != 'enabled'"
                            @click="enableTask(scope.row)">enable</el-button>
                        <el-button class="btn_table" size="small" type="danger"
                            v-else-if="scope.row.status == 'enabled'"
                            @click="disableTask(scope.row)">terminated</el-button>
                    </template>
                </vxe-column>
            </vxe-table>
        </div>

        <div class="pushtask_footer">

            <!-- 分页 -->
            <vxe-pager v-model:currentPage="pageVO.currentPage" v-model:pageSize="pageVO.pageSize" :total="pageVO.total"
                :layouts="['Home', 'PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'End', 'Sizes', 'FullJump', 'Total']"
                @page-change="pageChange">
            </vxe-pager>
        </div>
        <!-- 添加在 template 最后 -->
        <AutoTask v-model="showModal" :title="modalTitle" :selected-ids="taskStore.selectedIds"
            :current-row-data="currentRowData" @confirm="handleModalConfirm" @confirmNew="handleModalConfirm"
            :btn-type="btnType" />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import type { autoTaskFormInter } from '@/api/pushtask/type'
import { ElMessage, ElMessageBox } from 'element-plus';
import autoTaskTable from './hooks/autoTaskTable';
import autoTaskModals from './hooks/autoTaskModals'
import autoRunningStatus from './hooks/autoRunningStatus'
import { formatDateToSimple } from "@/utils/time";
import { reqBatchEnabled,reqDisBatchEnabled } from "@/api/pushtask/autoTask"
import { useTaskStore } from '@/store/pushtask/autoTask'
import AutoTask from '@/components/task/AutoTask/PkgModal.vue'
import type { FormDataType } from '@/components/task/AutoPkgTask/type'
import {getCookies} from '@/utils/common'
import { autoTaskEnabled } from "@/api/pushtask/type";
// 获取group
const group = ref(getCookies('group'))

const taskStore = useTaskStore()
// 表单数据
const propFrom = ref<autoTaskFormInter>({
    etypes: 'all',
    offerIds: '',
    pkgNames: '',
    apps: '',
    countries: '',
    status: 'enabled',
})
const toggleAllCheckboxEvent = () => {
    const $table = tableRef.value
    if ($table) {
        $table.toggleAllCheckboxRow()
    }
}
const toggleCheckboxEvent = (row: any) => {
    const $table = tableRef.value
    if ($table) {
        $table.toggleCheckboxRow(row)
    }
}


// -------------------查询功能-------------------
const {
    tableRef,
    // loading,
    tableDataList,
    pageVO,
    tableData,
    filterName,
    searchEvent,
    findAllHooks,
    pageChanges
} = autoTaskTable()

// 查询功能
const findJob = async (type: boolean) => {
    findAllHooks(type, 1)
};
const pageChange = ({ currentPage, pageSize }: any) => {
    pageChanges({ pageSize, currentPage })
}
// 点击单选框，直接查询数据
const handleStatusChange = () => {
    findAllHooks(true, 1)
}


watch(propFrom, (newValue) => {
    taskStore.updatePropFrom(newValue)
}, { deep: true, immediate: true })
// -------------------查询功能结束-------------------

// -------------------弹窗状态-------------------
const {
    showModal,
    modalTitle,
    btnType,
    currentRowData,
    BatchEdits,
    handleModals
} = autoTaskModals(tableRef, findAllHooks)

// 批量编辑
const BatchEdit = () => {
    BatchEdits()
}

// -------------------处理弹窗确认-------------------
const handleModalConfirm = async (formData: FormDataType): Promise<void> => {
    handleModals(formData)
};
// -------------------处理弹窗确认结束-------------------
// 添加任务
const addJob = () => {
    taskStore.setSelectedIds([])
    modalTitle.value = 'TaskDetail []'
    currentRowData.value = null // 清空当前行数据
    showModal.value = true
    btnType.value = 'addJob'
}

// 显示任务详情
const showTask = (row: any) => {
    taskStore.setSelectedIds([row.taskId])
    modalTitle.value = `TaskDetail [${row.taskId}]`
    currentRowData.value = row // 设置当前行数据
    showModal.value = true
    btnType.value = 'showTask'
}
watch(() => showModal.value, async (newValue) => {
    if (newValue === true) {

    }
})
// -------------------弹窗状态结束-------------------


// -------------------表格操作-------------------
// 统一处理启用/禁用操作的函数
const handleTaskStatus = async (type: 'enable' | 'disable', isBatch: boolean, data: any) => {
    const actionText = type === 'enable' ? '启用' : '禁用'

    // 批量操作时的检查
    if (isBatch) {
        const $table = tableRef.value
        if (!$table) return

        const selectRecords = $table.getCheckboxRecords()
        if (selectRecords.length < 1) {
            ElMessage.warning(`请选择要${actionText}的数据`)
            return
        }
        data = selectRecords
    }

    // 构造请求参数
    const params = {
        taskIds: isBatch ? data.map((row: any) => row.taskId).join(',') : data.taskId
    }

    try {
        await ElMessageBox.confirm(`确定${actionText}${isBatch ? '' : '该任务'}吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })
        let res: autoTaskEnabled
        if(type === 'enable'){
            res = await reqBatchEnabled(params)
        }else{
            res = await reqDisBatchEnabled(params)
        }
        if (res.message === 'success') {
            ElMessage.success(`${actionText}成功`)
            findAllHooks(false)
        } else {
            ElMessage.error(`${actionText}失败`)
        }
    } catch (err) {
        // 用户取消操作，不需要处理
    }
}
// 简化后的四个方法
const enableTask = (row: any) => handleTaskStatus('enable', false, row)
const BatchEnable = () => handleTaskStatus('enable', true, null)
const disableTask = (row: any) => handleTaskStatus('disable', false, row)
const BatchDisable = () => handleTaskStatus('disable', true, null)
// -------------------表格操作结束-------------------


// -------------------处理弹窗确认结束-------------------

const {
    filterStatus
} = autoRunningStatus()

// 导出csv
const exportToCSV = () => {
    const rows = tableData.value;
    if (!rows || rows.length === 0) {
        ElMessage.error('暂无数据可导出');
        return;
    }

    const $table = tableRef.value;
    if ($table) {
        const list = $table.getFullColumns()
        .filter(column => !['xh', '#'].includes(column.field)); // 过滤掉 xh 和 # 列// 过滤掉 xh 列;
        const headers = list.map((column) => column.title);
        // headers[0] = '#';
        // headers[headers.length - 1] = 'Action';

        const formattedRows = tableData.value.map((row: any) => {
            return list.map((column) => {
                if(column.field === 'etype'){
                    return `${row.type == 0 ? "click" : 'imp'}`;
                }else if(column.field === 'fill_type'){
                    return `${row.fill_type == null ? 'top' : row.fill_type}`;
                }else if(column.field === 'bsclick'){
                    return `${row.bsclick == null ? 'false' : row.bsclick}`;
                }else if(column.field === 'send_plan'){
                    return `${row.send_plan == null ? row.clickTarget : row.send_plan}`;
                }else if (column.field === 'succ/sent/result') {
                    return `${row.clickSuccess + '/' + row.clickSent}`;
                }else if (column.field === 'cr') {
                    const ctr = row?.crInfo?.ctr || 0;
                    const ivr = row?.crInfo?.ivr || 0;
                    const ecpc = row?.crInfo?.ecpc || 0;
                    const roi = row?.crInfo?.roi || 0;
                    return `cr:${((ctr + ivr) * 100).toFixed(4)}%;ecpc:${(ecpc * 100).toFixed(4)}%;roi:${(roi * 100).toFixed(2)}%`;
                } else if (column.field === 'updatedTime') {
                    return formatDateToSimple(row?.updatedTime);
                }
                return row[column.field] || ''; // 其他字段正常取值
            });
        });

        const csvContent = [headers, ...formattedRows].map((row) => row.join(',')).join('\n');

        // 创建 Blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // 创建隐藏的下载链接并触发下载
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'table_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};


onMounted(async () => {


});
</script>

<style scoped lang="scss">
.pushtask {
    width: 100%;
    height: calc(100vh - 120px);

    .pushtask_header,
    .pushtask_btn {
        width: 100%;
        height: 10%;
    }

    .pushtask_table {
        width: 100%;
        height: 70%;
        overflow: hidden;
    }

    .pushtask_footer {
        width: 100%;
        height: 10%;
    }

    .btn_table {
        margin: 10px;
    }
}

.el-row {
    margin-bottom: 20px;
}

.el-col {
    margin: 5px 0;
}

.el-table {
    margin-top: 20px;
}

/* 使标签和输入框对齐 */
.form-item-label {
    font-weight: bold;
    color: #606266;
    margin: 0 10px;
    text-align: left;
    width: 100px;
}

/* 每一行输入框和拉框的样式 */
.form-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
}

/* 按钮区域布局 */
.form-item-buttons {
    display: flex;
    justify-content: space-between;
    padding-top: 10px;
    margin-top: 20px;
}

/* 左侧按钮 */
.form-item-left {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
}

/* 右侧按钮 */
.form-item-right {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.icon-echarts {
    cursor: $base-cursor;
    display: flex;
    justify-content: center;
    align-items: center;
}

.device-box {
    display: flex;
    flex-direction: column;
    gap: 5px;
    text-align: left;

    .device-text {}

    .device-span {
        font-weight: bold;
    }
}

.text-danger {
    color: #dc3545
}

.text-success {
    color: #28a745
}
</style>