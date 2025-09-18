<template>
    <div class="user-setting-container">
        <div class="user-setting-header">
            <vxe-toolbar :tools="toolbarTools" @tool-click="toolClickEvent"></vxe-toolbar>
        </div>
        <div class="table-setting-body">
            <div class="table-setting-content">
                <vxe-table border auto-resize height="auto" :column-config="{ resizable: true }" show-overflow
                    :cell-config="{ verticalAlign: 'center' }" :row-config="{ isCurrent: false, isHover: true }"
                    :scroll-y="{ enabled: true, gt: 0 }" :data="tableData" ref="tableRef" size="mini" round
                    :edit-config="editConfig">
                    <vxe-column type="seq" width="10%" align="center"></vxe-column>
                    <vxe-column field="id" :edit-render="{ name: 'input' }" title="id" width="20%" align="center"></vxe-column>
                    <vxe-column field="appIds" :edit-render="{ name: 'input' }" title="apps" ></vxe-column>
                    <vxe-column field="action" title="action" width="10%" align="center" :visible="RolePermissions.showBtn">
                        <template #default="{ row }">
                            <el-button @click="setUserAccess(row)" type="primary" size="small">Set</el-button>
                        </template>
                    </vxe-column>
                </vxe-table>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { VxeUI, VxeToolbarPropTypes, VxeToolbarEvents, VxeTablePropTypes } from 'vxe-table'
import { reqGetUserAccess, reqSetUserAccess } from '@/api/setting/user'
import { RowVO } from '@/api/setting/user/type'
import RolePermission from '@/store/modules/rolePermission'
const RolePermissions = RolePermission()


const tableData = ref()

const toolbarTools = ref<VxeToolbarPropTypes.Tools>([
    { name: 'Query', code: 'Query', status: 'primary' },
])
// 查询用户权限
const getUserAccess = async (type: boolean) => {
    try {
        tableData.value = await reqGetUserAccess()
        if (!type) {
            VxeUI.modal.message({ content: 'Data saved successfully', status: 'success' });
        }
    } catch (error) {
        VxeUI.modal.message({ content: 'Failed to fetch data', status: 'error' })
    }
}
const toolClickEvent: VxeToolbarEvents.ButtonClick = ({ code }) => {
    if (code === 'Query') {
        getUserAccess(false)
    }
}

const editConfig = ref<VxeTablePropTypes.EditConfig>({
    trigger: 'click',
    mode: 'cell'
})


// 设置用户权限
const setUserAccess = async (row: RowVO) => {
    const params = {
        id: row.id.trim(),
        apps: row.appIds.trim()
    }
    try {
        await reqSetUserAccess(params)
        VxeUI.modal.message({ content: 'Data saved successfully', status: 'success' });
        getUserAccess(true)
    } catch (error) {
        VxeUI.modal.message({ content: 'Failed to fetch data', status: 'error' })
    }
}
</script>
<style scoped lang="scss">
.user-setting-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    height: calc(100vh - $base-tabbar-height - 10px);

    .user-setting-header {
        height: auto;
    }

    .table-setting-body {
        width: 100%;
        margin-top: 5px;
        flex: 1;
        /* 占据剩余空间 */
        overflow: auto;

        .table-setting-content {
            height: 100%;
        }
    }
}
</style>