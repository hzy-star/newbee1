<template>
    <div class="pushtask">
        <!-- 查询条件 -->
        <div class="search-form-container">
            <el-form :inline="true" :model="searchForm" class="search-form">
                <el-form-item label="OfferId">
                    <el-input v-model="searchForm.offerId" placeholder="请输入offerId" />
                </el-form-item>
                <el-form-item label="Pkg">
                    <el-input v-model="searchForm.pkg" placeholder="请输入pkg" />
                </el-form-item>
                <el-form-item label="AppId">
                    <el-input v-model="searchForm.appId" placeholder="请输入appId" />
                </el-form-item>
                <el-form-item label="Status">
                    <el-input v-model="searchForm.status" placeholder="请输入status" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSearch">查询</el-button>
                    <el-button @click="onReset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 数据表格 -->
        <div class="table-container">
            <div class="toolbarRef-div">
                <vxe-toolbar ref="toolbarRef" custom></vxe-toolbar>
            </div>
            <div class="vxe-table-div">
                <vxe-table border auto-resize height="auto" show-overflow :loading="loading" :data="tableData"
                    :row-config="{ keyField: 'id' }" :column-config="{ resizable: true }" ref="tableRef">
                    <vxe-column type="seq" width="60" title="序号" />
                    <vxe-column field="offerId" title="OfferId" min-width="110" />
                    <vxe-column field="advId" title="AdvId" min-width="80" />
                    <vxe-column field="pkgName" title="PkgName" min-width="200" />
                    <vxe-column field="appId" title="AppId" min-width="80" />
                    <vxe-column field="countries" title="Countries" min-width="80" />
                    <vxe-column field="platform" title="Platform" min-width="80" />
                    <vxe-column field="s2s" title="S2S" min-width="60" />
                    <vxe-column field="dailyClick" title="DailyClick" min-width="60" :visible="false"/>
                    <vxe-column field="minuteClick" title="MinuteClick" min-width="100" :visible="false"/>
                    <vxe-column field="status" title="Status" min-width="80" />
                    <vxe-column field="comments" title="Comments" min-width="80" />
                    <vxe-column field="manualClick" title="ManualClick" min-width="80" />
                    <vxe-column field="manualImp" title="ManualImp" min-width="80" />
                    <vxe-column field="clickCap" title="ClickCap" min-width="100" :visible="false" />
                    <vxe-column field="pkgCategory" title="Category" min-width="100" :visible="false"/>
                    <vxe-column field="updated" title="Updated" min-width="160" fixed="right"/>
                    <vxe-column field="created" title="Created" min-width="160" fixed="right"/>

                </vxe-table>
            </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-container">
            <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit" :total="total"
                :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
                @current-change="handlePageChange" @size-change="handleSizeChange" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { reqList } from '@/api/dataPresentation/offerInquiry'
import type { VxeToolbarInstance, VxeTableInstance } from 'vxe-table'

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)

const searchForm = reactive({
    pkg: '',
    appId: '',
    status: '',
    offerId: '',
})

const pagination = reactive({
    page: 1,
    limit: 10,
})

// 查询
const fetchData = async () => {
    loading.value = true
    try {
        const params: any = {
            page: pagination.page,
            limit: pagination.limit,
        }
        if (searchForm.pkg) params.pkg = searchForm.pkg.trim()
        if (searchForm.appId) params.appId = searchForm.appId.trim()
        if (searchForm.status) params.status = searchForm.status.trim()
        if (searchForm.offerId) params.offerId = searchForm.offerId.trim()

        const res: any = await reqList(params)
        if (res.success) {
            tableData.value = res.data?.data || []
            total.value = res.data?.total ?? 0
        } else {
            ElMessage.error(res.message || '查询失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '查询失败')
    } finally {
        loading.value = false
    }
}

const onSearch = () => {
    pagination.page = 1
    fetchData()
}

const onReset = () => {
    searchForm.pkg = ''
    searchForm.appId = ''
    searchForm.status = ''
    searchForm.offerId = ''
    pagination.page = 1
    fetchData()
}

const handlePageChange = (page: number) => {
    pagination.page = page
    fetchData()
}

const handleSizeChange = (size: number) => {
    pagination.limit = size
    pagination.page = 1
    fetchData()
}

const tableRef = ref<VxeTableInstance>()
const toolbarRef = ref<VxeToolbarInstance>()
onMounted(() => {
    const $table = tableRef.value
    const $toolbar = toolbarRef.value
    if ($table && $toolbar) {
        $table.connect($toolbar)
    }
    fetchData()
})
</script>

<style scoped lang="scss">
.pushtask {
    width: 100%;
    display: flex;
    flex-direction: column;
    height: calc(100vh - $base-tabbar-height - 10px);

    .search-form-container {
        flex-shrink: 0;
        padding: 12px 0 0 0;
    }

    .table-container {
        flex: 1 1 0;
        min-height: 0;
        overflow: auto;

        .toolbarRef-div {
            height: 8%;
        }

        .vxe-table-div {
            height: 90%;
        }
    }

    .pagination-container {
        flex-shrink: 0;
        display: flex;
        justify-content: flex-end;
        padding: 12px 0;
    }
}
</style>
