<template>
    <div class="pushtask">
        <div class="pushtask_header">
            <!-- 查询条件 -->
            <div class="flex-row">
                <div class="flex-row-div">
                    <div class="form-item" style="min-width: 300px;">
                        <el-date-picker v-model="propFrom.dateTime" type="daterange" range-separator="To"
                            start-placeholder="Start date" end-placeholder="End date" :clearable="false" />
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
                    <div class="form-item" style="min-width: 200px;">
                        <div class="form-item-label">ES</div>
                        <el-select v-model="propFrom.es">
                            <el-option label="public" value="public" />
                            <el-option label="private" value="private" />
                        </el-select>
                    </div>
                    <div class="form-item">
                        <div class="form-item-label">Pkg</div>
                        <el-input v-model="propFrom.pkg_name" placeholder="Pkg" />
                    </div>
                    <div class="form-item" style="min-width: 200px;">
                        <div class="form-item-label">Dimension</div>
                        <el-select v-model="propFrom.dimensions" filterable multiple :multiple-limit="2" placeholder="Select"
                            style="width: 240px" >
                            <el-option label="source" value="source" />
                            <el-option label="Adx" value="adx" />
                            <el-option label="Country" value="country" />
                            <el-option label="Os" value="os" />
                            <el-option label="Day" value="day" />
                            <el-option label="PkgName" value="pkgName" />
                            <el-option label="Detail" value="detail" />
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
import { propFormInter } from '@/api/traffic/pullDevice/type'
import { reqPullDeviceUrl } from '@/api/traffic/pullDevice'
import { getCookies } from '@/utils/common'
import type { VxeTableInstance } from 'vxe-table'
import moment from 'moment';
// 获取group
const group = ref(getCookies('group'))

// 表单数据
const propFrom = ref<propFormInter>({
    dateTime: [] as Date[], // 初始化为空数组
    source: '',
    adx: '',
    country: '',
    os: '',
    es: 'public',
    pkg_name: '',
    dimensions: []
});
// 表格数据
const tableDataList = ref<any[]>([]);
// 动态表格
const columns = ref<any[]>([]);
// 查询
const handleQuery = async () => {
    let params: any = {
        metrics: ['recordCount']  // 默认添加 metrics
    };
    debugger
    // 添加日期范围参数，如果日期为空则不传
    if (propFrom.value.dateTime[0] && propFrom.value.dateTime[1]) {
        params.startDate = moment(propFrom.value.dateTime[0]).format('YYYY-MM-DD'); // 格式化日期
        params.endDate = moment(propFrom.value.dateTime[1]).format('YYYY-MM-DD'); // 格式化日期
    }
    // 添加其他查询字段，如果为空则不传
    if (propFrom.value.source) params.source = propFrom.value.source;
    if (propFrom.value.adx) params.adx = propFrom.value.adx;
    if (propFrom.value.country) params.country = propFrom.value.country;
    if (propFrom.value.os) params.os = propFrom.value.os;
    if (propFrom.value.pkg_name) params.pkg_name = propFrom.value.pkg_name;
    // 判断维度是否选择了，如果选择了就加上
    params.dimensions = propFrom.value.dimensions;
    // ES字段特殊处理：外层的es传递的是选择的值
    if (propFrom.value.es === 'private') {
        params.es = group.value === 'ym' ? 'yeahmobi' : 'gridads';
    } else {
        params.es = 'public';
    }
    // 将条件封装在query中，但不传 dimensions 和 metrics
    let query: any = {
        startDate: params.startDate,
        endDate: params.endDate,
        source: params.source,
        adx: params.adx,
        country: params.country,
        os: params.os,
        pkg_name: params.pkg_name,
        es: (propFrom.value.es === 'private')
            ? (group.value === 'ym' ? 'yeahmobi' : 'gridads')
            : 'public'
    };
    // 将 query 包装到 params 中
    params.query = { ...query };
    // 请求接口
    tableDataList.value = await reqPullDeviceUrl(params);
    if (tableDataList.value.length > 0) {
        columns.value = Object.keys(tableDataList.value[0]).map((key) => ({
            field: key,
            title: key,
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
    const today = new Date();
    propFrom.value.dateTime = [today, today];
    nextTick(()=>{
        propFrom.value.dimensions = ['source']
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