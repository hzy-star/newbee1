import { defineStore } from 'pinia'
import type { propFormInter } from '@/api/pushtask/type'

interface TaskState {
  propFrom: propFormInter
  ongoing: any[]
  autoBundleKey: any
  tableData: any[]
  selectedIds: string[]
  currentRowData: any
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    propFrom: {
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
    },
    ongoing: [],
    autoBundleKey: null,
    tableData: [],
    selectedIds: [],
    currentRowData: null
  }),
  
  actions: {
    updatePropFrom(data: Partial<propFormInter>) {
      debugger
      this.propFrom = { ...this.propFrom, ...data }
    },
    setOngoing(data: any[]) {
      this.ongoing = data
    },
    setAutoBundleKey(data: any) {
      this.autoBundleKey = data
    },
    setTableData(data: any[]) {
      this.tableData = data
    },
    setSelectedIds(ids: string[]) {
      this.selectedIds = ids
    },
    setCurrentRowData(data: any) {
      this.currentRowData = data
    }
  }
})