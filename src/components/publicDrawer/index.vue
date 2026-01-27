<template>
  <el-drawer
    v-model="drawerVisible"
    :title="`编辑 ${typeLabel}`"
    size="600px"
    :before-close="handleClose"
  >
    <!-- 顶部搜索区域 -->
    <div class="drawer-header">
      <el-input
        v-model="searchKeyword"
        :placeholder="`搜索${typeLabel}`"
        clearable
        style="width: 300px"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <div class="header-btns">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button type="success" @click="handleBatchAdd">批量新增</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="drawer-content">
      <vxe-table
        border
        round
        :data="filteredTableData"
        :row-config="{ keyField: '_uid' }"
        :checkbox-config="{ checkField: '_checked' }"
        height="100%"
        size="small"
      >
        <vxe-column type="checkbox" width="50" align="center"></vxe-column>
        <vxe-column field="value" :title="typeLabel" min-width="200" align="center">
          <template #default="{ row }">
            <el-input
              v-if="row._isEditing"
              v-model="row.value"
              :placeholder="`请输入${typeLabel}`"
              size="small"
              @blur="handleInputBlur(row)"
              @keyup.enter="handleInputBlur(row)"
            />
            <span v-else class="cell-text" @click="handleCellClick(row)">{{ row.value || '点击输入' }}</span>
          </template>
        </vxe-column>
        <vxe-column title="操作" width="80" align="center">
          <template #default="{ rowIndex }">
            <el-button type="danger" link @click="handleDelete(rowIndex)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </vxe-column>
      </vxe-table>
    </div>

    <!-- 底部按钮区域 -->
    <template #footer>
      <div class="drawer-footer">
        <el-button type="danger" @click="handleBatchDelete" :disabled="!hasChecked">
          批量删除
        </el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>

    <!-- 批量新增弹窗 -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批量新增"
      width="500px"
      append-to-body
    >
      <el-input
        v-model="batchInputValue"
        type="textarea"
        :rows="6"
        :placeholder="`请输入${typeLabel}，多个用逗号分隔`"
      />
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchAdd">确定</el-button>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Delete } from '@element-plus/icons-vue'

interface TableRow {
  _uid: string
  value: string
  _isEditing?: boolean
  _checked?: boolean
}

const props = defineProps<{
  modelValue: boolean
  type: 'pkg' | 'country'
  row: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', row: Record<string, any>): void
}>()

// 响应式数据
const searchKeyword = ref('')
const tableData = ref<TableRow[]>([])
const batchDialogVisible = ref(false)
const batchInputValue = ref('')

// 计算属性
const drawerVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const typeLabel = computed(() => props.type === 'pkg' ? 'PKG' : '国家')

const fieldKey = computed(() => props.type === 'pkg' ? 'pkgName' : 'country')

const filteredTableData = computed(() => {
  if (!searchKeyword.value) return tableData.value
  const keyword = searchKeyword.value.toLowerCase()
  return tableData.value.filter(item => 
    item.value.toLowerCase().includes(keyword)
  )
})

const hasChecked = computed(() => {
  return tableData.value.some(item => item._checked)
})

// 生成唯一ID
const generateUid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

// 初始化表格数据
const initTableData = () => {
  const fieldValue = props.row[fieldKey.value] || ''
  if (!fieldValue) {
    tableData.value = []
    return
  }
  
  const values = fieldValue.split(',').filter((v: string) => v.trim())
  tableData.value = values.map((value: string) => ({
    _uid: generateUid(),
    value: value.trim(),
    _isEditing: false,
    _checked: false
  }))
}

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已通过 filteredTableData 计算属性实现
}

// 点击单元格进入编辑模式
const handleCellClick = (row: TableRow) => {
  row._isEditing = true
}

// 新增一行
const handleAdd = () => {
  tableData.value.unshift({
    _uid: generateUid(),
    value: '',
    _isEditing: true,
    _checked: false
  })
}

// 输入框失焦处理
const handleInputBlur = (row: TableRow) => {
  // 如果内容为空，直接删除该行
  if (!row.value.trim()) {
    const index = tableData.value.findIndex(item => item._uid === row._uid)
    if (index > -1) {
      tableData.value.splice(index, 1)
    }
    return
  }
  row._isEditing = false
}

// 批量新增
const handleBatchAdd = () => {
  batchInputValue.value = ''
  batchDialogVisible.value = true
}

// 确认批量新增
const confirmBatchAdd = () => {
  if (!batchInputValue.value.trim()) {
    ElMessage.warning('请输入内容')
    return
  }
  
  const values = batchInputValue.value.split(',').filter(v => v.trim())
  const newRows = values.map(value => ({
    _uid: generateUid(),
    value: value.trim(),
    _isEditing: false,
    _checked: false
  }))
  
  tableData.value = [...newRows, ...tableData.value]
  batchDialogVisible.value = false
  ElMessage.success(`成功添加 ${values.length} 条数据`)
}

// 删除单行
const handleDelete = (rowIndex: number) => {
  const actualIndex = tableData.value.findIndex(
    item => item._uid === filteredTableData.value[rowIndex]._uid
  )
  if (actualIndex > -1) {
    tableData.value.splice(actualIndex, 1)
  }
}

// 批量删除
const handleBatchDelete = async () => {
  const checkedCount = tableData.value.filter(item => item._checked).length
  
  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${checkedCount} 条数据吗？`,
      '提示',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    
    tableData.value = tableData.value.filter(item => !item._checked)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

// 保存
const handleSave = () => {
  // 过滤掉空值
  const validData = tableData.value.filter(item => item.value.trim())
  const joinedValue = validData.map(item => item.value.trim()).join(',')
  
  // 更新 row 数据
  const updatedRow = {
    ...props.row,
    [fieldKey.value]: joinedValue
  }
  
  emit('save', updatedRow)
  drawerVisible.value = false
}

// 关闭抽屉
const handleClose = () => {
  drawerVisible.value = false
}

// 监听抽屉打开，初始化数据
watch(() => props.modelValue, (val) => {
  if (val) {
    searchKeyword.value = ''
    initTableData()
  }
})
</script>

<style lang="scss" scoped>
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .header-btns {
    display: flex;
    gap: 8px;
  }
}

.drawer-content {
//   height: calc(100vh - 230px);
    height: 90%;
}

.drawer-footer {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.cell-text {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f7fa;
  }
}
</style>
