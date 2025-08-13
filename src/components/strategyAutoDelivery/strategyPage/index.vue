<template>
  <div class="strategy-page">
    <div class="page-header">
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="primary" @click="handleAdd">新增</el-button>
    </div>
    <div class="page-content">
      <p>
        <vxe-input v-model="filterName" type="search" placeholder="模糊搜索strategy名称" clearable
          @change="searchEvent" size="mini"></vxe-input>
      </p>
      <!-- 策略列表表格 -->
      <vxe-table :data="strategyList" border round style="width: 100%" size="small" height="90%">
        <vxe-column field="xh" type="seq" align="center" title="序号" width="5%"></vxe-column>
        <vxe-column field="name" title="策略名称" min-width="50" align="center" />
        <vxe-column field="ruleFile" title="规则文件" min-width="220" />
        <vxe-column field="returnType" title="返回类型" min-width="30" align="center" />
        <vxe-column field="description" title="描述" min-width="110" show-header-overflow show-overflow />
        <vxe-column title="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="handleView(row)">查看</el-button>
            <el-button size="small" type="success" plain @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(row)">删除</el-button>
          </template>
        </vxe-column>
      </vxe-table>
    </div>

    <!-- 新增/编辑策略弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" :before-close="handleClose">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="策略名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入策略名称" :disabled="isView" />
        </el-form-item>
        <el-form-item label="规则文件" prop="ruleFile">
          <el-input v-model="formData.ruleFile" placeholder="请输入规则文件路径" :disabled="isView" />
        </el-form-item>
        <el-form-item label="返回类型" prop="returnType">
          <!-- <el-input v-model="formData.returnType" placeholder="请输入返回类型" :disabled="isView" /> -->
           <el-select v-model="formData.returnType" placeholder="请选择返回类型" :disabled="isView">
            <el-option label="RANK" value="rank" />
            <el-option label="FLAG" value="flag" />
            <el-option label="SCORE" value="score" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" placeholder="请输入描述" :disabled="isView" />
        </el-form-item>
      </el-form>

      <template #footer v-if="!isView">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reqStrategyList, reqCreateOrUpdate, reqDeleteStrategy } from '@/api/strategyAutoDelivery/strategyPage/index'
import type { Strategy } from '@/api/strategyAutoDelivery/strategyPage/type'
import type { FormInstance, FormRules } from 'element-plus'
import XEUtils from 'xe-utils'

// 响应式数据
const strategyList = ref<Strategy[]>([])
const strategyListBackUp = ref<Strategy[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isView = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

// 表单数据 - 使用ref实现，id为可选字段
const formData = ref<Omit<Strategy, 'id'> & { id?: number }>({
  name: '',
  ruleFile: '',
  returnType: '',
  description: ''
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入策略名称', trigger: 'blur' }
  ],
  ruleFile: [
    { required: true, message: '请输入规则文件', trigger: 'blur' }
  ],
  returnType: [
    { required: true, message: '请输入返回类型', trigger: 'blur' }
  ]
}

// 获取策略列表
const getStrategyList = async () => {
  try {
    const response = await reqStrategyList()
    strategyList.value = response.data || []
    strategyListBackUp.value = response.data || []
  } catch (error) {
    ElMessage.error('获取策略列表失败')
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    name: '',
    ruleFile: '',
    returnType: '',
    description: ''
  }
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 新增策略
const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增策略'
  isView.value = false
  dialogVisible.value = true
}

// 编辑策略
const handleEdit = (row: Strategy) => {
  formData.value = { ...row } // 包含id
  dialogTitle.value = '编辑策略'
  isView.value = false
  dialogVisible.value = true
}

// 查看策略
const handleView = (row: Strategy) => {
  formData.value = { ...row } // 包含id
  dialogTitle.value = '查看策略'
  isView.value = true
  dialogVisible.value = true
}

// 删除策略
const handleDelete = async (row: Strategy) => {
  ElMessageBox.confirm('确定要删除这个策略吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const data = await reqDeleteStrategy({ id: row.id })
      if (data.code === 200 || data.success === true) {
        ElMessage.success('删除成功')
        getStrategyList()
      } else {
        ElMessage.error(data.errMsg || '删除失败')
      }
    } catch (error) {
      ElMessage.error('删除操作异常')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    // 表单验证
    const isValid = await formRef.value.validate()
    if (!isValid) return

    submitLoading.value = true

    // 准备提交数据
    const submitData = formData.value.id
      ? { ...formData.value } // 编辑时包含id
      : { ...formData.value } // 新增时不包含id

    const data = await reqCreateOrUpdate(submitData)

    if (data.code === 200 || data.success === true) {
      ElMessage.success(formData.value.id ? '更新成功' : '创建成功')
      dialogVisible.value = false
      getStrategyList()
    } else {
      ElMessage.error(data.errMsg || '保存失败')
    }
  } catch (error) {
    console.error('表单提交异常:', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    submitLoading.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 查询策略列表
const handleSearch = () => {
  getStrategyList()
}





const filterName = ref('')
const handleSearchInput = () => {
  const filterVal = String(filterName.value).trim().toLowerCase()
  if (filterVal) {
    const filterRE = new RegExp(filterVal, 'gi')
    const searchProps = ['name', 'ruleFile', 'returnType', 'description']
    const rest = strategyListBackUp.value.filter((item: any) => searchProps.some(key => String(item[key]).toLowerCase().indexOf(filterVal) > -1))
    strategyList.value = rest.map(row => {
      // 搜索为克隆数据，不会污染源数据
      const item = XEUtils.clone(row) as any
      searchProps.forEach((key: any) => {
        item[key] = String(item[key]).replace(filterRE, match => `${match}`)
      })
      return item
    })
  } else {
    strategyList.value = strategyListBackUp.value
  }
}

// 节流函数,间隔500毫秒触发搜索
const searchEvent = XEUtils.throttle(function () {
  handleSearchInput()
}, 500, { trailing: true, leading: true })

// 页面初始化
onMounted(() => {
  getStrategyList()
})
</script>

<style lang="scss" scoped>
.strategy-page {
  // padding: 20px;
  height: calc(100vh - #{$base-tabbar-height} - 60px); // 计算高度减去底部栏

  .page-header {
    display: flex;
    justify-content: end;
    align-items: center;
    height: 5%;

    h2 {
      margin: 0;
      color: #303133;
    }
  }

  .page-content {
    height: 95%;
  }
}
</style>