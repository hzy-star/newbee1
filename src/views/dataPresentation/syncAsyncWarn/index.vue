<template>
    <div class="container">
        <div class="top-section">
            <div class="filter-item">
                <el-date-picker v-model="day" type="date" placeholder="选择日期" format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD" :disabled-date="disabledDate" />
            </div>
            <div class="filter-item">
                <el-input-number v-model="percent" controls-position="right" placeholder="请输入差异比" :min="0" :step="0.1"
                    :precision="1" />
            </div>
            <div class="filter-item">
                <el-input v-model="country" placeholder="请输入国家" />
            </div>
            <div class="filter-item">
                <el-input v-model="pkg" placeholder="请输入包名" />
            </div>
            <div class="filter-item">
                <el-checkbox-group v-model="groupBy">
                    <el-checkbox label="country">按国家</el-checkbox>
                    <el-checkbox label="pkg">按包名</el-checkbox>
                </el-checkbox-group>
            </div>
            <div class="filter-item">
                <el-button type="primary" @click="queryData">查询</el-button>
            </div>
        </div>

        <div class="table-section">
            <!-- 添加 :row-hover="noop" 属性 -->
            <el-table 
                :data="tableData" 
                border 
                :span-method="mergeCells" 
                :row-class-name="tableRowClassName"
                style="width: 100%"
                :row-hover="noop"
            >
                <!-- 固定列顺序 -->
                <!-- ✅ 固定顺序：先国家 -->
                <el-table-column v-if="showColumns && activeGroupBy.includes('country')" prop="country" label="国家"
                    width="120" align="center" />

                <!-- ✅ 然后包名 -->
                <el-table-column v-if="showColumns && activeGroupBy.includes('pkg')" prop="pkg" label="包名" width="180"
                    align="center" />

                <!-- ✅ 再发送方式 -->
                <el-table-column prop="sendType" label="发送方式" width="100" align="center" />

                <el-table-column prop="clicks" label="点击数" align="right" />
                <el-table-column prop="convs" label="转化数" align="right" />
                <el-table-column prop="convRatio" label="转化比" align="right" />
            </el-table>
        </div>
    </div>
</template>

<script setup lang="ts">
// 同步异步转化率差异告警页面
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { TableColumnCtx } from 'element-plus'
import { reqConvWarnUrl } from '@/api/dataPresentation/syncAsyncWarn';

// 添加空函数用于禁用悬停效果
const noop = () => {};

interface ResponseData {
    country: string
    sync_conv_ratio: string
    async_clicks: string
    async_conv_ratio: string
    pkg_name: string
    async_convs: string
    sync_clicks: string
    sync_convs: string
}

interface TableRow {
    country?: string
    pkg?: string
    sendType: string
    clicks: string
    convs: string
    convRatio: string
    groupIndex: number
}

interface SpanMethodProps {
    row: TableRow
    column: TableColumnCtx<TableRow>
    rowIndex: number
    columnIndex: number
}

const day = ref('')
const percent = ref(0.5)
const country = ref('')
const pkg = ref('')
const groupBy = ref<string[]>(['country']) // 用户勾选的值
const activeGroupBy = ref<string[]>([]) // 实际用于控制列显示的值
const tableData = ref<TableRow[]>([])
const showColumns = ref(false) // 控制是否展示列

const getYesterday = (): string => {
    const date = new Date()
    date.setDate(date.getDate() - 1)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

const disabledDate = (time: Date): boolean => {
    return time.getTime() > Date.now() - 8.64e7
}

day.value = getYesterday()


// 查询数据
const queryData = async (): Promise<void> => {
    if (!day.value) {
        ElMessage.warning('请选择日期')
        return
    }
    if (percent.value <= 0) {
        ElMessage.warning('差异比必须大于0')
        return
    }
    if (groupBy.value.length === 0) {
        ElMessage.warning('请至少选择一个分组方式')
        return
    }

    showColumns.value = false
    tableData.value = []

    try {
        const params = {
            day: day.value,
            percent: percent.value,
            byPkg: groupBy.value.includes('pkg'),
            byCountry: groupBy.value.includes('country'),
            pkg: pkg.value.trim(),
            country: country.value.trim()
        };
        const response = await reqConvWarnUrl(params)

        if (response.code === 200 && response.data) {
            activeGroupBy.value = [...groupBy.value] // ✅ 冻结当前显示列配置
            showColumns.value = true // ✅ 允许显示列
            processTableData(response.data)
            ElMessage.success('数据加载成功')
        } else {
            ElMessage.error('获取数据失败')
        }
    } catch (err) {
        console.error(err)
        ElMessage.error('获取数据失败')
    }
}

// 构建表格数据
const processTableData = (responseData: ResponseData[]): void => {
    const data: TableRow[] = []
    responseData.forEach((item, index) => {
        const base = {
            groupIndex: index,
            country: item.country,
            pkg: item.pkg_name
        }

        data.push({
            ...base,
            sendType: '同步',
            clicks: item.sync_clicks,
            convs: item.sync_convs,
            convRatio: item.sync_conv_ratio
        })

        data.push({
            ...base,
            sendType: '异步',
            clicks: item.async_clicks,
            convs: item.async_convs,
            convRatio: item.async_conv_ratio
        })
    })

    tableData.value = data
}

// 合并单元格
const mergeCells = ({ row, column, rowIndex }: SpanMethodProps): [number, number] | void => {
    const field = column.property

    if (
        (field === 'country' && activeGroupBy.value.includes('country')) ||
        (field === 'pkg' && activeGroupBy.value.includes('pkg'))
    ) {
        // 只在第一行显示
        if (rowIndex % 2 === 0) {
            return [2, 1]
        } else {
            return [0, 0]
        }
    }
}

// 行类名
const tableRowClassName = ({ row }: { row: TableRow }): string => {
    return row.groupIndex % 2 === 0 ? 'even-row' : 'odd-row'
}
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
  background-color: #86dcb7;
}

:deep(.odd-row) {
  background-color: #ffffff;
}

/* 完全禁用悬停效果 */
:deep(.el-table) {
  --el-table-row-hover-bg-color: transparent !important;
}

:deep(.el-table__body tr:hover > td) {
  background-color: inherit !important;
}

:deep(.el-table__body tr.hover-row > td) {
  background-color: inherit !important;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: inherit !important;
}

/* 多选框布局优化 */
.filter-item :deep(.el-checkbox-group) {
  display: flex;
  flex-direction: row;
  gap: 10px;
}
</style>