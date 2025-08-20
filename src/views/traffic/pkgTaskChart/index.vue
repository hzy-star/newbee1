<template>
    <div class="pushtaskchartchart">
        <div class="pushtaskchart_header">
            <!-- Query Conditions -->
            <el-row :gutter="20" type="flex" justify="start">
                <!-- Date Range Selection -->
                <el-col :span="8">
                    <div class="form-item">
                        <div class="form-item-label">Date Range</div>
                        <el-date-picker v-model="baseDate" style="width: 500px;" type="daterange" range-separator="To"
                            start-placeholder="Start date" end-placeholder="End date" size="default"
                            format="YYYY-MM-DD" />
                    </div>
                </el-col>
                <!-- etype -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Event Type</div>
                        <el-select v-model="FormData.etype" placeholder="Select event type" style="width: 100%;">
                            <el-option label="Impression" value="imp"></el-option>
                            <el-option label="Click" value="click"></el-option>
                        </el-select>
                    </div>
                </el-col>
                <!-- country -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Country</div>
                        <el-input v-model="FormData.country" placeholder="Enter country" />
                    </div>
                </el-col>
                <!-- Os -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">OS</div>
                        <el-input v-model="FormData.os" placeholder="Enter OS" />
                    </div>
                </el-col>
                <!-- PkgName -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Package</div>
                        <el-input v-model="FormData.pkgname" placeholder="Package name" />
                    </div>
                </el-col>
                <!-- def_sub4 -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Service</div>
                        <el-select v-model="FormData.def_sub4" placeholder="Select service" style="width: 100%;">
                            <el-option label="AutoTask" value="click_engine_gateway"></el-option>
                            <el-option label="PkgTask" value="click_engine_offline_pkgtask"></el-option>
                            <el-option label="Newbee" value="newbee"></el-option>
                            <el-option label="Push Node" value="pushnode"></el-option>
                        </el-select>
                    </div>
                </el-col>
                <!-- s -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Source</div>
                        <el-input v-model="FormData.s" placeholder="Enter source" />
                    </div>
                </el-col>
                <!-- ds_adx -->
                <!-- <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">ADX</div>
                        <el-input v-model="FormData.ds_adx" placeholder="Enter ADX" />
                    </div> -->
                <!-- </el-col> -->
                <!-- task_id -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Task ID</div>
                        <el-input v-model="FormData.task_id" placeholder="Enter task ID" />
                    </div>
                </el-col>
                <!-- offer_id -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">Offer ID</div>
                        <el-input v-model="FormData.offer_id" placeholder="Enter offer ID" />
                    </div>
                </el-col>
                <!-- app_id -->
                <el-col :span="4">
                    <div class="form-item">
                        <div class="form-item-label">App ID</div>
                        <el-input v-model="FormData.app_id" placeholder="Enter app ID" />
                    </div>
                </el-col>
                <!-- button -->
                <el-col :span="4">
                    <div class="form-item">
                        <el-button type="primary" @click="ShowChart" :loading="loading">
                            <span v-if="!loading">Show Chart</span>
                            <span v-else>Loading...</span>
                        </el-button>
                    </div>
                </el-col>
            </el-row>
        </div>

        <!-- Chart Container -->
        <div class="pushtaskchart_table">
            <div class="fullscreen-btn" @click="toggleFullscreen">
                ⛶
            </div>
            <div style="height: 100%;">
                <div id="taskCountChart" style="width: 100%; height:100%;"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Traffic Monitoring Dashboard
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { reqTaskResultList } from '@/api/traffic/pkgTaskChart'
import * as echarts from 'echarts'

const baseDate = ref<Date[]>([] as Date[]);
const loading = ref(false);

const FormData = reactive({
    start_day: '',
    end_day: '',
    etype: '',
    country: '',
    os: '',
    pkgname: '',
    def_sub4: 'click_engine_offline_pkgtask',
    s: '',
    // ds_adx: '',
    task_id: '',
    offer_id: '',
    app_id: '',
})

const ShowChart = async () => {
    if (baseDate.value && baseDate.value.length === 2) {
        FormData.start_day = formatDate(baseDate.value[0]);
        FormData.end_day = formatDate(baseDate.value[1]);
    } else {
        ElMessage.error('Please select a date range!');
        return;
    }

    loading.value = true;

    // 清空图表
    const chartDom = document.getElementById('taskCountChart') as HTMLElement;
    if (chartDom) {
        const chart = echarts.getInstanceByDom(chartDom);
        chart?.clear();
    }
    try {
        const param = {
            start_day: FormData.start_day,
            end_day: FormData.end_day,
            etype: FormData.etype,
            country: FormData.country.toLocaleUpperCase(),
            os: FormData.os,
            pkg_name: FormData.pkgname,
            def_sub4: FormData.def_sub4,
            s: FormData.s,
            // ds_adx: FormData.ds_adx,
            task_id: FormData.task_id,
            offer_id: FormData.offer_id,
            app_id: FormData.app_id,
        };

        const res = await reqTaskResultList(param);
        console.log('API Response:', res);

        await nextTick(); // Wait for DOM updates
        renderChart(res.data);

        // ElMessage.success('Chart loaded successfully!');
    } catch (error) {
        console.error('Error fetching task result list:', error);
        ElMessage.error('Failed to fetch task result list');
    } finally {
        loading.value = false;
    }
};

const renderChart = (rawData: any[]) => {
    if (!rawData || rawData.length === 0) {
        ElMessage.warning('没有可用的数据');
        return;
    }
    ElMessage.success('查询成功!');

    // 1. 提取所有唯一的code和dayhour
    const codes = [...new Set(rawData.map((item: any) => item.code))] as string[];
    const dayhours = [...new Set(rawData.map((item: any) => item.dayhour))].sort();

    // 2. 按code分组数据
    const groupedData: Record<string, Array<{ dayhour: string; cnt: number }>> = {};

    // 为每个code创建数据数组
    codes.forEach(code => {
        groupedData[code] = dayhours.map(dayhour => {
            return { dayhour, cnt: 0 };
        });
    });

    // 3. 填充实际数据
    rawData.forEach((item: any) => {
        const dayhour = item.dayhour;
        const code = item.code;

        if (groupedData[code]) {
            const dayhourData = groupedData[code].find(d => d.dayhour === dayhour);
            if (dayhourData) {
                dayhourData.cnt = item.cnt;
            }
        }
    });

    // 4. 准备图表数据
    const xAxisData = dayhours;

    // 定义不同系列的颜色
    const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];

    // 为每个code创建系列
    const series = codes.map((code, index) => {
        const colorIndex = index % colors.length;

        return {
            name: code,
            type: 'line',
            data: groupedData[code].map(item => item.cnt),
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
                width: 3,
                color: colors[colorIndex]
            },
            itemStyle: {
                color: colors[colorIndex]
            },
            emphasis: {
                lineStyle: {
                    width: 4
                }
            },
            areaStyle: {
                color: colors[colorIndex] // 半透明填充
            }
        };
    });

    // 5. 创建图表配置
    const option: any = {
        title: {
            text: 'Task Count Chart',
            left: 'center',
            textStyle: {
                fontSize: 20,
                fontWeight: 'bold',
                color: '#333'
            }
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#ccc',
            borderWidth: 1,
            confine: true,
            textStyle: {
                color: '#333'
            },
            formatter: (params: any) => {
                const maxItemsPerCol = 20; // 每列最多展示条数
                const columns: string[] = [];
                for (let i = 0; i < params.length; i += maxItemsPerCol) {
                    const chunk = params.slice(i, i + maxItemsPerCol);
                    let colContent = `<div style="display:inline-block;min-width:160px;vertical-align:top;margin-right:15px;">`;
                    chunk.forEach((param: any) => {
                        const color = param.color;
                        const code = param.seriesName;
                        colContent += `<div style="display:flex;align-items:center;margin:4px 0;">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${color};margin-right:5px;"></span>
                <span style="font-weight:500;">${code}:</span>
                <strong style="margin-left:5px;">${param.value.toLocaleString()}</strong>
            </div>`;
                    });
                    colContent += `</div>`;
                    columns.push(colContent);
                }

                return `<div style="font-weight:bold;margin-bottom:8px;border-bottom:1px solid #eee;padding-bottom:4px;">Time: ${params[0].axisValueLabel}:00</div>
            <div style="display:flex;flex-wrap:nowrap;">${columns.join('')}</div>`;
            }

        },
        legend: {
            data: codes,
            bottom: 25,
            itemGap: 20,
            textStyle: {
                fontSize: 12
            },
            type: 'scroll',
            pageButtonItemGap: 5,
            pageButtonGap: 30,
            pageTextStyle: {
                fontSize: 12,
                color: '#666'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            axisLabel: {
                fontSize: 11,
                rotate: 45
            },
            axisLine: {
                lineStyle: {
                    color: '#999'
                }
            },
            axisTick: {
                alignWithLabel: true
            }
        },
        yAxis: {
            type: 'value',
            name: '数量',
            nameTextStyle: {
                fontSize: 12,
                color: '#666'
            },
            axisLabel: {
                formatter: (value: number) => {
                    if (value >= 1000000) {
                        return `${(value / 1000000).toFixed(1)}M`;
                    } else if (value >= 1000) {
                        return `${(value / 1000).toFixed(1)}K`;
                    }
                    return value.toString();
                },
                fontSize: 11
            },
            axisLine: {
                lineStyle: {
                    color: '#999'
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#f0f0f0'
                }
            }
        },
        dataZoom: [
            {
                type: 'slider',
                show: true,
                xAxisIndex: 0,
                start: 0,
                end: xAxisData.length > 24 ? (24 / xAxisData.length) * 100 : 100,
                height: 24,
                bottom: 0
            },
            {
                type: 'inside',
                xAxisIndex: 0,
                start: 0,
                end: xAxisData.length > 24 ? (24 / xAxisData.length) * 100 : 100
            }
        ],

        series: series,
        animationEasing: 'cubicOut',
        animationDuration: 1000
    };

    // 6. Render chart
    const chartDom = document.getElementById('taskCountChart') as HTMLElement;
    if (chartDom) {
        const taskCountChart = echarts.getInstanceByDom(chartDom) || echarts.init(chartDom);
        taskCountChart.setOption(option, true);

        // Handle window resize
        const resizeHandler = () => {
            taskCountChart.resize();
        };

        window.removeEventListener('resize', resizeHandler);
        window.addEventListener('resize', resizeHandler);
    }
};

// Format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const toggleFullscreen = () => {
    const container = document.querySelector('.pushtaskchart_table') as HTMLElement;
    if (!container) return;

    if (!document.fullscreenElement) {
        container.requestFullscreen?.();
    } else {
        document.exitFullscreen?.();
    }
};


// 监听退出全屏时，自动 resize 图表
document.addEventListener("fullscreenchange", () => {
    const chartDom = document.getElementById('taskCountChart') as HTMLElement;
    if (chartDom) {
        const chart = echarts.getInstanceByDom(chartDom);
        chart?.resize();
    }
});

onMounted(async () => {
    // Default load data for the last 2 days
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    baseDate.value = [yesterday, today];
    FormData.start_day = formatDate(yesterday);
    FormData.end_day = formatDate(today);
    FormData.etype = 'imp'; // Default event type

    // Auto-load chart on mount
    await ShowChart();
});
</script>

<style scoped lang="scss">
.pushtaskchartchart {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(100vh - $base-tabbar-height - 10px);
    padding: 10px;
    background: #f8f9fa;

    .pushtaskchart_header {
        // flex: 0 0 auto;
        min-height: 120px;
        height: 15%;
        background: white;
        border-radius: 8px;
        padding: 10px 10px 0 10px;
        margin-bottom: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .pushtaskchart_table {
        // flex: 1 1 auto;
        height: 85%;
        min-height: 400px;
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        position: relative;
    }
}


.el-col {
    margin: 5px 0;
}

.form-item-label {
    font-weight: 600;
    color: #303133;
    margin: 0 10px 0px 0;
    text-align: right;
    font-size: 14px;
    min-width: 80px;
}

.form-item {
    display: flex;
    align-items: center;
    width: 100%;

    .el-input,
    .el-select,
    .el-date-picker {
        margin-top: 5px;
    }
}

// Responsive design
@media (max-width: 1200px) {
    .el-col {
        &:nth-child(1) {
            // Date picker
            flex: 0 0 100%;
            max-width: 100%;
        }

        &:not(:nth-child(1)) {
            flex: 0 0 50%;
            max-width: 50%;
        }
    }
}

@media (max-width: 768px) {
    .pushtaskchartchart {
        padding: 10px;
        height: calc(100vh - 60px);
    }

    .el-col {
        flex: 0 0 100%;
        max-width: 100%;
        margin: 8px 0;
    }

    .form-item {
        align-items: stretch;
    }

    .form-item-label {
        margin-bottom: 8px;
    }

    .pushtaskchart_table {
        #taskCountChart {
            height: calc(100vh - 400px) !important;
            min-height: 300px;
        }
    }
}

// Enhanced button styling
.el-button {
    font-weight: 600;
    border-radius: 6px;
    transition: all 0.3s ease;
    margin: auto;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
}

.fullscreen-btn {
    position: absolute;
    top: 10px;
    right: 15px;
    cursor: pointer;
    font-size: 18px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
    padding: 2px 6px;

    &:hover {
        background: rgba(0, 0, 0, 0.1);
    }
}
</style>