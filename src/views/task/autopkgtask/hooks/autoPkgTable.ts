import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { reqPkgTaskUrl } from "@/api/pushtask/autoPkgTask"
import type { VxeTableInstance } from 'vxe-table'
import { useTaskStore } from '@/store/pushtask/autoPkgTask'

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

    const pageVO = reactive({
        total: 0,
        currentPage: 1,
        pageSize: 10
    })

    const findAllHooks = async (type: boolean, num?: number) => {
        loading.value = true
        try {
            taskStore.propFrom.status = taskStore.propFrom.ce_pkg_status
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
            loading.value = false
        }, 100)
    }

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
        findAllHooks,
        pageChanges
    }
}