<template>
    <el-dialog :model-value="modelValue" :title="title" align-center @close="handleClose" width="70%"
        :close-on-click-modal="false" draggable>
        <div style="height: 85vh; ">
            <vxe-table border height="100%" auto-resize :cell-config="{ verticalAlign: 'center' }"
                 :data="tableDataList" ref="tableRef">
                <vxe-column field="TaskInfo" title="TaskInfo" align="center" width="20%">
                    <template #default="{ row }">
                        <div class="device-box">
                            <div class="device-text" :title="!!row.pkgtaskId ? (row.pkgtaskId) : '-'"><span
                                    class="device-span">task:</span> {{ !!row.pkgtaskId ? (row.pkgtaskId) : '-'
                                }}</div>
                            <div class="device-text" :title="!!row.appId ? (row.appId) : '-'"><span
                                    class="device-span">app:</span> {{ !!row.appId ? truncateText(row.appId) : '-'
                                }}
                            </div>
                            <div class="device-text" :title="!!row.pkgName ? (row.pkgName) : '-'"><span
                                    class="device-span">pkgName:</span> {{ !!row.pkgName ?
                                        truncateText(row.pkgName) : '-' }}</div>
                            <div class="device-text" :title="!!row.offers ? (row.offers) : '-'"><span
                                    class="device-span">offers:</span> {{ !!row.offers ?
                                        truncateText(row.offers) : '-' }}</div>
                        </div>
                    </template>
                </vxe-column>
                <vxe-column field="Status" title="Status" align="center" width="6%">
                    <template #default="{ row }">
                        {{ !!row?.status ? filterStatus(row.status) : '' }}
                    </template>
                </vxe-column>
                <vxe-column field="max" title="Max" align="center" width="10%"></vxe-column>
                <vxe-column field="DeviceCount" title="DeviceCount" align="center" width="10%">
                    <template #default="{ row }">
                        <div class="device-box">
                            <div class="device-text"><span class="device-span">hit:</span> {{ row.hitCount }}</div>
                            <div class="device-text"><span class="device-span">query:</span> {{ row.queryCount }}</div>
                            <div class="device-text"><span class="device-span">valid:</span> {{ row.validCount }}</div>
                        </div>
                    </template>
                </vxe-column>
                <vxe-column field="Time" title="Time" align="center" width="17%">
                    <template #default="{ row }">
                        <div class="device-box">
                            <div class="device-text"><span class="device-span">start:</span> {{ row.startTime || '' }}
                            </div>
                            <div class="device-text"><span class="device-span">send:</span> {{ row.sendTime || '' }}
                            </div>
                            <div class="device-text"><span class="device-span">end:</span> {{ row.endTime || '' }}</div>
                        </div>
                    </template>
                </vxe-column>
                <vxe-column field="Click(Imp)Count" title="Click(Imp)Count" align="center" width="17%">
                    <template #default="{ row }">
                        <div class="device-box">
                            <div class="device-text"><span class="device-span">sent:</span> {{ row.sendCount || '' }}
                            </div>
                            <div class="device-text"><span class="device-span">succ:</span> {{ row.succCount || '' }}
                            </div>
                            <div class="device-text" ><span class="device-span">Details:</span>
                                <div v-html="resultEval(row)" style="margin-left: 5px;"></div>
                            </div>
                        </div>
                    </template>
                </vxe-column>
                <vxe-column field="Filter" title="Filter" header-align="center" width="20%">
                    <template #default="{ row }">
                        <div class="filter-container">
                            <template v-for="(item) in parseFilters(row)" :key="index">
                                <div class="filter-item">
                                    <span class="filter-label">{{ item.key }}:</span>
                                    <span class="filter-value">{{ item.value }}</span>
                                </div>
                            </template>
                        </div>
                    </template>
                </vxe-column>
            </vxe-table>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue';
import { reqHistoryUrl } from '@/api/pushtask/autoPkgTask';
import { historyDataType } from './type';
import { truncateText } from '@/utils/common'; // 直接导入默认对象并调用truncateText
import autoRunningStatus from '@/views/task/autopkgtask/hooks/autoRunningStatus'
const {
    filterStatus
} = autoRunningStatus()
const props = defineProps({
    modelValue: Boolean,
    title: String,
    historyId: {
        type: String,
        default: () => '',
    },
})
const resultEval = (row: any) => {
    let curJvmStatusDetail = []
    if (!!row.resultDetail) {
        let resultDetail = eval("(" + row.resultDetail + ")");
        for (let i in resultDetail) {
            let fitem = resultDetail[i];
            curJvmStatusDetail.push("<b style='color: #878484'>" + i.replaceAll("<", "").replaceAll(">", "") + ":</b>" + fitem);
        }
    }
    return curJvmStatusDetail.join("<br>");
}

const parseFilters = (row: any) => {
    try {
        const result = [];
        const filters = JSON.parse(row.filters || '{}');

        Object.entries(filters).forEach(([key, value]) => {
            if (typeof value === 'string' && value.startsWith('{')) {
                try {
                    const nestedValue = JSON.parse(value);
                    const formattedValue = Object.entries(nestedValue)
                        .map(([k, v]) => `${k}:${v}`)
                        .join(',');
                    result.push({ key, value: formattedValue !== 'null' ? formattedValue : '-' });
                } catch {
                    result.push({ key, value: value !== 'null' ? value : '-' });
                }
            } else {
                result.push({ key, value: value !== 'null' ? value : '-' });
            }
        });

        // 添加额外的字段
        result.push({ key: 'bsClick', value: row.bsclick });
        result.push({ key: 'dualHour', value: row.hour });

        return result;
    } catch (error) {
        console.error('Error parsing filters:', error);
        return [];
    }
}
const tableDataList = reactive<historyDataType[]>([])
const emit = defineEmits(['update:modelValue'])
const handleClose = () => {
    emit('update:modelValue', false)
}
watch(() => props.modelValue, async (val) => {
    if (val) {
        let params = {
            pkgTaskId: props.historyId,
            days: 2
        }
        let res = await reqHistoryUrl(params)
        tableDataList.length = 0
        tableDataList.push(...res.data)
        tableDataList.sort(function (x, y) {
            return x.startTime == y.startTime ? 0 : (
                x.startTime > y.startTime ? -1 : 1
            );
        });
    }
})
</script>

<style scoped lang="scss">
:deep(.filter-label) {
    font-size: 15px;
    font-weight: bold;
    display: inline-block;
}

.device-box {
    display: flex;
    flex-direction: column;
    gap: 5px;
    text-align: left;

    .device-text {}

    .device-span {
        font-weight: bold;
    }
}

.filter-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
    padding: 8px;
}

.filter-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.filter-label {
    font-weight: bold;
    color: #606266;
    min-width: 80px;
}

.filter-value {
    color: #333;
    text-overflow: ellipsis;
}
</style>
