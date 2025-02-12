import { ref, reactive, onMounted, onUnmounted, shallowRef } from "vue";
import { ElMessage } from "element-plus";
import { reqlistUrl } from "@/api/pushtask/index";
import type { VxeTableInstance } from "vxe-table";
import { useTaskStore } from "@/store/pushtask/task";
import listTaskCr from "@/store/common/listTaskCr";
import { formatDateToSimple } from "@/utils/time";
import XEUtils from "xe-utils";

export default function useTable() {
  interface RowVO {
    id: number;
    name: string;
    role: string;
    sex: string;
    age: number;
    address: string;
  }
  const taskStore = useTaskStore();
  const getTaskCr = listTaskCr();
  const tableRef = ref<VxeTableInstance<RowVO>>();
  // 定义loading状态
  const loading = ref(false);
  // 定义表格数据
  const tableDataList = ref<any[]>([]);
  // 定义查询结果
  const result = ref<any[]>([]);
  // 表格数据
  // const processedData = ref<any>([]);
  // 模糊查询
  const filtercontent = ref("");
  // 初始化获取所有任务
  const ongoing: any = ref();

  const pageVO = reactive({
    total: 0,
    currentPage: 1,
    pageSize: 10,
  });
  const searchEvent = ref();
  // 在useTable.ts中添加
  let processedData = ref<any[]>([]);
  let taskCrData: any = ref();
  const findAllHooks = async (type: boolean, num?: number) => {
    loading.value = true;
    try {
      taskStore.propFrom.etypes == "all"
        ? (taskStore.propFrom.etypes = "")
        : taskStore.propFrom.etypes;
        debugger
        if (taskStore.propFrom) {
            if (typeof taskStore.propFrom.offerIds === 'string') {
              taskStore.propFrom.offerIds = taskStore.propFrom.offerIds.trim();
            }
            if (typeof taskStore.propFrom.pkgNames === 'string') {
              taskStore.propFrom.pkgNames = taskStore.propFrom.pkgNames.trim();
            }
            if (typeof taskStore.propFrom.appIds === 'string') {
              taskStore.propFrom.appIds = taskStore.propFrom.appIds.trim();
            }
            if (typeof taskStore.propFrom.countries === 'string') {
              taskStore.propFrom.countries = taskStore.propFrom.countries.trim();
            }
            if (typeof taskStore.propFrom.taskIds === 'string') {
              taskStore.propFrom.taskIds = taskStore.propFrom.taskIds.trim();
            }
          }
      const res = await reqlistUrl(taskStore.propFrom);
      result.value = res;
  
      // 直接赋值 processedData，减少后续计算
      processedData.value = result.value.map((item: any) => {
        const matchedOngoing = taskStore.ongoing.filter(
          (ongoingItem: any) => ongoingItem.taskId === item.id
        );
        taskCrData = getTaskCr.taskCr[item.id]
        return {
          ...item,
          ongoingData: matchedOngoing.length > 0 ? matchedOngoing : null,
          taskCrData: taskCrData || null,
        };
      });
  
      if (type) {
        ElMessage.success("查询成功");
      }
      handlePageData(num);
    } catch (error) {
      ElMessage.error("查询失败");
    } finally {
      loading.value = false;
    }
  };
  

  const handlePageData = (num?: number) => {
    // loading.value = true
    const { pageSize } = pageVO;
    const filterVal = String(filtercontent.value).trim().toLowerCase();
    // 判断模糊查询是否有值，有值则使用过滤后的数据processedData，无值则使用原始数据result
    pageVO.total = filterVal != ""
    ? processedData.value.length
    : result.value.length;
    if (num) {
      pageVO.currentPage = num;
    }
    tableDataList.value = processedData.value.slice(
      (pageVO.currentPage - 1) * pageSize,
      pageVO.currentPage * pageSize
    );
  };
  // 模糊查询
  const handleSearch = (num?: number) => {
    const filterVal = String(filtercontent.value).trim().toLowerCase();

    const { pageSize } = pageVO;
    // 首先过滤数据
    let filteredData = processedData.value;
    if (filterVal) {
      // 直接在原始数据上进行过滤
      filteredData = processedData.value.filter((item: any) => {
        // 构造用于搜索的字符串
        const searchText = [
          item.etype,
          item.offers,
          item.appId,
          item.weight,
          item.pkg_name,
          `${item.gt + "->" + item.lt}`,
          item.country,
          item.usealg,
          item.urlparams,
          `${item.pkgName != "null" ? item.pkgName : ""}`,
          // cr相关信息
          `${
            item?.ongoingData?.[0]?.successCount != null
              ? `${item?.ongoingData?.[0]?.successCount}/`
              : ""
          }`,
          `${
            item?.ongoingData?.[0]?.sendCount != null
              ? `${item?.ongoingData?.[0]?.sendCount}/`
              : ""
          }`,
          `${item?.ongoingData?.[0]?.message}`,
          `${
            item?.ongoingData?.[0]?.dcsuccessCount > 0
              ? item?.ongoingData?.[0]?.dcsuccessCount
              : ""
          }`,
          `${
            item?.ongoingData?.[0]?.sendServerCount > 0
              ? item?.ongoingData?.[0]?.sendServerCount
              : ""
          }`,
          `cr:${((item?.taskCrData?.ctr + item?.taskCrData?.ivr) * 100).toFixed(
            4
          )}%`,
          item.bsclick,
          formatDateToSimple(item?.mdate),
        ]
          .join(" ")
          .toLowerCase();

        return searchText.includes(filterVal);
      });
      // 更新总数据量
      pageVO.total = filteredData.length;
      if (num) {
        pageVO.currentPage = num;
      }
      tableDataList.value = filteredData.slice(
        (pageVO.currentPage - 1) * pageSize,
        pageVO.currentPage * pageSize
      );
      processedData.value = filteredData;
    } else {
      processedData.value = result.value.map((item: any) => {
        const matchedOngoing = taskStore.ongoing.filter(
          (ongoingItem: any) => ongoingItem.taskId === item.id
        );
        return {
          ...item,
          ongoingData: matchedOngoing.length > 0 ? matchedOngoing : null,
          taskCrData: taskCrData || null,
        };
      });
      // 更新总数据量
      pageVO.total = processedData.value.length;
      if (num) {
        pageVO.currentPage = num;
      }
      tableDataList.value = processedData.value.slice(
        (pageVO.currentPage - 1) * pageSize,
        pageVO.currentPage * pageSize
      );
    }
  };

  onMounted(() => {
    searchEvent.value = XEUtils.throttle(
      function (num?: number) {
        handleSearch(num);
      },
      200,
      { trailing: true, leading: true }
    );
  });
  onUnmounted(() => {
    // 清除节流函数
    if (searchEvent.value && searchEvent.value.cancel) {
      searchEvent.value.cancel();
    }
  });
  // 分页
  const pageChanges = ({
    pageSize,
    currentPage,
  }: {
    pageSize: number;
    currentPage: number;
  }) => {
    debugger;
    pageVO.currentPage = currentPage;
    pageVO.pageSize = pageSize;
    handlePageData();
  };

  return {
    tableRef,
    loading,
    tableDataList,
    pageVO,
    processedData,
    ongoing,
    filtercontent,
    searchEvent,
    findAllHooks,
    pageChanges,
  };
}
