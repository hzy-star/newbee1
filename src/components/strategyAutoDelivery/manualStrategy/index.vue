<template>
    <div class="strategy-page">
        <div class="page-header">
            <el-button type="primary" @click="handleSearchEngine">查询</el-button>
            <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
        <div class="page-content">
            <p>
                <vxe-input v-model="filterName" type="search" placeholder="模糊搜索strategy名称" clearable
                    @change="searchEvent" size="mini"></vxe-input>
                <vxe-select v-model="returnType" type="search" placeholder="搜索文件类型" clearable size="mini"
                    @change="handleFile">
                    <vxe-option label="RANK" value="rank" />
                    <vxe-option label="FLAG" value="flag" />
                    <vxe-option label="SCORE" value="score" />
                    <vxe-option label="S2S" value="s2s" />
                    <vxe-option label="DISTRIBUTE" value="distribute" />
                    <vxe-option label="JSON" value="json" />
                    <vxe-option label="SQL" value="sql" />
                </vxe-select>
                <vxe-select v-model="deviceSourceOption" type="search" placeholder="实时/离线" clearable size="mini"
                    @change="handleDeviceSource">
                    <vxe-option label="实时" value="online" />
                    <vxe-option label="离线" value="offline" />
                </vxe-select>
                <vxe-select v-model="enabledofdisabled" type="search" placeholder="启用/禁用" clearable size="mini"
                    @change="handleEnabledOfDisabled">
                    <vxe-option label="启用" value="enabled" />
                    <vxe-option label="禁用" value="disabled" />
                </vxe-select>
            </p>
            <!-- 策略列表表格 -->
            <vxe-table :data="strategyList" border round style="width: 100%" size="small" height="90%">
                <vxe-column field="xh" type="seq" align="center" title="序号" width="5%"></vxe-column>
                <vxe-column field="name" title="策略名称" min-width="50" align="center" />
                <vxe-column field="ruleFile" title="规则文件" min-width="220" >
                    <!-- 最多显示1行，超出部分省略，鼠标放上去显示tooltip -->
                    <template #default="{ row }">
                        <el-tooltip class="item" effect="dark" :content="row.ruleFile" placement="top">
                            <div class="rule-file-cell">
                                {{ row.ruleFile }}
                            </div>
                        </el-tooltip>
                    </template>
                </vxe-column>
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
                        <span v-else-if="row.returnType === 'distribute'" class="tag tag-distribute tag-xlong">
                            DISTRIBUTE
                        </span>
                        <span v-else-if="row.returnType === 'json'" class="tag tag-json">
                            JSON
                        </span>
                        <span v-else-if="row.returnType === 'sql'" class="tag tag-sql">
                            SQL
                        </span>
                        <span v-else class="tag tag-default">-</span>
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
                <vxe-column field="deviceSource" title="设备来源" min-width="30" width="80" align="center">
                    <template #default="{ row }">
                        <el-tag v-if="row.deviceSource === 'offline'" type="danger" size="small">离线</el-tag>
                        <el-tag v-else-if="row.deviceSource === 'online'" type="primary" size="small">实时</el-tag>
                        <el-tag v-else type="info" size="small">未知</el-tag>
                    </template>
                </vxe-column>
                <vxe-column field="status" title="状态" min-width="30" width="80" align="center">
                    <template #default="{ row }">
                        <el-tag v-if="row.status === 'enabled'" type="success" size="small">启用</el-tag>
                        <el-tag v-else-if="row.status === 'disabled'" type="danger" size="small">禁用</el-tag>
                        <el-tag v-else type="info" size="small">未知</el-tag>
                    </template>
                </vxe-column>
                <vxe-column field="description" title="描述" min-width="110" show-header-overflow show-overflow />
                <vxe-column title="操作" width="300" fixed="right" align="center">
                    <template #default="{ row }">
                        <el-button size="small" type="primary" plain @click="handleView(row)">查看</el-button>
                        <el-button size="small" type="success" plain @click="handleEdit(row)">编辑</el-button>
                        <el-button size="small" type="warning" plain @click="handleEditContent(row)"
                            :disabled="row.returnType == 'json' || row.returnType == 'sql'">编辑内容</el-button>
                        <el-button size="small" type="danger" plain @click="handleDelete(row)"
                            :disabled="!props.isSuperAdmin">
                            删除
                        </el-button>
                    </template>
                </vxe-column>
            </vxe-table>
            <div class="el-pagination-container">
                <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.size"
                    :total="totalItems" layout="total, sizes, prev, pager, next, jumper"
                    :page-sizes="[10, 100, 500, 1000, 5000, 9999999999999999999]" @current-change="handlePageChange"
                    @size-change="handleSizeChange" />
            </div>
        </div>

        <!-- 新增/编辑策略弹窗 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" :before-close="handleClose">
            <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
                <el-form-item label="返回类型" prop="returnType">
                    <el-select v-model="formData.returnType" placeholder="请选择返回类型" :disabled="isView"
                        @change="handlereturnTypeChange">
                        <el-option label="RANK" value="rank" />
                        <el-option label="FLAG" value="flag" />
                        <el-option label="SCORE" value="score" />
                        <el-option label="S2S" value="s2s" />
                        <el-option label="DISTRIBUTE" value="distribute" />
                        <el-option label="JSON" value="json" />
                        <el-option label="SQL" value="sql" />
                    </el-select>
                </el-form-item>

                <el-form-item label="类型字段" v-if="returnTypeField.length">
                    <el-tag v-for="(field, index) in returnTypeField" :key="index" type="info" effect="plain"
                        style="margin-right: 5px; margin-bottom: 5px">
                        {{ field }}
                    </el-tag>
                </el-form-item>

                <el-form-item label="策略名称" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入策略名称" :disabled="isView" />
                </el-form-item>

                <el-form-item label="设备来源" prop="deviceSource">
                    <el-select v-model="formData.deviceSource" placeholder="请选择设备来源"
                        :disabled="isView || returnTypeChange">
                        <el-option label="离线" value="offline" />
                        <el-option label="实时" value="online" />
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="formData.status" placeholder="启用/禁用" :disabled="isView">
                        <el-option label="启用" value="enabled" />
                        <el-option label="禁用" value="disabled" />
                    </el-select>
                </el-form-item>
                <el-form-item label="设备个数" prop="deviceCount" v-if="!isCreate && isJsonOrSql">
                    <el-input v-model="deviceCount" placeholder="设备个数" disabled="true" />
                </el-form-item>

                <el-form-item label="发送类型" prop="eventType">
                    <el-select v-model="formData.eventType" placeholder="请选择事件类型" disabled="true">
                        <el-option label="点击" value="click" />
                        <el-option label="展示" value="imp" />
                        <el-option label="全部" value="all" />
                    </el-select>
                </el-form-item>

                <!-- SQL: 新增时为 SQL 文本框；编辑/查看仍可用原路径或文本 -->
                <el-form-item label="规则文件" prop="ruleFile" v-if="formData.returnType === 'sql'">
                    <template v-if="isCreate">
                        <el-input v-model="sqlContent" type="textarea" :rows="8" placeholder="请输入 SQL 内容"
                            :disabled="isView" />
                    </template>
                    <template v-else>
                        <el-input v-model="formData.ruleFile" type="textarea" :rows="8" placeholder="请输入 SQL 内容"
                            :disabled="isView" />
                    </template>
                </el-form-item>

                <!-- JSON：新增时可视化配置；编辑时可直接编辑 JSON 文本（也可以同样可视化，这里给简单版本） -->
                <el-form-item label="JSON 规则" prop="ruleFile" v-if="formData.returnType === 'json'">
                    <!-- <template v-if="isCreate"> -->
                    <div class="json-conditions-wrapper">
                        <div v-for="(cond, index) in jsonConditions" :key="index" class="json-condition-row">
                            <!-- 字段 -->
                            <el-select v-model="cond.field" placeholder="字段" style="width: 180px; margin-right: 8px"
                                :disabled="isView" filterable>
                                <el-option v-for="field in jsonFields" :key="field.value" :label="field.label"
                                    :value="field.value" />
                            </el-select>

                            <!-- 操作符（展示符号，绑定 EQ/IN/...） -->
                            <el-select v-model="cond.operator" placeholder="操作符" style="width: 100px; margin-right: 8px"
                                :disabled="isView">
                                <el-option v-for="(symbol, opKey) in jsonOperatorMap" :key="opKey" :label="symbol"
                                    :value="opKey" />
                            </el-select>

                            <!-- 值 -->
                            <el-input v-model="cond.value" placeholder="值" style="width: 200px; margin-right: 8px"
                                :disabled="isView" />

                            <!-- 删除条件 -->
                            <el-button v-if="!isView && jsonConditions.length > 1" type="danger" :icon="Delete" circle
                                @click="removeJsonCondition(index)" />

                        </div>

                        <div v-if="!isView" style="margin-top: 10px">
                            <el-button type="primary" link @click="addJsonCondition">
                                + 添加条件
                            </el-button>
                        </div>
                    </div>
                    <!-- </template> -->
                    <!-- <template v-else>
                        <el-input v-model="formData.ruleFile" type="textarea" :rows="8" placeholder="JSON 规则内容"
                            :disabled="isView" />
                    </template> -->
                </el-form-item>

                <!-- rank/flag/score/s2s: CSV 上传 or 手动输入 (二选一) -->
                <el-form-item label="规则内容"
                    v-if="isCreate && ['rank', 'flag', 'score', 's2s', 'distribute'].includes(formData.returnType)">
                    <div class="csv-input-wrapper">
                        <!-- 文件上传：当没有文本输入时显示 -->
                        <div v-if="!hasCsvText">
                            <el-upload class="upload-demo" drag :auto-upload="false" :file-list="csvFileList"
                                :on-change="handleCsvFileChange" :on-remove="handleCsvFileRemove" :disabled="isView">
                                <i class="el-icon-upload"></i>
                                <div class="el-upload__text">
                                    将 CSV 文件拖到此处，或 <em>点击上传</em>
                                </div>
                            </el-upload>
                            <div style="margin-top: 8px; color: #999; font-size: 12px">
                                上传 CSV 文件后，将优先使用文件内容（file 字段），不再显示手动输入框。
                            </div>
                        </div>

                        <!-- 手动输入：当没有文件时显示 -->
                        <div v-if="!hasCsvFile" style="margin-top: 10px">
                            <span>请选择或输入分隔符</span>
                            <el-select v-model="batchDelimiter" placeholder="请选择或输入分隔符" size="small"
                                style="width: 180px; margin: 0 8px;" filterable allow-create default-first-option>
                                <el-option label="逗号 (,)" value="," />
                                <el-option label="分号 (;)" value=";" />
                                <el-option label="感叹号 (!)" value="!" />
                                <el-option label="竖线 (|)" value="|" />
                            </el-select>
                            <el-input v-model="csvText" type="textarea" :rows="6"
                                :placeholder=csvPlaceholder :disabled="isView" />
                            <div style="margin-top: 8px; color: #999; font-size: 12px">
                                当输入文本时，将使用 csvData 字段，隐藏文件上传功能。
                            </div>
                        </div>
                    </div>
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
    <GeneralCsvEditing mode="dialog" v-model:visible="visible" :csv-path="csvPath" title="通用 CSV 编辑" />
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, watch, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reqManualStrategyList, reqReturnTypeType, reqCreateOrUpdate, reqDeviceCount, reqDeleteId } from '@/api/strategyAutoDelivery/manualStrategy/index'
import type { Strategy } from '@/api/strategyAutoDelivery/strategyPage/type'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import XEUtils from 'xe-utils'
import { useDark } from '@vueuse/core'
import type { VxeSelectEvents } from 'vxe-table'
import { Delete } from '@element-plus/icons-vue'
import GeneralCsvEditing from '@/components/GeneralCsvEditing/index.vue'
// 获取父级传递的 isSuperAdmin,mode 属性
const props = defineProps<{
    mode: 'click' | 'imp' | 'all',
    isSuperAdmin: boolean
}>()

// 是否暗色模式
const isDark = useDark()

const visible = ref(false)
const csvPath = ref('')
// 响应式数据
const strategyList = ref<Strategy[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isView = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const batchDelimiter = ref(',')
const returnTypeChange = ref(false);
const deviceCount = ref('');
const isJsonOrSql = ref(false);

const totalItems = ref(0)
interface Pagination {
    current: number
    size: number
}
const pagination = reactive<Pagination>({
    current: 1,
    size: 100
})
const csvPlaceholder = `手动输入 CSV 数据,需要对应‘返回类型’字段顺序，每行一条数据，使用选定的分隔符分隔字段。
例如：
value1,value2,ios,CN,Safari,67890
value1,value2,android,US,Chrome,12345`;
// 表单数据 - 使用ref实现，id为可选字段
const formData = ref<Omit<Strategy, 'id'> & { id?: number }>({
    name: '',
    ruleFile: '',
    returnType: '',
    description: '',
    deviceSource: 'online',
    status: 'enabled',
    eventType: props.mode
})

// 是否为新增（无 id 即新增）
const isCreate = computed(() => !formData.value.id)

// 表单验证规则
const formRules: FormRules = {
    name: [
        { required: true, message: '请输入策略名称', trigger: 'blur' }
    ],
    returnType: [
        { required: true, message: '请输入返回类型', trigger: 'blur' }
    ],
    eventType: [
        { required: true, message: '请选择事件类型', trigger: 'change' }
    ]
    // ruleFile 根据具体类型在提交时做校验
}

const returnType = ref('')
const deviceSourceOption = ref('online')
const enabledofdisabled = ref('enabled')

// SQL 内容：新增 SQL 时使用
const sqlContent = ref('')

// CSV 文件 & 文本
const csvFileList = ref<UploadFile[]>([])
const csvText = ref('')

// 是否有文件/文本（控制二选一显示）
const hasCsvFile = computed(() => csvFileList.value.length > 0)
const hasCsvText = computed(() => csvText.value.trim().length > 0)

// JSON 配置相关
const jsonFields = [
    { value: 'country', label: '国家' },
    { value: 'make', label: '厂商' },
    { value: 'model', label: '机型' },
    { value: 'city', label: '城市' },
    { value: 'os', label: '平台' },
    { value: 'osversion', label: '系统版本' },
    { value: 'userActive', label: '距今活跃天数' },
    { value: 'userBundleSize15D', label: '近15天打开的app个数' },
    { value: 'userBundleSize180D', label: '近180天打开的app个数' },
    { value: 'userBundleSize', label: '历史总打开的app个数' },
    { value: 'shopping', label: '安装购物类 APP' },
    { value: 'social', label: '安装社交类 APP' },
    { value: 'loan', label: '安装借贷类 APP' },
    { value: 'tools', label: '安装工具类 APP' },
    { value: 'food_driver', label: '安装吃喝类 APP' },
    { value: 'userCategory7DTop1', label: '近7天最喜欢的app类目' },
    { value: 'userCategory15DTop1', label: '近15天最喜欢的app类目' },
    { value: 'userCategory60DTop1', label: '近60天最喜欢的app类目' },
    { value: 'userCategory60DTop2', label: '近60天次喜欢的app类目' },
    { value: 'userCategory180DTop1', label: '近180天最喜欢的app类目' },
    { value: 'userCategory180DTop2', label: '近180天次喜欢的app类目' },
    { value: 'userCategory180DTop3', label: '近180天喜欢的app类目' },
    { value: 'userCategoryTop1', label: '喜欢的app类目top1' },
    { value: 'userCategoryTop2', label: '喜欢的app类目top2' },
    { value: 'userCategoryTop3', label: '喜欢的app类目top3' },
    { value: 'extra1', label: '综合分数' }
]


const jsonOperatorMap: Record<string, string> = {
    EQ: '=',
    LIKE: 'LIKE',
    IN: 'IN',
    GT: '>',
    GE: '>=',
    LT: '<',
    LE: '<='
}

interface JsonCondition {
    field: string
    operator: keyof typeof jsonOperatorMap | ''
    value: string
}

const jsonConditions = ref<JsonCondition[]>([
    { field: '', operator: 'EQ', value: '' }
])

const addJsonCondition = () => {
    jsonConditions.value.push({ field: '', operator: 'EQ', value: '' })
}

const removeJsonCondition = (index: number) => {
    if (jsonConditions.value.length <= 1) return
    jsonConditions.value.splice(index, 1)
}

// 归类查询参数
const objectToParams = () => {
    const params = {
        name: String(filterName.value).trim().toLowerCase(), // 模糊搜索值
        returnType: String(returnType.value || ''), // 文件类型
        deviceSource: String(deviceSourceOption.value || ''), // 设备来源
        status: String(enabledofdisabled.value || '') // 启用/禁用
    }
    // 过滤空参数
    Object.keys(params).forEach(key => {
        if (!params[key as keyof typeof params]) {
            delete params[key as keyof typeof params]
        }
    })
    return params
}
// 分页处理
const handlePageChange = (newPage: number) => {
    pagination.current = newPage
    debugger
    getStrategyList(objectToParams())
}

const handleSizeChange = (newSize: number) => {
    pagination.size = newSize
    pagination.current = 1
    debugger
    getStrategyList(objectToParams())
}

// 获取策略列表
const getStrategyList = async (obj: any) => {
    try {
        const params = {
            eventType: [] as string[],
            page: pagination.current,
            limit: pagination.size,
            sourceType: 'custom', // 手动策略
        }
        if (props.mode !== 'all') {
            params.eventType = [props.mode, 'all']
        } else {
            params.eventType = ['click', 'imp', 'all']
        }
        Object.assign(params, obj)
        const response = await reqManualStrategyList(params)
        totalItems.value = response.data.total
        strategyList.value = response.data.data || []
        // applyDeviceSource(String(deviceSourceOption.value || ''), String(enabledofdisabled.value || ''))
    } catch (error) {
        ElMessage.error('获取策略列表失败')
    }
}

// 过滤逻辑
const filterName = ref('')


// 监听 mode 变化
watch(() => props.mode, () => {
    filterName.value = ''
    deviceSourceOption.value = 'online'
    enabledofdisabled.value = 'enabled'
    returnType.value = ''
    strategyList.value = []
})

// 搜索节流
const searchEvent = XEUtils.throttle(function () {
    debugger
    getStrategyList(objectToParams())
}, 500, { trailing: true, leading: true })

// vxe-select 设备源 change
const handleDeviceSource: VxeSelectEvents.Change = ({ value }) => {
    debugger
    getStrategyList(objectToParams())
}
const handleEnabledOfDisabled: VxeSelectEvents.Change = ({ value }) => {
    debugger
    getStrategyList(objectToParams())
}
const handleFile: VxeSelectEvents.Change = ({ value }) => {
    debugger
    getStrategyList(objectToParams())
}
// 重置表单
const resetForm = () => {
    formData.value = {
        name: '',
        ruleFile: '',
        returnType: '',
        description: '',
        deviceSource: 'online',
        status: 'enabled',
        eventType: props.mode
    }
    sqlContent.value = ''
    csvFileList.value = []
    csvText.value = ''
    batchDelimiter.value = ','
    jsonConditions.value = [{ field: '', operator: 'EQ', value: '' }]

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
    returnTypeField.value = []
}

// 编辑策略
const handleEdit = (row: Strategy) => {
    formData.value = { ...row }
    dialogTitle.value = '编辑策略'
    isView.value = false
    dialogVisible.value = true
    if (formData.value.returnType === 'distribute') {
        returnTypeChange.value = true
    } else {
        returnTypeChange.value = false
    }
    clearReturnTyeField()
    // SQL 编辑时，放入 sqlContent
    if (row.returnType === 'sql') {
        sqlContent.value = row.ruleFile || ''
    }

    // JSON 编辑时，尝试解析 ruleFile 为条件列表
    if (row.returnType === 'json') {
        try {
            const arr = JSON.parse(row.ruleFile || '[]')
            if (Array.isArray(arr) && arr.length) {
                jsonConditions.value = arr.map((it: any) => ({
                    field: it.field || '',
                    operator: it.operator || 'EQ',
                    value: String(it.value ?? '')
                }))
            } else {
                jsonConditions.value = [{ field: '', operator: 'EQ', value: '' }]
            }
        } catch {
            jsonConditions.value = [{ field: '', operator: 'EQ', value: '' }]
        }
    }
    deviceCountFun(row);
}
// 编辑内容
const handleEditContent = (row: Strategy) => {
    csvPath.value = row.ruleFile // 你的业务里拿到的地址oss://ym-east-data/data/ym_push/zxw_test/rank/flowAlgIMP.csv
    visible.value = true
}
const clearReturnTyeField = () => {
    const _val = formData.value.returnType
    if (_val && typeField.value.data) {
        returnTypeField.value = typeField.value.data[_val] || []
    }
}
// 查看策略
const handleView = (row: Strategy) => {
    formData.value = { ...row }
    dialogTitle.value = '查看策略'
    isView.value = true
    dialogVisible.value = true
    deviceCount.value = '';
    clearReturnTyeField()
    if (row.returnType === 'sql') {
        sqlContent.value = row.ruleFile || ''
    }
    if (row.returnType === 'json') {
        try {
            const arr = JSON.parse(row.ruleFile || '[]')
            if (Array.isArray(arr) && arr.length) {
                jsonConditions.value = arr.map((it: any) => ({
                    field: it.field || '',
                    operator: it.operator || 'EQ',
                    value: String(it.value ?? '')
                }))
            } else {
                jsonConditions.value = [{ field: '', operator: 'EQ', value: '' }]
            }
        } catch {
            jsonConditions.value = [{ field: '', operator: 'EQ', value: '' }]
        }
    }
    deviceCountFun(row);
}
function deviceCountFun(row: any) {
    deviceCount.value = '';
    isJsonOrSql.value = false;
    if (row.returnType == 'sql' || row.returnType == 'json') {
        isJsonOrSql.value = true
        reqDeviceCount({ id: row.id }).then(res => {
            deviceCount.value = res.data;
        }).catch(() => {
            deviceCount.value = '获取失败';
        })
    }
}
// 删除策略
const handleDelete = async (row: Strategy) => {
    ElMessageBox.confirm('确定要删除这个策略吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            // TODO: 调用删除接口
            const res: any = await reqDeleteId({ id: row.id })
            if (res.success) {
                ElMessage.success('删除成功')
                getStrategyList(objectToParams())
            } else {
                ElMessage.error(res.message || '删除失败')
            }
        } catch (error) {
            ElMessage.error('删除操作异常')
        }
    }).catch(() => {
        ElMessage.info('已取消删除')
    })
}

// CSV 文件上传变化
const handleCsvFileChange = (file: UploadFile, fileList: UploadFile[]) => {
    csvFileList.value = fileList
    if (fileList.length > 0) {
        // 有文件时清空文本
        csvText.value = ''
        batchDelimiter.value = ','
    }
}
const handleCsvFileRemove = (file: UploadFile, fileList: UploadFile[]) => {
    csvFileList.value = fileList
}
function conversion() {
    debugger
    // 手动输入模式：解析 csvText
    const raw = csvText.value || ''
    const lines = raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line !== '')

    if (!lines.length) {
        ElMessage.warning('请至少输入一行内容')
        return
    }

    const newBatchRows: string[][] = []

    for (const line of lines) {
        const cols = line.split(batchDelimiter.value)

        if (cols.length !== returnTypeField.value.length) {
            ElMessage.warning(
                `输入行的列数与表头列数不匹配，请检查后重新输入。\n` +
                `表头列数：${returnTypeField.value.length}，当前行列数：${cols.length}\n` +
                `当前行内容：${line}`
            )
            return
        }

        newBatchRows.push(cols)
    }

    return JSON.stringify(newBatchRows)
}
// 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return

    try {
        const isValid = await formRef.value.validate()
        if (!isValid) return

        submitLoading.value = true

        const baseData: any = {
            eventType: formData.value.eventType,
            name: formData.value.name,
            returnType: formData.value.returnType,
            deviceSource: formData.value.deviceSource,
            status: formData.value.status,
            description: formData.value.description,
            sourceType: 'custom' // 手动策略
        }

        if (formData.value.id) {
            baseData.id = formData.value.id
        }

        const rt = formData.value.returnType
        const payload: any = { data: baseData }
        debugger
        if (rt === 'sql') {
            // SQL 类型：ruleFile 传 SQL 文本
            const content = isCreate.value ? sqlContent.value : (formData.value.ruleFile || '')
            if (!content.trim()) {
                ElMessage.warning('请填写 SQL 内容')
                return
            }
            baseData.ruleFile = content
        } else if (rt === 'json') {
            // JSON 类型：ruleFile 传 JSON 数组字符串
            // if (isCreate.value) {
            const arr = jsonConditions.value
                .filter(it => it.field && it.operator && it.value !== '')
                .map(it => ({
                    field: it.field,
                    operator: it.operator,
                    value: it.value
                }))
            if (!arr.length) {
                ElMessage.warning('请至少添加一条 JSON 条件')
                return
            }
            baseData.ruleFile = JSON.stringify(arr)
            // } else {
            //     // 编辑时，当前示例直接用现有文本
            //     baseData.ruleFile = formData.value.ruleFile
            // }
        } else {
            // 非 json/sql 类型：file 或 csvData
            if (isCreate.value) {
                if (hasCsvFile.value) {
                    // 这里 file 通常是 File 对象，由后端处理路径
                    const fileObj = csvFileList.value[0]?.raw
                    if (!fileObj) {
                        ElMessage.error('CSV 文件异常，请重新选择')
                        return
                    }
                    payload.file = fileObj
                } else if (hasCsvText.value) {

                    payload.csvData = conversion()
                } else {
                    ElMessage.warning('请上传 CSV 文件或输入 CSV 数据')
                    return
                }
            } else {
                if (hasCsvFile.value) {
                    const fileObj = csvFileList.value[0]?.raw
                    if (!fileObj) {
                        ElMessage.error('CSV 文件异常，请重新选择')
                        return
                    }
                    payload.file = fileObj
                } else if (hasCsvText.value) {
                    payload.csvData = conversion()
                }
                payload.data.ruleFile = formData.value.ruleFile || ''
            }
        }
        // baseData转string
        payload.data = JSON.stringify(baseData)
        debugger
        // TODO: 接口按你实际参数格式调整
        console.log('提交数据:', payload)
        const res: any = await reqCreateOrUpdate(payload)
        if (res.success) {
            ElMessage.success(formData.value.id ? '更新成功' : '创建成功')
            dialogVisible.value = false
            debugger
            getStrategyList(objectToParams())
        } else {
            ElMessage.error(res.message || '保存失败,CSV头不匹配')
        }

    } catch (error: any) {
        console.error('表单提交异常:', error.message)
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
const handleSearchEngine = () => {
    pagination.current = 1
    debugger
    getStrategyList(objectToParams())
}


const returnTypeField = ref<any>([])
const handlereturnTypeChange = (value: string) => {
    formData.value.returnType = value
    if (value && typeField.value.data) {
        returnTypeField.value = typeField.value.data[value] || []
    }

    // 切换类型时，重置类型相关的临时数据
    sqlContent.value = ''
    csvFileList.value = []
    csvText.value = ''
    batchDelimiter.value = ','
    jsonConditions.value = [{ field: '', operator: 'EQ', value: '' }]

    if (formData.value.returnType === 'distribute') {
        returnTypeChange.value = true
        formData.value.deviceSource = 'offline'
    } else {
        returnTypeChange.value = false
    }
}

const typeField = ref<any>([])

// 页面初始化
onMounted(async () => {
    typeField.value = await reqReturnTypeType()
})
</script>

<style lang="scss" scoped>
.strategy-page {
    height: $base-alg-platform-height;

    .page-header {
        display: flex;
        justify-content: end;
        align-items: center;
        height: 5%;
    }

    .page-content {
        height: 90%;

        .el-pagination-container {
            display: grid;
            justify-content: end;
            padding: 10px 0;
        }
    }
}

.json-conditions-wrapper {
    width: 100%;

    .json-condition-row {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }
}

.csv-input-wrapper {
    width: 100%;
}

.rule-file-cell {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
}
</style>