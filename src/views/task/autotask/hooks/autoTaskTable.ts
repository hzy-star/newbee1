import { ref, reactive ,onMounted,onUnmounted} from 'vue'
import { ElMessage } from 'element-plus'
import { reqAutoTaskUrl } from "@/api/pushtask/autoTask"
import type { VxeTableInstance } from 'vxe-table'
import { useTaskStore } from '@/store/pushtask/autoTask'
import {  zeroTime } from "@/utils/time";
import XEUtils from 'xe-utils'

export default function autoTaskTable() {
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
    // const processedData = ref<any>([]);
    // 模糊查询
    const filterName = ref('') // 搜索框内容

    const pageVO = reactive({
        total: 0,
        currentPage: 1,
        pageSize: 10
    })
    let processedData = ref<any[]>([]);

    const searchEvent = ref()
    const findAllHooks = async (type: boolean, num?: number) => {
        loading.value = true
        try {
            
            taskStore.propFrom.etypes == 'all' ? taskStore.propFrom.etypes = '' : taskStore.propFrom.etypes
            if (taskStore.propFrom) {
                if (typeof taskStore.propFrom.offerIds === 'string') {
                  taskStore.propFrom.offerIds = taskStore.propFrom.offerIds.trim();
                }
                if (typeof taskStore.propFrom.pkgNames === 'string') {
                  taskStore.propFrom.pkgNames = taskStore.propFrom.pkgNames.trim();
                }
                if (typeof taskStore.propFrom.apps === 'string') {
                  taskStore.propFrom.apps = taskStore.propFrom.apps.trim();
                }
                if (typeof taskStore.propFrom.countries === 'string') {
                  taskStore.propFrom.countries = taskStore.propFrom.countries.trim();
                }
              }
            const res = await reqAutoTaskUrl(taskStore.propFrom)
            result.value = res
            processedData.value = result.value.map((item: any) => {
                return {
                    ...item,
                }
            })
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
        // loading.value = true
            const { pageSize } = pageVO
            const filterVal = String(filterName.value).trim().toLowerCase();
            // 判断模糊查询是否有值，有值则使用过滤后的数据processedData，无值则使用原始数据result
            pageVO.total = filterVal != ""
            ? processedData.value.length
            : result.value.length;
            // 更新当前页码
            if (num) {
                pageVO.currentPage = num
            }
            
            tableDataList.value = processedData.value.slice(
                (pageVO.currentPage - 1) * pageSize,
                pageVO.currentPage * pageSize
              );
              if(filterVal != ""){
                searchEvent.value(num)
              }
    }
    const handleSearch = (num?: number) => {
        const filterVal = String(filterName.value).trim().toLowerCase()
        
        const { pageSize } = pageVO
        // 首先过滤数据
        let filteredData = processedData.value
        if (filterVal) {
            // 直接在原始数据上进行过滤
            filteredData = processedData.value.filter((item: any) => {
                // 构造用于搜索的字符串
                const searchText = [
                    item.type == 0 ? 'click' : 'imp',
                    item.appId,
                    item.country,
                    item.offerId,
                    item.pkg_name,
                    item.source,
                    item.fill_type ?? 'top',
                    item.bsclick ?? 'false',
                    // cr相关信息
                    `cr:${(((item?.crInfo?.ctr || 0) + (item?.crInfo?.ivr || 0)) * 100).toFixed(4)}`,
                    `ecpc:${((item?.crInfo?.ecpc || 0) * 100).toFixed(4)}`,
                    `roi:${((item?.crInfo?.roi || 0) * 100).toFixed(2)}`,
                    zeroTime(item.updatedTime)
                ].join(' ').toLowerCase()

                return searchText.includes(filterVal)
            })
            // 更新总数据量
            pageVO.total = filteredData.length
            if (num) {
                pageVO.currentPage = num
            }
            tableDataList.value = filteredData.slice(
                (pageVO.currentPage - 1) * pageSize, 
                pageVO.currentPage * pageSize
            )
        } else{
            
            // 更新总数据量
            pageVO.total = processedData.value.length
            if (num) {
                pageVO.currentPage = num
            }
            tableDataList.value = processedData.value.slice(
                (pageVO.currentPage - 1) * pageSize, 
                pageVO.currentPage * pageSize
            )
        }
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
        processedData,
        filterName,
        searchEvent,
        findAllHooks,
        pageChanges
    }
}