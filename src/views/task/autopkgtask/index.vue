<template>
    <div class="pushtask">
        <div class="pushtask_header">
            <!-- 查询条件 -->
            <el-row :gutter="20" type="flex" justify="start">
                <!-- Offers -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Offers</div>
                        <el-input v-model="propFrom.offerid" />
                    </div>
                </el-col>

                <!-- Pkgs -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Pkgs</div>
                        <el-input v-model="propFrom.pkgname" />
                    </div>
                </el-col>
                <!-- Apps -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Apps</div>
                        <el-input v-model="propFrom.appid" />
                    </div>
                </el-col>
                <!-- Country -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Country</div>
                        <el-input v-model="propFrom.country" />
                    </div>
                </el-col>
                <!-- Bsclick -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Bsclick</div>
                        <el-select v-model="propFrom.bsclick" placeholder="">
                            <el-option label="all" value="all" />
                            <el-option label="true" value="1" />
                            <el-option label="false" value="0" />
                        </el-select>
                    </div>
                </el-col>
                <!-- TaskIds -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">TaskIds</div>
                        <el-input v-model="propFrom.jobid" />
                    </div>
                </el-col>



                <!-- Etype -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Etype</div>
                        <el-select v-model="propFrom.etype" placeholder="Please select" >
                            <el-option label="click" value="click" />
                            <el-option label="imp" value="imp" />
                            <el-option label="all" value="all" />
                        </el-select>
                    </div>
                </el-col>
                <!-- 其他字段 -->
                <el-col :span="4">
                    <div class="form-item">
                        <el-input v-model="filtercontent" @change="searchEvent(1)"/>
                    </div>
                </el-col>
                <!-- Status -->
                <el-col :span="7">
                    <div class="form-item">
                        <el-radio-group v-model="propFrom.ce_pkg_status" @change="handleStatusChange">
                            <el-radio label="enabled">Enabled</el-radio>
                            <el-radio label="disabled">Disabled</el-radio>
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
                    <el-button type="success" v-show="propFrom.ce_pkg_status == 'disabled'"  @click="BatchEnable">BatchEnable</el-button>
                    <el-button type="danger"  v-show="propFrom.ce_pkg_status == 'enabled'"   @click="BatchDisable">BatchDisable</el-button>
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
                        {{ row.etype == null ? "click" : row.etype }}
                    </template>
                </vxe-column>
                <vxe-column field="id" title="taskid" align="center" width="5%"></vxe-column>
                <vxe-column field="appId" title="appId" align="center" width="5%"></vxe-column>
                <vxe-column field="pkgName" title="pkgname" align="center" width="10%"></vxe-column>
                <vxe-column field="country" title="country" align="center" width="4%"></vxe-column>
                <vxe-column field="offers" title="offers" align="center" width="6%"></vxe-column>
                <vxe-column field="deviceDays" title="deviceDays" align="center" width="5%"></vxe-column>
                <vxe-column field="source" title="source" align="center" width="12%">
                    <template #default="{ row }">
                        <div class="device-box">
                            <div class="device-text" :title="!!row.s ? (row.s) : '-'"><span
                                    class="device-span">source:</span> {{ !!row.s ? truncateText(row.s) : '-' }}</div>
                            <div class="device-text" :title="!!row.ds_adx ? (row.ds_adx) : '-'"><span
                                    class="device-span">dsadx:</span> {{ !!row.ds_adx ? truncateText(row.ds_adx) : '-'
                                }}
                            </div>
                            <div class="device-text" :title="!!row.ds_bundle ? (row.ds_bundle) : '-'"><span
                                    class="device-span">dsbundle:</span> {{ !!row.ds_bundle ?
                                        truncateText(row.ds_bundle) : '-' }}</div>
                        </div>
                    </template>
                </vxe-column>
                <vxe-column field="bsclick" title="bsclick" align="center" width="4%"></vxe-column>
                <vxe-column field="max" title="max" align="center" width="5%"></vxe-column>
                <vxe-column field="hour" title="hour" align="center" width="4%"></vxe-column>
                <vxe-column field="startHour" title="startHour" align="center" width="5%"></vxe-column>
                <vxe-column field="runningStatus" title="runningStatus" align="center" width="8%">
                    <template #default="{ row }">
                        <div class="device-box">
                            <div class="device-text">
                                <span class="device-span">succ:</span>
                                {{ !!row.runnerStatus?.succCount ? (row.runnerStatus?.succCount) : '' }}
                            </div>
                            <div class="device-text">
                                <span class="device-span">sent:</span>
                                {{ !!row.runnerStatus?.sendCount ? (row.runnerStatus?.sendCount) : '' }}
                            </div>
                            <div class="device-text">
                                <span class="device-span">valid:</span>
                                {{ !!row.runnerStatus?.validCount ? (row.runnerStatus?.validCount) : '' }}
                            </div>

                            <div class="device-text"
                                :class="row.runnerStatus?.status < 0 ? 'text-danger' : 'text-success'">
                                {{ !!row.runnerStatus?.status ? filterStatus(row.runnerStatus?.status) : '' }}
                            </div>
                        </div>

                        <!-- Add a check to only display popover if necessary fields are not null -->
                        <el-popover v-if="row?.runnerStatus?.resultDetail" effect="light" trigger="hover"
                            placement="left" width="auto">
                            <template #default>
                                <div class="popoverClass"
                                    v-html="row?.runnerStatus?.resultDetail ? generateStatusDetail(row?.runnerStatus?.resultDetail) : ''">
                                </div>
                            </template>
                            <template #reference>
                                <el-tag>more</el-tag>
                            </template>
                        </el-popover>
                    </template>
                </vxe-column>
                <vxe-column field="cr" title="cr" align="center" width="8%">
                    <template #default="{ row }">
                        <!-- 检查 taskCr 是否存在且不为 null -->
                        <div class="device-box">
                            <div class="device-text"><span class="device-span">cr:</span>
                                {{ (((row?.crInfo?.ctr ? row?.crInfo?.ctr : 0) + (row?.crInfo?.ivr ? row?.crInfo?.ivr :
                                0)) * 100).toFixed(4) }}%</div>
                            <div class="device-text"><span class="device-span">ecpc:</span>
                                {{ (((row?.crInfo?.ecpc ? row?.crInfo?.ecpc : 0)) * 100).toFixed(4) }}%</div>
                            <div class="device-text"><span class="device-span">roi:</span>
                                {{ (((row?.crInfo?.roi ? row?.crInfo?.roi : 0)) * 100).toFixed(2) }}%</div>

                        </div>
                    </template>
                </vxe-column>
                <vxe-column field="updated" title="updateDate" align="center" width="100">
                    <template #default="{ row }">
                        {{ formatDateToSimple(row?.updated) }}
                    </template>
                </vxe-column>
                <vxe-column field="Action" align="center" fixed="right" width="240">
                    <template #header>
                        <div style="display: flex; align-items: center; justify-content: center;">
                            <span>Action</span>
                            <el-button type="primary" size="small" @click="exportToCSV">csv</el-button>
                        </div>
                    </template>
                    <template #default="scope">
                        <el-button class="btn_table" size="small" type="primary" @click="showTask(scope.row)">show</el-button>
                        <el-button class="btn_table" size="small" type="primary" @click="tryTask(scope.row)">try</el-button>
                        <el-button class="btn_table" size="small" type="primary" @click="runTask(scope.row)">run</el-button>
                        <el-button class="btn_table" size="small" type="success" v-if="scope.row.status == 'disabled'"
                            @click="enableTask(scope.row)">enable</el-button>
                        <el-button class="btn_table" size="small" type="danger" v-else-if="scope.row.status == 'enabled'"
                            @click="disableTask(scope.row)">disable</el-button>
                        <el-button class="btn_table" size="small" type="primary" @click="historyTask(scope.row)">history</el-button>
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
        <PkgModal v-model="showModal" :title="modalTitle" :selected-ids="taskStore.selectedIds"
            :current-row-data="currentRowData"  @confirm="handleModalConfirm" @confirmNew="handleModalConfirm" 
            :btn-type="btnType" />
            <!-- historyTask -->
            <HistoryTaskTable v-model="showHistoryModal" :title="historyTitle" :historyId="String(historyId)" />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import type { autoPkgFormInter } from '@/api/pushtask/type'
import { ElMessage, ElMessageBox } from 'element-plus';
import autoPkgTable from './hooks/autoPkgTable'
import autoPkgModal from './hooks/autoPkgModal'
import autoRunningStatus from './hooks/autoRunningStatus'
import { formatDateToSimple } from "@/utils/time";
import {  reqBatchEnabledOrDisabled,reqTryOrRunUrl } from "@/api/pushtask/autoPkgTask"
import { useTaskStore } from '@/store/pushtask/autoPkgTask'
import PkgModal from '@/components/task/AutoPkgTask/PkgModal.vue'
import HistoryTaskTable from '@/components/task/AutoPkgTask/HistoryTaskTable.vue'
import type { FormDataType } from '@/components/task/AutoPkgTask/type'
import { truncateText } from '@/utils/common'; // 直接导入默认对象并调用truncateText
const taskStore = useTaskStore()
// 表单数据
const propFrom = ref<autoPkgFormInter>({
    etype: 'all',
    offerid: '',
    pkgname: '',
    appid: '',
    country: '',
    jobid: '',
    bsclick: 'all',
    ce_pkg_status: 'enabled',
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
    filtercontent,
    searchEvent,
    findAllHooks,
    pageChanges
} = autoPkgTable()
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
} = autoPkgModal(tableRef, findAllHooks)

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
    taskStore.setSelectedIds([row.id])
    modalTitle.value = `TaskDetail [${row.id}]`
    currentRowData.value = row // 设置当前行数据
    showModal.value = true
    btnType.value = 'showTask'
}
// 通用的任务操作函数
const handleTask = async (row: any, max: number, message: string, type: string) => {
  ElMessageBox.confirm(message, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const params = {
      pkgTaskId: row.id,
      max: max
    }
    let res = await reqTryOrRunUrl(params)
    if(res.message === 'success') {
      ElMessage.success(`${type} success`)
    } else {
      ElMessage.error(res.message)
    }
    findAllHooks(false)
  }).catch(() => {
    ElMessage.info(`${type} cancel`)
  })
}
// try 任务
const tryTask = (row: any) => {
  handleTask(row, 5, 'Confirm try to send 5 click for task','try')
}
// run 任务
const runTask = (row: any) => {
  handleTask(row, 0, 'Confirm to run task','run')
}
const showHistoryModal = ref<boolean>(false)
const historyTitle = ref<string>('')
const historyId = ref<string>('')
// historyTask
const historyTask = (row:any) => {
    showHistoryModal.value = true
    historyTitle.value = `TaskDetail [${row.id}]`
    historyId.value = row.id
}

watch(() => showModal.value, async (newValue) => {
    if (newValue === true) {

    }
})
// -------------------弹窗状态结束-------------------


// -------------------表格操作-------------------
// 统一处理启用/禁用操作的函数
const handleTaskStatus = async (type: 'enable' | 'disable', isBatch: boolean, data: any) => {
    const value = type === 'enable' ? 'enabled' : 'disabled'
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
        key: 'status',
        value,
        pkgTaskIds: isBatch ? data.map((row: any) => row.id).join(',') : data.id
    }

    try {
        await ElMessageBox.confirm(`确定${actionText}${isBatch ? '' : '该任务'}吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })

        const res = await reqBatchEnabledOrDisabled(params)
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


const generateStatusDetail = (data: any) => {
    let statusDetail = eval("(" + data + ")");
    let statusPercent = '';
    let statusDetailArr = [];
    for (let i in statusDetail) {
        statusPercent = `
            <div>
                <label class="bg-gray text-muted">
                    ${i.replaceAll("<", "").replaceAll(">", "") + ':'}
                </label>
                <br />
                <span class="display-5 px-1">
                    <b> ${statusDetail[i]} </b>
                </span>
            </div>`;
        statusDetailArr.push(statusPercent);
    }

    // 拼接最终的 HTML 内容
    return statusDetailArr.join('');
}

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
        .filter(column => !['xh', '#'].includes(column.field)); // 过滤掉 xh 和 # 列// 过滤掉 xh 列;;
        const headers = list.map((column) => column.title);
        // headers[0] = '#';
        // headers[headers.length - 1] = 'Action';

        const formattedRows = tableData.value.map((row: any) => {
            return list.map((column) => {
                if (column.field === 'source') {
                    return `source:${row.s || '-'};dsadx:${row.ds_adx || '-'};dsbundle:${row.ds_bundle || '-'}`;
                } else if (column.field === 'runningStatus') {
                    // 添加状态值的安全检查
                    const status = row.runnerStatus?.status;
                    const statusText = status !== undefined && status !== null ? filterStatus(status) : '';
                    return `succ:${row.runnerStatus?.succCount || ''};sent:${row.runnerStatus?.sendCount || ''};valid:${row.runnerStatus?.validCount || ''};status:${statusText}`;
                } else if(column.field === 'cr') {
                    const ctr = row?.crInfo?.ctr || 0;
                    const ivr = row?.crInfo?.ivr || 0;
                    const ecpc = row?.crInfo?.ecpc || 0;
                    const roi = row?.crInfo?.roi || 0;
                    return `cr:${((ctr + ivr) * 100).toFixed(4)}%;ecpc:${(ecpc * 100).toFixed(4)}%;roi:${(roi * 100).toFixed(2)}%`;
                } else if(column.field === 'updated') {
                    return formatDateToSimple(row?.updated);
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
    .btn_table{
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
.popoverClass{
  max-height: 500px;
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
  padding: 10px;
  overflow: scroll;
}
.text-muted {
    color: #6c757d !important
}
.px-1{
    font-weight: 600 !important;
}
</style>