import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { reqlistUrl } from "@/api/pushtask/index"
import type { VxeTableInstance } from 'vxe-table'
import { useTaskStore } from '@/store/pushtask/task'
import listTaskCr from "@/store/common/listTaskCr"
import {  formatDateToSimple } from "@/utils/time";
import XEUtils from 'xe-utils'

export default function useTable() {
    interface RowVO {
        id: number
        name: string
        role: string
        sex: string
        age: number
        address: string
    }
    const taskStore = useTaskStore()
    const getTaskCr = listTaskCr()
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
    // 初始化获取所有任务
    const ongoing: any = ref()
    

    const pageVO = reactive({
        total: 0,
        currentPage: 1,
        pageSize: 10
    })

    const findAllHooks = async (type: boolean, num?: number) => {
        loading.value = true
        try {
            taskStore.propFrom.etypes == 'all' ? taskStore.propFrom.etypes = '' : taskStore.propFrom.etypes
            const res = await reqlistUrl(taskStore.propFrom)
            result.value = res
            const processedData = res.map((item: any) => {
                const matchedOngoing = taskStore.ongoing.filter(
                    (ongoingItem: any) => ongoingItem.taskId === item.id
                )
                const taskCrData = getTaskCr.taskCr[item.id]
                return {
                    ...item,
                    ongoingData: matchedOngoing.length > 0 ? matchedOngoing : null,
                    taskCrData: taskCrData || null,
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
                // 查找 ongoing 中所有匹配的记录
                const matchedOngoing = ongoing.value.filter(
                    (ongoingItem: any) => ongoingItem.taskId === item.id
                );
                // 从 taskCr 中查找对应 taskId 的数据
                const taskCrData = getTaskCr.taskCr[item.id];
                // 返回新的结构，将 matchedOngoing 嵌套到 ongoingData
                return {
                    ...item, // 保留原来的字段
                    ongoingData: matchedOngoing.length > 0 ? matchedOngoing : null, // 如果有匹配项，则嵌套数组；否则为 null
                    taskCrData: taskCrData || null,
                };
            });
            
            pageVO.total = tableData.value.length
            tableDataList.value = tableData.value.slice(
                (pageVO.currentPage - 1) * pageSize, 
                pageVO.currentPage * pageSize
            )
            searchEvent(num)
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
                    item.etype,
                    item.offers,
                    item.appId,
                    item.weight,
                    item.pkg_name,
                    `${item.gt + "->" + item.lt}`,
                    item.country,
                    item.usealg,
                    item.urlparams,
                    `${item.pkgName != 'null' ? item.pkgName : ''}`,
                    // cr相关信息
                    `${item?.ongoingData?.[0]?.successCount != null ? `${item?.ongoingData?.[0]?.successCount}/` : ''}`,
                    `${item?.ongoingData?.[0]?.sendCount != null ? `${item?.ongoingData?.[0]?.sendCount}/` : ''}`,
                    `${item?.ongoingData?.[0]?.message}`,
                    `${item?.ongoingData?.[0]?.dcsuccessCount > 0 ? item?.ongoingData?.[0]?.dcsuccessCount : '' }`,
                    `${item?.ongoingData?.[0]?.sendServerCount > 0 ? item?.ongoingData?.[0]?.sendServerCount : ''}`,
                    `cr:${((item?.taskCrData?.ctr + item?.taskCrData?.ivr) * 100).toFixed(4)}%`,
                    item.bsclick,
                    formatDateToSimple(item?.mdate)
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
    // 节流函数,间隔500毫秒触发搜索
    const searchEvent = XEUtils.throttle(function (num?: number) {
        handleSearch(num)
    }, 200, { trailing: true, leading: true })

    // 分页
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
        ongoing,
        filtercontent,
        searchEvent,
        findAllHooks,
        pageChanges
    }
}