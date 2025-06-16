<template>
  <div class="container">
    <div class="topbar">
      <div class="left-section">
        <div class="box-flex">
          <el-text class="box-text">group:</el-text>
          <el-input v-model="group" placeholder="请输入group" style="width: 200px;" />
        </div>
        <div class="box-flex">
          <el-text class="box-text">K:</el-text>
          <el-input v-model="_k" placeholder="请输入K" style="width: 200px;" />
        </div>
        <div class="box-flex">
          <el-text class="box-text">status:</el-text>
          <el-select v-model="status" placeholder="启用/禁用" style="width: 200px;" clearable>
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </div>
      </div>
      <div class="right-section">
        <el-button type="primary" @click="addbtn">Add</el-button>
        <el-button type="primary" @click="queryData">Query</el-button>
      </div>
    </div>
    <div class="vxeTable-container">
      <vxe-table :data="tableData" style="width: 100%" border>
        <!-- No.列 -->
        <vxe-column field="No." title="No." type="seq" show-header-overflow align="center" width="5%" />

        <!-- Key列 -->
        <vxe-column field="k" title="Key" show-header-overflow align="center" width="10%">
        </vxe-column>

        <!-- Value列 -->
        <vxe-column field="Value" title="Value" show-header-overflow align="center" width="15%">
          <template #default="{ row }">
            <el-input v-model="row.v" placeholder="Value" type="textarea" :autosize="{ minRows: 4, maxRows: 4 }" />
          </template>
        </vxe-column>
        <vxe-column field="kvgroup" title="kvgroup" show-header-overflow align="center" width="10%">
        </vxe-column>
        <vxe-column field="kvdesc" title="kvdesc" show-header-overflow align="center" width="10%">
        </vxe-column>
        <vxe-column field="status" title="status" show-header-overflow align="center" width="10%">
          <!-- 展示是否启用 -->
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'success' : 'danger'" size="small">
              {{ row.status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </vxe-column>
        <vxe-column field="cdate" title="cdate" show-header-overflow align="center">
        </vxe-column>
        <vxe-column field="mdate" title="mdate" show-header-overflow align="center">
        </vxe-column>
        <!-- Action列 -->
        <vxe-column field="Action" title="Action" show-header-overflow align="center" width="150">
          <template #default="{ row }">
            <el-button type="success" @click="handleEdit(row)" size="small">Edit</el-button>
            <el-button type="danger" @click="handleDelete(row)" size="small">Delete</el-button>
          </template>
        </vxe-column>
      </vxe-table>
    </div>

    <!-- 新增/编辑弹出框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑' : '新增'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="k">
          <el-input v-model="formData.k" placeholder="请输入k" />
        </el-form-item>
        <el-form-item label="v">
          <el-input v-model="formData.v" placeholder="请输入v" type="textarea" :autosize="{ minRows: 4, maxRows: 6 }" />
        </el-form-item>
        <el-form-item label="kvdesc">
          <el-input v-model="formData.kvdesc" placeholder="请输入kvdesc" />
        </el-form-item>
        <el-form-item label="kvgroup">
          <el-input v-model="formData.kvgroup" placeholder="请输入kvgroup" />
        </el-form-item>
        <el-form-item label="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="cdate" v-if="isEdit">
          <el-input v-model="formData.cdate" disabled />
        </el-form-item>
        <el-form-item label="mdate" v-if="isEdit">
          <el-input v-model="formData.mdate" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">
            {{ isEdit ? '保存' : '新增' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { reqListKvUrl, reqSaveKvUrl, reqDelKvUrl } from '@/api/setting/KvConfig'
import { ElMessage, ElMessageBox } from 'element-plus';


// 转换原始数据，处理null值
let tableData = ref<TableItem[]>()
interface TableItem {
  k: string | null
  v: string
  kvdesc: string | null
  mdate: string | null
  cdate: string | null
  kvgroup: string | null
  status: string | null
  id?: number | null
}
let data = ref()
let group = ref()
let _k = ref()
let status = ref()

// 弹出框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formData = ref<TableItem>({
  k: '',
  v: '',
  kvdesc: '',
  mdate: null,
  cdate: null,
  kvgroup: '',
  status: '1',
  id: null
})

// 查询数据
const queryData = async () => {
  // 清空之前的数据
  data.value = {}
  tableData.value = []
  // 获取数据
  const prarms = {
    kvgroup: group.value,
    k: _k.value,
    status: status.value
  }
  data.value = await reqListKvUrl(prarms)
  console.log(data);
  tableData.value = data.value.data
}

// 新增按钮点击
const addbtn = () => {
  isEdit.value = false
  // 重置表单数据
  formData.value = {
    k: '',
    v: '',
    kvdesc: '',
    mdate: null,
    cdate: null,
    kvgroup: group.value || '', // 默认使用当前查询的group
    status: '1',
    id: null
  }
  dialogVisible.value = true
}

// 编辑按钮点击
const handleEdit = (row: TableItem) => {
  isEdit.value = true
  // 复制行数据到表单
  formData.value = {
    k: row.k || '',
    v: row.v || '',
    kvdesc: row.kvdesc || '',
    mdate: row.mdate,
    cdate: row.cdate,
    kvgroup: row.kvgroup || '',
    status: row.status || '1',
    id: row.id || null
  }
  dialogVisible.value = true
}

// 保存数据
const handleSave = async () => {
  try {
    // 构建保存参数
    const params = {
      k: formData.value.k ?? '',
      v: formData.value.v ?? '',
      kvdesc: formData.value.kvdesc ?? '',
      kvgroup: formData.value.kvgroup ?? '',
      status: formData.value.status ?? '0',
    }
    
    // 如果是编辑模式，需要传递id
    if (isEdit.value && formData.value.id) {
      Object.assign(params, { id: formData.value.id })
    }
    
    // 调用保存接口
    let data = await reqSaveKvUrl(params)
    
    if(data.code !== 200) {
      ElMessage.error(data.errMsg || '保存失败，请重试')
      return

    }
    // 提示成功
    ElMessage.success(isEdit.value ? '保存成功' : '新增成功')
    
    // 关闭弹窗
    dialogVisible.value = false
    
    // 重新查询数据
    queryData()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

// 处理删除操作
const handleDelete = (row: TableItem) => {
  if (!row.k) {
    ElMessage.warning('无效的记录，无法删除')
    return
  }
  
  ElMessageBox.confirm(
    '确定要删除这条记录吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      // 调用删除接口
      await reqDelKvUrl({ id: row.id !== null && row.id !== undefined ? row.id : undefined }) // 根据API定义，这里应该使用id而不是k
      ElMessage.success('删除成功')
      // 重新查询数据
      queryData()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }).catch(() => {
    // 用户取消删除
  })
}
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: calc(100vh - $base-tabbar-height - 10px);
  padding: 10px;

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    gap: 20px;

    .left-section {
      display: flex;
      align-items: center;
      gap: 10px;

      .box-flex {
        .box-text {
          font-weight: bold;
          margin-right: 15px;
        }
      }
    }
  }
}

:deep(.el-textarea__inner) {
  font-family: monospace;
  line-height: 2;
}
</style>