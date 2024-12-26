<template>
  <div class="pushtask">
    <div class="pushtask_header">
      <!-- 查询条件 -->
      <el-row :gutter="20" type="flex" justify="start">
        <!-- Etype -->
        <el-col :span="4">
          <div class="form-item">
            <div class="form-item-label">Etype</div>
            <el-select v-model="propFrom.etypes" placeholder="Please select" @change="handleEtypeChange">
              <el-option label="click" value="click"  />
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
            <el-input v-model="propFrom.filtercontent" />
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
        <el-col :span="7">
          <div class="form-item">
            <el-radio-group v-model="propFrom.status">
              <el-radio label="enable">Enabled</el-radio>
              <el-radio label="disabled">Disabled</el-radio>
              <el-radio label="template">Template</el-radio>
              <el-radio label="all">All</el-radio>
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
          <el-button 
            v-show="propFrom.status !== 'template'" 
            type="primary" 
            @click="BatchEdit"
          >BatchEdit</el-button>
          <el-button type="success" @click="">BatchEnable</el-button>
          <el-button type="danger" @click="">BatchDisable</el-button>
          <el-button type="primary" @click="CreateTemplate">CreateTemplate</el-button>
        </el-col>

        <!-- 右侧按钮 -->
        <el-col :span="12" class="form-item-right">
          <el-button type="primary" @click="addTask">Add Task</el-button>
          <el-button type="primary" @click="findAll(true)">Find All</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <div class="pushtask_table">
      <vxe-table border auto-resize height="auto" :loading="loading" :column-config="{ resizable: true }"
        :cell-config="{ verticalAlign: 'center' }" :row-config="{ isCurrent: true, isHover: true, }"
        :data="tableDataList" ref="tableRef">
        <vxe-column type="checkbox" title="" align="center" width="70">
          <template #header="{ checked, indeterminate }">
            <span class="custom-checkbox" @click.stop="toggleAllCheckboxEvent">
              <i v-if="indeterminate" class="vxe-icon-square-minus-fill"></i>
              <i v-else-if="checked" class="vxe-icon-square-checked-fill"></i>
              <i v-else class="vxe-icon-checkbox-unchecked"></i>
            </span>
            #
          </template>
          <template #checkbox="{ row, checked, indeterminate }">
            <span class="custom-checkbox" @click.stop="toggleCheckboxEvent(row)">
              <i v-if="indeterminate" class="vxe-icon-square-minus-fill"></i>
              <i v-else-if="checked" class="vxe-icon-square-checked-fill"></i>
              <i v-else class="vxe-icon-checkbox-unchecked"></i>
            </span>
            <div @click="checkCharts(row)" class="icon-echarts">
              <svg-icon name="echarts" width="15px" height="15px"></svg-icon>
            </div>
          </template>
        </vxe-column>
        <vxe-column field="etype" title="event" align="center" width="70"></vxe-column>
        <vxe-column field="offers" title="offer" align="center" width="70"></vxe-column>
        <vxe-column field="appId" title="appid" align="center" width="70"></vxe-column>
        <vxe-column field="weight" title="weight" align="center" width="70"></vxe-column>
        <vxe-column title="scope" align="center" width="80">
          <template #default="{ row }">
            {{ row.gt + "->" + row.lt }}
          </template>
        </vxe-column>
        <vxe-column field="country" title="country" align="center" width="90"></vxe-column>
        <vxe-column field="usealg" title="usealg" align="center" width="90"></vxe-column>
        <vxe-column field="urlparams" title="urlparam" align="center" width="170"></vxe-column>
        <vxe-column field="sendPlan" title="sendPlan" align="center" width="90"></vxe-column>
        <vxe-column field="pkgName" title="pkg" align="center" width="90">
          <template #default="{ row }">
            {{ row.pkgName != 'null' ? row.pkgName : '' }}
          </template>
        </vxe-column>
        <vxe-column field="succ/total/status/dcsuccss/sent" align="center" title="succ/total/status/dcsuccss/sent"
          width="260">
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
            <el-popover v-if="shouldShowPopover(row)" effect="light" trigger="hover" placement="top" width="auto">
              <template #default>
                <div v-html="generateStatusDetail(row?.ongoingData?.[0]?.statusDetail || '')"></div>
              </template>
              <template #reference>
                <el-tag>more</el-tag>
              </template>
            </el-popover>
          </template>

        </vxe-column>
        <vxe-column field="cr/ecpc(0.285%)/roi(65%)" title="cr/ecpc(0.285%)/roi(65%)" align="center" width="120">
          <template #default="{ row }">
            <!-- 检查 taskCr 是否存在且不为 null -->
            <div v-if="row?.taskCrData">
              cr: {{ ((row?.taskCrData?.ctr + row?.taskCrData?.ivr) * 100).toFixed(4) }}%
            </div>
          </template>
        </vxe-column>
        <vxe-column field="bsclick" title="bsclick" align="center" width="90"></vxe-column>
        <vxe-column field="mdate" title="mdate" align="center" width="100">
          <template #default="{ row }">
            {{ formatDateToSimple(row?.mdate) }}
          </template>
        </vxe-column>
        <vxe-column align="center" fixed="right" width="240">
          <template #header>
            <div style="display: flex; align-items: center; justify-content: center;">
              <span>Action</span>
              <el-button type="primary" size="small" @click="">scv</el-button>
            </div>
          </template>
          <template #default="scope">
            <el-button size="small" type="primary" @click="showTask(scope.row)">show</el-button>
            <el-button size="small" type="warning">del</el-button>
            <el-button size="small" type="success" v-if="scope.row.bsclick == 'true'">enable</el-button>
            <el-button size="small" type="danger" v-else>disable</el-button>
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
    <TaskModal v-model="showModal" :title="modalTitle" :selected-ids="selectedIds" :current-row-data="currentRowData"
      :auto-bundle-key="autoBundleKey" @confirm="handleModalConfirm" @confirmNew="handleModalConfirm" :btn-type="btnType" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue';
import type { propFormInter } from '@/api/pushtask/type'
import { ElMessage } from 'element-plus';
import { getRelativeDates,formatDateToSimple } from "@/utils/time";
import { reqlistUrl, reqOngoing, reqGetBundleKey,reqSaveTask,reqBatchSaveTasks } from "@/api/pushtask/index"
import listTaskCr from "@/store/common/listTaskCr"
import TaskModal from '@/components/task/TaskModal.vue'
import { VxeTableInstance } from 'vxe-table'
const getTaskCr = listTaskCr()
// 页面初始化获取getAutoTopBundleKeyNames接口的值
const autoBundleKey = ref<any>()
// 获取最近3天的日期
const date = ref(getRelativeDates(-3));
// 初始化获取所有任务
const ongoing: any = ref()
// 表单数据
// 添加处理 etype 变化的方法
const handleEtypeChange = (value: string) => {
  if (value === 'all') {
    propFrom.value.etypes = '';
  }
}
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
  filtercontent: '',
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
// 查看图表
const checkCharts = (row: any) => {
  console.log(row);

}
// 表格数据
const tableData = ref<any>([]);
const result = ref([])
// 查询功能
const findAll = async (type:boolean) => {
  loading.value = true
  try {
    const res = await reqlistUrl(propFrom.value)
    result.value = res
    // 判断ongoing.value中的taskId 是否在tableData.value中存在
    // 如果相同，则把ongoing.value中的数据添加到tableData.value中，存放在一个ongoingData中
    tableData.value = res.map((item: any) => {
      // 查找 ongoing 中所有匹配的记录
      const matchedOngoing = ongoing.value.filter(
        (ongoingItem: any) => ongoingItem.taskId === item.id
      );
      // 从 taskCr 中查找对应 taskId 的数据
      const taskCrData = getTaskCr.taskCr[item.id];
      // 返回新的结构，将 matchedOngoing 嵌套到 ongoingData
      return {
        ...item, // 保留原来的字段
        ongoingData: matchedOngoing.length > 0 ? matchedOngoing : null, // 如果有匹配项，则嵌套数组；否则为 null
        taskCrData: taskCrData || null,
      };
    });
    // 点击查询才会提示
    if(type){
      ElMessage.success('查询成功');
    }
    pageChange({ pageSize: pageVO.pageSize, currentPage: 1 });
  } catch (error) {
    ElMessage.error('查询失败');
  } finally {
    loading.value = false
  }
};

// 分页
const pageVO = reactive({
  total: 0,
  currentPage: 1,
  pageSize: 10
})

const loading = ref(false)
// 前端分页
const tableDataList = ref([])
const handlePageData = (num?: number) => {
  loading.value = true
  setTimeout(() => {
    const { pageSize, currentPage } = pageVO
    tableData.value = result.value.map((item: any) => {
      // 查找 ongoing 中所有匹配的记录
      const matchedOngoing = ongoing.value.filter(
        (ongoingItem: any) => ongoingItem.taskId === item.id
      );
      // 从 taskCr 中查找对应 taskId 的数据
      const taskCrData = getTaskCr.taskCr[item.id];
      // 返回新的结构，将 matchedOngoing 嵌套到 ongoingData
      return {
        ...item, // 保留原来的字段
        ongoingData: matchedOngoing.length > 0 ? matchedOngoing : null, // 如果有匹配项，则嵌套数组；否则为 null
        taskCrData: taskCrData || null,
      };
    });
    pageVO.total = tableData.value.length
    tableDataList.value = tableData.value.slice(((num ?? currentPage) - 1) * pageSize, (num ?? currentPage) * pageSize)
    loading.value = false
    console.log(tableDataList.value);

  }, 100)
}

const pageChange = ({ pageSize, currentPage }: { pageSize: number; currentPage: number }) => {
  pageVO.currentPage = currentPage
  pageVO.pageSize = pageSize
  handlePageData()
}
/****  分页结束 */

// more展示el-popover
const generateStatusDetail = (ongoingData: any) => {
  // 动态生成字符串逻辑
  let statusDetail = ongoingData;
  let statusDetailArr = [];
  let statusDetailSendArr = [];
  let result = '';
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
  result = [...statusDetailSendArr, ...statusDetailArr].join('');
  return result;
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


// 弹窗相关****
// 添加状态管理
const showModal = ref(false)
const modalTitle = ref('')
const btnType = ref('')
const selectedIds = ref<string[]>([])
const currentRowData = ref<any>(null)
interface RowVO {
  id: number
  name: string
  role: string
  sex: string
  age: number
  address: string
}
const tableRef = ref<VxeTableInstance<RowVO>>()
// 批量编辑
const formatSelectedIds = (ids: string[]) => {
  if (ids.length <= 1) {
    return ids.join(', ');
  }
  return `${ids.slice(0, 1).join(', ')}... (共${ids.length}个)`;
}

const BatchEdit = () => {
  const $table = tableRef.value
  if ($table) {
    const selectRecords = $table.getCheckboxRecords()
    if (selectRecords.length < 2) {
      ElMessage.warning('请选择至少2条要编辑的任务')
      return
    }
    selectedIds.value = selectRecords.map(row => row.id)
    modalTitle.value = `TaskDetail [${formatSelectedIds(selectedIds.value)}]`
    currentRowData.value = null // 清空当前行数据
    showModal.value = true
    btnType.value = 'batchEdit'
  }
}

// 创建模板
const CreateTemplate = () => {
  selectedIds.value = []
  modalTitle.value = 'TaskDetail []'
  currentRowData.value = null // 清空当前行数据
  showModal.value = true
  btnType.value = 'createTemplate'
}

// 添加任务
const addTask = () => {
  selectedIds.value = []
  modalTitle.value = 'TaskDetail []'
  currentRowData.value = null // 清空当前行数据
  showModal.value = true
  btnType.value = 'addTask'
}

// 显示任务详情
const showTask = (row: any) => {
  selectedIds.value = [row.id]
  modalTitle.value = `TaskDetail [${row.id}]`
  currentRowData.value = row // 设置当前行数据
  showModal.value = true
  btnType.value = 'showTask'
}

// 处理弹窗确认
const handleModalConfirm = async (formData: any) => {
  // ... existing code ...
  const { buttonType, ...resformData } = formData
  // 转换数据格式
  const taskInfo = {
    ...resformData,
    // 转换数组为字符串
    autoCrFilterName: (resformData.autoCrFilterName || []).join(','),
    autoTopBundle: (resformData.autoTopBundle || []).join(','),
    topLtBundle: (resformData.topLtBundle || []).join(','),
    
    // 创建 attr 对象
    attr: JSON.stringify({
      autoCrClickMin: resformData.autoCrClickMin || '',
      eraseifa:  (resformData.eraseifa || false).toString(),
      noipuadup: (resformData.noipuadup || false).toString()
    }),
    
    // 创建 audiences 对象
    audiences: JSON.stringify({
      ifaAudience: ["", resformData.ifaAudience || "1"],
      optionFilterText: ""
    }),
    
    // 创建 autoTrafficFilter
    autoTrafficFilter: [
      resformData.autoCr && 'auto_cr',
      resformData.sevenDaysClickFilter && 'day7click',
      resformData.invalidIfaFilter && 'invalid_ifa_filter'
    ].filter(Boolean).join(','),
    
    // 合并 autoTrafficFilter 和 autoCrFilterName
    autoFilterRuleNames: [
      [
        resformData.autoCr && 'auto_cr',
        resformData.sevenDaysClickFilter && 'day7click',
        resformData.invalidIfaFilter && 'invalid_ifa_filter'
      ].filter(Boolean),
      resformData.autoCrFilterName || []
    ].flat().join(','),
    
    // 创建 autoFilterRuleValues
    autoFilterRuleValues: JSON.stringify(
      (resformData.autoCrFilterName || []).reduce((acc: any, name: string, index: number) => {
        const values = (resformData.autoCrFilterVal || '').split(',')[index];
        acc[name] = values || '';
        return acc;
      }, {})
    ),
    
    // 合并 ifadupcheck 和 checkservice
    ifadupcheck: `${resformData.ifadupcheck || ''}:${resformData.checkservice || ''}`,
    
    // 添加 id
    id: selectedIds.value.join(',')  || '',
    
    // 添加 ifaAudience
    ifaAudience: resformData.ifaAudience || ',1'
  };
  // 创建 URLSearchParams
  const params = new URLSearchParams();
  let res = ref('')
  // 根据按钮类型执行不同的操作
  // 多选编辑保存
  if(btnType.value == 'batchEdit' && buttonType == 'save'){
    // 批量编辑
    debugger
    taskInfo.ids = selectedIds.value.join(',')
    taskInfo.isBatchEdit = 'yes'
    // isTemplate(resformData.taskStatus, taskInfo)
    Object.entries(taskInfo).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    return
    res.value = await reqBatchSaveTasks(params)
  }else if(btnType.value == 'batchEdit' && buttonType == 'new'){ //多选编辑---新增
    delete taskInfo.audienceList;
    delete taskInfo.invalidIfaFilter
    taskInfo.batchType = 'new'
    taskInfo.id = ''
    // isTemplate(resformData.taskStatus, taskInfo)
    Object.entries(taskInfo).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    res.value = await reqSaveTask(params)
  }else if(btnType.value == 'createTemplate' && buttonType == 'template'){  // 创建任务--save to task
    // 显示任务详情
    delete taskInfo.audienceList;
    delete taskInfo.invalidIfaFilter
    taskInfo.isTemplate = 'no'
    taskInfo.id = ''
    Object.entries(taskInfo).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    res.value = await reqSaveTask(params)
  }else if(btnType.value == 'createTemplate' && buttonType == 'save'){  // 编辑模板--save
    // 显示任务详情
    delete taskInfo.audienceList;
    delete taskInfo.invalidIfaFilter
    addTemplate(taskInfo)
    Object.entries(taskInfo).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    res.value = await reqSaveTask(params)
  }else if(btnType.value == 'createTemplate' && buttonType == 'new'){  // 新增模板--new
    // 显示任务详情
    delete taskInfo.audienceList;
    delete taskInfo.invalidIfaFilter
    addTemplate(taskInfo)
    Object.entries(taskInfo).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    res.value = await reqSaveTask(params)
  }else if(btnType.value == 'addTask' && buttonType == 'new'){      // 添加任务--只有新增
    // 添加任务
    // 显示任务详情
    delete taskInfo.audienceList;
    delete taskInfo.invalidIfaFilter
    taskInfo.batchType = 'new'
    taskInfo.id = ''
    Object.entries(taskInfo).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    res.value = await reqSaveTask(params)
  }else if(btnType.value == 'showTask' && buttonType == 'save'){ // 单选编辑
    // 显示任务详情
    delete taskInfo.audienceList;
    delete taskInfo.invalidIfaFilter
    isTemplate(resformData.taskStatus, taskInfo)
    Object.entries(taskInfo).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    res.value = await reqSaveTask(params)
  }else if(btnType.value == 'showTask' && buttonType == 'new'){ // 单选编辑--新增
    delete taskInfo.audienceList;
    delete taskInfo.invalidIfaFilter
    taskInfo.batchType = 'new'
    taskInfo.id = ''
    isTemplate(resformData.taskStatus, taskInfo)
    Object.entries(taskInfo).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    res.value = await reqSaveTask(params)
  }
  if(res.value == 'success'){
    ElMessage.success('保存成功')
    findAll(false)
    showModal.value = false; // 关闭弹窗
  }else{
    ElMessage.error('保存失败')
  }
}
const isTemplate = (_t: any,taskInfo: any) => {
  if(_t == 'template'){
    taskInfo.isTemplate = 'yes'
    taskInfo.offers = taskInfo.offers==null?"all":taskInfo.offers;
    taskInfo.country = taskInfo.country==null?"all":taskInfo.country;
  }
}
const addTemplate = (taskInfo: any) => {
    taskInfo.isTemplate = 'yes'
    taskInfo.offers = taskInfo.offers==null?"all":taskInfo.offers;
    taskInfo.country = taskInfo.country==null?"all":taskInfo.country;
  
}

// 弹窗结束*****

onMounted(async () => {
  if (date.value.length > 0) {
    propFrom.value.taskdate = date.value[0];  // 设置默认选中第一个日期
  }
  let taskdate = {
    taskid: '',
    taskdate: propFrom.value.taskdate
  }
  // 获取所有任务
  ongoing.value = await reqOngoing(taskdate)
  // 页面初始化，获取一次cr数据
  await getTaskCr.loadTaskCrIfNeeded()
  autoBundleKey.value = await reqGetBundleKey()

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
  cursor: $base-cursor
}
</style>