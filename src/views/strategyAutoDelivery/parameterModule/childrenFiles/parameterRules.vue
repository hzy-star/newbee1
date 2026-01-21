<!-- 参数规则模块 -->
<template>
  <div class="body-box">
    <!-- 外层 Tab -->
    <el-tabs class="type-tabs" v-model="outerTab" @tab-change="handleTabChange">
      <el-tab-pane label="点击" name="click" />
      <el-tab-pane label="展示" name="imp" />
      <el-tab-pane label="全部" name="all" />
    </el-tabs>

    <!-- 工具栏 -->
    <div class="toolbar-container">
      <p class="toolbar-left">
        <vxe-select v-model="selectedFtype" placeholder="请选择功能类型" size="mini" @change="handleFtypeChange">
          <vxe-option v-for="item in categoryList" :key="item" :label="item" :value="item" />
        </vxe-select>
        <vxe-input v-model="searchKeyword" type="search" placeholder="搜索功能名" clearable size="mini" />
        <vxe-select v-model="selectedDeviceSource" placeholder="实时/离线" clearable size="mini"
          @change="handleDeviceSource">
          <vxe-option label="实时" value="online" />
          <vxe-option label="离线" value="offline" />
        </vxe-select>
        <vxe-select v-model="enabledofdisabled" placeholder="启用/禁用" clearable size="mini"
          @change="handleEnabledOfDisabled">
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
          <vxe-column field="xh" type="seq" align="center" title="序号" width="60" />
          <vxe-column field="name" title="功能名称" min-width="150" align="center" />
          <vxe-column field="ftype" title="功能类型" min-width="100" align="center" />
          <vxe-column field="propertyConfig" title="规则文件" min-width="300">
            <template #default="{ row }">
              <el-tooltip effect="dark" :content="row.propertyConfig" placement="top">
                <div class="rule-file-cell">{{ row.propertyConfig }}</div>
              </el-tooltip>
            </template>
          </vxe-column>
          <vxe-column field="eventType" title="可用范围" min-width="50" width="80" align="center">
            <template #default="{ row }">
              <span :class="['tag', getEventTypeClass(row.eventType)]">
                {{ getEventTypeLabel(row.eventType) }}
              </span>
            </template>
          </vxe-column>
          <vxe-column field="status" title="状态" min-width="30" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : row.status === 'disabled' ? 'danger' : 'info'"
                size="small">
                {{ row.status === 'enabled' ? '启用' : row.status === 'disabled' ? '禁用' : '未知' }}
              </el-tag>
            </template>
          </vxe-column>
          <vxe-column field="deviceSource" title="设备来源" min-width="100" width="80" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.deviceSource === 'offline'" type="danger" size="small">离线</el-tag>
              <el-tag v-else-if="row.deviceSource === 'online'" type="primary" size="small">实时</el-tag>
              <el-tag v-else type="info" size="small">未知</el-tag>
            </template>
          </vxe-column>
          <vxe-column field="description" title="描述" min-width="210">
            <template #default="{ row }">
              <el-tooltip effect="dark" :content="row.description" placement="top">
                <div class="rule-file-cell">{{ row.description }}</div>
              </el-tooltip>
            </template>
          </vxe-column>
          <vxe-column title="操作" width="300" fixed="right" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" plain @click="handleView(row)">查看</el-button>
              <el-button size="small" type="success" plain @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" type="warning" plain @click="handleEditContent(row)"
                v-if="row.sourceType == 'custom' && isLocalContentType">编辑内容</el-button>
              <el-button size="small" color="#a59a00" :dark="isDark" plain @click="handlePreview(row)"
                v-if="row.sourceType == 'system' && isLocalContentType">预览内容</el-button>
              <el-button size="small" color="#626aef" :dark="isDark" plain
                @click="handleDownload(row.propertyConfig)" v-if="isLocalContentType">下载</el-button>
              <!-- <el-button size="small" type="danger" plain @click="handleDelete(row)" :disabled="!isSuperAdmin">
                删除
              </el-button> -->
            </template>
          </vxe-column>
        </vxe-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <vxe-pager v-model:currentPage="pageVO.currentPage" v-model:pageSize="pageVO.pageSize" :total="pageVO.total"
          :pageSizes="[10, 20, 50, 100]" :layouts="['Total', 'Sizes', 'PrevPage', 'Number', 'NextPage', 'FullJump']"
          @page-change="pageChange" />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" :before-close="handleClose">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <!-- 功能类型 -->
        <el-form-item label="功能类型" prop="ftype">
          <el-select v-model="formData.ftype" placeholder="请选择功能类型" disabled @change="handleFtypeDialogChange">
            <el-option v-for="item in categoryList" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <!-- 公共表单项 -->
        <el-form-item label="功能名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入功能名称" :disabled="isView" />
        </el-form-item>

        <el-form-item label="可用范围" prop="eventType">
          <el-select v-model="formData.eventType" placeholder="请选择可用范围" :disabled="isView">
            <el-option label="点击" value="click" />
            <el-option label="展示" value="imp" />
            <el-option label="全部" value="all" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="启用/禁用" :disabled="isView">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>

        <el-form-item label="实时/离线" prop="deviceSource">
          <el-select v-model="formData.deviceSource" placeholder="实时/离线" :disabled="isView">
            <el-option label="实时" value="online" />
            <el-option label="离线" value="offline" />
          </el-select>
        </el-form-item>

        <el-form-item label="来源类型" prop="sourceType" v-if="isCreate">
          <el-select v-model="formData.sourceType" placeholder="请选择来源类型" :disabled="isView || !isSuperAdmin">
            <el-option label="系统内置" value="system" />
            <el-option label="用户自定义" value="custom" />
          </el-select>
        </el-form-item>

        <!-- localContent 类型特有表单项 -->
        <template v-if="isLocalContentType">
          <!-- 上传文件 -->
          <el-form-item label="上传文件" v-if="showFileUpload">
            <div class="csv-input-wrapper">
              <el-upload class="upload-demo" drag :auto-upload="false" :file-list="csvFileList"
                :on-change="handleFileChange" :on-remove="handleFileRemove" :limit="1">
                <i class="el-icon-upload" />
                <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
              </el-upload>
              <div class="upload-tip">上传 CSV 文件后，将优先使用文件内容（file 字段），不再显示手动输入框。</div>
            </div>
          </el-form-item>

          <!-- OSS 地址 -->
          <el-form-item label="OSS地址" v-if="showOssInput" :prop="showOssInput ? 'propertyConfig' : ''">
            <el-input v-model="formData.propertyConfig" placeholder="请输入 OSS 地址，如：oss://bucket/path/file.csv"
              :disabled="isView" />
          </el-form-item>

          <!-- 自定义配置 -->
          <el-form-item label="自定义配置" v-if="showCustomInput">
            <div class="custom-config-wrapper">
              <div class="delimiter-row">
                <span>请选择或输入分隔符</span>
                <el-select v-model="batchDelimiter" placeholder="请选择或输入分隔符" size="small" class="delimiter-select"
                  filterable allow-create default-first-option @change="handleDelimiterChange">
                  <el-option label="逗号 (,)" value="," />
                  <el-option label="分号 (;)" value=";" />
                  <el-option label="感叹号 (!)" value="!" />
                  <el-option label="竖线 (|)" value="|" />
                </el-select>
              </div>
              <el-input v-model="csvText" type="textarea" :rows="6" :placeholder="customInputPlaceholder"
                :disabled="isView || !hasDelimiterSelected" />
              <div class="input-tip">
                {{ hasDelimiterSelected ? '当输入文本时，将使用 csvData 字段，隐藏文件上传功能。' : '请先选择分隔符后再输入内容。' }}
              </div>
            </div>
          </el-form-item>
        </template>

        <!-- 非 localContent 类型特有表单项 -->
        <el-form-item v-else label="配置内容" prop="propertyConfig">
          <el-input v-model="formData.propertyConfig" type="textarea" :rows="10" placeholder="请输入配置内容"
            :disabled="isView" />
        </el-form-item>

        <!-- 描述（公共） -->
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" placeholder="请输入描述" :disabled="isView" />
        </el-form-item>
      </el-form>

      <template #footer v-if="!isView">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>

  <GeneralCsvEditing mode="dialog" v-model:visible="visible" :csv-path="csvPath" title="通用 CSV 编辑" />
  <!-- 通用 CSV 预览组件（可复用） -->
  <CsvPreviewDialog ref="csvRef" :maxPreviewLines="Infinity" :style="{ height: '85vh', overflowY: 'auto' }" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reqCateGory, reqPageList, reqCreateOrUpdate, reqCreateOrUpdate2 } from '@/api/strategyAutoDelivery/parameterModule/parameterRules/index'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { localContentConfig, localContentTypes } from '@/utils/constants'
import GeneralCsvEditing from '@/components/GeneralCsvEditing/index.vue'
import { handleDownload } from '@/utils/common'
import CsvPreviewDialog from '@/components/CsvPreviewDialog.vue'
import { useDark } from '@vueuse/core' // 替代原来的 ~/composables/dark
import useCookie from '@/store/modules/cookie'

// ==================== 用户信息 ====================
const useCookies = useCookie()
const isSuperAdmin = computed(() => useCookies.userRole === 'superAdmin')

// 是否暗色模式（自动跟随 prefers-color-scheme，也可手动切换）
const isDark = useDark()
// ==================== 状态定义 ====================
const outerTab = ref<'click' | 'imp' | 'all'>('all')
const categoryList = ref<string[]>([])
const selectedFtype = ref('')
const searchKeyword = ref('')
const enabledofdisabled = ref('')
const tableData = ref<any[]>([])
const selectedDeviceSource = ref<string>('')

// 分页
const pageVO = ref({ currentPage: 1, pageSize: 10, total: 0 })

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isView = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

// 文件上传
const csvFileList = ref<UploadFile[]>([])
const csvText = ref('')
const batchDelimiter = ref('')
const previousDelimiter = ref('')
// 编辑内容
const visible = ref(false)
const csvPath = ref('')
// 表单数据
const formData = ref<any>({
  name: '',
  ftype: '',
  eventType: 'click',
  status: 'enabled',
  sourceType: 'custom',
  deviceSource: 'online',
  propertyConfig: '',
  description: ''
})

// ==================== 计算属性 ====================
const isLocalContentType = computed(() => localContentTypes.includes(selectedFtype.value))
const isCreate = computed(() => !formData.value.id)
const hasFileUpload = computed(() => csvFileList.value.length > 0)
const hasOssInput = computed(() => {
  const config = formData.value.propertyConfig || ''
  return config.trim().length > 0 && config.startsWith('oss://')
})
const hasDelimiterSelected = computed(() => batchDelimiter.value.trim().length > 0)
const hasCustomInput = computed(() => hasDelimiterSelected.value && csvText.value.trim().length > 0)

// 显示控制
// 系统内置：只显示 OSS 地址输入框
// 用户自定义：显示上传文件和自定义配置，隐藏 OSS 地址
const isSystemSource = computed(() => formData.value.sourceType === 'system')
const isCustomSource = computed(() => formData.value.sourceType === 'custom')

// 上传文件：新增模式 + 用户自定义 + 没有选择分隔符 + 非查看模式
const showFileUpload = computed(() => isCreate.value && isCustomSource.value && !hasDelimiterSelected.value && !isView.value)
// OSS地址：新增模式 + 系统内置时显示
const showOssInput = computed(() => isCreate.value && isSystemSource.value)
// 自定义配置：新增模式 + 用户自定义 + 没有上传文件 + 非查看模式
const showCustomInput = computed(() => isCreate.value && isCustomSource.value && !hasFileUpload.value && !isView.value)

// 动态 placeholder
const customInputPlaceholder = computed(() => {
  if (!hasDelimiterSelected.value) return '请先选择分隔符'
  const header = getDefaultHeader(formData.value.ftype, batchDelimiter.value)
  if (!header) return '请输入自定义配置内容'
  const d = batchDelimiter.value
  return `请输入配置内容，表头：${header}\n每行一条数据，使用选定的分隔符分隔字段。\n例如：\nCN${d}com.example.app${d}sync${d}type1\nUS${d}com.test.app${d}async${d}type2`
})

// 表单验证规则
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    ftype: [{ required: true, message: '请选择功能类型', trigger: 'change' }]
  }
  if (isLocalContentType.value) {
    rules.name = [{ required: true, message: '请输入功能名称', trigger: 'blur' }]
    rules.eventType = [{ required: true, message: '请选择可用范围', trigger: 'change' }]
    rules.status = [{ required: true, message: '请选择状态', trigger: 'change' }]
    rules.deviceSource = [{ required: true, message: '请选择实时或离线', trigger: 'change' }]
    rules.sourceType = [{ required: true, message: '请选择来源类型', trigger: 'change' }]
    if (!hasFileUpload.value && !hasCustomInput.value) {
      rules.propertyConfig = [{ required: true, message: '请输入内容', trigger: 'blur' }]
    }
  } else {
    rules.propertyConfig = [{ required: true, message: '请输入配置内容', trigger: 'blur' }]
  }
  return rules
})

// ==================== 工具函数 ====================
const getDefaultHeader = (ftype: string, delimiter: string): string => {
  const config = localContentConfig[ftype]
  return config?.headers?.length ? config.headers.join(delimiter) : ''
}

const getEventTypeClass = (eventType: string) => {
  const classMap: Record<string, string> = { click: 'tag-click', imp: 'tag-imp' }
  return classMap[eventType] || 'tag-default'
}

const getEventTypeLabel = (eventType: string) => {
  const labelMap: Record<string, string> = { click: '点击', imp: '展示' }
  return labelMap[eventType] || '全部'
}

const buildBaseData = () => ({
  name: formData.value.name,
  description: formData.value.description,
  ftype: formData.value.ftype,
  eventType: formData.value.eventType,
  sourceType: formData.value.sourceType,
  deviceSource: formData.value.deviceSource,
  propertyConfig: formData.value.propertyConfig,
  status: formData.value.status,
  lastUpdateUser: useCookies.username,
  ...(formData.value.id && { id: formData.value.id })
})

const conversion = () => {
  const lines = (csvText.value || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (!lines.length) {
    ElMessage.warning('请至少输入一行内容')
    return null
  }
  return JSON.stringify(lines.map(line => line.split(batchDelimiter.value)))
}

const resetForm = () => {
  formData.value = {
    name: '',
    ftype: selectedFtype.value,
    eventType: outerTab.value,
    status: 'enabled',
    sourceType: isSuperAdmin.value ? 'system' : 'custom',
    deviceSource: 'online',
    propertyConfig: '',
    description: ''
  }
  csvFileList.value = []
  csvText.value = ''
  batchDelimiter.value = ''
  previousDelimiter.value = ''
  formRef.value?.clearValidate()
}

// ==================== API 调用 ====================
const getCategoryList = async () => {
  try {
    const res = await reqCateGory()
    if (res.success) {
      categoryList.value = res.data || []
      if (categoryList.value.length) {
        selectedFtype.value = categoryList.value[0]
        handleQuery()
      }
    }
  } catch {
    ElMessage.error('获取功能类型列表失败')
  }
}

const handleQuery = async () => {
  if (!selectedFtype.value) {
    ElMessage.warning('请先选择功能类型')
    return
  }
  try {
    const params: any = {
      ftype: selectedFtype.value,
      eventType: outerTab.value === 'all' ? 'click,imp,all' : `${outerTab.value},all`,
      deviceSource: selectedDeviceSource.value || '',
      sourceType: isSuperAdmin.value ? 'system' : 'custom',
      status: enabledofdisabled.value || '',
      page: pageVO.value.currentPage,
      limit: pageVO.value.pageSize,
      ...(searchKeyword.value && { name: searchKeyword.value })
    }
    const res = await reqPageList(params)
    if (res.success) {
      tableData.value = res.data.data || []
      pageVO.value.total = res.data.total || 0
    }
  } catch {
    ElMessage.error('查询失败')
  }
}

// ==================== 事件处理 ====================
const handleTabChange = () => {
  pageVO.value.currentPage = 1
  handleQuery()
}

const handleFtypeChange = () => handleQuery()
const handleDeviceSource = () => handleQuery()
const handleEnabledOfDisabled = () => handleQuery()
const pageChange = ({ currentPage, pageSize }: any) => {
  pageVO.value.currentPage = currentPage
  pageVO.value.pageSize = pageSize
  handleQuery()
}

const handleFtypeDialogChange = () => {
  formData.value.propertyConfig = ''
  csvFileList.value = []
  csvText.value = ''
  batchDelimiter.value = ''
  previousDelimiter.value = ''
}

const handleDelimiterChange = () => {
  const newDelimiter = batchDelimiter.value
  const oldDelimiter = previousDelimiter.value

  // 如果新旧分隔符相同，不做任何处理
  if (newDelimiter === oldDelimiter) return

  if (csvText.value && oldDelimiter) {
    // 转义正则特殊字符，然后全局替换旧分隔符为新分隔符
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, (match) => '\\' + match)
    const escaped = escapeRegex(oldDelimiter)
    csvText.value = csvText.value.split('\n')
      .map(line => line.replace(new RegExp(escaped, 'g'), newDelimiter))
      .join('\n')
  } else if (!csvText.value && localContentConfig[formData.value.ftype]) {
    // 如果没有内容，则设置默认表头
    const header = getDefaultHeader(formData.value.ftype, newDelimiter)
    if (header) csvText.value = header
  }
  previousDelimiter.value = newDelimiter
}

const handleFileChange = (file: UploadFile, list: UploadFile[]) => {
  csvFileList.value = list
  if (list.length) {
    formData.value.propertyConfig = ''
    csvText.value = ''
  }
}

const handleFileRemove = (_: UploadFile, list: UploadFile[]) => {
  csvFileList.value = list
}

// ==================== CRUD 操作 ====================
const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增功能'
  isView.value = false
  dialogVisible.value = true
}

const handleView = (row: any) => {
  formData.value = { ...row }
  dialogTitle.value = '查看功能'
  isView.value = true
  dialogVisible.value = true
  csvFileList.value = []
  csvText.value = ''
  batchDelimiter.value = ''
  previousDelimiter.value = ''
}

const handleEdit = (row: any) => {
  formData.value = { ...row }
  dialogTitle.value = '编辑功能'
  isView.value = false
  dialogVisible.value = true
  csvFileList.value = []
  csvText.value = ''
  batchDelimiter.value = ''
  previousDelimiter.value = ''
}

// 预览（调用通用组件）
const csvRef = ref<any>(null)
const handlePreview = async (row: any) => {
  const objectName = String(row.propertyConfig || '').trim()
  if (!objectName) {
    ElMessage.warning('规则文件路径为空，无法预览')
    return
  }
  csvRef.value?.open(objectName, `CSV 预览 - ${row.name || ''}`)
}
// 编辑内容
const handleEditContent = (row: any) => {
  csvPath.value = row.propertyConfig // 你的业务里拿到的地址oss://ym-east-data/data/ym_push/zxw_test/rank/flowAlgIMP.csv
  visible.value = true
}
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定删除功能: ${row.name} ?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // TODO: 调用删除接口
    ElMessage.success('删除成功')
    handleQuery()
  } catch {
    console.log('取消删除')
  }
}

const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    const isValid = await formRef.value.validate()
    if (!isValid) return

    submitLoading.value = true

    if (isLocalContentType.value) {
      if (hasOssInput.value) {
        // OSS 地址提交
        const res: any = await reqCreateOrUpdate(buildBaseData())
        handleSubmitResult(res)
      } else if (hasFileUpload.value || hasCustomInput.value) {
        // 文件或自定义内容提交
        const payload: any = { data: buildBaseData() }

        if (hasFileUpload.value) {
          const fileObj = csvFileList.value[0]?.raw
          if (!fileObj) {
            ElMessage.error('CSV 文件异常，请重新选择')
            return
          }
          payload.file = fileObj
        } else if (hasCustomInput.value) {
          const csvData = conversion()
          if (!csvData) {
            submitLoading.value = false
            return
          }
          payload.csvData = csvData
        }
        debugger
        if (!isCreate.value) {
          payload.data.ruleFile = formData.value.ruleFile || ''
        }
        payload.data = JSON.stringify(payload.data)

        const res: any = await reqCreateOrUpdate2(payload)
        handleSubmitResult(res)
      } else {
        ElMessage.warning('请输入 OSS 地址、上传文件或输入自定义配置')
      }
    } else {

      // 非 localContent 类型
      const res: any = await reqCreateOrUpdate(buildBaseData())
      handleSubmitResult(res)
    }
  } catch (error: any) {
    console.error('表单提交异常:', error.message)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    submitLoading.value = false
  }
}

const handleSubmitResult = (res: any) => {
  if (res.success) {
    ElMessage.success(formData.value.id ? '更新成功' : '创建成功')
    dialogVisible.value = false
    handleQuery()
  } else {
    ElMessage.error(res.message || '保存失败')
  }
}

// ==================== 生命周期 ====================
onMounted(() => getCategoryList())
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

      &.is-active {
        font-weight: 500;
      }
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

.rule-file-cell {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.csv-input-wrapper,
.custom-config-wrapper {
  width: 100%;
}

.upload-tip,
.input-tip {
  margin-top: 8px;
  color: #999;
  font-size: 12px;
}

.delimiter-row {
  margin-bottom: 10px;
}

.delimiter-select {
  width: 180px;
  margin: 0 8px;
}
</style>
