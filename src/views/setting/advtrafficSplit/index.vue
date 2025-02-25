<template>
    <div class="pushtask">
        <!-- 数据表格 -->
        <div class="table-header">
            <vxe-toolbar :tools="toolbarTools" @tool-click="toolClickEvent"></vxe-toolbar>
        </div>
        <div class="pushtask_table">
            <div class="vxe-table-div">
                <div class="table-body">
                    <vxe-table border auto-resize height="auto" :column-config="{ resizable: true }" show-overflow
                        :cell-config="{ verticalAlign: 'center' }" :row-config="{ isCurrent: false, isHover: true }"
                        :scroll-y="{ enabled: true, gt: 0 }" :data="tableDataList" ref="tableRef" size="mini" round>
                        <vxe-column field="xh" type="seq" title="No." align="center" show-header-overflow width="6%">
                        </vxe-column>
                        <vxe-column field="pkg_name" title="Pkg"  align="center" />
                        <vxe-column field="advs" title="AdvId"  align="center" />
                        <vxe-column field="country" title="Country"  align="center" />
                        <vxe-column field="top_bundle_range" title="TopBundleRange"  align="center" />
                        <vxe-column field="near_gateway_range" title="NearGatewayRange"  align="center" />
                        <vxe-column field="common_gateway_range" title="CommonRange"  align="center" />
                        <vxe-column field="status" title="Status"  align="center">
                            <template #default="{ row }">
                                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                                    {{ row.status === 1 ? 'Enable' : 'Disable' }}
                                </el-tag>
                            </template>
                        </vxe-column>
                        <vxe-column field="create_date" title="Created"  align="center">
                            <template #default="{ row }">
                                {{ formatDate(row.create_date) }}
                            </template>
                        </vxe-column>
                        <vxe-column field="update_date" title="Updated"  align="center">
                            <template #default="{ row }">
                                {{ formatDate(row.update_date) }}
                            </template>
                        </vxe-column>
                        <vxe-column title="Operation" width="120"  align="center" :visible="RolePermissions.showBtn">
                            <template #default="{ row }">
                                <el-button type="primary" @click="editSplit(row)">Edit</el-button>
                            </template>
                        </vxe-column>
                    </vxe-table>
                </div>
            </div>
        </div>
        <ModelPage v-model="modelValue" :title="title" :formData="formData" @saveSplit="saveSplit" @close="resetForm" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SplitData } from '@/api/setting/advtrafficSplit/type'
import { reqAdvTrafficSplitUrl, reqAdvSaveOrNewUrl } from '@/api/setting/advtrafficSplit'
import { ElMessage } from 'element-plus'
import { VxeUI, VxeToolbarPropTypes, VxeToolbarEvents } from 'vxe-table'
import ModelPage from '@/components/setting/advtrafficSplit/model.vue'
import RolePermission from '@/store/modules/rolePermission'
const RolePermissions = RolePermission()
// 表单数据
const formData = ref<SplitData>({
    pkg_name: '',
    advs: '',
    country: '',
    top_bundle_range: '',
    near_gateway_range: '',
    common_gateway_range: '',
    status: 1 // 默认值为 1（Enable）
});
const modelValue = ref(false)
let title = ref('')
const toolbarTools = ref<VxeToolbarPropTypes.Tools>([
    { name: 'Add+', code: 'Add', status: 'primary' },
    { name: 'Query', code: 'Query', status: 'success' }
])
const toolClickEvent: VxeToolbarEvents.ButtonClick = ({ code }) => {
    if (code == 'Query') {
        queryList()
    } else {
        // 新增时清空表单
        resetForm()
        modelValue.value = true
        title.value = 'Add/Save'
    }
}
// 保存数据
// 保存逻辑调整
const saveSplit = async (type: 'save' | 'new') => {
    if (!validateForm()) {
    return
  }
    try {
        // 根据类型处理ID
        const params = { ...formData.value }
        if (type === 'new' && title.value === 'Add/Save') {
            delete params.id // 新建时移除ID
        } else if (type === 'save' && title.value === 'Add/Save') {
            params.id = ''
        } else if (type === 'new' && title.value === 'Edit') {
            delete params.id // 新建时移除ID
        }

        await reqAdvSaveOrNewUrl(params)
        await queryList()
        modelValue.value = false // 关闭弹窗
        resetForm()
    } catch (error) {
        console.error(error)
    }
}

// 表单验证
const validateForm = () => {
    if (!formData.value.advs.trim()) {
        ElMessage.warning('AdvId should not be empty')
        return false
    }
    if (!formData.value.country.trim()) {
        ElMessage.warning('Country should not be empty')
        return false
    }
    if (!formData.value.pkg_name.trim()) {
        ElMessage.warning('Pkg name should not be empty')
        return false
    }
    return true
}
// 重置表单
const resetForm = () => {
    formData.value = {
    id: '', // 确保重置ID字段
    pkg_name: '',
    advs: '',
    country: '',
    top_bundle_range: '',
    near_gateway_range: '',
    common_gateway_range: '',
    status: 1
  }
}
const extractFormData = (split: SplitData) => {
    return {
        pkg_name: split.pkg_name || '',
        advs: split.advs || '',
        country: split.country || '',
        top_bundle_range: split.top_bundle_range || '',
        near_gateway_range: split.near_gateway_range || '',
        common_gateway_range: split.common_gateway_range || '',
        status: split.status === 1 ? 1 : 0, // 确保 status 是 1 或 0
        id: split.id || ''
    }
}
// 编辑时保留ID用于更新
const editSplit = (split: SplitData) => {
    formData.value = extractFormData(split)
    modelValue.value = true
    title.value = 'Edit'
}
// 表格数据
const tableDataList = ref();
// 查询
const queryList = async () => {
    tableDataList.value = await reqAdvTrafficSplitUrl({});
}
// 日期格式化
const formatDate = (dateStr?: string) => {
    return dateStr ? dateStr.substring(0, 19) : ''
}
onMounted(() => {
    if(!RolePermissions.showBtn){
        toolbarTools.value = [{ name: 'Query', code: 'Query', status: 'success' }]
    }
});
</script>

<style scoped lang="scss">
.pushtask {
    width: 100%;
    display: flex;
    flex-direction: column;
    height: calc(100vh - $base-tabbar-height - 10px);

    .pushtask_table {
        width: 100%;
        margin-top: 5px;
        flex: 1;
        /* 占据剩余空间 */
        overflow: auto;

        .vxe-table-div {
            height: 100%;

            .table-body {
                height: 100%;
            }
        }
    }
}
</style>