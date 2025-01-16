import { ref, reactive ,onMounted,onUnmounted} from 'vue'
import { ElMessage } from 'element-plus'
import { reqPkgTaskUrl } from "@/api/pushtask/autoPkgTask"
import type { VxeTableInstance } from 'vxe-table'
import { useTaskStore } from '@/store/pushtask/autoPkgTask'
import {  formatDateToSimple } from "@/utils/time";
import XEUtils from 'xe-utils'
import { truncateText } from '@/utils/common'; // 直接导入默认对象并调用truncateText
import autoRunningStatus from './autoRunningStatus'

export default function autoPkgTable() {
    interface RowVO {
        id: number
        name: string
        role: string
        sex: string
        age: number
        address: string
    }
    const taskStore = useTaskStore()
    const tableRef = ref<VxeTableInstance<RowVO>>()
    // 定义loading状态
    const loading = ref(false)
    // 定义表格数据
    const tableDataList = ref<any[]>([])
    // 定义查询结果
    const result = ref<any[]>([])
    // 表格数据
    const tableData = ref<any>([]);
    // 模糊查询
    const filtercontent = ref('')

    const pageVO = reactive({
        total: 0,
        currentPage: 1,
        pageSize: 10
    })

    const searchEvent = ref()
    const {
        filterStatus
    } = autoRunningStatus()
    const findAllHooks = async (type: boolean, num?: number) => {
        loading.value = true
        try {
            taskStore.propFrom.status = taskStore.propFrom.ce_pkg_status
            taskStore.propFrom.bsclick == 'all' ? taskStore.propFrom.bsclick = '' : taskStore.propFrom.bsclick
            taskStore.propFrom.etype == 'all' ? taskStore.propFrom.etype = '' : taskStore.propFrom.etype
            const res = await reqPkgTaskUrl(taskStore.propFrom)
            result.value = res
            const processedData = res.map((item: any) => {
                return {
                    ...item,
                }
            })

            taskStore.setTableData(processedData)
            if (type) {
                ElMessage.success('查询成功')
            }
            handlePageData(num)
        } catch (error) {
            ElMessage.error('查询失败')
        } finally {
            loading.value = false
        }
    }

    const handlePageData = (num?: number) => {
        loading.value = true
        setTimeout(() => {
            const { pageSize } = pageVO
            // 更新当前页码
            if (num) {
                pageVO.currentPage = num
            }
            
            tableData.value = result.value.map((item: any) => {
                // 返回新的结构，将 matchedOngoing 嵌套到 ongoingData
                return {
                    ...item, // 保留原来的字段
                };
            });
            
            pageVO.total = tableData.value.length
            tableDataList.value = tableData.value.slice(
                (pageVO.currentPage - 1) * pageSize, 
                pageVO.currentPage * pageSize
            )
            searchEvent.value(num)
            loading.value = false
        }, 100)
    }
    // 模糊查询
    const handleSearch = (num?: number) => {
        const filterVal = String(filtercontent.value).trim().toLowerCase()
        
        const { pageSize } = pageVO
        // 首先过滤数据
        let filteredData = tableData.value
        if (filterVal) {
            // 直接在原始数据上进行过滤
            filteredData = tableData.value.filter((item: any) => {
                // 构造用于搜索的字符串
                const searchText = [
                    `${item.etype == null ? "click" : item.etype}`,
                    item.id,
                    item.appId,
                    item.pkgName,
                    item.country,
                    item.offers,
                    item.deviceDays,
                    `source:${!!item.s ? truncateText(item.s) : '-'}`,
                    `dsadx:${!!item.ds_adx ? truncateText(item.ds_adx) : '-'}`,
                    `dsbundle:${!!item.ds_bundle ? truncateText(item.ds_bundle) : '-'}`,
                    item.bsclick,
                    item.max,
                    item.hour,
                    item.startHour,
                    // runningStatus
                    `succ:${!!item.runnerStatus?.succCount ? (item.runnerStatus?.succCount) : ''}`,
                    `sent:${!!item.runnerStatus?.sendCount ? (item.runnerStatus?.sendCount) : ''}`,
                    `valid:${!!item.runnerStatus?.validCount ? (item.runnerStatus?.validCount) : ''}`,
                    `${!!item.runnerStatus?.status ? filterStatus(item.runnerStatus?.status) : ''}`,
                    `cr:${ (((item?.crInfo?.ctr ? item?.crInfo?.ctr : 0) + (item?.crInfo?.ivr ? item?.crInfo?.ivr :
                                0)) * 100).toFixed(4) }%`,
                    `ecpc:${(((item?.crInfo?.ecpc ? item?.crInfo?.ecpc : 0))* 100).toFixed(4)}%`,
                    `roi:${(((item?.crInfo?.roi ? item?.crInfo?.roi : 0))* 100).toFixed(2)}%`,
                    item.bsclick,
                    formatDateToSimple(item?.updated)
                ].join(' ').toLowerCase()
    
                return searchText.includes(filterVal)
            })
        }
        // 更新总数据量
        pageVO.total = filteredData.length
        if (num) {
            pageVO.currentPage = num
        }
        tableDataList.value = filteredData.slice(
            (pageVO.currentPage - 1) * pageSize, 
            pageVO.currentPage * pageSize
        )
    }
    
    onMounted(() => {
        searchEvent.value = XEUtils.throttle(function (num?: number) {
            handleSearch(num)
        }, 200, { trailing: true, leading: true })
    })
    onUnmounted(() => {
        // 清除节流函数
        if (searchEvent.value && searchEvent.value.cancel) {
            searchEvent.value.cancel()
        }
    })
    const pageChanges = ({ pageSize, currentPage }: { pageSize: number; currentPage: number }) => {
        pageVO.currentPage = currentPage
        pageVO.pageSize = pageSize
        handlePageData()
    }

    return {
        tableRef,
        loading,
        tableDataList,
        pageVO,
        tableData,
        filtercontent,
        searchEvent,
        findAllHooks,
        pageChanges
    }
}