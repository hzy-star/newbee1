import { defineStore } from "pinia";
import type { autoTaskFormInter } from "@/api/pushtask/type";

interface TaskState {
  propFrom: autoTaskFormInter;
  tableData: any[];
  selectedIds: string[];
  currentRowData: any;
}

export const useTaskStore = defineStore("autoTask", {
  state: (): TaskState => ({
    propFrom: {
      etypes: "all",
      offerIds: "",
      pkgNames: "",
      apps: "",
      countries: "",
      status: "enabled",
    },
    tableData: [],
    selectedIds: [],
    currentRowData: null,
  }),

  actions: {
    updatePropFrom(data: Partial<autoTaskFormInter>) {
      this.propFrom = { ...this.propFrom, ...data };
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
