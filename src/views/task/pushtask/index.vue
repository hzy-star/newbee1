<template>
  <div class="pushtask">
    <div class="pushtask_header">
      <!-- 查询条件 -->
      <el-row :gutter="20" type="flex" justify="start" style="margin: 0;">
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
        <el-col :span="4">
          <div class="form-item">
            <div class="form-item-label">Offers</div>
            <el-input v-model="propFrom.offerIds" />
          </div>
        </el-col>

        <!-- Pkgs -->
        <el-col :span="4">
          <div class="form-item">
            <div class="form-item-label">Pkgs</div>
            <el-input v-model="propFrom.pkgNames" />
          </div>
        </el-col>

        <!-- Apps -->
        <el-col :span="4">
          <div class="form-item">
            <div class="form-item-label">Apps</div>
            <el-input v-model="propFrom.appIds" />
          </div>
        </el-col>

        <!-- Countries -->
        <el-col :span="4">
          <div class="form-item">
            <div class="form-item-label">Countries</div>
            <el-input v-model="propFrom.countries" />
          </div>
        </el-col>

        <!-- TaskIds -->
        <el-col :span="4">
          <div class="form-item">
            <div class="form-item-label">TaskIds</div>
            <el-input v-model="propFrom.taskIds" />
          </div>
        </el-col>

        <!-- Bsclick -->
        <el-col :span="4">
          <div class="form-item">
            <div class="form-item-label">Bsclick</div>
            <el-select v-model="propFrom.bsclick" placeholder="" clearable>
              <el-option label="true" value="true" />
              <el-option label="false" value="false" />
            </el-select>
          </div>
        </el-col>

        <!-- 其他字段 -->
        <el-col :span="4">
          <div class="form-item">
            <el-input v-model="filtercontent" @change="searchEvent(1)" />
          </div>
        </el-col>


        <!-- Date -->
        <el-col :span="4">
          <div class="form-item">
            <div class="form-item-label">Date</div>
            <el-select v-model="propFrom.taskdate" placeholder="please select">
              <el-option v-for="(item, index) in date" :key="index" :label="item" :value="item" />
            </el-select>
          </div>
        </el-col>
        <!-- Status -->
        <el-col :span="10">
          <div class="form-item">
            <el-radio-group v-model="propFrom.status" @change="handleStatusChange">
              <el-radio value="enable">Enabled</el-radio>
              <el-radio value="disabled">Disabled</el-radio>
              <el-radio value="template">Template</el-radio>
              <el-radio value="all">All</el-radio>
            </el-radio-group>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="pushtask_btn">
      <!-- 操作按钮 -->
      <div class="form-item-buttons">
        <!-- 左侧按钮 -->
        <div class="form-item-left">
          <el-button v-show="propFrom.status !== 'template'" type="primary" @click="BatchEdit">BatchEdit</el-button>
          <el-button v-show="propFrom.status !== 'template' && propFrom.status !== 'enable'" type="success"
            @click="BatchEnable">BatchEnable</el-button>
          <el-button v-show="propFrom.status !== 'template' && propFrom.status !== 'disabled'" type="danger"
            @click="BatchDisable">BatchDisable</el-button>
        </div>
        <el-icon @click="clickarrow">
          <component :is="arrowupOrDown ? 'ArrowUp' : 'ArrowDown'"></component>
        </el-icon>

        <!-- 右侧按钮 -->
        <div class="form-item-right">
          <el-button type="primary" @click="CreateTemplate">CreateTemplate</el-button>
          <el-button type="primary" @click="addTask">Add Task</el-button>
          <el-button type="primary" @click="findAll(true)">Find All</el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="pushtask_table">
      <div class="toolbarRef-div">
        <vxe-toolbar ref="toolbarRef" custom></vxe-toolbar>
      </div>
      <div class="vxe-table-div">
        <vxe-table border auto-resize height="auto" :column-config="{ resizable: true }"
          :cell-config="{ verticalAlign: 'center' }" :row-config="{ isCurrent: true, isHover: true, }"
          :scroll-y="{ enabled: true, gt: 0 }" :data="tableDataList" ref="tableRef" :custom-config="customConfig">
          <vxe-column field="#" type="checkbox" title="" align="center" width="6%">
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
              <div class="icon-echarts">
                <svg-icon v-if="row.createdBy == 'app'" name="fa-plane" width="15px" height="15px"></svg-icon>
                <svg-icon v-if="row.trafficcontrol" name="fa-android" width="15px" height="15px"></svg-icon>
                <svg-icon name="fa-line-chart" width="15px" height="15px" @click="handleshowChart(row)"></svg-icon>
                <svg-icon v-if="row.autoCr" name="fa-magic" width="15px" height="15px"
                  @click="handleshowAutoCr(row)"></svg-icon>
                <svg-icon v-if="row.sortCr" name="fa-signal" width="15px" height="15px"
                  @click="handleshowTaskSortChart(row)"></svg-icon>
              </div>
            </template>
          </vxe-column>
          <vxe-column field="xh" type="seq" align="center" title=" " width="3%"></vxe-column>
          <vxe-column field="etype" title="event" align="center" width="4%"></vxe-column>
          <vxe-column field="offers" title="offer" align="center" width="6%"></vxe-column>
          <vxe-column field="appId" title="appid" align="center" width="6%"></vxe-column>
          <vxe-column field="weight" title="weight" align="center" width="5%" :visible="false"></vxe-column>
          <vxe-column field="scope" title="scope" align="center" width="5%" :visible="false">
            <template #default="{ row }">
              {{ row.gt + "->" + row.lt }}
            </template>
          </vxe-column>
          <vxe-column field="country" title="country" align="center" width="4%"></vxe-column>
          <vxe-column field="usealg" title="usealg" align="center" width="5%" :visible="false"></vxe-column>
          <vxe-column field="urlparams" title="urlparam" align="center" width="10%"></vxe-column>
          <vxe-column field="sendPlan" title="sendPlan" align="center" width="8%"></vxe-column>
          <vxe-column field="pkgName" title="pkg" align="center" width="9%">
            <template #default="{ row }">
              {{ row.pkgName != 'null' ? row.pkgName : '' }}
            </template>
          </vxe-column>
          <vxe-column field="succ/total/status/dcsuccss/sent" align="center" title="succ/total/status/dcsuccss/sent"
            width="12%">
            <template #default="{ row }">
              <div>
                <div>
                  {{ row?.ongoingData?.[0]?.successCount != null ? `${row?.ongoingData?.[0]?.successCount}/` : '' }}
                </div>
                <div>
                  {{ row?.ongoingData?.[0]?.sendCount != null ? `${row?.ongoingData?.[0]?.sendCount}/` : '' }}
                </div>
                <!-- message等于success，显示绿色内容，不然显示红色 -->
                <div v-if="row?.ongoingData?.[0]?.message != null"
                  :style="{ color: row?.ongoingData?.[0]?.message === 'success' ? 'green' : 'red' }">
                  {{ row?.ongoingData?.[0]?.message }}/
                </div>
                <div>
                  {{ row?.ongoingData?.[0]?.dcsuccessCount > 0 ? row?.ongoingData?.[0]?.dcsuccessCount : '' }}
                </div>
                <div>
                  {{ row?.ongoingData?.[0]?.sendServerCount > 0 ? row?.ongoingData?.[0]?.sendServerCount : '' }}
                </div>
              </div>

              <!-- Add a check to only display popover if necessary fields are not null -->
              <el-popover v-if="shouldShowPopover(row)" effect="light" trigger="hover" placement="left" width="auto">
                <template #default>
                  <div class="popoverClass" v-html="generateStatusDetail(row?.ongoingData?.[0]?.statusDetail || '')">
                  </div>
                </template>
                <template #reference>
                  <el-tag>more</el-tag>
                </template>
              </el-popover>
            </template>

          </vxe-column>
          <vxe-column field="cr/ecpc(0.285%)/roi(65%)" title="cr/ecpc(0.285%)/roi(65%)" align="center" width="10%">
            <template #default="{ row }">
              <!-- 检查 taskCr 是否存在且不为 null -->
              <div v-if="row?.taskCrData">
                cr: {{ ((row?.taskCrData?.ctr + row?.taskCrData?.ivr) * 100).toFixed(4) }}%
              </div>
            </template>
          </vxe-column>
          <vxe-column field="bsclick" title="bsclick" align="center" width="5%"></vxe-column>
          <vxe-column field="mdate" title="mdate" align="center" width="100">
            <template #default="{ row }">
              {{ formatDateToSimple(row?.mdate) }}
            </template>
          </vxe-column>
          <vxe-column field="Action" align="center" fixed="right" min-width="100">
            <template #header>
              <div style="display: flex; align-items: center; justify-content: center;">
                <span>Action</span>
                <el-button type="primary" size="small" @click="exportToCSV">csv</el-button>
              </div>
            </template>
            <template #default="scope">
              <div class="action-icons">
                <svg-icon class="action-icon-svg" name="view" width="15px" height="15px" @click="showTask(scope.row)" title="show"></svg-icon>
                <svg-icon class="action-icon-svg" name="delete" width="15px" height="15px" @click="delTask(scope.row)" title="delete"></svg-icon>
                <svg-icon class="action-icon-svg" v-if="scope.row.taskStatus == 'disable' && scope.row.taskStatus != 'template'" name="enabled"
                  width="15px" height="15px" @click="enableTask(scope.row)" title="enabled"></svg-icon>
                <svg-icon class="action-icon-svg" v-else-if="scope.row.taskStatus == 'enable' && scope.row.taskStatus != 'template'"
                  name="disabled" width="15px" height="15px" @click="disableTask(scope.row)" title="disabled"></svg-icon>
              </div>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
    </div>

    <div class="pushtask_footer">

      <!-- 分页 -->
      <vxe-pager v-model:currentPage="pageVO.currentPage" v-model:pageSize="pageVO.pageSize" :total="pageVO.total"
        :layouts="['Home', 'PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'End', 'Sizes', 'FullJump', 'Total']"
        @page-change="pageChange">
      </vxe-pager>
    </div>
    <!-- 添加在 template 最后 -->
    <TaskModal v-model="showModal" :title="modalTitle" :selected-ids="taskStore.selectedIds"
      :current-row-data="currentRowData" :auto-bundle-key="autoBundleKey" @confirm="handleModalConfirm"
      @confirmNew="handleModalConfirm" :btn-type="btnType" />
    <ChartModal v-model:visible="chartVisible" :title="chartTitle" :chart-type="chartType" :chart-data="chartData"
      :show-switch="showSwitch" :default-type="defaultType" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, reactive } from 'vue';
import type { propFormInter } from '@/api/pushtask/type'
import { ElMessage, ElMessageBox } from 'element-plus';
import useChart from './hooks/useChart'
import useTable from './hooks/useTable'
import useModal from './hooks/useModal'
import { getRelativeDates, formatDateToSimple } from "@/utils/time";
import { reqOngoing, reqGetBundleKey, reqDelTask, reqEnableTask, reqDisAbleTask, reqBatchEnableTask, reqBatchDisableTask } from "@/api/pushtask/index"
import listTaskCr from "@/store/common/listTaskCr"
import TaskModal from '@/components/task/TaskModal.vue'
import ChartModal from '@/components/task/ChartModal.vue'
import type { FormDataType } from '@/components/task/type'
import { useTaskStore } from '@/store/pushtask/task'
import type { VxeToolbarInstance ,VxeTablePropTypes} from 'vxe-table'
const arrowupOrDown = ref(true)
// 折叠展开
const clickarrow = () => {
  arrowupOrDown.value = !arrowupOrDown.value
  const header = document.querySelector('.pushtask_header') as HTMLElement
  const tableDiv = document.querySelector('.vxe-table-div') as HTMLElement
  const pushDiv = document.querySelector('.pushtask_table') as HTMLElement
  const footDiv = document.querySelector('.pushtask_footer') as HTMLElement
  const buttonsMargin = document.querySelector('.form-item-buttons') as HTMLElement
  const tabbarHeight = parseFloat(getComputedStyle(document.querySelector('.layout_tabbar') as HTMLElement).height)
  const btnHeight = parseFloat(getComputedStyle(document.querySelector('.pushtask_btn') as HTMLElement).height)
  
  if (header && tableDiv && pushDiv && footDiv) {
    if (arrowupOrDown.value) {
      header.style.display = 'flex'
      tableDiv.style.height = `90%`
      pushDiv.style.height = `75%`
      buttonsMargin.style.marginTop = '5px'
      buttonsMargin.style.paddingTop = '5px'
    } else {
      header.style.display = 'none'
      tableDiv.style.height = `calc(100% - ${tabbarHeight}px - 5px)`
      pushDiv.style.height = `calc(100% - ${tabbarHeight}px - ${btnHeight}px )`
      buttonsMargin.style.marginTop = '0px'
      buttonsMargin.style.paddingTop = '0px'
    }
  }
}
const getTaskCr = listTaskCr()
// 页面初始化获取getAutoTopBundleKeyNames接口的值
const autoBundleKey = ref<Array<string>>()
// 获取最近3天的日期
const date = ref(getRelativeDates(-3));
// 表单数据
const propFrom = ref<propFormInter>({
  etypes: 'click',
  offerIds: '',
  pkgNames: '',
  appIds: '',
  countries: '',
  taskIds: '',
  bsclick: '',
  status: 'enable',
  taskdate: '',
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

// -------------------echarts图表-------------------
const {
  chartVisible,
  chartTitle,
  chartType,
  chartData,
  showSwitch,
  defaultType,
  showChart,
  showAutoCr,
  showTaskSortChart,
} = useChart()
// 查看图表
const handleshowChart = async (row: any) => {
  showChart(row)
}
// 显示自动CR图表
const handleshowAutoCr = async (row: any) => {
  showAutoCr(row)
}
// 显示排序CR图表
const handleshowTaskSortChart = async (row: any) => {
  showTaskSortChart(row)
}
// -------------------echarts图表结束-------------------


// -------------------查询功能-------------------
const {
  tableRef,
  // loading,
  tableDataList,
  pageVO,
  tableData,
  ongoing,
  filtercontent,
  searchEvent,
  findAllHooks,
  pageChanges
} = useTable()
// 查询功能
const findAll = async (type: boolean) => {
  await fetchTasks(type)
};
const pageChange = ({ currentPage, pageSize }: any) => {
  pageChanges({ pageSize, currentPage })
}
// 点击单选框，直接查询数据
const handleStatusChange = async () => {
  await fetchTasks(true)
}
// 通用的获取任务并更新状态逻辑
const fetchTasks = async (hooksParam: boolean) => {
  const taskdate = { taskid: '', taskdate: propFrom.value.taskdate }
  ongoing.value = await reqOngoing(taskdate)
  taskStore.setOngoing(ongoing.value)
  findAllHooks(hooksParam, 1)
}


const taskStore = useTaskStore()
watch(propFrom, (newValue) => {
  taskStore.updatePropFrom(newValue)
}, { deep: true, immediate: true })
// -------------------查询功能结束-------------------


// -------------------显示more-------------------
// more展示el-popover
const generateStatusDetail = (ongoingData: any) => {
  // 动态生成字符串逻辑
  let statusDetail = ongoingData;
  let statusDetailArr = [];
  let statusDetailSendArr = [];
  let results = '';
  var totalCount = 0;
  for (var i in statusDetail) {
    const value = parseInt(statusDetail[i]);
    if (!isNaN(value)) {  // 确保 value 是有效数字
      totalCount += value;
    }
  }
  for (let i in statusDetail) {
    let statusPercent = '';
    if (i.startsWith('s_')) {
      statusPercent = `
            <div style="margin-bottom: 5px;"><label style="color:red">${i}:</label><br>
              <span style="
                cursor: pointer;
                margin-left: 10px;
                font-size: 14px;
                font-weight: 600;
              ">${(parseInt(statusDetail[i]) * 100 / totalCount).toFixed(4)}%</span>
            </div>`;
      if (i.startsWith('s_success')) {
        statusPercent = `
              <div style="margin-bottom: 5px;"><label style="color:gray">${i}:</label><br>
                <span style="
                  cursor: pointer;
                  margin-left: 10px;
                  font-size: 14px;
                  font-weight: 600;
                ">${(parseInt(statusDetail[i]) * 100 / totalCount).toFixed(4)}%</span>
              </div>`;
      }
      statusDetailSendArr.push(statusPercent);
    } else {
      statusPercent = `
            <div style="margin-bottom: 5px;"><label style="color:gray">${i}:</label><br>
              <span style="
                cursor: pointer;
                margin-left: 10px;
                font-size: 14px;
                font-weight: 600;
              ">${(parseInt(statusDetail[i]) * 100 / totalCount).toFixed(4)}%</span>
            </div>`;
      statusDetailArr.push(statusPercent);
    }
  }

  // 拼接最终的 HTML 内容
  results = [...statusDetailSendArr, ...statusDetailArr].join('');
  return results;
}
//根据条件显示el-popover
const shouldShowPopover = (row: any) => {
  const ongoingData = row?.ongoingData?.[0];
  return ongoingData?.successCount != null ||
    ongoingData?.sendCount != null ||
    ongoingData?.message != null ||
    ongoingData?.dcsuccessCount > 0 ||
    ongoingData?.sendServerCount > 0 ||
    ongoingData?.statusDetail != null;
};
// -------------------显示more结束-------------------

// -------------------弹窗状态-------------------
const {
  showModal,
  modalTitle,
  btnType,
  currentRowData,
  handleModals,
  BatchEdits,
} = useModal(tableRef, findAllHooks)

// 批量编辑
const BatchEdit = () => {
  BatchEdits()
}

// 创建模板
const CreateTemplate = () => {
  taskStore.setSelectedIds([])
  modalTitle.value = 'TaskDetail []'
  currentRowData.value = null // 清空当前行数据
  showModal.value = true
  btnType.value = 'createTemplate'
}

// 添加任务
const addTask = () => {
  taskStore.setSelectedIds([])
  modalTitle.value = 'TaskDetail []'
  currentRowData.value = null // 清空当前行数据
  showModal.value = true
  btnType.value = 'addTask'
}

// 显示任务详情
const showTask = (row: any) => {
  taskStore.setSelectedIds([row.id])
  modalTitle.value = `TaskDetail [${row.id}]`
  currentRowData.value = row // 设置当前行数据
  showModal.value = true
  btnType.value = 'showTask'
}
watch(() => showModal.value, async (newValue) => {
  if (newValue === true && !autoBundleKey.value) { // 弹窗打开时，获取数据
    autoBundleKey.value = await reqGetBundleKey()
  }
})
// -------------------弹窗状态结束-------------------


// -------------------表格操作-------------------
// 删除当前行数据
const delTask = (row: any) => {
  ElMessageBox.confirm('确定删除该任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const params = new URLSearchParams();
    params.append('id', row.id);
    const res = await reqDelTask(params);

    if (res === 'OK') {
      ElMessage.success('删除成功');
      // 刷新表格数据
      findAllHooks(false)
    } else {
      ElMessage.error('删除失败');
    }
  })
}
// 启用当前行数据--单独启用
const enableTask = (row: any) => {
  ElMessageBox.confirm('确定启用该任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const params = new URLSearchParams();
    params.append('id', row.id);
    const res = await reqEnableTask(params);

    if (res === 'OK') {
      ElMessage.success('启用成功');
      // 刷新表格数据
      findAllHooks(false)
    } else {
      ElMessage.error('启用失败');
    }

  })
}
// 启用选中数据--批量启用
const BatchEnable = () => {
  const $table = tableRef.value
  if ($table) {
    const selectRecords = $table.getCheckboxRecords()
    if (selectRecords.length < 1) {
      ElMessage.warning('请选择要启用的数据')
      return
    }
    const params = selectRecords.map(row => row.id).join(',')
    ElMessageBox.confirm('确定启用吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {
      const res = await reqBatchEnableTask(params)
      if (res === 'OK') {
        ElMessage.success('启用成功')
        // 刷新表格数据
        findAllHooks(false)
      } else {
        ElMessage.error('启用失败')
      }
    })
  }

}
// 禁用当前行数据--单独禁用
const disableTask = (row: any) => {
  ElMessageBox.confirm('确定禁用该任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    const params = new URLSearchParams();
    params.append('id', row.id);
    const res = await reqDisAbleTask(params);

    if (res === 'OK') {
      ElMessage.success('禁用成功');
      // 刷新表格数据
      findAllHooks(false)
    } else {
      ElMessage.error('禁用失败');
    }
  })
}

// 禁用选中数据--批量禁用
const BatchDisable = () => {
  const $table = tableRef.value
  if ($table) {
    const selectRecords = $table.getCheckboxRecords()
    if (selectRecords.length < 1) {
      ElMessage.warning('请选择要禁用的数据')
      return
    }
    const params = selectRecords.map(row => row.id).join(',')
    ElMessageBox.confirm('确定禁用吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {
      const res = await reqBatchDisableTask(params)
      if (res === 'OK') {
        ElMessage.success('禁用成功')
        // 刷新表格数据
        findAllHooks(false)
      } else {
        ElMessage.error('禁用失败')
      }
    })
  }
}
// -------------------表格操作结束-------------------


// -------------------处理弹窗确认-------------------
const handleModalConfirm = async (formData: FormDataType): Promise<void> => {
  handleModals(formData)
};
// -------------------处理弹窗确认结束-------------------


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
        if (column.field === 'sendPlan') {
          return `"${row.sendPlan || ''}"`;
        } else if (column.field === 'succ/total/status/dcsuccss/sent') {
          // 动态拼接 succ/total/status/dcsuccss/sent 的值
          const ongoingData = row.ongoingData?.[0] || {};
          return `${ongoingData.successCount || ''}/ ` +
            `${ongoingData.sendCount || ''}/ ` +
            `${ongoingData.message || ''}/ ` +
            `${ongoingData.dcsuccessCount || ''}/ ` +
            `${ongoingData.sendServerCount || ''}`;
        } else if (column.field === 'cr/ecpc(0.285%)/roi(65%)') {
          // 动态拼接 cr/ecpc(0.285%)/roi(65%) 的值
          const taskCrData = row?.taskCrData;
          if (taskCrData) {
            const cr = ((taskCrData.ctr + taskCrData.ivr) * 100).toFixed(4);
            return `cr: ${cr}%`;
          }
          return ''; // 如果数据不存在返回空字符串
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
const customConfig = reactive<VxeTablePropTypes.CustomConfig>({
  checkMethod ({ column }) {
    return !['#', 'xh','Action'].includes(column.field)
  }
})
const toolbarRef = ref<VxeToolbarInstance>()
onMounted(async () => {
  const $table = tableRef.value
  const $toolbar = toolbarRef.value
  if ($table && $toolbar) {
    $table.connect($toolbar)
  }
  if (date.value.length > 0) {
    propFrom.value.taskdate = date.value[0];  // 设置默认选中第一个日期
  }
  // 页面初始化，获取一次cr数据
  await getTaskCr.loadTaskCrIfNeeded()

});
</script>

<style scoped lang="scss">
.pushtask {
  width: 100%;
  height: calc(100vh - $base-tabbar-height - 10px);
  .pushtask_header{
    height: 10%;
  }
  .pushtask_header,
  .pushtask_btn {
    width: 100%;
  }

  .pushtask_table {
    width: 100%;
    height: 75%;
    overflow: hidden;
    .toolbarRef-div{
      height: 10%;
    }
    .vxe-table-div {
      height: 90%;
      .action-icons{
        display: flex;
        align-items: center;
        justify-content: center;
        .action-icon-svg{
          margin: 0 5px;
        }
      }
    }
  }

  .pushtask_footer {
    width: 100%;
    height: 5%;
  }
}


.el-col {
  margin: 2px 0;
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
  padding-top: 5px;
  margin-top: 5px;
}

/* 左侧按钮 */
.form-item-left {
  display: flex;
  justify-content: flex-start;
}

/* 右侧按钮 */
.form-item-right {
  display: flex;
  justify-content: flex-end;
}

.icon-echarts {
  cursor: $base-cursor;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popoverClass {
  max-height: 500px;
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
  padding: 10px;
  overflow: scroll;
}
</style>