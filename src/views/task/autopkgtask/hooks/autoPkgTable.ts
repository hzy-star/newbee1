import { ref, reactive ,onMounted,onUnmounted,watch} from 'vue'
import { ElMessage } from 'element-plus'
import { reqPkgTaskUrl } from "@/api/pushtask/autoPkgTask"
import type { VxeTableInstance } from 'vxe-table'
import { useTaskStore } from '@/store/pushtask/autoPkgTask'
import {  zeroTime } from "@/utils/time";
import XEUtils from 'xe-utils'
import { truncateText } from '@/utils/common'; // 直接导入默认对象并调用truncateText
import autoRunningStatus from './autoRunningStatus'
import { debounce } from 'lodash';

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
    // const processedData = ref<any>([]);
    // 模糊查询
    const filtercontent = ref('')
    // 储存排序后的规则
    const sortListConfig = ref<{ field: string; order: string }[]>([]);
    const sortConfig = ref()

    const pageVO = reactive({
        total: 0,
        currentPage: 1,
        pageSize: 10
    })

    const searchEvent = ref()
    let processedData = ref<any[]>([]);
    let originalData = ref<any[]>([]);
    const {
        filterStatus
    } = autoRunningStatus()
    const findAllHooks = async (type: boolean, num?: number) => {
        loading.value = true
        try {
            taskStore.propFrom.status = taskStore.propFrom.ce_pkg_status
            taskStore.propFrom.bsclick == 'all' ? taskStore.propFrom.bsclick = '' : taskStore.propFrom.bsclick
            taskStore.propFrom.etype == 'all' ? taskStore.propFrom.etype = '' : taskStore.propFrom.etype
            
            if (taskStore.propFrom) {
                if (typeof taskStore.propFrom.offerid === 'string') {
                  taskStore.propFrom.offerid = taskStore.propFrom.offerid.trim();
                }
                if (typeof taskStore.propFrom.pkgname === 'string') {
                  taskStore.propFrom.pkgname = taskStore.propFrom.pkgname.trim();
                }
                if (typeof taskStore.propFrom.appid === 'string') {
                  taskStore.propFrom.appid = taskStore.propFrom.appid.trim();
                }
                if (typeof taskStore.propFrom.country === 'string') {
                  taskStore.propFrom.country = taskStore.propFrom.country.trim();
                }
                if (typeof taskStore.propFrom.jobid === 'string') {
                  taskStore.propFrom.jobid = taskStore.propFrom.jobid.trim();
                }
              }
            const res = await reqPkgTaskUrl(taskStore.propFrom)
            result.value = res
            processedData.value = result.value.map((item: any) => {
                return {
                    ...item,
                }
            })
            originalData.value = processedData.value;
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

    const handlePageData = (num?: number,type?:boolean) => {
        // loading.value = true
        const { pageSize } = pageVO
        const filterVal = String(filtercontent.value).trim().toLowerCase();
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
          if(sortListConfig.value.length > 0 && !type){
            sortConfig.value.value.sortMethods({ sortList: sortListConfig.value });
          }
        // loading.value = false
    }
    // 模糊查询
    const handleSearch = (num?: number) => {
        const filterVal = String(filtercontent.value).trim().toLowerCase()
        
        const { pageSize } = pageVO
        // 首先过滤数据
        let filteredData = processedData.value
        if (filterVal) {
            // 直接在原始数据上进行过滤
            filteredData = processedData.value.filter((item: any) => {
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
                    zeroTime(item?.updated)
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
        }else{
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
    watch(filtercontent, debounce((newValue, oldValue) => {
      // 如果 filtercontent 改变了，并且新的值与旧的值不相等，则将 processedData 设置为 result
      if (newValue !== oldValue) {
          processedData.value = result.value.map((item: any) => {
              return {
                  ...item,
              }
          })
      }
    }, 300)); // 300ms 防抖时间，用户停止输入后 300ms 执行处理
    const pageChanges = ({ pageSize, currentPage }: { pageSize: number; currentPage: number }) => {
        pageVO.currentPage = currentPage
        pageVO.pageSize = pageSize
        handlePageData(0,true);
    }

    return {
        tableRef,
        loading,
        tableDataList,
        pageVO,
        processedData,
        originalData,
        filtercontent,
        searchEvent,
        sortListConfig,
        sortConfig,
        findAllHooks,
        pageChanges,
        handlePageData
    }
}