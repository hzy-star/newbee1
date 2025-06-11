<template>
    <div class="pushtask">
        <div class="pushtask_header">
            <!-- 查询条件 -->
            <div class="flex-row">
                <div class="flex-row-div">
                    <div class="form-item" style="min-width: 200px;">
                        <div class="form-item-label">Range</div>
                        <el-select v-model="propFrom.range">
                            <el-option label="7天" value="day" />
                            <el-option label="三小时" value="hour" />
                            <el-option label="一个月" value="month" />
                        </el-select>
                    </div>
                    <div class="form-item">
                        <div class="form-item-label">Source</div>
                        <el-input v-model="propFrom.source" placeholder="Source" />
                    </div>
                    <div class="form-item">
                        <div class="form-item-label">Adx</div>
                        <el-input v-model="propFrom.adx" placeholder="Adx" />
                    </div>
                    <div class="form-item">
                        <div class="form-item-label">Country</div>
                        <el-input v-model="propFrom.country" placeholder="Country" />
                    </div>
                    <div class="form-item">
                        <div class="form-item-label">Os</div>
                        <el-input v-model="propFrom.os" placeholder="Os" />
                    </div>
                    <div class="form-item">
                        <div class="form-item-label">Pkg</div>
                        <el-input v-model="propFrom.pkg_name" placeholder="Pkg" />
                    </div>
                    <div class="form-item" style="min-width: 200px;">
                        <div class="form-item-label">Dimension</div>
                        <el-select v-model="propFrom.dimensions" filterable multiple :multiple-limit="2" placeholder="Select"
                            style="width: 240px" >
                            <el-option label="Country" value="country" />
                            <el-option label="Os" value="os" />
                            <el-option label="Adx" value="adx" />
                            <el-option label="source" value="s" />
                            <el-option label="PkgName" value="pkg_name" />
                            <!-- <el-option label="Day" value="day" /> -->
                        </el-select>
                    </div>
                    <div class="form-item">
                        <el-button type="primary" @click="handleQuery">Query</el-button>
                    </div>
                </div>
            </div>
        </div>
        <!-- 数据表格 -->
        <div class="pushtask_table">
            <div class="vxe-table-div">
                <vxe-table border auto-resize height="auto" :column-config="{ resizable: true }"
                    :cell-config="{ verticalAlign: 'center' }" :row-config="{ isCurrent: false, isHover: true }"
                    :scroll-y="{ enabled: true, gt: 50 }" :data="tableDataList" ref="tableRef" size="mini" round>
                    <vxe-column v-if="tableDataList.length > 0" field="xh" type="seq" align="center" show-header-overflow width="6%">
                        <template #header>
                        <div style="display: flex; align-items: center; justify-content: center;">
                            <svg-icon name="csvExport" width="15px" height="15px" @click="exportToCSV" title="csv"></svg-icon>
                        </div>
                        </template>
                    </vxe-column>
                    <!-- 动态生成列 -->
                    <vxe-column v-for="col in columns" :key="col.field" :field="col.field" :title="col.title"
                        show-header-overflow></vxe-column>
                </vxe-table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { propFormInter } from '@/api/dataPresentation/clickhouseDevice/type'
import { reqPullDeviceUrl } from '@/api/dataPresentation/clickhouseDevice'
import type { VxeTableInstance } from 'vxe-table'

// 表单数据
const propFrom = ref<propFormInter>({
    source: '',
    adx: '',
    country: '',
    os: '',
    range: 'day',
    pkg_name: '',
    dimensions: []
});
// 表格数据
const tableDataList = ref<any[]>([])
// 动态表格
const columns = ref<any[]>([]);
// 查询
interface FieldPriority {
    recordCount?: number;
    // 其他可能的有特殊排序需求的字段
    [key: string]: number | undefined; // 索引签名
}

const handleQuery = async () => {
    let params: any = {};
    // 将条件封装在query中，但不传 dimensions 和 metrics
    params.filters = {
        s: propFrom.value.source ? propFrom.value.source : '',
        adx: propFrom.value.adx ? propFrom.value.adx : '',
        country: propFrom.value.country ? propFrom.value.country : '',
        os: propFrom.value.os ? propFrom.value.os : '',
        pkg_name: propFrom.value.pkg_name ? propFrom.value.pkg_name : '',
    };
    // 将 query 包装到 params 中
    params.groupBys = propFrom.value.dimensions
    params.range = propFrom.value.range;
    let deviceData = await reqPullDeviceUrl(params);
    tableDataList.value = deviceData.data;
    debugger
    if (deviceData.code == 200) {
        const fieldPriority:FieldPriority = {
            'recordCount': 1,  // 最高优先级
            // 可以添加其他需要特殊排序的字段
        };
        
        columns.value = Object.keys(deviceData.data[0])
            .map(key => ({
                field: key,
                title: key,
                priority: fieldPriority[key] || 999 // 默认优先级
            }))
            .sort((a, b) => a.priority - b.priority)
            .map(item => ({
                field: item.field,
                title: item.title
            }));
    }
}

const tableRef = ref<VxeTableInstance>()
// csv导出
const exportToCSV = () => {
  const $table = tableRef.value
  if ($table) {
    $table.exportData({
      type: 'csv',  // 导出类型
      filename:'pull_device',   // 文件名
      message: false,   //是否显示内置的消息提示
    })
  }
}

onMounted(() => {
    // 设置初始日期为当前本地日期（避免时区偏差）
    nextTick(()=>{
        propFrom.value.dimensions = ['s']
    })
});
</script>

<style scoped lang="scss">
.pushtask {
    width: 100%;
    display: flex;
    flex-direction: column;
    height: calc(100vh - $base-tabbar-height - 10px);

    .pushtask_header {
        width: 100%;

        flex-shrink: 0;

        .flex-row {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .flex-row-div {
                display: flex;
                align-items: center;
                // 超出自动换行
                flex-wrap: wrap;
                width: 100%;

                /* 每一行输入框和拉框的样式 */
                .form-item {
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    margin: 5px 10px;

                    /* 使标签和输入框对齐 */
                    .form-item-label {
                        font-weight: bold;
                        color: #606266;
                        margin: 0 10px;
                        text-align: left;
                    }

                }

                .form-item:last-child {
                    margin-left: auto;
                    /* 将最后一个元素推到右侧 */
                }

            }
        }
    }

    .pushtask_table {
        width: 100%;

        flex: 1;
        /* 占据剩余空间 */
        overflow: auto;

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
</style>