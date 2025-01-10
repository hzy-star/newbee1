<template>
  <el-dialog v-model="dialogVisible" :title="title" width="60%" :before-close="handleClose">
    <div v-if="showSwitch" class="switch-group">
    <el-radio-group v-model="currentType" @change="handleTypeChange">
      <el-radio v-for="option in radioOptions" :key="option.value" :label="option.value">
        {{ option.label }}
      </el-radio>
    </el-radio-group>
  </div>

    <div ref="chartRef" :style="{ width: '100%', height: '600px' }"></div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption, LineSeriesOption } from 'echarts'
const radioOptions = ref<{ label: string; value: string }[]>([])
interface DayData {
  day: string;
  taskhour?: Record<string, number>;
  taskhourok?: Record<string, number>;
  taskhourserver?: Record<string, number>;
}

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '图表'
  },
  // 图表类型: line-折线图, bar-柱状图, pie-饼图
  chartType: {
    type: String,
    default: 'line'
  },
  // 图表数据
  chartData: {
    type: Object,
    required: true
  },
  // 是否显示切换按钮
  showSwitch: {
    type: Boolean,
    default: true
  },
  // 默认选中的类型
  defaultType: {
    type: String,
    default: 'deviceCount' // 或 'sendCount'
  }
})

const emit = defineEmits(['update:visible', 'typeChange'])

const dialogVisible = ref(false)
const chartRef = ref<HTMLElement>()
let myChart: echarts.ECharts | null = null

// 添加新的响应式变量
const currentType = ref(props.defaultType)

// 监听 visible 变化，初始化图表
watch(() => props.visible, (newVal) => {
  if (newVal) {
    dialogVisible.value = newVal
    currentType.value = props.defaultType
  }
})

watch(() => dialogVisible.value, (val) => {
  emit('update:visible', val)
  if (val) {
    nextTick(() => {
      initChart()
    })
  }
})

watch(
  () => props.title,
  (newTitle) => {
    if (newTitle === 'TaskCountChart') {
      radioOptions.value = [
        { label: 'deviceCount', value: 'deviceCount' },
        { label: 'sendCount', value: 'sendCount' }
      ]
    } else {
      radioOptions.value = [
        { label: 'task_rate', value: 'task_rate' },
        { label: 'task_count', value: 'task_count' },
        { label: 'min_full_time', value: 'min_full_time' }
      ]
    }
  },
  { immediate: true }
)

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
}

// 数据处理函数
// 
const processChartData = (rawData: Record<string, DayData>) => {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const series = []
  const xAxisData = hours

  // 遍历每天的数据
  for (const dayData of Object.values(rawData)) {
    const day = dayData.day

    // 处理任务流量数据
    const taskData = hours.map(hour => {
      return (currentType.value == 'deviceCount' ? dayData.taskhour?.[hour] || 0 : dayData.taskhourserver?.[hour] || 0)
    })

    // 处理成功流量数据
    const successData = hours.map(hour => {
      return (dayData.taskhourok?.[hour] || 0)
    })

    // 添加任务流量系列(折线图)
    series.push({
      name: `${day}_任务流量`,
      type: 'line' as const,
      data: taskData,
      smooth: true,
      yAxisIndex: 0
    })

    // 添加成功流量系列(柱状图)
    series.push({
      name: `${day}_成功流量`,
      type: 'bar' as const,
      data: successData,
      yAxisIndex: 1
    })
  }

  return {
    xAxis: xAxisData,
    series,
    yAxis: [
      {
        type: 'value' as const,
        name: '请求量'
      },
      {
        type: 'value' as const,
        name: '成功量'
      }
    ]
  }
}

const processAutoCRData = (rawData: Record<string, Record<string, string>>) => {
  // 生成24小时的数组
  const hours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0') + '00'
  )
  const series = []
  
  // 处理每天的数据
  for (const [date, dayData] of Object.entries(rawData)) {
    // 将日期格式化为 YYYY-MM-DD
    const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`
    
    // 填充24小时的数据，没有的时间点填0
    const lineData = hours.map(hour => {
      return parseFloat(dayData[hour] || '0')
    })

    // 添加每天的数据系列
    series.push({
      name: `${formattedDate}_CR`,
      type: 'line' as const,
      data: lineData,
      smooth: true
    })
  }

  return {
    xAxis: hours,
    series
  }
}

const processSortCrData = (chartData: any) => {
  // 使用minutes作为X轴数据
  const xAxisData = chartData.minutes.map((time: string) => 
    time // 只取最后4位，显示时分
  )
  const series = []

  if (currentType.value === 'min_full_time') {
    // 处理min_full_time数据
    series.push({
      name: '',
      type: 'line',
      data: chartData.min_full_time,
      smooth: true
    })
  } else if (currentType.value === 'task_rate') {
    // 处理task_rate数据
    Object.entries(chartData.task_rate).forEach(([key, values]) => {
      series.push({
        name: key,
        type: 'line' as const,
        data: values,
        smooth: true
      })
    })
  } else if (currentType.value === 'task_count') {
    // 处理task_count数据
    Object.entries(chartData.task_count).forEach(([key, values]) => {
      series.push({
        name: key,
        type: 'line' as const,
        data: values,
        smooth: true
      })
    })
  }

  return {
    xAxis: xAxisData,
    series: series as LineSeriesOption[],
    yAxis: [
      {
        type: 'value' as const,  // 明确指定类型
        // name: currentType.value === 'min_full_time' ? '处理时间(秒)' : 
        //       currentType.value === 'task_rate' ? '任务比率' : '任务数量'
      }
    ]
  }
}


// 修改 generateChartOptions 方法
const generateChartOptions = (): EChartsOption => {
  const { chartData, title } = props
  let baseOptions: EChartsOption = {}
  
  if (title == 'TaskCountChart') {
    const processedData = processChartData(chartData)
    baseOptions = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: processedData.series?.map((item: { name: string }) => item.name) || []
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: processedData.xAxis
      },
      yAxis: processedData.yAxis,
      series: processedData.series
    }
  } else if (title == 'TaskAutoCRchart') {
    const processedData = processAutoCRData(chartData)
    baseOptions = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: processedData.series.map(item => item.name)
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: processedData.xAxis
      },
      yAxis: {
        type: 'value',
        name: 'CR',
        min: 0,
        max: 1,
        interval: 0.1,
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: processedData.series
    }
  }else {
    const processedData = processSortCrData(chartData)
    baseOptions = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: processedData.series?.map((item: LineSeriesOption) => String(item.name)) || []
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: processedData.xAxis
      },
      yAxis: processedData.yAxis,
      series: processedData.series
    }
  }
  return baseOptions
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) {
    console.error('chartRef 未绑定到 DOM 元素');
    return;
  }
  // 检查是否已有实例，若有则销毁
  if (myChart) {
    myChart.dispose();
  }
  try {
    myChart = echarts.init(chartRef.value)
  } catch (error) {
    console.error('ECharts 初始化失败:', error);
    return;
  }

  const options: EChartsOption = generateChartOptions()
  myChart.setOption(options)
}

// 监听窗口大小变化
const handleResize = () => {
  myChart?.resize()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

// 监听数据变化重新渲染
watch(() => props.chartData, (val) => {
  const options = generateChartOptions()
  myChart?.setOption(options, true)
}, { deep: true })

// 组件销毁时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  myChart?.dispose()
})

// 添加切换处理函数
const handleTypeChange = (type: string) => {
  currentType.value = type
  emit('typeChange', type)
  const options = generateChartOptions()
  myChart?.setOption(options, true)
}
</script>

<style scoped>
.switch-group {
  padding: 0 20px;
}
</style>