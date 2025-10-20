<template>
    <div class="container">
        <!-- 顶部查询条件 -->
        <el-form :model="formData" class="filter-container">
            <!-- 第一行条件 -->
            <el-row :gutter="20" class="filter-row">
                <el-col :span="4">
                    <el-form-item label="日期">
                        <el-date-picker v-model="formData.day" type="date" value-format="YYYY-MM-DD"
                            @change="handleDateChange" />
                    </el-form-item>
                </el-col>
                <el-col v-for="(item, index) in filterItems" :key="index" :span="3">
                    <el-form-item :label="item">
                        <el-input v-model="formData.filters[item]" />
                    </el-form-item>
                </el-col>
            </el-row>

            <!-- 第二行条件 -->
            <el-row :gutter="20" class="filter-row">
                <el-col :span="18">
                    <el-radio-group :model-value="formData.groupBys[0]" @update:model-value="handleRadioChange"
                        :disabled="formData.byHour">
                        <el-radio-button v-for="item in radioItems" :key="item" :value="item"
                            :disabled="formData.byHour">{{
                            item }}</el-radio-button>
                    </el-radio-group>
                </el-col>
                <el-col :span="5">
                    <el-form-item label=" ">
                        <el-checkbox v-model="formData.byHour" class="mr-4">byHour</el-checkbox>
                        <el-button type="primary" @click="handleQuery" style="margin-left: 16px">QUERY</el-button>
                        <el-button type="primary" @click="exportToCSV">Export</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <!-- 底部展示区域 -->
        <div class="main-content">
            <div class="tab-header">
                <el-tabs v-model="activeTab">
                    <el-tab-pane label="table" name="table" :disabled="!formData.byHour" />
                    <el-tab-pane label="chart" name="chart" :disabled="!formData.byHour" />
                </el-tabs>
            </div>

            <!-- 表格展示 -->
            <el-table v-show="activeTab === 'table'" :data="tableData" border>
                <el-table-column v-for="col in tableColumns" :key="col" :prop="col" :label="col"
                    :sort-method="col === 'uv' || col === 'pv' ? sortNumber : null" sortable>
                    <!-- 自定义表头，添加 tooltip -->
                    <template #header="{ column }">
                        <el-tooltip v-if="col === 'uv' || col === 'pv'" effect="dark"
                            :content="col === 'uv' ? '设备独立数' : '设备数'" placement="top">
                            <span>{{ column.label }}</span>
                        </el-tooltip>
                        <span v-else>{{ column.label }}</span>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 图表展示 -->
            <div v-show="activeTab === 'chart'" ref="chartRef" style="height: 400px" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { reqStatistic } from '@/api/traffic/trafficStatistics'


// 添加默认日期常量
const defaultDate = new Date(Date.now() - 86400000);

// 定义过滤项联合类型
type FilterKey = 'adx' | 'country' | 'os' | 'bundle' | 'make'|'city';

// 使用映射类型定义Filters
type Filters = {
    [K in FilterKey]: string;
}

// 优化后的表单数据初始化
const formData = ref<{
    day: string,
    filters: Filters,
    groupBys: FilterKey[],
    byHour: boolean
}>({
    day: defaultDate.toISOString().slice(0, 10),  // 格式化为 "YYYY-MM-DD"
    filters: {
        adx: '',
        country: '',
        os: '',
        bundle: '',
        make: '',
        city: ''
    } as Filters,
    groupBys: ['adx'],
    byHour: false
})
// 添加单选处理函数
const handleRadioChange = (value: FilterKey) => {
    formData.value.groupBys = [value] // 总是只保留最新选中的值
}

// 可选项配置
const filterItems: FilterKey[] = ['adx', 'country', 'os', 'bundle', 'make','city']
const radioItems: FilterKey[] = ['adx', 'country', 'os', 'bundle', 'make','city']

// 表格相关
const activeTab = ref('table')
const tableData = ref<Array<Record<string, any>>>([])
const tableColumns = computed(() => {
    if (!tableData.value.length) return []
    const fields = Object.keys(tableData.value[0])
    const priorityFields = ['uv', 'pv', 'uvRatio'];
    return [
        ...priorityFields,
        ...fields.filter(f => !priorityFields.includes(f))
    ]
})

// 图表相关
const chartRef = ref(null)
let chartInstance: echarts.ECharts | null = null

// 日期处理
const handleDateChange = (val: string) => {
    formData.value.day = val || new Date(Date.now() - 86400000).toISOString().slice(0, 10)
}

// 查询处理
const handleQuery = async () => {
    console.log('查询参数:', formData.value);
    try {
        let res = await reqStatistic(formData.value)
        const data = res.data
        tableData.value = data.map((item:any) => ({
          ...item,
          uv: Number(item.uv),
          pv: Number(item.pv)
        }))

        if (formData.value.byHour && activeTab.value === 'chart') {
            initChart()
        }
    } catch (error) {
        ElMessage.error('查询失败')
    }
}
// 导出
const exportToCSV = () => {
    if (tableData.value.length === 0) {
        ElMessage.warning('没有数据可导出')
        return
    }

    const headers = tableColumns.value
    const csvRows = [
        headers.join(','), // 添加表头
        ...tableData.value.map(row =>
            headers.map(header => `"${row[header] ?? ''}"`).join(',')
        )
    ]
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `export_${formData.value.day}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
// 图表初始化
const initChart = () => {
    if (!chartRef.value) return

    chartInstance?.dispose()
    chartInstance = echarts.init(chartRef.value)

    // 按小时排序数据
    const sortedData = [...tableData.value].sort((a, b) => a.hour.localeCompare(b.hour))
    const option = {
        // title: { text: '分小时数据趋势', left: 'center' },
        tooltip: {
            trigger: 'axis',
            formatter: (params: any) => {
                return `时间: ${params[0].name}<br/>
                UV: ${params[0].value.toLocaleString()}<br/>
                PV: ${params[1].value.toLocaleString()}`
            }
        },
        legend: { data: ['UV', 'PV'] },
        xAxis: {
            type: 'category',
            data: sortedData.map(item => item.hour)
        },
        yAxis: [
            { type: 'value', name: '' },
        ],
        series: [
            {
                name: 'UV',
                type: 'bar',
                data: sortedData.map(item => item.uv)
            },
            {
                name: 'PV',
                type: 'bar',
                data: sortedData.map(item => item.pv)
            }
        ]
    }
    chartInstance.setOption(option)
}

// 监听byHour变化
watch(() => formData.value.byHour, (newVal) => {
    if (!newVal) {
        activeTab.value = 'table'
        formData.value.groupBys = ['adx']
    } else {
        // activeTab.value = 'chart'
        formData.value.groupBys = []
    }
    handleQuery()
})

// 销毁图表实例
onMounted(() => {
    window.addEventListener('resize', () => chartInstance && chartInstance.resize())
})

// 自动初始化图表
watch(activeTab, (newVal) => {
    if (newVal === 'chart' && formData.value.byHour) {
        nextTick(() => initChart())
    }
})

const sortNumber = (a: any, b: any, column: any) => {
  const prop = column?.property;
  if (!prop) return 0;
  const numA = Number(a[prop]) || 0;
  const numB = Number(b[prop]) || 0;
  return numA - numB;
};
</script>

<style scoped>
.container {
    padding: 20px;
}

.main-content {
    margin-top: 20px;
}

.tab-header {
    margin-bottom: 20px;
}
</style>