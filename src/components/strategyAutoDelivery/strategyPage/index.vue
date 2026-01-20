<template>
  <div class="strategy-page">
    <div class="page-header">
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="primary" @click="handleAdd">新增</el-button>
    </div>
    <div class="page-content">
      <p>
        <vxe-input v-model="filterName" type="search" placeholder="模糊搜索strategy名称" clearable @change="searchEvent"
          size="mini"></vxe-input>
        <vxe-select v-model="returnType" type="search" placeholder="搜索文件类型" clearable size="mini"
          @change="handleSearch">
          <vxe-option label="RANK" value="rank" />
          <vxe-option label="FLAG" value="flag" />
          <vxe-option label="SCORE" value="score" />
          <vxe-option label="S2S" value="s2s" />
          <vxe-option label="DISTRIBUTE" value="distribute" />
        </vxe-select>
        <vxe-select v-model="deviceSourceOption" type="search" placeholder="实时/离线" clearable size="mini"
          @change="handleDeviceSource">
          <vxe-option label="实时" value="online" />
          <vxe-option label="离线" value="offline" />
        </vxe-select>
      </p>
      <!-- 策略列表表格 -->
      <div style="height: 90%;">
        <vxe-table :data="strategyList" border round style="width: 100%" size="small" height="auto" :scroll-y="{ enabled: true, gt: 10 }">
          <vxe-column field="xh" type="seq" align="center" title="序号" width="5%"></vxe-column>
          <vxe-column field="name" title="策略名称" min-width="50" align="center" />
          <vxe-column field="ruleFile" title="规则文件" min-width="220" />
          <!-- <vxe-column field="returnType" title="文件类型" min-width="30" align="center" /> -->
          <vxe-column field="returnType" title="文件类型" min-width="30" width="80" align="center">
            <template #default="{ row }">
              <span v-if="row.returnType === 'rank'" class="tag tag-rank">
                RANK
              </span>
              <span v-else-if="row.returnType === 'score'" class="tag tag-score">
                SCORE
              </span>
              <span v-else-if="row.returnType === 'flag'" class="tag tag-flag">
                FLAG
              </span>
              <span v-else-if="row.returnType === 's2s'" class="tag tag-s2s">
                S2S
              </span>
              <span v-else-if="row.returnType === 'json'" class="tag tag-json">
                JSON
              </span>
              <span v-else-if="row.returnType === 'distribute'" class="tag tag-distribute tag-xlong">
                DISTRIBUTE
              </span>
              <span v-else class="tag tag-default">-</span>
            </template>
          </vxe-column>
          <vxe-column field="eventType" title="可用范围" min-width="50" width="80" align="center">
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
          <vxe-column field="deviceSource" title="设备来源" min-width="30" width="80" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.deviceSource === 'offline'" type="danger" size="small">离线</el-tag>
              <el-tag v-else-if="row.deviceSource === 'online'" type="primary" size="small">实时</el-tag>
              <el-tag v-else type="info" size="small">未知</el-tag>
            </template>
          </vxe-column>
          <vxe-column field="isusing" title="是否使用" min-width="50" width="80" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.isusing" type="success" size="small">是</el-tag>
              <el-tag v-else type="error" size="small">否</el-tag>
            </template>
          </vxe-column>
          <vxe-column field="description" title="描述" min-width="110" show-header-overflow show-overflow />
          <vxe-column title="操作" width="320" fixed="right" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" plain @click="handleView(row)">查看</el-button>
              <el-button size="small" type="success" plain @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" type="danger" plain @click="handleDelete(row)"
                :disabled="!props.isSuperAdmin">删除</el-button>
              <el-button size="small" type="warning" plain @click="handlePreview(row)">预览</el-button>
              <el-button size="small" color="#626aef" :dark="isDark" plain @click="handleDownload(row.ruleFile)">下载</el-button>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
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
          <el-select v-model="formData.returnType" placeholder="请选择返回类型" :disabled="isView"
            @change="handleReturnTypeChange">
            <el-option label="RANK" value="rank" />
            <el-option label="FLAG" value="flag" />
            <el-option label="SCORE" value="score" />
            <el-option label="S2S" value="s2s" />
            <el-option label="DISTRIBUTE" value="distribute" />
          </el-select>
        </el-form-item>
        <el-form-item label="可用范围" prop="eventType">
          <el-select v-model="formData.eventType" placeholder="请选择可用范围" :disabled="!props.isSuperAdmin">
            <el-option label="点击" value="click" />
            <el-option label="展示" value="imp" />
            <el-option label="全部" value="all" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备来源" prop="deviceSource">
          <!-- <el-switch v-model="formData.deviceSource" active-text="实时" inactive-text="离线" /> -->
          <el-select v-model="formData.deviceSource" placeholder="请选择设备来源" :disabled="isView || returnTypeChange">
            <el-option label="离线" value="offline" />
            <el-option label="实时" value="online" />
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
    <!-- 通用 CSV 预览组件（可复用） -->
    <CsvPreviewDialog ref="csvRef"  :maxPreviewLines="Infinity"
      :style="{ height: '85vh', overflowY: 'auto' }" />

  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reqStrategyList, reqCreateOrUpdate, reqDeleteStrategy } from '@/api/strategyAutoDelivery/strategyPage/index'
import type { Strategy } from '@/api/strategyAutoDelivery/strategyPage/type'
import type { FormInstance, FormRules } from 'element-plus'
import XEUtils from 'xe-utils'
import CsvPreviewDialog from '@/components/CsvPreviewDialog.vue'
import { handleDownload } from '@/utils/common'
import { useDark } from '@vueuse/core' // 替代原来的 ~/composables/dark
import type { VxeSelectEvents } from 'vxe-table'
import { deleteAlgDataCheck } from '@/utils/common'
// 获取父级传递的 isSuperAdmin,mode 属性
const props = defineProps<{
  mode: 'click' | 'imp' | 'all',
  isSuperAdmin: boolean
}>()
// 是否暗色模式（自动跟随 prefers-color-scheme，也可手动切换）
const isDark = useDark()
// 响应式数据
const strategyList = ref<Strategy[]>([])
const strategyListBackUp = ref<Strategy[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isView = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const returnTypeChange = ref(false);

// 表单数据 - 使用ref实现，id为可选字段
const formData = ref<Omit<Strategy, 'id'> & { id?: number }>({
  name: '',
  ruleFile: '',
  returnType: '',
  description: '',
  deviceSource: 'online',
  eventType: props.mode
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
  ],
  eventType: [
    { required: true, message: '请选择可用范围', trigger: 'change' }
  ]
}
const returnType = ref('')
const deviceSourceOption = ref('online')
// 获取策略列表
const getStrategyList = async () => {
  try {
    const response = await reqStrategyList({ returnType: returnType.value, eventType: (props.mode == 'click' ? 'click,all' : props.mode == 'imp' ? 'imp,all' : 'click,imp,all'),sourceType:'system' })
    // strategyList.value = response.data || []
    strategyListBackUp.value = response.data || []
    applyDeviceSource(String(deviceSourceOption.value || ''))
  } catch (error) {
    ElMessage.error('获取策略列表失败')
  }
}
// 抽出通用过滤逻辑（接收字符串）
const filterName = ref('')
const applyDeviceSource = (val: string) => {
  let strategyListFiltered: any[] = []
  if (val === 'online') {
    strategyListFiltered = strategyListBackUp.value.filter(item => item.deviceSource === 'online')
  } else if (val === 'offline') {
    strategyListFiltered = strategyListBackUp.value.filter(item => item.deviceSource === 'offline')
  } else {
    strategyListFiltered = strategyListBackUp.value
  }
  const filterVal = String(filterName.value).trim().toLowerCase()
  if (filterVal) {
    const filterRE = new RegExp(filterVal, 'gi')
    const searchProps = ['name', 'ruleFile', 'returnType', 'description', 'deviceSource']
    const rest = strategyListFiltered.filter((item: any) => searchProps.some(key => String(item[key]).toLowerCase().indexOf(filterVal) > -1))
    strategyList.value = rest.map(row => {
      // 搜索为克隆数据，不会污染源数据
      const item = XEUtils.clone(row) as any
      searchProps.forEach((key: any) => {
        item[key] = String(item[key]).replace(filterRE, match => `${match}`)
      })
      return item
    })
  } else {
    strategyList.value = strategyListFiltered
  }
}
// 监听顶部传入的 mode 变化，清空筛选条件和列表
watch(() => props.mode, (newVal) => {
  filterName.value = ''
  deviceSourceOption.value = 'online'
  returnType.value = ''
  strategyListBackUp.value = []
  strategyList.value = []
})

// 节流函数,间隔500毫秒触发搜索
const searchEvent = XEUtils.throttle(function () {
  applyDeviceSource(String(deviceSourceOption.value || ''))
}, 500, { trailing: true, leading: true })

// vxe-select 的 change 事件签名：({ value, $event, ... })
const handleDeviceSource: VxeSelectEvents.Change = ({ value }) => {
  applyDeviceSource(String(value || ''))
}
watch(deviceSourceOption, (newVal) => {
  applyDeviceSource(String(newVal || ''))
}, { immediate: true })
// 重置表单
const resetForm = () => {
  formData.value = {
    name: '',
    ruleFile: '',
    returnType: '',
    description: '',
    deviceSource: 'online',
    eventType: props.mode
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
  returnTypeChange.value = false
}

// 编辑策略
const handleEdit = (row: Strategy) => {
  formData.value = { ...row } // 包含id
  dialogTitle.value = '编辑策略'
  isView.value = false
  if (formData.value.returnType === 'distribute') {
    returnTypeChange.value = true
  } else {
    returnTypeChange.value = false
  }
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
  // 删除之前判断isusing字段 是否为true，如果是true则不允许删除
  if (!deleteAlgDataCheck(row,'自动策略')) return
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
    // 编辑时包含id，传formData中的id,description,deviceSource,eventType,name,returnType,ruleFile字段
    const submitData = {
      ...(formData.value.id && { id: formData.value.id }),
      name: formData.value.name,
      ruleFile: formData.value.ruleFile,
      returnType: formData.value.returnType,
      description: formData.value.description,
      deviceSource: formData.value.deviceSource,
      eventType: formData.value.eventType,
      sourceType:'system'
    }

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
const handleReturnTypeChange = (val: string) => {
  if (val === 'distribute') {
    returnTypeChange.value = true
    formData.value.deviceSource = 'offline'
  } else {
    returnTypeChange.value = false
  }
}

// 预览（调用通用组件）
const csvRef = ref<InstanceType<any> | null>(null)
const handlePreview = async (row: Strategy) => {
  // const objectName = String(row.ruleFile || '').trim().replace(/^oss:\/\//, '')
  const objectName = String(row.ruleFile || '').trim()
  if (!objectName) {
    ElMessage.warning('规则文件路径为空，无法预览')
    return
  }
  csvRef.value?.open(objectName, `CSV 预览 - ${row.name || ''}`)
}
// 页面初始化
onMounted(() => {
  // getStrategyList()
})
</script>

<style lang="scss" scoped>
.strategy-page {
  height: $base-alg-platform-height; // 计算高度减去底部栏

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