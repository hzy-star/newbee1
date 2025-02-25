<template>
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
                        <el-select v-model="formData.rta_name" >
                            <el-option label="Aliexpress" value="Aliexpress" />
                            <el-option label="Tiktok" value="Tiktok" />
                        </el-select>
                    </el-form-item>
                </div>
            </div>

            <div class="form-item-container action-area">
                <div class="form-item groupby-select">
                    <el-form-item label="GroupBy">
                        <el-select 
                            v-model="formData.groupby" 
                            multiple 
                            collapse-tags 
                            :popper-append-to-body="false"
                        >
                            <el-option 
                                v-for="item in groupOptions" 
                                :key="item.value" 
                                :label="item.label"
                                :value="item.value" 
                            />
                        </el-select>
                    </el-form-item>
                </div>

                <div class="query-button">
                    <el-button type="primary" @click="handleQuery">查询</el-button>
                </div>
            </div>
        </el-form>

        <!-- 数据表格 -->
        <vxe-table border show-overflow :data="tableData" :sort-config="sortConfig" @sort-change="handleSortChange">
            <vxe-column type="seq" width="60" />
            <vxe-column v-for="col in currentColumns" :key="col.field" :field="col.field" :title="col.title"
                :sortable="col.sortable" />
        </vxe-table>

        <!-- 分页 -->
        <div class="pagination-container">
            <span class="total-info">总数: {{ totalItems }}</span>
            <el-pagination 
                v-model:current-page="pagination.current" 
                v-model:page-size="pagination.size"
                :total="totalItems" 
                layout="total, sizes, prev, pager, next, jumper" 
                @current-change="handlePageChange"
                @size-change="handleSizeChange" 
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue'
import type { VxeSortProp } from 'vxe-table'
import { ElMessage } from 'element-plus'
import axios from 'axios'

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

// 响应式数据
const formData = reactive<QueryForm>({
    baseDate: '',
    dayStep: '-1',
    hour: '',
    adx: '',
    country: '',
    channel: '',
    rta_name: 'Aliexpress',
    groupby: []
})

const tableData = ref<any[]>([])
const totalItems = ref(0)
// 修改sortConfig以支持多列排序
const sortConfig = reactive({
    trigger: 'default',
    multiple: true, // 启用多列排序
    sort: [] as Array<{ field: string; order: 'asc' | 'desc' }>
})
const currentSorts = ref<SortItem[]>([])

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
    return Object.keys(tableData.value[0]).map(key => ({
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
        //   const { data } = await postRequest('rta/count', params)
        const data = {
            "total": 34,
            "totalPages": 1,
            "data": [
                {
                    "day": "20250220",
                    "hour": "00",
                    "scount": 3424,
                    "fcount": 36288,
                    "successRate": 0.0862
                },
                {
                    "day": "20250220",
                    "hour": "01",
                    "scount": 3364,
                    "fcount": 37108,
                    "successRate": 0.0831
                },
                {
                    "day": "20250220",
                    "hour": "02",
                    "scount": 3738,
                    "fcount": 40046,
                    "successRate": 0.0854
                },
                {
                    "day": "20250220",
                    "hour": "03",
                    "scount": 4034,
                    "fcount": 44265,
                    "successRate": 0.0835
                },
                {
                    "day": "20250220",
                    "hour": "04",
                    "scount": 3932,
                    "fcount": 45593,
                    "successRate": 0.0794
                },
                {
                    "day": "20250220",
                    "hour": "05",
                    "scount": 4092,
                    "fcount": 47947,
                    "successRate": 0.0786
                },
                {
                    "day": "20250220",
                    "hour": "06",
                    "scount": 3715,
                    "fcount": 46268,
                    "successRate": 0.0743
                },
                {
                    "day": "20250220",
                    "hour": "07",
                    "scount": 3438,
                    "fcount": 43762,
                    "successRate": 0.0728
                },
                {
                    "day": "20250220",
                    "hour": "08",
                    "scount": 3325,
                    "fcount": 43286,
                    "successRate": 0.0713
                },
                {
                    "day": "20250220",
                    "hour": "09",
                    "scount": 2917,
                    "fcount": 36314,
                    "successRate": 0.0744
                },
                {
                    "day": "20250220",
                    "hour": "10",
                    "scount": 3438,
                    "fcount": 44227,
                    "successRate": 0.0721
                },
                {
                    "day": "20250220",
                    "hour": "11",
                    "scount": 3359,
                    "fcount": 44590,
                    "successRate": 0.0701
                },
                {
                    "day": "20250220",
                    "hour": "12",
                    "scount": 3481,
                    "fcount": 43413,
                    "successRate": 0.0742
                },
                {
                    "day": "20250220",
                    "hour": "13",
                    "scount": 3311,
                    "fcount": 40998,
                    "successRate": 0.0747
                },
                {
                    "day": "20250220",
                    "hour": "14",
                    "scount": 3335,
                    "fcount": 38966,
                    "successRate": 0.0788
                },
                {
                    "day": "20250220",
                    "hour": "15",
                    "scount": 3152,
                    "fcount": 35789,
                    "successRate": 0.0809
                },
                {
                    "day": "20250220",
                    "hour": "16",
                    "scount": 2808,
                    "fcount": 30549,
                    "successRate": 0.0842
                },
                {
                    "day": "20250220",
                    "hour": "17",
                    "scount": 2792,
                    "fcount": 27841,
                    "successRate": 0.0911
                },
                {
                    "day": "20250220",
                    "hour": "18",
                    "scount": 2563,
                    "fcount": 24823,
                    "successRate": 0.0936
                },
                {
                    "day": "20250220",
                    "hour": "19",
                    "scount": 2420,
                    "fcount": 22026,
                    "successRate": 0.099
                },
                {
                    "day": "20250220",
                    "hour": "20",
                    "scount": 2834,
                    "fcount": 24646,
                    "successRate": 0.1031
                },
                {
                    "day": "20250220",
                    "hour": "21",
                    "scount": 2196,
                    "fcount": 23897,
                    "successRate": 0.0842
                },
                {
                    "day": "20250220",
                    "hour": "22",
                    "scount": 2205,
                    "fcount": 26764,
                    "successRate": 0.0761
                },
                {
                    "day": "20250220",
                    "hour": "23",
                    "scount": 2600,
                    "fcount": 31389,
                    "successRate": 0.0765
                },
                {
                    "day": "20250221",
                    "hour": "00",
                    "scount": 3586,
                    "fcount": 37417,
                    "successRate": 0.0875
                },
                {
                    "day": "20250221",
                    "hour": "01",
                    "scount": 3616,
                    "fcount": 37269,
                    "successRate": 0.0884
                },
                {
                    "day": "20250221",
                    "hour": "02",
                    "scount": 3586,
                    "fcount": 39265,
                    "successRate": 0.0837
                },
                {
                    "day": "20250221",
                    "hour": "03",
                    "scount": 3822,
                    "fcount": 42617,
                    "successRate": 0.0823
                },
                {
                    "day": "20250221",
                    "hour": "04",
                    "scount": 3835,
                    "fcount": 45013,
                    "successRate": 0.0785
                },
                {
                    "day": "20250221",
                    "hour": "05",
                    "scount": 3678,
                    "fcount": 44886,
                    "successRate": 0.0757
                },
                {
                    "day": "20250221",
                    "hour": "06",
                    "scount": 3420,
                    "fcount": 44143,
                    "successRate": 0.0719
                },
                {
                    "day": "20250221",
                    "hour": "07",
                    "scount": 3467,
                    "fcount": 43145,
                    "successRate": 0.0744
                },
                {
                    "day": "20250221",
                    "hour": "08",
                    "scount": 3142,
                    "fcount": 37267,
                    "successRate": 0.0778
                },
                {
                    "day": "20250221",
                    "hour": "09",
                    "scount": 1036,
                    "fcount": 12986,
                    "successRate": 0.0739
                }
            ]
        }
        debugger
        tableData.value = data.data
        totalItems.value = data.total
        pagination.current = data.currentPage
    } catch (error) {
        ElMessage.error('查询失败')
    }
}

// 构建查询参数
const buildQueryParams = () => {
    const days = calculateDays(formData.baseDate, formData.dayStep)

    return {
        filters: {
            adx: formData.adx,
            hour: formData.hour,
            channel: formData.channel,
            country: formData.country.split(','),
            day: days,
            rta_name: [formData.rta_name]
        },
        groupBy: formData.groupby.join(','),
        page: pagination.current,
        limit: pagination.size,
        orderBy: currentSorts.value
            .filter(item => item.order)
            .map(item => item.order == 'desc' ? `${item.field} ${item.order}` : `${item.field}`)
            .join(',')
    }
}

// 处理排序变化
const handleSortChange: VxeSortProp.SortChangeCallback = ({ field, order }) => {
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

    // 同步到vxe-table的sort配置
    sortConfig.sort = currentSorts.value
        .filter(item => item.order)
        .map(item => ({ field: item.field, order: item.order as 'asc' | 'desc' }))

    handleQuery()
}


// 分页处理
const handlePageChange = (newPage: number) => {
    pagination.current = newPage
    handleQuery()
}

const handleSizeChange = (newSize: number) => {
    pagination.size = newSize
    handleQuery()
}

// 工具函数
const formatDate = (date: Date, format: string) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return format
        .replace('YYYY', year.toString())
        .replace('MM', month)
        .replace('DD', day)
}

const calculateDays = (baseDate: string, dayStep: string) => {
    const days = []
    if (baseDate) {
        days.push(baseDate.replace(/-/g, ''))
        const stepNum = parseInt(dayStep)
        if (!isNaN(stepNum)) {
            const step = stepNum >= 0 ? 1 : -1
            for (let i = 0; i !== stepNum; i += step) {
                const newDate = new Date(baseDate)
                newDate.setDate(newDate.getDate() + i + step)
                days.push(formatDate(newDate, 'YYYYMMDD'))
            }
        }
    }
    return days
}

const postRequest = async (url: string, params: any) => {
    const response = await axios.post(url, params)
    return response.data
}
</script>

<style scoped lang="scss">
.device-query-container {
    padding: 5px;

    .query-form {
        margin-bottom: 5px;
        
        .form-item-container {
            display: flex;
            flex-wrap: wrap;
            
            .form-item {
                flex: 1;
                min-width: 300px;  // 最小宽度保证基础换行效果
                
                :deep(.el-form-item__content) {
                    width: 100%;  // 确保表单控件宽度填满
                    
                    .el-select {
                        width: 100%;
                    }
                    
                    .el-input-group {
                        display: flex;
                        gap: 8px;
                    }
                }
            }
            
            &.action-area {
                align-items: flex-end;
                
                .groupby-select {
                    flex: 2;
                    min-width: 400px;  // 多选下拉需要更多宽度
                }
                
                .query-button {
                    margin-left: auto;  // 实现居右布局
                    padding-bottom: 22px;  // 对齐表单基线
                }
            }
        }
    }

    .pagination-container {
        margin-top: 20px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        
        .total-info {
            margin-right: 20px;
        }
    }
}
</style>