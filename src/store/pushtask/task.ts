import { defineStore } from 'pinia'
import type { propFormInter } from '@/api/pushtask/type'
interface Root {
  total: number
  pageListData: any
  totalPages: number
  countStatistics: any
}

interface TaskState {
  propFrom: propFormInter & { page: number; size: number; sort?: string }
  ongoing: any[]
  autoBundleKey: any
  tableData: Root
  selectedIds: string[]
  currentRowData: any
}

export const useTaskStore = defineStore("task", {
  state: (): TaskState => ({
    propFrom: {
      etypes: "click",
      offerIds: "",
      pkgNames: "",
      appIds: "",
      countries: "",
      taskIds: "",
      bsclick: "",
      status: "enable",
      taskdate: "",
      page: 1, // 新增
      size: 10, // 新增
    },
    ongoing: [],
    autoBundleKey: null,
    tableData: {
      total: 0,
      pageListData: [],
      totalPages: 0,
      countStatistics: [],
    },
    selectedIds: [],
    currentRowData: null,
  }),

  actions: {
    updatePropFrom(data: Partial<propFormInter>) {
      this.propFrom = { ...this.propFrom, ...data };
    },

    setOngoing(data: any[]) {
      this.ongoing = data;
    },
    setAutoBundleKey(data: any) {
      this.autoBundleKey = data;
    },
    setTableData(data: Root) {
      this.tableData = data;
    },
    setSelectedIds(ids: string[]) {
      this.selectedIds = ids;
    },
    setCurrentRowData(data: any) {
      this.currentRowData = data;
    },
  },
});
