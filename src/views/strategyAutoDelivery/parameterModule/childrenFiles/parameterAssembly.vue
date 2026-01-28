<!-- 参数装配模块 -->
<template>
  <div class="body-box">
    <!-- 外层 Tab -->
    <el-tabs class="type-tabs" v-model="outerTab" @tab-change="handleTabChange">
      <el-tab-pane label="点击" name="click"></el-tab-pane>
      <el-tab-pane label="展示" name="imp"></el-tab-pane>
      <el-tab-pane label="全部" name="all"></el-tab-pane>
    </el-tabs>

    <!-- 工具栏 -->
    <div class="toolbar-container">
      <p class="toolbar-left">
        <vxe-select v-model="selectedFtype" placeholder="请选择功能类型" size="mini" @change="handleFtypeChange">
          <vxe-option v-for="item in categoryList" :key="item" :label="item" :value="item" />
        </vxe-select>

        <vxe-input v-model="searchKeyword" type="search" placeholder="搜索包名" clearable size="mini" />

        <vxe-select v-model="selectedDeviceSource" placeholder="实时/离线" clearable size="mini" @change="handleQuery">
          <vxe-option label="实时" value="online" />
          <vxe-option label="离线" value="offline" />
        </vxe-select>

        <vxe-select v-model="selectedStatus" placeholder="启用/禁用" clearable size="mini" @change="handleQuery">
          <vxe-option label="启用" value="enabled" />
          <vxe-option label="禁用" value="disabled" />
        </vxe-select>
      </p>

      <div class="toolbar-right">
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button type="success" @click="handleAdd">新增</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-container">
      <div class="table-wrapper">
        <vxe-table :data="tableData" border round stripe height="100%" :scroll-y="{ enabled: true, gt: 10 }"
          :column-config="{ resizable: true }">
          <vxe-column field="xh" type="seq" align="center" title="序号" width="60"></vxe-column>
          <vxe-column field="pkg" title="pkg" min-width="150" align="center">
            <template #default="{ row }">
              <el-tooltip :content="row.pkgName" placement="top" :disabled="!row.pkgName">
                <div class="cell-ellipsis-2" @click="handleModelEdit('pkg', row)">
                  {{ row.pkg }}
                </div>
              </el-tooltip>
            </template>
          </vxe-column>
          <vxe-column field="country" title="国家" min-width="100" align="center">
            <template #default="{ row }">
              <el-tooltip :content="row.country" placement="top" :disabled="!row.country">
                <div class="cell-ellipsis-2" @click="handleModelEdit('country', row)">
                  {{ row.country }}
                </div>
              </el-tooltip>
            </template>
          </vxe-column>


          <vxe-column field="os" title="系统" min-width="80" width="80" align="center">
            <template #default="{ row }">
              <span>{{ row.os || '-' }}</span>
            </template>
          </vxe-column>
          <vxe-column field="ftype" title="设备类别" min-width="50" width="80" align="center" />
          <vxe-column field="status" title="状态" min-width="50" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'" size="small">
                {{ row.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </vxe-column>
          <vxe-column field="eventType" title="事件类型" min-width="50" width="80" align="center">
            <template #default="{ row }">
              <span v-if="row.eventType === 'click'" class="tag tag-click">
                点击
              </span>
              <span v-else-if="row.eventType === 'imp'" class="tag tag-imp">
                展示
              </span>
              <span v-else class="tag tag-default">全部</span>
            </template>
          </vxe-column>
          <vxe-column field="deviceSource" title="设备来源" min-width="100" width="80" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.deviceSource === 'offline'" type="danger" size="small">离线</el-tag>
              <el-tag v-else-if="row.deviceSource === 'online'" type="primary" size="small">实时</el-tag>
              <el-tag v-else type="info" size="small">未知</el-tag>
            </template>
          </vxe-column>
          <vxe-column field="lastUpdateUser" title="最后更新用户" min-width="100" width="110" align="center" />
          <vxe-column field="config" title="config" align="center" class-name="config-col" min-width="300">
            <template #default="{ row }">
              <div v-if="row.functionTypes && row.functionTypes.length > 0" class="config-container">
                <div v-for="(item, index) in row.functionTypes" :key="index" class="config-item">
                  <div class="config-grid">
                    <div class="config-cell">
                      <span class="config-label">功能名</span>
                      <el-tooltip :content="item.name" placement="top">
                        <span class="config-value text-ellipsis">{{ item.name }}</span>
                      </el-tooltip>
                    </div>
                    <div class="config-cell">
                      <span class="config-label">号段</span>
                      <el-tooltip :content="`${item.start}-${item.end}`" placement="top">
                        <span class="config-value text-ellipsis" style="color: red;">{{ item.start }}-{{ item.end
                          }}</span>
                      </el-tooltip>
                    </div>
                  </div>
                  <el-divider v-show="index !== row.functionTypes.length - 1" />
                </div>
              </div>
              <span v-else>-</span>
            </template>
          </vxe-column>
          <vxe-column title="操作" width="200" fixed="right" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" plain @click="handleView(row)">查看</el-button>
              <el-button size="small" type="success" plain @click="handleEdit(row)">编辑</el-button>
              <!-- <el-button size="small" type="danger" plain @click="handleDelete(row)" :disabled="!isSuperAdmin">删除</el-button> -->
            </template>
          </vxe-column>
        </vxe-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <vxe-pager v-model:currentPage="pageVO.currentPage" v-model:pageSize="pageVO.pageSize" :total="pageVO.total"
          :pageSizes="[10, 20, 50, 100]" :layouts="['Total', 'Sizes', 'PrevPage', 'Number', 'NextPage', 'FullJump',]"
          @page-change="pageChange" />
        <!-- 调试信息 -->
        <!-- <div style="margin-top: 10px; font-size: 12px; color: #999;">
          当前页: {{ pageVO.currentPage }} | 每页: {{ pageVO.pageSize }} | 总数: {{ pageVO.total }}
        </div> -->
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <AssemblyModel v-model="dialogVisible" :title="dialogTitle" :form="currentForm" :is-view="isView"
      :ftype="selectedFtype" :event-type="outerTab" :device-source="selectedDeviceSource" @submit="handleSubmit" />
    <!-- 公共抽屉组件 -->
    <PublicDrawer v-model="drawerVisible" :type="drawerType" :row="drawerRow" @save="handleDrawerSave" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reqCateGory, reqPageList } from '@/api/strategyAutoDelivery/parameterModule/parameterAssembly/index'
import AssemblyModel from './parameterAssemblyModel.vue'
import PublicDrawer from '@/components/publicDrawer/index.vue'
import { reqCreateOrUpdate } from '@/api/strategyAutoDelivery/parameterModule/parameterAssembly/index'
// 引入 cookie store 获取用户角色
import useCookie from "@/store/modules/cookie"
const useCookies = useCookie()
const userRole = useCookies.userRole
const currentUserRole = ref(userRole)
const isSuperAdmin = computed(() => currentUserRole.value === 'superAdmin')

// 外层 Tab
const outerTab = ref<'click' | 'imp' | 'all'>('all')

// 功能类型列表
const categoryList = ref<string[]>([])
const selectedFtype = ref<string>('')

// 搜索和筛选
const searchKeyword = ref<string>('')
const selectedDeviceSource = ref<string>('')
const selectedStatus = ref<string>('')

// 分页数据
const pageVO = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref<any[]>([])

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isView = ref(false)
const currentForm = ref<any>({})

// 获取功能类型列表
const getCategoryList = async () => {
  try {
    const response = await reqCateGory()
    if (response.success) {
      categoryList.value = response.data || []
      if (categoryList.value.length > 0) {
        selectedFtype.value = categoryList.value[0]
        handleQuery()
      }
    }
  } catch (error) {
    ElMessage.error('获取功能类型列表失败')
  }
}

// 功能类型切换
const handleFtypeChange = () => {
  handleQuery()
}

// 查询列表
const handleQuery = async () => {
  if (!selectedFtype.value) {
    ElMessage.warning('请先选择功能类型')
    return
  }

  try {
    const params = {
      ftype: selectedFtype.value,
      eventType: outerTab.value == 'all' ? ('click,imp,all') : (outerTab.value + ',all'),
      deviceSource: selectedDeviceSource.value || '',
      pkg: searchKeyword.value || '',
      status: selectedStatus.value || '',
      page: pageVO.value.currentPage,
      limit: pageVO.value.pageSize
    }

    const response = await reqPageList(params)
    if (response.success) {
      tableData.value = response.data.data || []
      pageVO.value.total = response.data.total || 0
      console.log('查询结果:', {
        dataLength: tableData.value.length,
        total: pageVO.value.total,
        currentPage: pageVO.value.currentPage,
        pageSize: pageVO.value.pageSize
      })
    }
  } catch (error) {
    ElMessage.error('查询失败')
  }
}

// Tab 切换
const handleTabChange = () => {
  // 切换 Tab 时重置分页
  pageVO.value.currentPage = 1
  handleQuery()
}

// 新增
const handleAdd = () => {
  debugger
  currentForm.value = {
    pkg: '',
    country: '',
    eventType: outerTab.value === 'all' ? 'click' : outerTab.value,
    deviceSource: selectedDeviceSource.value || 'online',
    status: selectedStatus.value || '',
    functionTypes: []
  }
  dialogTitle.value = '新增配置'
  isView.value = false
  dialogVisible.value = true
}

// 查看
const handleView = (row: any) => {
  currentForm.value = { ...row }
  dialogTitle.value = '查看配置'
  isView.value = true
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  currentForm.value = { ...row }
  dialogTitle.value = '编辑配置'
  isView.value = false
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定删除配置: ${row.pkg} ?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 这里调用删除接口（如果有的话）
    ElMessage.success('删除成功')
    handleQuery()
  } catch (error) {
    console.log('取消删除')
  }
}

// 提交回调
const handleSubmit = () => {
  handleQuery()
}

// 分页改变
const pageChange = ({ currentPage, pageSize }: any) => {
  pageVO.value.currentPage = currentPage
  pageVO.value.pageSize = pageSize
  handleQuery()
}

// 抽屉相关
const drawerVisible = ref(false)
const drawerType = ref<'pkg' | 'country'>('pkg')
const drawerRow = ref<any>({})

const handleModelEdit = (type: 'pkg' | 'country', row: any) => {
  drawerType.value = type
  if(type === 'pkg'){
    row.pkgName = row.pkg
  }
  drawerRow.value = { ...row }
  drawerVisible.value = true
}
// 抽屉保存回调
const handleDrawerSave = async (updatedRow: any) => {
    try {
        updatedRow.pkg = updatedRow.pkgName
        delete updatedRow.pkgName;
        const response: any = await reqCreateOrUpdate(updatedRow)
        if (response?.code === 200 || response?.success === true) {
            ElMessage.success('保存成功')
            handleQuery()
        } else {
            ElMessage.error(response?.errMsg || '保存失败')
        }
    } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
    }
}
onMounted(() => {
  getCategoryList()
})
</script>

<style scoped lang="scss">
.body-box {
  height: calc(100vh - #{$base-tabbar-height} - 10px);
  padding: 10px;
  display: flex;
  flex-direction: column;

  .type-tabs {
    flex-shrink: 0;

    :deep(.el-tabs__header) {
      padding: 0 5px;
      margin-bottom: 10px;
      border-bottom: 1px solid #ebeef5;
    }

    :deep(.el-tabs__item) {
      padding: 0 16px;
      font-size: 14px;
    }

    :deep(.el-tabs__item.is-active) {
      font-weight: 500;
    }
  }

  .toolbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    flex-shrink: 0;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .toolbar-right {
      display: flex;
      gap: 10px;
    }
  }

  .table-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;

    .table-wrapper {
      flex: 1;
      overflow: hidden;
      min-height: 0;
    }

    .pagination-wrapper {
      flex-shrink: 0;
      padding: 10px 0;
      background: #fff;
    }
  }
}


.config-container {
  padding: 8px;
}

:deep(td.config-col .vxe-cell) {
  white-space: normal;
  text-align: left;
}

.config-item {
  background: #f8fafc;
  border: 1px solid #eef1f6;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
}

.config-item:hover {
  background: #f5f8ff;
  border-color: #e3e8f5;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 10px;
}

.config-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.config-label {
  font-weight: 500;
  font-size: 12px;
  min-width: 50px;
}

.config-value {
  color: #0b22f2;
}

.text-ellipsis {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-divider) {
  margin: 8px 0;
}
</style>