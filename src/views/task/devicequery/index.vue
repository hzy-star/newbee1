<template>
    <div class="device-query">
        <div class="device-query-container">
            <!-- 查询表单 -->
            <el-form :model="formData" label-width="120px" class="query-form">
                <div class="form-item-container">
                    <!-- 日期部分 -->
                    <div class="form-item">
                        <el-form-item label="Data">
                            <!-- <el-input-group> -->
                            <el-input v-model="formData.baseDate" style="width: 55%" />
                            <el-input v-model="formData.dayStep" style="width: 40%" />
                            <!-- </el-input-group> -->
                        </el-form-item>
                    </div>

                    <!-- 其他字段 -->
                    <div class="form-item">
                        <el-form-item label="Hour">
                            <el-input v-model="formData.hour" />
                        </el-form-item>
                    </div>

                    <div class="form-item">
                        <el-form-item label="Adx">
                            <el-input v-model="formData.adx" />
                        </el-form-item>
                    </div>

                    <div class="form-item">
                        <el-form-item label="Country">
                            <el-input v-model="formData.country" />
                        </el-form-item>
                    </div>

                    <div class="form-item">
                        <el-form-item label="Channel">
                            <el-input v-model="formData.channel" />
                        </el-form-item>
                    </div>

                    <div class="form-item">
                        <el-form-item label="RTA-Name">
                            <el-select v-model="formData.rta_name">
                                <el-option label="Aliexpress" value="Aliexpress" />
                                <el-option label="Tiktok" value="Tiktok" />
                            </el-select>
                        </el-form-item>
                    </div>
                </div>

                <div class="form-item-container action-area">
                    <div class="form-item groupby-select">
                        <el-form-item label="GroupBy">
                            <el-select v-model="formData.groupby" multiple :popper-append-to-body="false">
                                <el-option v-for="item in groupOptions" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                    </div>

                    <div class="query-button">
                        <el-button type="primary" @click="handleQuery">查询</el-button>
                    </div>
                </div>
            </el-form>

            <!-- 数据表格 -->
            <div class="vxe-table-div">
                <vxe-table border auto-resize height="auto" show-overflow :data="tableData"
                    :row-config="{ keyField: 'id' }" :sort-config="sortConfig" @sort-change="handleSortChange">
                    <vxe-column type="seq" width="60" />
                    <vxe-column v-for="col in currentColumns" :key="col.field" :field="col.field" :title="col.title"
                        :sortable="col.sortable" />
                </vxe-table>
            </div>

            <!-- 分页 -->
            <div class="pagination-container">
                <span class="total-info">总数: {{ totalItems }}</span>
                <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.size"
                    :total="totalItems" layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handlePageChange" @size-change="handleSizeChange" />
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { reqRtaData } from '@/api/pushtask/rta_data'
import type { VxeTablePropTypes, VxeTableEvents } from 'vxe-pc-ui'

interface QueryForm {
    baseDate: string
    dayStep: string
    hour: string
    adx: string
    country: string
    channel: string
    rta_name: string
    groupby: string[]
}

interface Pagination {
    current: number
    size: number
}

interface SortItem {
    field: string
    order: 'asc' | 'desc' | null
}

interface TableDataItem {
    day: string
    scount: number
    fcount: number
    successRate: number
    //   [key: string]: any // 允许动态字段
}

// 响应式数据
const formData = reactive<QueryForm>({
    baseDate: '',
    dayStep: '-1',
    hour: '',
    adx: '',
    country: '',
    channel: '',
    rta_name: 'Aliexpress',
    groupby: ['day']
})

const tableData = ref<TableDataItem[]>([])
const totalItems = ref(0)
const currentSorts = ref<SortItem[]>([])

const sortConfig = ref<VxeTablePropTypes.SortConfig>({
    multiple: true,
    chronological: true
})

const pagination = reactive<Pagination>({
    current: 1,
    size: 10
})

const groupOptions = [
    { value: 'day', label: 'Day' },
    { value: 'hour', label: 'Hour' },
    { value: 'adx', label: 'Adx' },
    { value: 'country', label: 'Country' },
    { value: 'channel', label: 'Channel' },
]

// 计算当前列配置
const currentColumns = computed(() => {
    if (tableData.value.length === 0) return []

    const firstRow = tableData.value[0]
    return Object.keys(firstRow)
        .filter(key => key !== 'id') // ✅ 过滤掉不要展示的字段
        .map(key => ({
            field: key,
            title: key,
            sortable: true
        }))
})

// 初始化默认值
onMounted(() => {
    formData.baseDate = formatDate(new Date(), 'YYYY-MM-DD')
})

// 处理查询
const handleQuery = async () => {
    if (formData.groupby.length === 0) {
        ElMessage.warning('请至少选择一个分组方式！')
        return
    }

    try {
        const params = buildQueryParams()
        const data = await reqRtaData(params)
        // 遍历每条数据，把每一条的所有字段值拼接起来生成 id 字段
        const processedData = data.data.map((item: any) => {
            const id = Object.values(item).join('_')  // 也可以用其他连接符，比如 '-'
            return {
                ...item,
                id
            }
        })
        tableData.value = processedData
        totalItems.value = data.total
        // pagination.current = data.totalPages
    } catch (error) {
        console.error('查询失败:', error)
        ElMessage.error('查询失败')
    }
}

// 构建查询参数
const buildQueryParams = () => {
    const days = calculateDays(formData.baseDate, formData.dayStep)

    const filters = {
        ...(formData.adx && { adx: formData.adx.split(',') }),
        ...(formData.hour && { hour: formData.hour.split(',') }),
        ...(formData.channel && { channel: formData.channel.split(',') }),
        ...(formData.country && { country: formData.country.split(',') }),
        ...(days && days.length > 0 && { day: days }),
        ...(formData.rta_name && { rta_name: [formData.rta_name] })
    }

    return {
        ...(Object.keys(filters).length > 0 && { filters }),
        groupBy: formData.groupby.join(','),
        page: pagination.current,
        limit: pagination.size,
        orderBy: currentSorts.value
            .filter(item => item.order)
            .map(item => item.order === 'desc' ? `${item.field} ${item.order}` : item.field)
            .join(',')
    }
}

// 处理排序变化
const handleSortChange: VxeTableEvents.SortChange = ({ field, order }) => {
    const existingIndex = currentSorts.value.findIndex(item => item.field === field)

    if (existingIndex > -1) {
        if (order) {
            currentSorts.value[existingIndex].order = order
        } else {
            currentSorts.value.splice(existingIndex, 1)
        }
    } else if (order) {
        currentSorts.value.push({ field, order })
    }
    handleQuery()
}

// 分页处理
const handlePageChange = (newPage: number) => {
    pagination.current = newPage
    handleQuery()
}

const handleSizeChange = (newSize: number) => {
    pagination.size = newSize
    pagination.current = 1
    handleQuery()
}

// 工具函数
const formatDate = (date: Date, format: string): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return format
        .replace('YYYY', year.toString())
        .replace('MM', month)
        .replace('DD', day)
}

const calculateDays = (baseDate: string, dayStep: string): string[] => {
    const days: string[] = []
    if (!baseDate) return days

    days.push(baseDate.replace(/-/g, ''))
    const stepNum = parseInt(dayStep)

    if (isNaN(stepNum)) return days

    const step = stepNum >= 0 ? 1 : -1
    for (let i = 0; i !== stepNum; i += step) {
        const newDate = new Date(baseDate)
        newDate.setDate(newDate.getDate() + i + step)
        days.push(formatDate(newDate, 'YYYYMMDD'))
    }

    return days
}
</script>
<style scoped lang="scss">
.device-query {
    width: 100%;
    height: calc(100vh - $base-tabbar-height - 10px);

    .device-query-container {
        padding: 5px;
        height: 100%;
        display: flex;
        flex-direction: column;

        // 查询表单区域
        .query-form {
            margin-bottom: 10px;

            .form-item-container {
                display: flex;
                flex-wrap: wrap;
                // gap: 16px;

                .form-item {
                    flex: 1 1 300px;
                    height: 35px;
                }

                .groupby-select {
                    flex: 2;
                }
            }

            .action-area {
                display: flex;
                justify-content: space-between;
                // align-items: center;
                // margin-top: 10px;

                .query-button {
                    display: flex;
                    justify-content: flex-end;
                }
            }
        }

        // 表格区域
        .vxe-table-div {
            flex: 1;
            overflow: auto;
        }

        // 分页区域
        .pagination-container {
            margin-top: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .total-info {
                font-size: 14px;
                color: #666;
            }
        }
    }
}
</style>