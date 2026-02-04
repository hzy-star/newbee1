<template>
    <el-dialog v-model="dialogVisible" :top="isFullscreen ? '0' : '5vh'" title="通用监控"
        :width="isFullscreen ? '100%' : '85%'" :fullscreen="isFullscreen" :before-close="handleClose" destroy-on-close
        class="monitoring-dialog">
        <div class="search-bar">
            <div class="search-left">
                <el-select v-model="searchForm.pkgName" filterable placeholder="请选择/搜索 pkgName" style="width: 240px"
                    @change="handlePkgChange">
                    <el-option v-for="pkg in pkgOptions" :key="pkg" :label="pkg" :value="pkg" />
                </el-select>
                <el-select v-model="searchForm.countries" multiple filterable collapse-tags collapse-tags-tooltip
                    placeholder="请选择国家" style="width: 200px" @change="handleCountryChange">
                    <el-option v-for="country in countryOptions" :key="country" :label="country.toUpperCase()"
                        :value="country" />
                </el-select>
                <el-tag :type="eventTypeTag.type" style="margin: 0 10px">
                    {{ eventTypeTag.label }}
                </el-tag>
                <el-radio-group v-model="searchForm.dateType" @change="handleDateTypeChange">
                    <el-radio value="day">Day</el-radio>
                    <el-radio value="hour">Hour</el-radio>
                </el-radio-group>
                <div>
                    <el-date-picker v-if="searchForm.dateType === 'day'" v-model="searchForm.timeRange"
                        type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                        format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" style="width: 380px" />
                    <el-date-picker v-else v-model="searchForm.timeRange" type="datetimerange" range-separator="至"
                        start-placeholder="开始时间" end-placeholder="结束时间" format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss" style="width: 380px" />
                </div>
            </div>
            <div class="search-right">
                <el-button @click="toggleFullscreen">

                    {{ isFullscreen ? '缩小' : '全屏' }}
                </el-button>
                <el-button type="primary" :loading="loading" @click="handleSearch">
                    查询
                </el-button>
            </div>
        </div>

        <div class="flow-filter-bar">
            <div class="flow-filter-left">
                <span class="filter-label">Flow 过滤：</span>
                <el-select v-model="selectedFlows" multiple collapse-tags collapse-tags-tooltip clearable 
                    placeholder="选择要显示的 Flow" style="width: 300px" @change="handleFlowFilterChange">
                    <el-option v-for="flow in flowOptions" :key="flow" :label="flow" :value="flow" />
                </el-select>
            </div>
            <div class="flow-legend" v-if="flowOptions.length > 0">
                <span class="legend-title">Flow 图例：</span>
                <div class="legend-items">
                    <div v-for="(flow, index) in flowOptions" :key="flow" class="legend-item">
                        <span class="legend-color" :style="{
                            backgroundColor: flowColors[index % flowColors.length],
                        }"></span>
                        <span class="legend-name">{{ flow }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="charts-container" v-loading="loading">
            <div v-for="model in modelList" :key="model" class="chart-wrapper">
                <h3>{{ modelTitleMap[model] }}</h3>
                <div :ref="(el) => setChartRef(el, model)" class="chart-box"></div>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed, nextTick, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import * as echarts from "echarts";
import { roundIfNeeded } from '@/utils/common'
import {
    reqPkgMatchCountry,
    reqDataList,
} from "@/api/strategyAutoDelivery/generalMonitoring/index";

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true,
    },
    model: {
        type: String,
        default: "",
    },
    row: {
        type: Object as () => any,
        default: () => ({}),
    },
});

const emit = defineEmits(["update:modelValue"]);

const dialogVisible = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val),
});

const modelList = ["standard", "metric", "d1r", "oog", "roi"];

const modelTitleMap: Record<string, string> = {
    standard: "常规量监控",
    metric: "指标监控",
    d1r: "留存监控",
    oog: "OutOfGeo监控",
    roi: "ROI"
};

// 指标名称中文映射
const metricNameMap: Record<string, string> = {
    clicks: "点击数",
    click_convs: "点击转化数",
    imps: "展示数",
    imp_convs: "展示转化数",
    events: "事件数",
    cer: "事件达成率 CER * 10^4",
    er: "事件触发率 ER",
    cr: "转化率 CR * 10^4",
    ir: "转化率 IR",
    d1r: "次留率",
    oog_rate: "OOG率",
    roi:"ROI * 10^3"
};

// 获取指标中文名称
const getMetricLabel = (metric: string) => {
    return metricNameMap[metric] || metric;
};

const searchForm = ref({
    pkgName: "default",
    countries: [] as string[],
    timeRange: [] as string[],
    dateType: "day" as "day" | "hour",
});
type PkgCountryMap = Record<string, string[]>;
type ChartData = Record<string, Record<string, Record<string, number>>>;

const loading = ref(false);
const isFullscreen = ref(false);
const pkgCountryMap = ref<PkgCountryMap>({});
const pkgOptions = computed(() => Object.keys(pkgCountryMap.value));
const countryOptions = ref<string[]>([]);
const flowOptions = ref<string[]>([]);
const selectedFlows = ref<string[]>([]);
const chartDataCache = ref<Record<string, ChartData>>({});

const eventTypeTag = computed(() =>
    props.row?.eventType === "click"
        ? { label: "点击", type: "success" }
        : { label: "展示", type: "warning" },
);

const chartInstances = ref<Record<string, echarts.ECharts>>({});
const chartRefs = ref<Record<string, HTMLElement>>({});

const setChartRef = (el: any, model: string) => {
    if (el) chartRefs.value[model] = el;
};

// 颜色用于区分 flow（提升到组件级别以便模板使用）
const flowColors = [
    "#5470c6",
    "#91cc75",
    "#fac858",
    "#ee6666",
    "#73c0de",
    "#3ba272",
    "#fc8452",
    "#9a60b4",
    "#ea7ccc",
    "#8b5cf6",
];

const initDefaultTime = () => {
    const today = new Date();
    const endDate = new Date(today);
    const startDate = new Date(today);
    endDate.setDate(today.getDate());
    startDate.setDate(today.getDate() - 6);

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    //   searchForm.value.timeRange =
    //     searchForm.value.dateType === "day"
    //       ? [formatDate(startDate), formatDate(endDate)]
    //       : [
    //           `${formatDate(startDate)} 00:00:00`,
    //           `${formatDate(endDate)} 23:59:59`,
    //         ];
    searchForm.value.timeRange = [
        `${formatDate(startDate)} 00:00:00`,
        `${formatDate(endDate)} 23:59:59`,
    ];
};

const handleDateTypeChange = () => initDefaultTime();

// 切换全屏
const toggleFullscreen = async () => {
    isFullscreen.value = !isFullscreen.value;
    await nextTick();
    // 全屏切换后重新调整图表大小
    handleResize();
};

// 获取默认的 第一个 值
const getDefaultFirstValue = (countries: string[]) => {
    // const allValue = countries.find((c) => c.toUpperCase() === "ALL");
    const firstValue = countries[0]
    return firstValue || "";
};

const fetchPkgCountryData = async () => {
    try {
        const params = {
            pkgname: props.row.pkgName,
            country: props.row.country,
            eventType: props.row?.eventType || "click",
        };
        const res = await reqPkgMatchCountry(params);

        if (res.success && res.data) {
            pkgCountryMap.value = res.data;
            const pkgList = Object.keys(res.data);
            if (pkgList.length > 0) {
                searchForm.value.pkgName = pkgList[0];
                countryOptions.value = res.data[pkgList[0]] || [];
                const firstValue = getDefaultFirstValue(countryOptions.value);
                searchForm.value.countries = firstValue ? [firstValue] : [];
                handleSearch()
            }
        }
    } catch {
        ElMessage.error("获取 pkgName 数据失败");
    }
};

const handlePkgChange = (pkg: string) => {
    countryOptions.value = pkgCountryMap.value[pkg] || [];
    const firstValue = getDefaultFirstValue(countryOptions.value);
    searchForm.value.countries = firstValue ? [firstValue] : [];
};

const handleCountryChange = (val: string[]) => {
    const firstValue = getDefaultFirstValue(countryOptions.value);
    if (val.length === 0) {
        // 清空时默认选中 第一个国家
        searchForm.value.countries = firstValue ? [firstValue] : [];
    } else if (firstValue  && val.length > 1) {
        // 如果选中了 ALL 且还有其他选项，根据最后选择的决定保留哪些
        const lastSelected = val[val.length - 1];
        searchForm.value.countries =
            lastSelected.toUpperCase() === "ALL"
                ? val.filter((v) => v.toUpperCase() == "ALL")
                : val.filter((v) => v.toUpperCase() !== "ALL");
    }
};

const handleSearch = async () => {
    loading.value = true;
    try {
        const baseParams = {
            pkgname: searchForm.value.pkgName || "default",
            country:searchForm.value.countries.join(","),
            eventType: props.row?.eventType || "click",
            abmodel: props.model,
            startTime: searchForm.value.timeRange[0] || "",
            endTime: searchForm.value.timeRange[1] || "",
            dateType: searchForm.value.dateType,
        };
        const requests = modelList.map(modelType => reqDataList({ ...baseParams, modelType }));
        const results = await Promise.all(requests);

        const allFlows = new Set<string>();
        results.forEach((res) => {
            if (res.success && res.data) {
                Object.keys(res.data).forEach((flow) => allFlows.add(flow));
            }
        });

        flowOptions.value = Array.from(allFlows);
        selectedFlows.value = [...flowOptions.value];

        results.forEach((res, i) => {
            if (res.success && res.data) {
                chartDataCache.value[modelList[i]] = res.data as unknown as ChartData;
            }
        });

        await nextTick();
        renderAllCharts();
        // 创建 ResizeObserver 监听图表容器
        setupResizeObserver();
    } catch {
        ElMessage.error("查询数据失败");
    } finally {
        loading.value = false;
    }
};

const handleFlowFilterChange = () => renderAllCharts();

const renderAllCharts = () => {
    modelList.forEach((model) => {
        if (chartDataCache.value[model]) {
            renderChart(model, chartDataCache.value[model]);
        }
    });
};

// 格式化 x 轴标签
const formatXAxisLabel = (value: string) => {
    if (searchForm.value.dateType === "hour") {
        // 2026010100 -> 01-01 00
        const month = value.substring(4, 6);
        const day = value.substring(6, 8);
        const hour = value.substring(8, 10);
        return `${month}-${day} ${hour}`;
    } else {
        // 20260101 -> 01-01
        const month = value.substring(4, 6);
        const day = value.substring(6, 8);
        return `${month}-${day}`;
    }
};

const renderChart = (model: string, data: ChartData) => {
    const chartDom = chartRefs.value[model];
    if (!chartDom) return;

    if (chartInstances.value[model]) {
        chartInstances.value[model].dispose();
    }

    const chart = echarts.init(chartDom);
    chartInstances.value[model] = chart;

    const filteredFlows = Object.keys(data).filter(
        (flow) =>
            selectedFlows.value.length === 0 || selectedFlows.value.includes(flow),
    );

    if (!filteredFlows.length) {
        chart.setOption({
            title: { text: "暂无数据", left: "center", top: "center" },
        });
        return;
    }

    const firstFlow = data[filteredFlows[0]];
    const xAxisData = Object.keys(firstFlow).sort();
    const metricKeys = Object.keys(firstFlow[xAxisData[0]] || {});
    const xAxisLabels = xAxisData.map(formatXAxisLabel);

    // symbol 用于区分指标
    const symbols: Array<
        "circle" | "triangle" | "rect" | "diamond" | "pin" | "arrow" | "roundRect"
    > = ["circle", "triangle", "rect", "diamond", "pin", "arrow", "roundRect"];

    // 为每个 flow 分配固定颜色
    const flowColorMap: Record<string, string> = {};
    filteredFlows.forEach((flow, idx) => {
        flowColorMap[flow] = flowColors[idx % flowColors.length];
    });

    // 为每个指标分配固定 symbol
    const metricSymbolMap: Record<string, string> = {};
    metricKeys.forEach((metric, idx) => {
        metricSymbolMap[metric] = symbols[idx % symbols.length];
    });

    const series: any[] = [];
    filteredFlows.forEach((flow) => {
        metricKeys.forEach((metric) => {
            series.push({
                name: getMetricLabel(metric),
                type: "line",
                data: xAxisData.map((day) => data[flow][day]?.[metric] ?? 0),
                itemStyle: { color: flowColorMap[flow] },
                lineStyle: {
                    color: flowColorMap[flow],
                    width: 1.5, //图表线条粗细
                },
                symbol: metricSymbolMap[metric],
                symbolSize: 6,  //线条上的图标大小
                _flowName: flow,
                _metricName: getMetricLabel(metric),
            });
        });
    });

    // legend 数据使用中文名称
    const legendData = metricKeys.map((metric) => getMetricLabel(metric));

    chart.setOption({
        tooltip: {
            trigger: "axis",
            appendToBody: true, //tooltip 会渲染到 body 下，层级最高，不会被 div 的 overflow 裁剪
            confine: true,  //让 tooltip 限制在图表区域内，不会超出屏幕
            enterable: true,    //让鼠标可以进入 tooltip 进行滚动操作。
            extraCssText: 'max-height: 35vh; overflow-y: auto;',    //tooltip 最大高度 60vh，超出部分可以滚动查看
            formatter: (params: any) => {
                if (!params || !params.length) return "";
                let result = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].axisValue}</div>`;
                params.forEach((item: any) => {
                    const s = series[item.seriesIndex];
                    result += `<div style="display:flex;align-items:center;margin:3px 0;">
                        <span style="display:inline-block;width:10px;height:10px;background:${item.color};border-radius:50%;margin-right:5px;"></span>
                        <span><b>${s._flowName}</b><i style="font-size:12px;">(${s._metricName})</i>: ${roundIfNeeded(item.value,4)}</span>
                    </div>`;
                });
                return result;
            },
        },
        legend: {
            type: "scroll",
            top: 0,
            data: legendData,
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "15%",
            containLabel: true,
        },
        dataZoom: [
            {
                type: "inside",
                start: 0,
                end: 100,
                zoomOnMouseWheel: true,
                moveOnMouseMove: true,
            },
            {
                type: "slider",
                start: 0,
                end: 100,
                bottom: 5,
                height: 20,
            },
        ],
        xAxis: {
            type: "category",
            boundaryGap: false,
            data: xAxisLabels,
        },
        yAxis: {
            type: "value",
        },
        series,
    });
};

const resetAllData = () => {
    searchForm.value = {
        pkgName: "default",
        countries: [],
        timeRange: [],
        dateType: "day",
    };
    pkgCountryMap.value = {};
    countryOptions.value = [];
    flowOptions.value = [];
    selectedFlows.value = [];
    chartDataCache.value = {};
    isFullscreen.value = false;
    // 销毁图表实例
    Object.values(chartInstances.value).forEach((c) => c?.dispose());
    chartInstances.value = {};
};

const handleClose = () => {
    dialogVisible.value = false;
    resetAllData();
};

// watch(dialogVisible, async (val) => {
//   if (val) {
//     initDefaultTime();
//     await fetchPkgCountryData();
//   }
// });

const handleResize = () => {
    Object.values(chartInstances.value).forEach((c) => c?.resize());
};

// 使用 ResizeObserver 监听图表容器大小变化
let resizeObserver: ResizeObserver | null = null;

const setupResizeObserver = () => {
    resizeObserver?.disconnect();
    resizeObserver = new ResizeObserver(() => {
        handleResize();
    });
    Object.values(chartRefs.value).forEach((el) => {
        if (el) resizeObserver?.observe(el);
    });
};

watch(dialogVisible, async (val) => {
    if (val) {
        resetAllData();
        initDefaultTime();
        await fetchPkgCountryData();
    } else {
        // 清理 ResizeObserver
        resizeObserver?.disconnect();
        resizeObserver = null;
        resetAllData();
    }
});

window.addEventListener("resize", handleResize);

onBeforeUnmount(() => {
    window.removeEventListener("resize", handleResize);
    resizeObserver?.disconnect();
    Object.values(chartInstances.value).forEach((c) => c?.dispose());
});
</script>

<style lang="scss" scoped>
.search-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 5px;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;
    justify-content: space-between;
}

.search-left {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

.search-right {
    display: flex;
    align-items: center;
    gap: 10px;
}

.flow-filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 5px;
    padding: 10px 15px;
    background: #fafafa;
    border-radius: 4px;
    border: 1px solid #ebeef5;

    .flow-filter-left {
        display: flex;
        align-items: center;
    }

    .filter-label {
        margin-right: 10px;
        color: #606266;
        font-size: 14px;
    }

    .flow-legend {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: #fff;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        max-width: 70%;

        .legend-title {
            color: #909399;
            font-size: 13px;
            margin-right: 12px;
            flex-shrink: 0;
        }

        .legend-items {
            display: flex;
            flex-wrap: nowrap;
            gap: 12px;
            overflow-x: auto;
            height: 35px;

            &::-webkit-scrollbar {
                height: 4px;
            }

            &::-webkit-scrollbar-thumb {
                background: #c0c4cc;
                border-radius: 2px;
            }

            &::-webkit-scrollbar-track {
                background: transparent;
            }
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;

            .legend-color {
                width: 14px;
                height: 14px;
                border-radius: 2px;
            }

            .legend-name {
                font-size: 12px;
                color: #606266;
            }
        }
    }
}

.charts-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
    max-height: calc(100vh - 320px);
    overflow-y: auto;
    overflow-x: hidden;
}

.chart-wrapper {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 10px;
    background: #fff;
    min-width: 0;
    overflow: hidden;

    h3 {
        margin: 0 0 8px 0;
        font-size: 13px;
        color: #303133;
        border-left: 3px solid #409eff;
        padding-left: 8px;
    }
}

.chart-box {
    width: 100%;
    height: 250px;
    min-width: 0;
}

:deep(.monitoring-dialog) {
    max-height: 90vh;

    .el-dialog__body {
        padding: 10px 15px;
        max-height: calc(90vh - 100px);
        overflow-y: auto;
        overflow-x: hidden;
    }
}
</style>
