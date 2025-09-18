import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { reqCounttaskhour, reqAutoCrHisGet, reqSortCr } from "@/api/pushtask/index"
import { toDateStr } from "@/utils/time"

interface ChartParams {
  startday?: string
  startDate?: string
  step?: number
  taskid?: string | number
  tid?: string | number
  groupby?: string
  offer_id?: string | number
  app_id?: string | number
  page?: number
  limit?: number
}

export default function useChart() {
  
  // 图表相关的状态
  const chartVisible = ref(false)
  const chartTitle = ref('')
  const chartType = ref('line')
  const chartData = ref<any>({})
  const showSwitch = ref(false)
  const defaultType = ref('deviceCount')

  // 查看任务统计图表
  const showChart = async (row: any) => {
    try {
      const params: ChartParams = {
        startday: toDateStr(new Date()),
        step: -2,
        taskid: row.id,
        groupby: "hour"
      }
      
      // 调用获取图表数据的接口
      const res = await reqCounttaskhour(params)

      // 更新图表状态
      chartTitle.value = 'TaskCountChart'
      chartType.value = 'line'
      chartData.value = res
      showSwitch.value = true
      defaultType.value = 'deviceCount'
      chartVisible.value = true
    } catch (error) {
      ElMessage.error('获取图表数据失败')
    }
  }

  // 显示自动CR图表
  const showAutoCr = async (row: any) => {
    try {
      const params: ChartParams = {
        startDate: toDateStr(new Date()),
        step: -2,
        tid: row.id,
        groupby: "hour"
      }
      
      const res = await reqAutoCrHisGet(params)
      
      // 更新图表状态
      chartTitle.value = 'TaskAutoCRchart'
      chartType.value = 'line'
      chartData.value = res
      showSwitch.value = false
      defaultType.value = 'deviceCount'
      chartVisible.value = true
    } catch (error) {
      ElMessage.error('获取自动CR数据失败')
    }
  }

  // 显示排序CR图表
  const showTaskSortChart = async (row: any) => {
    try {
      const params: ChartParams = {
        offer_id: row.offers,
        app_id: row.appId,
        page: 0,
        limit: 60
      }
      
      const res = await reqSortCr(params)
      
      // 更新图表状态
      chartTitle.value = 'TaskSortCRchart'
      chartType.value = 'line'
      chartData.value = res
      showSwitch.value = true
      defaultType.value = 'task_rate'
      chartVisible.value = true
    } catch (error) {
      ElMessage.error('获取排序CR数据失败')
    }
  }


  // 导出所有方法和状态
  return {
    // 状态
    chartVisible,
    chartTitle,
    chartType,
    chartData,
    showSwitch,
    defaultType,

    // 方法
    showChart,
    showAutoCr,
    showTaskSortChart,
  }
}

// 图表配置类型定义
export interface ChartConfig {
  title: string
  type: 'line' | 'bar' | 'pie'
  data: any
  showSwitch: boolean
  defaultType: string
}

// 图表事件类型定义
export interface ChartEvents {
  onTypeChange?: (type: string) => void
  onClose?: () => void
}