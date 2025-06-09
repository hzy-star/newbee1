<template>
    <div class="container">
        <!-- 顶部区域 -->
        <div class="top-section">
            <div class="filter-item">
                <el-date-picker v-model="day" type="date" placeholder="选择日期" format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD" :disabled-date="disabledDate" />
            </div>
            <div class="filter-item"><el-input-number v-model="percent" controls-position="right" placeholder="请输入差异比"
                    :min="0" :step="0.1" :precision="1" />
            </div>
            <div class="filter-item">
                <el-button type="primary" @click="queryData">查询</el-button>
            </div>
        </div>

        <!-- 表格区域 -->
        <div class="table-section">
            <vxe-table auto-resize height="auto" :data="tableData" border :row-class-name="tableRowClassName">
                <vxe-column title="" field="name" width="180" />
                <vxe-column title="发送方式" field="sendType" width="180" />
                <vxe-column title="点击数" field="clicks" />
                <vxe-column title="转化数" field="convs" />
                <vxe-column title="转化比" field="convRatio" />
            </vxe-table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { reqConvWarnUrl } from '@/api/dataPresentation/syncAsyncWarn';
import { ElMessage } from 'element-plus';

// 定义数据结构
interface ResponseData {
    country: string;
    sync_conv_ratio: string;
    async_clicks: string;
    async_conv_ratio: string;
    pkg_name: string;
    async_convs: string;
    sync_clicks: string;
    sync_convs: string;
}

interface TableRow {
    name: string;
    sendType: string;
    clicks: string;
    convs: string;
    convRatio: string;
    groupIndex: number; // 添加组索引，用于标识数据对
}

// 定义响应式变量
const day = ref('');
const percent = ref(0.5);
const responseData = ref<ResponseData[]>([]);
const tableData = ref<TableRow[]>([]);

// 获取昨天的日期
const getYesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 禁用今天及以后的日期
const disabledDate = (time: Date) => {
    return time.getTime() > Date.now() - 8.64e7; // 禁用今天及以后的日期
};

// 初始化日期为昨天
day.value = getYesterday();

// 自定义行类名，实现每两行（一组数据）使用相同的斑马纹
const tableRowClassName = ({ row, rowIndex }: { row: TableRow, rowIndex: number }) => {
    // 使用groupIndex来确定是否应用斑马纹
    return row.groupIndex % 2 === 0 ? 'even-row' : 'odd-row';
};

// 查询数据
const queryData = async () => {
    if (!day.value) {
        ElMessage.warning('请选择日期');
        return;
    }
    if (percent.value <= 0) {
        ElMessage.warning('差异比必须大于0');
        return;
    }

    try {
        const params = {
            day: day.value,
            percent: percent.value,
        };
        const response = await reqConvWarnUrl(params);
        if (response.code === 200 && response.data) {
            responseData.value = response.data;
            processTableData();
        } else {
            ElMessage.error(response.errMsg || '获取数据失败');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        ElMessage.error('获取数据失败');
    }
};

// 处理表格数据
const processTableData = () => {
    const data: TableRow[] = [];
    if (!responseData.value || responseData.value.length === 0) {
        ElMessage.warning('暂无数据');
        tableData.value = [];
        return;
    } else {
        ElMessage.success('数据加载成功');
    }
    responseData.value.forEach((item, index) => {
        // 第一组：country，同步，sync_clicks，sync_convs，sync_conv_ratio
        data.push({
            name: item.country,
            sendType: '同步',
            clicks: item.sync_clicks,
            convs: item.sync_convs,
            convRatio: item.sync_conv_ratio,
            groupIndex: index // 添加组索引
        });

        // 第二组：pkg_name，异步，async_clicks，async_convs，async_conv_ratio
        data.push({
            name: item.pkg_name,
            sendType: '异步',
            clicks: item.async_clicks,
            convs: item.async_convs,
            convRatio: item.async_conv_ratio,
            groupIndex: index // 使用相同的组索引
        });
    });

    tableData.value = data;
    console.log('tableData:', tableData.value);

};

onMounted(async () => {
    // await queryData();
});
</script>

<style scoped lang="scss">
.container {
    padding: 20px;
    height: calc(100vh - #{$base-tabbar-height} - 10px);

    .top-section {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        gap: 20px;

        .filter-item {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
    }

    .table-section {
        margin-top: 20px;
        flex: 1;
        height: 90%;
    }
}




/* 自定义斑马纹样式 */
:deep(.even-row) {
    background-color: #70a8aa;
    color: #ffffff;
}

:deep(.odd-row) {
    background-color: #ffffff;
}
</style>
