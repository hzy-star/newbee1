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

                <!-- Offers -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Offer</div>
                        <el-input v-model="FormData.offerId" />
                    </div>
                </el-col>

                <!-- Apps -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Apps</div>
                        <el-input v-model="FormData.appId" />
                    </div>
                </el-col>

                <!-- Pkg -->
                <el-col :span="8">
                    <div class="form-item">
                        <div class="form-item-label">Pkg</div>
                        <el-input v-model="FormData.pkgName" />
                    </div>
                </el-col>

                <!-- Task -->
                <el-col :span="8">
                    <div class="form-item">
                        <div class="form-item-label">Task</div>
                        <el-input v-model="FormData.taskId" />
                    </div>
                </el-col>

                <!-- GroupBy -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">GroupBy</div>
                        <el-select v-model="FormData.groupBy" placeholder="">
                            <el-option label="hour" value="hour" />
                            <el-option label="TaskId" value="taskid" />
                        </el-select>
                    </div>
                </el-col>
                <!-- etype -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">etype</div>
                        <el-select v-model="FormData.etype" placeholder="">
                            <el-option label="all" value="all" />
                            <el-option label="click" value="click" />
                            <el-option label="impression" value="imp" />
                        </el-select>
                    </div>
                </el-col>
                <!-- etype -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Country</div>
                        <el-input v-model="FormData.country" />
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

        <div class="pushtaskchart_radio">
            <el-radio v-model="radio" label="deviceCount">deviceCount</el-radio>
            <el-radio v-model="radio" label="sendCount">sendCount</el-radio>
        </div>

        <!-- 数据表格 -->
        <div class="pushtaskchart_table">
            <div id="taskCountChart" style="width: 100%; height: 400px;"></div>
        </div>

        <div class="pushtaskchart_footer">
            <div id="taskSuccessRateChart" style="width: 100%; height: 400px;"></div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { toDateStr } from '@/utils/time'
import { ElMessage } from 'element-plus'
import { formatData, paramsData } from '@/api/traffic/pushtaskchart/type'
import * as echarts from 'echarts'
import { reqCountTaskHour } from '@/api/traffic/pushtaskchart'

const dataTime = ref(toDateStr(new Date(), true))
const FormData = ref<formatData>({
    baseDate: dataTime.value,
    dayStep: '-1',
    offerId: '',
    appId: '',
    pkgName: '',
    taskId: '',
    groupBy: 'hour',
    etype: 'click',
    country: ''
})
const radio = ref('deviceCount')
// 显示图表
let resData = ref([])

// 监听radio的变化
watch(radio, (newValue) => {
    console.log("Radio changed to:", newValue);
    updateCharts();
});

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
            adx: FormData.value.adx,
            country: FormData.value.country,
            os: FormData.value.os
        }),
        startday: FormData.value.baseDate,
        step: parseInt(FormData.value.dayStep),
        days: calculateDays(FormData.value.baseDate, FormData.value.dayStep),
        offer: FormData.value.offerId,
        pkg: FormData.value.pkgName,
        taskid: FormData.value.taskId,
        groupby: FormData.value.groupBy,
        etype: FormData.value.etype == 'all' ? '' : FormData.value.etype,
        app: FormData.value.appId,
        country: FormData.value.country,
    };
    let res = await reqCountTaskHour(params)
    resData.value = res
    updateCharts();
}

// 更新图表的函数
const updateCharts = () => {
    // 获取当前选中的radio值
    const selectedRadio = radio.value;

    // 根据选中的radio值来决定使用的数据类型
    let taskCountKeys;
    if (selectedRadio === 'deviceCount') {
        taskCountKeys = ["taskhourok", "taskhour"];
    } else if (selectedRadio === 'sendCount') {
        taskCountKeys = ["taskhourok", "taskhourserver"];
    }
    // 渲染任务流量图表
    renderChart(resData.value, document.getElementById("taskCountChart"), taskCountKeys);

    // 渲染成功率图表
    renderSuccessRateChart(resData.value, document.getElementById("taskSuccessRateChart"), taskCountKeys);
}

// 渲染任务流量图表的函数
const renderChart = (data: any, container: any, keyNames: any) => {
    const chartEle = container;
    // 销毁现有的图表实例
    if (echarts.getInstanceByDom(chartEle)) {
        echarts.dispose(chartEle);
    }
    const trafficChart = echarts.init(chartEle);
    trafficChart.clear();

    const hours = Array.from({ length: 24 }, (_, i) => (i < 10 ? '0' : '') + i);
    const seriesDataArr: any[] = [];

    data.forEach((dayData: any) => {
        keyNames.forEach((countName: any) => {
            const taskCountOfHour = dayData[countName] || {};
            const taskCountArr = hours.map((hour: any) => taskCountOfHour[hour] || 0);

            const isDeviceCountEvent = countName.indexOf("ok") === -1;
            const charCountName = isDeviceCountEvent ? '任务流量' : '成功流量';

            seriesDataArr.push({
                name: dayData.day + "_" + charCountName,
                type: isDeviceCountEvent ? 'line' : "bar",
                data: taskCountArr,
                smooth: true,
                yAxisIndex: isDeviceCountEvent ? 0 : 1,
            });
        });
    });

    const option = {
        tooltip: {
            trigger: 'axis',
            confine: true, // 确保 tooltip 在图表区域内
        },
        legend: {
            type: 'scroll',
            orient: 'horizontal',
            top: 'top',
            width: '80%',
            data: seriesDataArr.map(series => series.name)
        },
        grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
        toolbox: { feature: { saveAsImage: {} } },
        xAxis: { type: 'category', boundaryGap: false, data: hours },
        yAxis: [
            { type: 'value', name: "请求量" },
            { type: 'value', name: "成功量" }
        ],
        series: seriesDataArr
    };

    trafficChart.setOption(option);
}

// 渲染成功率图表的函数
const renderSuccessRateChart = (data: any, container: any, keyNames: any) => {
    const chartEle = container;
    // 销毁现有的图表实例
    if (echarts.getInstanceByDom(chartEle)) {
        echarts.dispose(chartEle);
    }
    const trafficChart = echarts.init(chartEle);
    trafficChart.clear();

    const hours = Array.from({ length: 24 }, (_, i) => (i < 10 ? '0' : '') + i);
    const seriesDataArr: any[] = [];
    const successLegend: any[] = [];

    data.forEach((dayData: any) => {
        const daySuccessRate: any[] = [];
        const dayReq = hours.map((hour: any) => dayData[keyNames[1]] ? dayData[keyNames[1]][hour] : 0);
        const daySuccess = hours.map((hour: any) => dayData[keyNames[0]] ? dayData[keyNames[0]][hour] : 0);

        hours.forEach((hour, index) => {
            const hourSuccess = daySuccess[index];
            const hourReq = dayReq[index];
            daySuccessRate.push(hourSuccess === 0 ? 0 : (hourSuccess / (hourReq === 0 ? 100 : hourReq)));
        });

        successLegend.push(dayData.day + "_clickRate");
        seriesDataArr.push({
            name: dayData.day + "_clickRate",
            type: "line",
            data: daySuccessRate,
            smooth: true
        });
    });

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
            data: successLegend
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        toolbox: { feature: { saveAsImage: {} } },
        xAxis: { type: 'category', boundaryGap: false, data: hours },
        yAxis: [
            { type: 'value', name: "点击率" }
        ],
        series: seriesDataArr
    };

    trafficChart.setOption(option);
}

onMounted(() => {
    ShowChart();

    // 添加窗口resize事件监听器
    window.addEventListener('resize', handleResize);
});

// 处理窗口resize事件 自适应窗口大小
const handleResize = () => {
    // 获取图表实例并调用resize方法
    const taskCountChartElement = document.getElementById("taskCountChart");
    const taskSuccessRateChartElement = document.getElementById("taskSuccessRateChart");

    if (taskCountChartElement) {
        const taskCountChart = echarts.getInstanceByDom(taskCountChartElement);
        if (taskCountChart) {
            taskCountChart.resize();
        }
    }

    if (taskSuccessRateChartElement) {
        const taskSuccessRateChart = echarts.getInstanceByDom(taskSuccessRateChartElement);
        if (taskSuccessRateChart) {
            taskSuccessRateChart.resize();
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

    .pushtaskchart_header,
    .pushtaskchart_radio {
        flex: 0 0 auto; // 固定高度
        min-height: 50px; // 设置最小高度
    }

    .pushtaskchart_table,
    .pushtaskchart_footer {
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

.icon-echarts {
    cursor: $base-cursor;
    display: flex;
    justify-content: center;
    align-items: center;
}

.popoverClass {
    max-height: 500px;
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;
    padding: 10px;
    overflow: scroll;
}
</style>