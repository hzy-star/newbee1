<template>
    <div class="pushtaskchartchart">
        <div class="pushtaskchart_header">
            <!-- 查询条件 -->
            <el-row :gutter="20" type="flex" justify="start">
                <!-- Data -->
                <el-col :span="8">
                    <div class="form-item">
                        <div class="form-item-label">Data</div>
                        <el-date-picker style="width: 500px;" v-model="FormData.baseDate" type="date"
                            placeholder="选择日期">
                        </el-date-picker>
                        <div class="form-item-label">Plus</div>
                        <el-input v-model="FormData.dayStep" />

                    </div>
                </el-col>

                <!-- Adx -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Adx</div>
                        <el-input v-model="FormData.adx" />
                    </div>
                </el-col>
                <!-- etype -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Country</div>
                        <el-input v-model="FormData.country" />
                    </div>
                </el-col>
                <!-- Os -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Os</div>
                        <el-input v-model="FormData.os" />
                    </div>
                </el-col>
                <!-- button -->
                <el-col :span="4">
                    <div class="form-item">
                        <el-button type="primary" @click="ShowChart">ShowChart</el-button>
                    </div>
                </el-col>
            </el-row>
        </div>

        <!-- 数据表格 -->
        <div class="pushtaskchart_table">
            <div id="taskCountChart" style="width: 100%; height: calc(100vh - 170px);"></div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { toDateStr } from '@/utils/time'
import { formatData, paramsData } from '@/api/traffic/deviceChart/type'
import * as echarts from 'echarts'
import { reqCountDevHour } from '@/api/traffic/deviceChart'

const dataTime = ref(toDateStr(new Date(), true))
const FormData = ref<formatData>({
    baseDate: dataTime.value,
    dayStep: '-1',
    adx: '',
    os: '',
    country: ''
})
// 显示图表
let resData = ref([])


// 监听 baseDate 的变化并格式化
watch(() => FormData.value.baseDate, (newDate: any) => {
    if (newDate instanceof Date) {
        FormData.value.baseDate = newDate.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'); // 格式化为 YYYY-MM-DD
    }
});

// 计算日期范围
const calculateDays = (baseDate: any, dayStep: any) => {
    const startDate = new Date(baseDate);
    const step = parseInt(dayStep, 10);
    const daysArray = [];

    for (let i = 0; i <= Math.abs(step); i++) {
        const newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() + (step > 0 ? i : -i));
        daysArray.push(newDate.toISOString().split('T')[0]);
    }

    return daysArray.join(',');
};

// 定义ShowChart函数
const ShowChart = async () => {
    let params: paramsData = {
        countryos: JSON.stringify({
            adx: FormData.value.adx?.trim(),
            country: FormData.value.country?.trim(),
            os: FormData.value.os?.trim()
        }),
        days: calculateDays(FormData.value.baseDate?.trim(), FormData.value.dayStep?.trim()),
    };
    let res = await reqCountDevHour(params)
    resData.value = res
    updateCharts();
}

// 更新图表的函数
const updateCharts = () => {
    
    // 渲染任务流量图表
    renderChart(resData.value, document.getElementById("taskCountChart"));
}

// 渲染任务流量图表的函数
const renderChart = (data: any, container: any) => {
    const chartEle = container;

    // 销毁现有的图表实例，避免重复渲染
    if (echarts.getInstanceByDom(chartEle)) {
        echarts.dispose(chartEle);
    }
    const trafficChart = echarts.init(chartEle);
    trafficChart.clear();

    // 生成 X 轴的小时数组
    const hours = Array.from({ length: 24 }, (_, i) => i); // X轴从0开始

    // 解析 data 数据
    const seriesData: any[] = [];
    const legendData: string[] = [];

    Object.entries(data).forEach(([date, values]: [string, any]) => {
        const seriesItem = {
            name: date, // 日期作为系列名称
            type: 'line',
            smooth: true, // 平滑曲线
            data: hours.map(hour => values[String(hour).padStart(2, '0')] ?? 0) // 格式化 hour 为字符串，避免 undefined
        };
        seriesData.push(seriesItem);
        legendData.push(date);
    });

    // 配置 ECharts 选项
    const option = {
        tooltip: {
            trigger: 'axis',
            confine: true // 确保 tooltip 在图表区域内
        },
        legend: {
            type: 'scroll',
            orient: 'horizontal',
            top: 'top',
            width: '80%',
            data: legendData
        },
        grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
        toolbox: { feature: { saveAsImage: {} } },
        xAxis: { 
            type: 'category', 
            boundaryGap: false, 
            data: hours,  // X 轴显示的是数字 0-23
        },
        yAxis: { type: 'value', name: "请求量" },
        series: seriesData
    };

    // 设置图表数据
    trafficChart.setOption(option);
};



onMounted(() => {
    ShowChart();

    // 添加窗口resize事件监听器
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    // 移除窗口resize事件监听器
    window.removeEventListener('resize', handleResize)
})
// 处理窗口resize事件 自适应窗口大小
const handleResize = () => {
    // 获取图表实例并调用resize方法
    const taskCountChartElement = document.getElementById("taskCountChart");
    console.log(taskCountChartElement);
    
    if (taskCountChartElement) {
        const taskCountChart = echarts.getInstanceByDom(taskCountChartElement);
        if (taskCountChart) {
            taskCountChart.resize();
        }
    }
};
</script>

<style scoped lang="scss">
.pushtaskchartchart {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(100vh - 120px);
    padding: 5px;

    .pushtaskchart_header {
        flex: 0 0 auto; // 固定高度
        min-height: 50px; // 设置最小高度
    }

    .pushtaskchart_table{
        flex: 1 1 50%; // 平均分配剩余空间
        min-height: 400px; // 设置最小高度
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


</style>