<template>
    <div class="container">
        <vxe-toolbar ref="toolbarRef" :refresh="{ queryMethod }"></vxe-toolbar>
        <div class="overflow-x-auto">
            <vxe-table ref="tableRef" :loading="loading" :data="tableData" auto-resize height="auto"
                :column-config="{ resizable: true }" show-overflow :cell-config="{ verticalAlign: 'center' }"
                :row-config="{ isCurrent: false, isHover: true }" :scroll-y="{ enabled: true, gt: 0 }" round>
                <vxe-column type="seq" width="5%"></vxe-column>
                <vxe-column field="k" title="策略" width="10%"></vxe-column>
                <vxe-column field="v" title="路径" width="40%"></vxe-column>
                <vxe-column field="kvdesc" title="描述" width="30%"></vxe-column>
                <vxe-column field="Download" title="Download" align="center">
                    <template #default="{ row }">
                        <svg-icon name="csvDownload" width="20px" height="20px" @click="downloadUrl(row)"
                            title="下载csv文件"></svg-icon>
                    </template>
                </vxe-column>
            </vxe-table>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { VxeToolbarInstance, VxeTableInstance } from 'vxe-table'
import { reqlistByKvGroup, reqDownloadUrl } from '@/api/docDownload/ossDownload'
import { ElMessage } from 'element-plus'

interface RowVO {
    k: string
    v: string
    kvdesc: any
    mdate: string
    cdate: any
    kvgroup: string
    status: any
}


const toolbarRef = ref<VxeToolbarInstance>()
const tableRef = ref<VxeTableInstance>()

const loading = ref(false)
const tableData = ref<RowVO[]>([])

// 模拟后端接口
const queryMethod = async () => {
    loading.value = true
    await queryList()
    loading.value = false
}
// 下载链接
const downloadUrl = async (row: RowVO) => {
    try {
        // 获取完整响应对象
        const response = await reqDownloadUrl({ objectName: row.v });

        // 从响应头获取文件名
        const contentDisposition = response.headers['content-disposition'];
        const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/);
        const fileName = fileNameMatch ? fileNameMatch[1] : 'download.csv';

        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName; // 使用后端返回的文件名
        link.style.display = 'none';

        // 触发下载
        document.body.appendChild(link);
        link.click();

        // 清理资源
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading URL:', error);
        ElMessage.error('文件路径不存在');
    }
};
// 查询接口
const queryList = async () => {
    try {
        const response = await reqlistByKvGroup({ kvgroup: 'ossdir' })
        tableData.value = response
    } catch (error) {
        console.error('Error fetching data:', error)
    } finally {
        loading.value = false
    }
}
onMounted(async () => {
    queryList()
})
</script>
<style lang="scss" scoped>
.container {
    height: calc(100vh - #{$base-tabbar-height} - 10px);

    overflow: hidden;

    .overflow-x-auto {
        height: 90%;
        min-height: 100px; // 最小高度防止内容过少时挤压
        display: flex;
        flex-direction: column;

        .vxe-table {
            flex: 1;

            :deep(.vxe-table--body-wrapper) {
                flex: 1;
            }
        }
    }
}
</style>
