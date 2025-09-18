import { defineStore } from "pinia";
import type { autoPkgFormInter } from "@/api/pushtask/type";

interface TaskState {
  propFrom: autoPkgFormInter;
  ongoing: any[];
  autoBundleKey: any;
  tableData: any[];
  selectedIds: string[];
  currentRowData: any;
}

export const useTaskStore = defineStore("autoPkgTask", {
  state: (): TaskState => ({
    propFrom: {
      etype: "click",
      offerid: "",
      pkgname: "",
      appid: "",
      country: "",
      jobid: "",
      bsclick: "",
      ce_pkg_status: "enable",
      status: "",
    },
    ongoing: [],
    autoBundleKey: null,
    tableData: [],
    selectedIds: [],
    currentRowData: null,
  }),

  actions: {
    updatePropFrom(data: Partial<autoPkgFormInter>) {
      this.propFrom = { ...this.propFrom, ...data };
    },
    setOngoing(data: any[]) {
      this.ongoing = data;
    },
    setAutoBundleKey(data: any) {
      this.autoBundleKey = data;
    },
    setTableData(data: any[]) {
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
