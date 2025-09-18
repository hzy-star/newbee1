<template>
    <div class="dataStatistics">
        <!-- 顶部 -->
        <div class="dataStatistics-header">
            <!-- 左侧元素容器 -->
            <div class="header-left">
                <!-- 日期选择 -->
                <el-date-picker v-model="dateRange" type="daterange" range-separator="To" start-placeholder="Start date"
                    end-placeholder="End date" :clearable="false" :disabled-date="disabledDate"
                    @change="handleDateChange"  />
                <!-- 单选按钮组 -->
                <el-radio-group v-model="radioValue" @change="handleRadioChange">
                    <el-radio-button value="byProxyType">按代理类型</el-radio-button>
                    <el-radio-button value="byDay">按日期</el-radio-button>
                    <el-radio-button value="sendType">按发送类型</el-radio-button>
                </el-radio-group>
            </div>

            <!-- 独立右侧查询按钮 -->
            <el-button type="primary" @click="handleQuery">查询</el-button>
        </div>

        <!-- 内容区域 -->
        <div class="dataStatistics-content">
            <!-- 表格展示 -->
            <vxe-table v-if="radioValue === 'byProxyType'" :data="tableData" border auto-resize height="auto"
                :column-config="{ resizable: true }" show-overflow :cell-config="{ verticalAlign: 'center' }"
                :row-config="{ isCurrent: false, isHover: true }" :scroll-y="{ enabled: true, gt: 0 }" round>
                <vxe-column v-for="(key) in tableColumns" :key="key" :field=" columnTitles[key] || key" :title="columnTitles[key] || key" />
            </vxe-table>

            <!-- 图表展示 -->
            <div v-else ref="chartRef" style="height: auto; width: 100%"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import { ElMessage } from 'element-plus';
import { reqSummaryUrl } from '@/api/dataPresentation/dataStatistics';

// 类型定义
interface TableDataItem {
    [key: string]: string | number
}

// 常量定义
const GROUP_BY_MAP: { [key: string]: string } = {
    byProxyType: 'proxy_type',
    byDay: 'part',
    sendType: 'send_type'
}

// 响应式数据
const dateRange = ref<string[]>(getDefaultDateRange());
const radioValue = ref<'byProxyType' | 'byDay' | 'sendType'>('byProxyType');
const tableData = ref<any>([]);
const chartRef = ref<HTMLElement>();
let chartInstance: ECharts | null = null;

const columnTitles: { [key: string]: string } = {
    imps: 'imps',
    clicks: 'clicks',
    dimension: 'dimension',
}
// 计算属性
const tableColumns = computed(() => {
    if (tableData.value.length === 0) return {};
    
    // 只保留 columnTitles 中存在的 key
    return Object.keys(columnTitles).reduce((acc: { [key: string]: string }, key) => {
        if (tableData.value[0].hasOwnProperty(key)) {
            acc[key] = columnTitles[key];
        }
        return acc;
    }, {});
});


// 方法定义
function getDefaultDateRange(): string[] {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const formattedDate = formatDate(yesterday);
  return [formattedDate, formattedDate];
}
// 新增辅助函数：格式化日期为 YYYY-MM-DD
function formatDate(date: any): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function disabledDate(time: Date): boolean {
    return time.getTime() > Date.now() - 86400000; // 禁用今天及之后的日期
}

async function handleQuery() {
    try {
        const params = {
            // 直接使用字符串格式的日期
            startDay: dateRange.value[0],
            endDay: dateRange.value[1],
            groupBy: GROUP_BY_MAP[radioValue.value]
        };

        const res = await reqSummaryUrl(params);
        if (res.code !== 200) throw new Error('请求失败');

        tableData.value = res.data;

        if (radioValue.value !== 'byProxyType') {
            nextTick(() => renderChart(res.data));
        }

        ElMessage.success('查询成功');
    } catch (error) {
        ElMessage.error('查询失败');
        console.error('查询错误:', error);
    }
}

function renderChart(data: TableDataItem[]) {
    if (!chartRef.value) return;

    // 销毁旧图表
    if (chartInstance) {
        chartInstance.dispose();
    }

    // 根据分组类型获取系列配置
    const { seriesConfig, yAxisName } = (() => {
        switch (radioValue.value) {
            case 'byDay':
                return {
                    seriesConfig: [
                        { field: 'imps', name: '展示量', color: '#5470C6' },
                        { field: 'clicks', name: '点击量', color: '#91CC75' }
                    ],
                    yAxisName: '数量'
                }
            case 'sendType':
                return {
                    seriesConfig: [
                        { field: 'async_clicks', name: '异步点击量', color: '#FAC858' },
                        { field: 'sync_clicks', name: '同步点击量', color: '#EE6666' }
                    ],
                    yAxisName: '点击量'
                }
            default:
                return { seriesConfig: [], yAxisName: '' }
        }
    })();

    // 处理数据排序
    const sortedData = [...data].sort((a, b) =>
        new Date(a.dimension).getTime() - new Date(b.dimension).getTime()
    );

    // 生成图表配置
    const option = {
        title: { text: '数据统计图表', left: 'center' },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        legend: {
            data: seriesConfig.map(item => item.name),
            top: 30
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: sortedData.map(item => item.dimension),
            axisLabel: {
                rotate: 45,
                formatter: (value: string) => {
                    if (radioValue.value === 'sendType') {
                        return value.split('-').slice(1).join('-'); // 简写日期格式
                    }
                    return value
                }
            }
        },
        yAxis: {
            type: 'value',
            name: yAxisName,
        },
        series: seriesConfig.map(config => ({
            name: config.name,
            type: 'bar',
            barGap: 0,
            data: sortedData.map(item => Number(item[config.field])),
            itemStyle: { color: config.color },
            emphasis: {
                focus: 'series'
            }
        })),
        dataZoom: [{
            type: 'inside',
            start: 0,
            end: 100
        }]
    };

    // 初始化图表
    chartInstance = echarts.init(chartRef.value);
    chartInstance.setOption(option);

    // 窗口 resize 监听
    window.addEventListener('resize', () => chartInstance?.resize());
}

function handleDateChange(val: Date[] | string[]) {
  // 统一转换为字符串数组
  if (Array.isArray(val) && val[0] instanceof Date) {
    dateRange.value = val.map(d => formatDate(d));
  } else {
    dateRange.value = val as string[];
  }
}

function handleRadioChange(val: 'byProxyType' | 'byDay' | 'sendType') {
    tableData.value = []; // 清空旧数据
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }
}

// 生命周期
onMounted(() => {
    // handleQuery();
});

// 组件卸载时清理图表
onUnmounted(() => {
    if (chartInstance) {
        chartInstance.dispose();
    }
});
</script>

<style scoped lang="scss">
.dataStatistics {
    display: flex;
    flex-direction: column;
    height: calc(100vh - #{$base-tabbar-height} - 10px);
    padding: 16px;
    background-color: #f5f7fa;
    box-sizing: border-box;

    .dataStatistics-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding: 12px 16px;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

        .header-left {
            display: flex;
            gap: 16px;
            align-items: center;
            
            /* 日期选择器样式调整 */
            :deep(.el-date-editor) {
                width: 240px;
            }
        }
    }

    .dataStatistics-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        
        /* 表格容器样式 */
        .vxe-table {
            flex: 1;
            padding: 12px;
            
            :deep(.vxe-header--column) {
                background-color: #f8fafc;
                font-weight: 500;
            }
        }
        
        /* 图表容器样式 */
        > div {
            flex: 1;
            min-height: 400px;
            padding: 16px;
        }
    }
}

/* 响应式调整 */
@media (max-width: 768px) {
    .dataStatistics {
        padding: 8px;
        
        .dataStatistics-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
            
            .header-left {
                flex-wrap: wrap;
                gap: 8px;
                
                :deep(.el-date-editor) {
                    width: 100%;
                }
            }
        }
    }
}
</style>