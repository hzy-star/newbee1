<template>
    <div class="pulltaskchart">
        <div class="pulltaskchart_header">
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
                        <div class="form-item-label">App</div>
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

                <!-- JobGroup -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">JobGroup</div>
                        <el-select v-model="FormData.JobGroup" placeholder="">
                            <el-option 
                                :label="item.id + '(' + item.name + ')' " 
                                :value="item.id" 
                                v-for="item in state.jobData" 
                                :key="item.id" 
                            />
                        </el-select>
                    </div>
                </el-col>
                <!-- Country -->
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

        <div class="pulltaskchart_radio">
            <el-radio v-model="radio" label="expectCount">expectCount</el-radio>
            <el-radio v-model="radio" label="sendCount">sendCount</el-radio>
        </div>

        <!-- 数据表格 -->
        <div class="pulltaskchart_table">
            <div id="taskCountChart" style="width: 100%; height: 400px;"></div>
        </div>

        <div class="pulltaskchart_footer">
            <div id="taskSuccessRateChart" style="width: 100%; height: 400px;"></div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive, onUnmounted } from 'vue'
import { toDateStr } from '@/utils/time'
import { ElMessage } from 'element-plus'
import { formatData, paramsData } from '@/api/traffic/pulltaskchart/type'
import * as echarts from 'echarts'
import { reqCountTaskHour,reqCountGtoupHour } from '@/api/traffic/pulltaskchart'
import { JobGroupData } from '@/store/traffic/pulltaskchart'
const JobGroupDatas = JobGroupData()
const dataTime = ref(toDateStr(new Date(), true))
const FormData = ref<formatData>({
    baseDate: dataTime.value,
    dayStep: '-1',
    offerId: '',
    appId: '',
    pkgName: '',
    taskId: '',
    JobGroup: '',
    country: ''
})
const radio = ref('expectCount')
// 显示图表 任务实际量级
interface TaskData {
    taskhourserver?: Record<string, number>;
    taskhourok?: Record<string, number>;
    day?: string;
    taskhour?: Record<string, number>;
}
let resData = ref<TaskData[]>()
// 显示图表环境预估量级
let environment = ref({})

// 监听radio的变化
watch(radio, (newValue) => {
    console.log("Radio changed to:", newValue);
    updateCharts(true);
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
        startday: FormData.value.baseDate,
        step: parseInt(FormData.value.dayStep),
        days: calculateDays(FormData.value.baseDate, FormData.value.dayStep),
        offer: FormData.value.offerId,
        pkg: FormData.value.pkgName,
        taskid: FormData.value.taskId,
        jobgroup: FormData.value.JobGroup as string,
        app: FormData.value.appId,
        country: FormData.value.country,
    };
    // 查询task实际量级接口
    let res = await reqCountTaskHour(params)
    resData.value = res
    // 查询环境预估量级
    let result = await reqCountGtoupHour(params)
    environment.value = result
    updateCharts();
}

// 更新图表的函数
const updateCharts = (type?:boolean) => {
    // 获取当前选中的radio值
    const selectedRadio = radio.value;

    // 根据选中的radio值来决定使用的数据类型
    let taskCountKeys;
    if (selectedRadio === 'expectCount') {
        taskCountKeys = ["taskhourok", "taskhour"];
    } else if (selectedRadio === 'sendCount') {
        taskCountKeys = ["taskhourok", "taskhourserver"];
    }
    // 渲染任务流量图表
    renderChart(resData.value, document.getElementById("taskCountChart"), taskCountKeys);
    if (!type) {
        // 渲染成功率图表
        renderSuccessRateChart(environment.value, document.getElementById("taskSuccessRateChart"), taskCountKeys);
    }
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

    const hours = Array.from({ length: 24 }, (_, i) => i); // 改成从 0 开始

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
        title: {
            text: 'task实际量级',
            textStyle: {
                fontSize: 22 // 你可以根据需要调整字体大小
            }
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

    const hours = Array.from({ length: 24 }, (_, i) => i); // X轴从0开始
    const seriesDataArr: any[] = [];

    // 遍历 environment 数据
    Object.keys(data).forEach((envKey) => {
        const dayData = data[envKey];
        const dayValues: any[] = hours.map((hour: any) => dayData[hour] || 0); // 获取每小时的数据

        seriesDataArr.push({
            name: envKey,
            type: "line",
            data: dayValues,
            smooth: true
        });
    });

    const option = {
        tooltip: {
            trigger: 'axis',
            confine: true // 确保 tooltip 在图表区域内
        },
        title: { text: '环境预估量级', textStyle: { fontSize: 22 } },
        legend: {
            type: 'scroll',
            orient: 'horizontal',
            top: 'top',
            width: '80%',
            data: seriesDataArr.map(series => series.name) // 使用 environment 的键作为图例名称
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        toolbox: { feature: { saveAsImage: {} } },
        xAxis: { type: 'category', boundaryGap: false, data: hours },
        yAxis: [
            { type: 'value',  } // Y轴名称可以根据需要调整
        ],
        series: seriesDataArr
    };

    trafficChart.setOption(option);
}
// 定义JobGroup数据
const state = reactive({
  jobData: [] as { random: number; mdate: string; alliance_group: string; isMaster: string; ip: string; name: string; id: string; filters: string; enabled: string; }[]
})

onMounted(async () => {
    // 查询group数据
    if (JobGroupDatas.JobGroup.length == 0) {
        await JobGroupDatas.getJobGroup()
    }
    state.jobData = JobGroupDatas.JobGroup; // 获取数据
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
.pulltaskchart {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(100vh - 120px);
    padding: 5px;

    .pulltaskchart_header,
    .pulltaskchart_radio {
        flex: 0 0 auto; // 固定高度
        min-height: 50px; // 设置最小高度
    }

    .pulltaskchart_table,
    .pulltaskchart_footer {
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