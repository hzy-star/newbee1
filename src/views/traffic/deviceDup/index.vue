<template>
    <div class="pushtask">
        <div class="pushtask_header">
            <!-- 查询条件 -->
            <div class="flex-row">
                <div class="flex-row-div">
                    <div class="form-item" style="min-width: 200px;">
                        <div class="form-item-label">Date</div>
                        <el-select v-model="propFrom.taskdate">
                            <el-option v-for="(item, index) in date" :key="index" :label="item" :value="item" />
                        </el-select>
                    </div>
                    <div class="form-item" style="min-width: 400px;">
                        <div class="form-item-label">searchDup</div>
                        <!-- <el-input v-model="propFrom.searchDup" placeholder="Search text here" @input="searchDupTable" /> -->
                        <vxe-input v-model="propFrom.searchDup" type="search" placeholder="Search text here" clearable
                            @change="searchEvent"></vxe-input>
                    </div>
                    <div class="form-item">
                        <el-input v-model="propFrom.dayOffset" placeholder="Offset" />
                        <el-button type="primary" @click="comparebtn">Compare</el-button>
                    </div>
                </div>

                <div class="flex-row-div">
                    <div class="form-item">
                        <el-button type="primary" @click="checkdupbtn">Check</el-button>
                    </div>
                </div>
            </div>
        </div>
        <!-- 数据表格 -->
        <div class="pushtask_table">
            <div class="vxe-table-div">
                <vxe-table border auto-resize height="auto" :column-config="{ resizable: true }"
                    :cell-config="{ verticalAlign: 'center' }" :row-config="{ isCurrent: false, isHover: true }"
                    :scroll-y="{ enabled: true, gt: 50 }" :data="tableDataList" ref="tableRef" size="mini" round
                    :sort-config="sortConfig">
                    <vxe-column field="xh" type="seq" align="center" show-header-overflow width="6%"></vxe-column>
                    <vxe-column field="adx" title="adx" show-header-overflow sortable align="center" width="25%">
                    </vxe-column>
                    <vxe-column field="country" title="country" show-header-overflow sortable align="center"
                        width="12%"></vxe-column>
                    <vxe-column field="os" title="os" show-header-overflow sortable align="center"
                        width="12%"></vxe-column>
                    <vxe-column field="count" title="请求量" show-header-overflow sortable align="center" width="12%">
                        <template #default="{ row }">
                            <div>{{ row.count }}</div>
                            <!-- 对比数据 -->
                            <div v-if="row.compareCount !== null" class="compare-item text-muted">
                                {{ row.compareCount }}
                            </div>
                        </template></vxe-column>
                    <vxe-column field="uniq" title="独立设备" show-header-overflow sortable align="center" width="12%">
                        <template #default="{ row }">
                            <div>{{ row.uniq }}</div>
                            <div v-if="row.compareUniq !== null" class="compare-item text-muted">
                                {{ row.compareUniq }}
                            </div>
                        </template></vxe-column>
                    <vxe-column field="filter" title="重复量" show-header-overflow sortable align="center" width="11%">
                        <template #default="{ row }">
                            <div>{{ row.filter }}</div>
                            <div v-if="row.compareFilter !== null" class="compare-item text-muted">
                                {{ row.compareFilter }}
                            </div>
                        </template></vxe-column>
                    <vxe-column field="uniqRatio" title="重复比列" show-header-overflow sortable align="center" width="10%">
                        <template #default="{ row }">
                            <div>{{ row.ratio }}</div>
                            <div v-if="row.compareRatio !== null" class="compare-item text-muted">
                                {{ row.compareRatio }}
                            </div>
                        </template></vxe-column>
                </vxe-table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getRelativeDates } from "@/utils/time";
import { reqAdxIfaDupUrl } from "@/api/traffic/deviceDup";
import XEUtils from 'xe-utils'
import type { VxeTablePropTypes } from 'vxe-table'

// 表单数据
const propFrom = ref({
    taskdate: '',
    searchDup: '',
    dayOffset: ''
});
// 基础数据（checkdupbtn 加载）
const baseData = ref<any[]>([]);
// 对比数据（comparebtn 加载）
const compareData = ref<any[]>([]);
// 合并后的表格数据（用于渲染）
const mergedData = ref<any[]>([]);

// 获取最近3天的日期
const date = ref(getRelativeDates(-3));

// 表格数据
const tableDataList = ref<any[]>([]);

onMounted(() => {
    if (date.value.length > 0) {
        propFrom.value.taskdate = date.value[0];  // 设置默认选中第一个日期
    }
});

/**
 * 处理表格数据
 */
const cellDatas = ref<any[]>([]);
// 模糊查询
const handleSearch = () => {
    const filterVal = String(propFrom.value.searchDup).trim().toLowerCase()
    debugger
    if (filterVal) {
        const filterRE = new RegExp(filterVal, 'gi')
        const searchProps = ['adx', 'country', 'os', 'count', 'uniq', 'filter', 'uniqRatio']
        const rest = cellDatas.value.filter(item => searchProps.some(key => String(item[key]).toLowerCase().indexOf(filterVal) > -1))
        tableDataList.value = rest.map(row => {
            // 搜索为克隆数据，不会污染源数据
            const item = XEUtils.clone(row)
            searchProps.forEach(key => {
                item[key] = String(item[key]).replace(filterRE, match => `${match}`)
            })
            return item
        })
    } else {
        tableDataList.value = cellDatas.value
    }
}

// 节流函数,间隔500毫秒触发搜索
const searchEvent = XEUtils.throttle(function () {
    handleSearch()
}, 500, { trailing: true, leading: true })
/**
 * Compare 按钮事件（加载对比数据）
 */
const comparebtn = async () => {
    const { taskdate, dayOffset } = propFrom.value;

    if (!taskdate || dayOffset === undefined || dayOffset === null) {
        alert("Day or DayOffset is Empty");
        return;
    }

    // 计算偏移后的日期
    const formattedTaskDate = `${taskdate.substring(0, 4)}-${taskdate.substring(4, 6)}-${taskdate.substring(6, 8)}`;
    const offsetDate = new Date(formattedTaskDate);
    offsetDate.setDate(offsetDate.getDate() + parseInt(dayOffset));
    const formattedDay = `${offsetDate.getFullYear()}-${String(offsetDate.getMonth() + 1).padStart(2, "0")}-${String(offsetDate.getDate()).padStart(2, "0")} 00:00:00`;

    const filterData = {
        day: formattedDay,
        searchDup: propFrom.value.searchDup,
        dayOffset: propFrom.value.dayOffset
    };

    const response = await reqAdxIfaDupUrl(filterData);
    if (response) {
        // 加载对比数据，保留基础数据
        compareData.value = processRawData(response, true);
        mergeTableData();
    }
};
/**
 * 处理原始数据，生成统一格式
 * @param data 接口返回的原始数据
 * @param isCompare 是否为对比数据
 */
const processRawData = (data: any, isCompare: boolean): any[] => {
    const result: any[] = [];
    // 先清空原有数据，防止数据累积
    cellDatas.value = [];
    for (const key in data) {
        const dataLine = data[key];
        const adxTotal = dataLine.count || 0;
        const adxFiltered = dataLine.filter || 0;
        const adxCountryItems = key.split("_");

        const itemCount = adxCountryItems.length;
        const adxPosEnd = 1 + itemCount - 3;

        const adx = adxCountryItems.slice(0, adxPosEnd).join("_");
        const country = adxCountryItems[adxPosEnd];
        const os = adxCountryItems[adxPosEnd + 1];
        const uniq = adxTotal - adxFiltered;
        let ratio: string | number;
        if (isCompare) {
            ratio = adxTotal == 0 ? "NA" : Math.floor(adxFiltered * 10000 / adxTotal) / 100;
        } else {
            ratio = Math.round((adxTotal > 0 ? (adxFiltered * 100 / adxTotal) : 100) * 100) / 100;
        }

        // 生成唯一 key，用于合并数据
        const rowKey = `${adx}_${country}_${os}`;

        result.push({
            key: rowKey,
            adx,
            country,
            os,
            count: adxTotal,
            uniq: uniq,
            filter: adxFiltered,
            ratio: ratio,
            isCompare: isCompare // 标记是否为对比数据
        });
    }
    return result;
};

/**
 * 合并基础数据和对比数据
 */
const mergeTableData = () => {
    // 使用 map 来提高查找 compareItem 的效率
    const compareDataMap = new Map(compareData.value.map(item => [item.key, item]));

    // 合并后的数据
    const merged: any[] = baseData.value.map(baseItem => {
        const compareItem = compareDataMap.get(baseItem.key);

        // 如果没有 compareItem 或 compareItem 不需要对比，使用默认值 null 或 0
        const mergedItem = {
            ...baseItem,
            compareCount: compareItem?.count ?? null,
            compareUniq: compareItem?.uniq ?? null,
            compareFilter: compareItem?.filter ?? null,
            compareRatio: compareItem?.ratio ?? null
        };

        // 如果对比标志为 true，则把默认值 0 替换为实际值
        if (compareItem?.isCompare) {
            mergedItem.compareCount = compareItem.count ?? 0;
            mergedItem.compareUniq = compareItem.uniq ?? 0;
            mergedItem.compareFilter = compareItem.filter ?? 0;
            mergedItem.compareRatio = compareItem.ratio ?? 0;
        }

        return mergedItem;
    });

    // 更新数据并触发相关事件
    mergedData.value = merged;
    tableDataList.value = merged;
    cellDatas.value = merged;

    // 如果有搜索条件，则触发模糊查询
    if (propFrom.value.searchDup !== "") {
        searchEvent();
    }
};
/**
 * Check 按钮事件（加载基础数据）
 */
const checkdupbtn = async () => {
    const filterData = {
        day: propFrom.value.taskdate,
        searchDup: propFrom.value.searchDup,
        dayOffset: propFrom.value.dayOffset
    };
    const response = await reqAdxIfaDupUrl(filterData);
    if (response) {
        // 加载基础数据，清空对比数据
        baseData.value = processRawData(response, false);
        compareData.value = [];
        mergeTableData();
    }
};
// 排序
// 定义数据项的类型
interface TableRow {
    [key: string]: any; // 根据实际数据结构定义
}
const sortConfig = ref<VxeTablePropTypes.SortConfig<any>>({
    sortMethod({ sortList }) {
        const sortItem = sortList[0]
        // let datas = JSON.parse(JSON.stringify(processedData.value))
        let datas = [...tableDataList.value] // 浅拷贝数组
        // 取出第一个排序的列
        const { field, order } = sortItem
        let list: any[] = []
        if (order === 'asc' || order === 'desc') {
            if (field === 'uniqRatio') {
                list = datas.sort((a: TableRow, b: TableRow) => {
                    const aVal = (isNaN(Number(a['ratio'])) ? Infinity : Number(a['ratio']))
                    const bVal = (isNaN(Number(b['ratio'])) ? Infinity : Number(b['ratio']))
                    return aVal === bVal ? 0 : (aVal > bVal ? 1 : -1)
                })
            } else if (field === 'count') {
                list = datas.sort((a: TableRow, b: TableRow) => {
                    const aVal = (isNaN(Number(a['count'])) ? Infinity : Number(a['count']))
                    const bVal = (isNaN(Number(b['count'])) ? Infinity : Number(b['count']))
                    return aVal === bVal ? 0 : (aVal > bVal ? 1 : -1)
                })
            } else if (field === 'uniq') {
                list = datas.sort((a: TableRow, b: TableRow) => {
                    const aVal = (isNaN(Number(a['uniq'])) ? Infinity : Number(a['uniq']))
                    const bVal = (isNaN(Number(b['uniq'])) ? Infinity : Number(b['uniq']))
                    return aVal === bVal ? 0 : (aVal > bVal ? 1 : -1)
                })
            } else if (field === 'filter') {
                list = datas.sort((a: TableRow, b: TableRow) => {
                    const aVal = (isNaN(Number(a['filter'])) ? Infinity : Number(a['filter']))
                    const bVal = (isNaN(Number(b['filter'])) ? Infinity : Number(b['filter']))
                    return aVal === bVal ? 0 : (aVal > bVal ? 1 : -1)
                })
            } else {
                list = datas.sort((a: TableRow, b: TableRow) => {
                    const aVal = a[field].toUpperCase()  // 转换为大写
                    const bVal = b[field].toUpperCase()  // 转换为大写
                    return aVal === bVal ? 0 : (aVal > bVal ? 1 : -1)
                })
            }
        }
        if (order === 'desc') {
            list.reverse()
        }

        // 返回一个新的数组，而不是直接修改 tableDataList.value
        return list
    }
})
</script>

<style scoped lang="scss">
.pushtask {
    width: 100%;
    height: calc(100vh - $base-tabbar-height - 10px);

    .pushtask_header {
        width: 100%;
        height: 7%;
        display: flex;
        align-items: center;

        .flex-row {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .flex-row-div {
                display: flex;
                align-items: center;

                /* 每一行输入框和拉框的样式 */
                .form-item {
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    margin: 0 10px;

                    /* 使标签和输入框对齐 */
                    .form-item-label {
                        font-weight: bold;
                        color: #606266;
                        margin: 0 10px;
                        text-align: left;
                        width: 100px;
                    }

                }
            }
        }
    }

    .pushtask_table {
        width: 100%;
        height: 90%;
        overflow: hidden;

        .vxe-table-div {
            height: 100%;

            .action-icons {
                display: flex;
                align-items: center;
                justify-content: center;

                .action-icon-svg {
                    margin: 0 5px;
                }
            }
        }
    }
}

.compare-item {
    font-size: 0.8rem;
    color: #666;
    margin-top: 2px;
}
</style>