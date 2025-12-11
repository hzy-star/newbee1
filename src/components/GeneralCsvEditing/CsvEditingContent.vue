<template>
    <div class="csv-box">
        <!-- 顶部：仅 CSV 地址 + 查询表头 -->
        <div class="top-line">
            <label class="top-line__label">CSV地址</label>
            <input v-model="innerPath" type="text" placeholder="请输入 CSV 地址"
                class="top-line__input top-line__input--path" :disabled="csvDisabled" />
            <el-icon style="cursor: pointer" @click="clearPath" v-if="!props.isDialog">
                <close />
            </el-icon>
            <button class="btn btn--primary" @click="loadHeader" :disabled="loadingHeader" v-if="!props.isDialog">
                {{ loadingHeader ? '加载中...' : '查询表头' }}
            </button>
        </div>

        <!-- 动态搜索条件 -->
        <div v-if="headerKeys.length" class="search-panel">
            <div class="search-panel__tip">
                根据 CSV 表头自动生成搜索条件（区分大小写），
                <span class="text-danger">*</span> 为必填。
            </div>
            <div class="search-panel__grid">
                <div v-for="item in searchableHeaders" :key="item.key" class="search-item">
                    <label class="search-item__label">
                        {{ item.key }}
                        <span v-if="item.config.searchRequired" class="text-danger">*</span>
                    </label>
                    <input v-model="searchForm[item.key]" type="text" :placeholder="`请输入 ${item.key}`"
                        class="search-item__input" />
                    <p v-if="showSearchError && item.config.searchRequired && !searchForm[item.key]"
                        class="search-item__error">
                        {{ item.key }} 为必填项
                    </p>
                </div>
            </div>
            <div class="search-panel__actions">
                <button class="btn btn--plain" @click="resetSearch">
                    重置
                </button>
                <button class="btn btn--success" @click="queryList" :disabled="loadingList">
                    {{ loadingList ? '查询中...' : '搜索' }}
                </button>
            </div>
        </div>

        <!-- 表格区域：改成 vxe-table 虚拟列表 -->
        <div class="table-wrapper">
            <div v-if="!headerKeys.length" class="table-empty-tip">
                请输入 CSV 地址并点击“查询表头”以加载表头
            </div>

            <div v-else class="table-scroll">
                <vxe-table v-if="tableObjects.length || !loadingList" ref="xTableRef" :data="tableObjects" border round
                    size="small" height="100%" :column-config="{ resizable: true }" show-overflow
                    :cell-config="{ verticalAlign: 'center' }" :row-config="{ isCurrent: false, isHover: true }"
                    :scroll-y="{ enabled: true, gt: 0 }" :virtual-y-config="{ enabled: true, gt: 0 }"
                    :empty-text="loadingList ? '加载中...' : '暂无数据，请调整搜索条件后重试'">
                    <!-- 序号列 -->
                    <vxe-column type="seq" width="60" title="#" align="center"></vxe-column>

                    <!-- 动态列：按 headerKeys 生成 -->
                    <vxe-column v-for="key in headerKeys" :key="key" :field="key" :title="key" :min-width="120"
                        show-overflow />

                    <!-- 操作列 -->
                    <vxe-column title="操作" width="160" fixed="right" align="center">
                        <template #default="{ row }">
                            <button class="link-btn link-btn--edit" @click="openRowDialog(row.__rowIndex)">
                                修改
                            </button>
                            <button class="link-btn link-btn--delete" @click="deleteSingleRow(row.__rowIndex)">
                                删除
                            </button>
                        </template>
                    </vxe-column>
                </vxe-table>
            </div>

            <!-- 底部整表操作 -->
            <div v-if="headerKeys.length" class="table-footer">
                <button class="btn btn--danger" @click="deleteByFilter">
                    删除
                </button>
                <button class="btn btn--warning" @click="openBatchDialog('replace')">
                    替换
                </button>
                <button class="btn btn--success" @click="openBatchDialog('add')">
                    新增
                </button>
            </div>
        </div>

        <!-- 单行编辑弹窗：编辑当前行所有字段 -->
        <div v-if="rowDialogVisible" class="dialog-mask">
            <div class="dialog dialog--row-edit">
                <div class="dialog__header">
                    修改行数据
                </div>
                <div class="dialog__body dialog__body--scroll">
                    <div v-for="key in headerKeys" :key="key" class="dialog-form-item">
                        <div class="dialog-form-item__label">
                            {{ key }}
                        </div>
                        <input v-model="rowForm[key]" type="text" class="dialog-form-item__input" />
                    </div>
                </div>
                <div class="dialog__footer">
                    <button class="btn btn--plain" @click="closeRowDialog">
                        取消
                    </button>
                    <button class="btn btn--primary" @click="saveRowDialog">
                        保存
                    </button>
                </div>
            </div>
        </div>

        <!-- 批量新增/替换弹窗：操作所有命中当前 filters 的行 -->
        <!-- 批量新增/替换弹窗：使用 Element Plus el-dialog -->
        <el-dialog v-model="batchDialogVisible" :title="batchDialogType === 'replace' ? '替换所有匹配行' : '新增行'" width="60%"
            top="10vh" :close-on-click-modal="false">
            <div class="dialog__body dialog__body--scroll">
                <div class="batch-tip">
                    按当前搜索条件
                    <span class="batch-tip__strong">（filters）</span>
                    {{ batchDialogType === 'replace' ? '替换所有匹配到的行。' : '新增若干行到文件末尾。' }}
                </div>

                <div class="filters-preview">
                    <div class="filters-preview__title">filters 预览：</div>
                    <div v-if="Object.keys(currentFilters).length">
                        <div v-for="(vals, key) in currentFilters" :key="key" class="filters-preview__item">
                            <span class="filters-preview__key">{{ key }}:</span>
                            <span class="filters-preview__value">{{ vals.join(', ') }}</span>
                        </div>
                    </div>
                    <div v-else class="filters-preview__empty">
                        无搜索条件，将对整个 CSV 执行操作，请谨慎！
                    </div>
                </div>

                <!-- 填写方式选择 -->
                <div>
                    请选择填写内容的方式：
                    <el-select v-model="batchInputMode" placeholder="请选择填写方式" size="small"
                        style="width: 120px; margin-left: 8px;">
                        <el-option label="手动填写" value="manual"></el-option>
                        <el-option label="表格填写" value="clipboard"></el-option>
                    </el-select>
                </div>

                <!-- 手动填写模式 -->
                <div v-if="batchInputMode === 'manual'" style="margin-top: 12px; color: #374151;">
                    <span>请选择或输入分隔符</span>
                    <el-select v-model="batchDelimiter" placeholder="请选择或输入分隔符" size="small"
                        style="width: 180px; margin: 0 8px;" filterable allow-create default-first-option>
                        <el-option label="逗号 (,)" value="," />
                        <el-option label="分号 (;)" value=";" />
                        <el-option label="感叹号 (!)" value="!" />
                        <el-option label="竖线 (|)" value="|" />
                    </el-select>
                    进行批量粘贴，每行对应一条数据，列顺序请参考上方表头。
                    <textarea v-model="batchManualInput" placeholder="请粘贴内容"
                        style="width: 100%; height: 280px; margin-top: 8px;" />
                </div>

                <!-- 表格填写模式 -->
                <div class="batch-table-wrap" v-else>
                    <vxe-table :data="batchRows" border round size="small" height="300"
                        :column-config="{ resizable: true }" show-overflow>
                        <vxe-column type="seq" width="60" title="#" align="center"></vxe-column>

                        <vxe-column v-for="(key, colIndex) in headerKeys" :key="key" :field="key" :title="key"
                            :min-width="120">
                            <template #default="{ row }">
                                <input v-model="row[key]" type="text" class="batch-cell-input" :placeholder="key" />
                            </template>
                        </vxe-column>

                        <vxe-column title="操作" width="120" align="center" fixed="right">
                            <template #default="{ rowIndex }">
                                <button class="btn btn--success"
                                    style="min-width: 32px; padding: 2px 6px; margin-right: 4px;"
                                    @click="addBatchRowAfter(rowIndex)">
                                    +
                                </button>
                                <button class="btn btn--danger" style="min-width: 32px; padding: 2px 6px;"
                                    @click="removeBatchRow(rowIndex)" :disabled="batchRows.length === 1">
                                    -
                                </button>
                            </template>
                        </vxe-column>
                    </vxe-table>

                    <div class="batch-table-tip">
                        可以在任意行点击 + 号新增一行，点击 - 号删除该行（至少保留一行）。
                    </div>
                </div>
            </div>

            <template #footer>
                <el-button @click="closeBatchDialog">取消</el-button>
                <el-button type="primary" @click="submitBatchDialog">
                    {{ batchDialogType === 'replace' ? '替换' : '新增' }}
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref, computed, watch,onMounted } from 'vue'
import {
    reqCsvEditHeaderUrl,
    reqCsvEditQuerySimplifyUrl,
    reqCsvEditAddUrl,
    reqCsvEditReplaceUrl,
    reqCsvEditDeleteUrl
} from '@/api/docDownload/generalCsvEditing/index.ts'
import type { VxeTableInstance } from 'vxe-table'
import { ElMessage, ElMessageBox } from 'element-plus'

const csvDisabled = ref(false)
const clearPath = () => {
    innerPath.value = ''
    csvDisabled.value = false
    resetSearch()
    // 清空table数据
    tableData.value = []
}
/**
 * 新增：允许父组件通过 v-model:path 传入/同步 CSV 地址
 * 不传也可以手动输入
 */
const props = defineProps<{
    path?: string,
    isDialog?: boolean
}>()
const emit = defineEmits<{
    (e: 'update:path', v: string): void
}>()

const innerPath = ref(props.path || '')
watch(
    () => props.path,
    v => {
        if (v !== undefined && v !== innerPath.value) {
            innerPath.value = v
        }
    }
)
watch(innerPath, v => {
    emit('update:path', v)
})

type HeaderItem = {
    showSearch: boolean
    searchRequired: boolean
    valueNotEmpty: boolean
}
type HeaderConfig = Record<string, HeaderItem>

const headerConfig = reactive<HeaderConfig>({})
const headerKeys = computed(() => Object.keys(headerConfig))
const batchInputMode = ref<'manual' | 'clipboard'>('clipboard')
const batchDelimiter = ref(',')
const batchManualInput = ref('')

// 只包含 showSearch = true 的列，并把配置一并带出
const searchableHeaders = computed(() =>
    headerKeys.value
        .filter((key) => headerConfig[key]?.showSearch)
        .map((key) => ({
            key,
            config: headerConfig[key],
        })),
)

const searchForm = reactive<Record<string, string>>({})
// 原始二维数组数据：每行是 string[]
const tableData = ref<string[][]>([])

// vxe-table 需要对象数组
const tableObjects = computed(() =>
    tableData.value.map((row, index) => {
        const obj: Record<string, any> = { __rowIndex: index }
        headerKeys.value.forEach((key, colIndex) => {
            obj[key] = row[colIndex] ?? ''
        })
        return obj
    })
)

const loadingHeader = ref(false)
const loadingList = ref(false)
const showSearchError = ref(false)

// vxe-table 实例（如果后面需要调用 API，可以用）
const xTableRef = ref<VxeTableInstance | null>(null)

/** 构造 filters: { col: [value] } */
const buildFilters = (): Record<string, string[]> => {
    const filters: Record<string, string[]> = {}
    Object.keys(searchForm).forEach((k) => {
        const v = searchForm[k]
        if (v !== '') {
            filters[k] = [v]
        }
    })
    return filters
}

const currentFilters = computed(() => buildFilters())

/** 加载表头 */
const loadHeader = async () => {
    if (!innerPath.value) {
        ElMessage.warning('请先输入 CSV 地址')
        return
    }
    loadingHeader.value = true
    try {
        const params: any = { path: innerPath.value }

        const res = await reqCsvEditHeaderUrl(params)
        if (res?.code !== 200) {
            ElMessage.error(res?.errMsg || '获取表头失败，请稍后重试')
            csvDisabled.value = false
            return
        }
        csvDisabled.value = true
        const data = res?.data || {}

        Object.keys(headerConfig).forEach((k) => delete headerConfig[k])
        Object.keys(searchForm).forEach((k) => delete searchForm[k])

        Object.keys(data).forEach((k) => {
            const val = data[k]
            if (val && typeof val === 'object' && 'showSearch' in val) {
                headerConfig[k] = {
                    showSearch: !!val.showSearch,
                    searchRequired: !!val.searchRequired,
                    valueNotEmpty: !!val.valueNotEmpty
                }
            } else {
                headerConfig[k] = {
                    showSearch: false,
                    searchRequired: false,
                    valueNotEmpty: false
                }
            }
        })

        headerKeys.value.forEach((k) => {
            if (headerConfig[k].showSearch) searchForm[k] = ''
        })

        tableData.value = []
        showSearchError.value = false
    } finally {
        loadingHeader.value = false
    }
}

const resetSearch = () => {
    Object.keys(searchForm).forEach((k) => (searchForm[k] = ''))
    showSearchError.value = false
}

const validateSearch = () => {
    showSearchError.value = true
    for (const key of headerKeys.value) {
        const conf = headerConfig[key]
        if (conf?.showSearch && conf.searchRequired && !searchForm[key]) {
            return false
        }
    }
    return true
}

/** 查询列表（简化版） */
const queryList = async () => {
    if (!innerPath.value) {
        ElMessage.warning('请先输入 CSV 地址')
        return
    }
    if (!validateSearch()) return

    loadingList.value = true
    try {
        const payload: any = { path: innerPath.value }

        const filters = buildFilters()
        if (Object.keys(filters).length) payload.filters = filters

        const res = await reqCsvEditQuerySimplifyUrl(payload)
        if (res?.code !== 200) {
            ElMessage.error(res?.errMsg || '查询失败，请稍后重试')
            return
        }
        // 后端返回二维数组：string[][]，直接塞到 tableData
        tableData.value = res?.data || []
    } finally {
        loadingList.value = false
    }
}

const deleteByFilter = async () => {
    if (!innerPath.value) {
        ElMessage.warning('请先输入 CSV 地址')
        return
    }
    ElMessageBox.confirm('确认根据当前搜索条件删除所有匹配行吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        const payload: any = { path: innerPath.value }

        const filters = buildFilters()
        if (Object.keys(filters).length) payload.filters = filters

        try {
            const res = await reqCsvEditDeleteUrl(payload)
            if (res?.code !== 200) {
                ElMessage.error(res?.errMsg || '删除失败，请稍后重试')
                return
            }
            ElMessage.success('删除成功')
            tableData.value = []
        } catch (e) {
            console.error(e)
            ElMessage.error('删除失败')
        }
    }).catch(() => {
        // ignore
    })
}

/** 单行编辑弹窗逻辑 */
const rowDialogVisible = ref(false)
const rowEditingIndex = ref<number | null>(null)
const rowForm = reactive<Record<string, string>>({})

const openRowDialog = (rowIndex: number) => {
    const row = tableData.value[rowIndex]
    if (!row) return
    rowEditingIndex.value = rowIndex
    Object.keys(rowForm).forEach((k) => delete rowForm[k])
    headerKeys.value.forEach((key, idx) => {
        rowForm[key] = row[idx] ?? ''
    })
    rowDialogVisible.value = true
}

const closeRowDialog = () => {
    rowDialogVisible.value = false
    rowEditingIndex.value = null
}

const saveRowDialog = async () => {
    if (rowEditingIndex.value === null) return
    if (!innerPath.value) {
        ElMessage.warning('缺少 CSV 地址，无法调用替换接口')
        return
    }

    const filters: Record<string, string[]> = {}
    const originalRow = tableData.value[rowEditingIndex.value]
    headerKeys.value.forEach((key, idx) => {
        filters[key] = [originalRow[idx] ?? '']
    })

    const newRow: string[] = headerKeys.value.map((key) => rowForm[key] ?? '')
    const payload: any = {
        path: innerPath.value,
        newRows: [newRow],
        filters
    }

    try {
        const res = await reqCsvEditReplaceUrl(payload)
        if (res?.code !== 200) {
            ElMessage.error(res?.errMsg || '修改失败，请稍后重试')
            return
        }
        tableData.value.splice(rowEditingIndex.value, 1, newRow)
        ElMessage.success('修改成功')
        closeRowDialog()
    } catch (e) {
        console.error(e)
        ElMessage.error('修改失败')
    }
}

/** 单行删除：使用整行值构造 filters */
const deleteSingleRow = async (rowIndex: number) => {
    ElMessageBox.confirm('确认删除该行数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        const row = tableData.value[rowIndex]
        if (!row) return
        if (!innerPath.value) {
            ElMessage.warning('缺少 CSV 地址，无法删除')
            return
        }
        const filters: Record<string, string[]> = {}
        headerKeys.value.forEach((key, idx) => {
            filters[key] = [row[idx] ?? '']
        })
        const payload: any = { path: innerPath.value, filters }
        try {
            const res = await reqCsvEditDeleteUrl(payload)
            if (res?.code !== 200) {
                ElMessage.error(res?.errMsg || '删除失败，请稍后重试')
                return
            }
            tableData.value.splice(rowIndex, 1)
            ElMessage.success('删除成功')
        } catch (e) {
            console.error(e)
            ElMessage.error('删除失败')
        }
    }).catch(() => {
        // ignore
    })
}

// 批量新增/替换弹窗：对当前 filters 命中的所有行
const batchDialogVisible = ref(false)
const batchDialogType = ref<'add' | 'replace'>('add')

// 批量编辑用的数据结构：每一行是一个对象，key 为 header 名
const batchRows = ref<Record<string, string>[]>([])

/** 打开批量弹窗：初始化一行空数据 */
const openBatchDialog = (type: 'add' | 'replace') => {
    if (!innerPath.value) {
        ElMessage.warning('请先输入 CSV 地址')
        return
    }
    if (!headerKeys.value.length) {
        ElMessage.warning('请先查询表头')
        return
    }

    batchDialogType.value = type
    batchDialogVisible.value = true
    // 打开弹窗时，重置填写方式和内容
    batchInputMode.value = 'clipboard'
    batchManualInput.value = ''
    batchDelimiter.value = ','
    // 清空表格数据
    batchRows.value = []
    // 初始化时给一行空数据
    const emptyRow: Record<string, string> = {}
    headerKeys.value.forEach((key) => {
        emptyRow[key] = ''
    })
    batchRows.value = [emptyRow]
}

/** 关闭批量弹窗 */
const closeBatchDialog = () => {
    batchDialogVisible.value = false
}

/** 在指定行后面新增一行 */
const addBatchRowAfter = (rowIndex: number) => {
    const emptyRow: Record<string, string> = {}
    headerKeys.value.forEach((key) => {
        emptyRow[key] = ''
    })
    batchRows.value.splice(rowIndex + 1, 0, emptyRow)
}

/** 删除指定行，至少保留一行 */
const removeBatchRow = (rowIndex: number) => {
    if (batchRows.value.length <= 1) return
    batchRows.value.splice(rowIndex, 1)
}

/** 将 batchRows 转成接口需要的 newRows: string[][] */
const buildNewRowsFromBatch = (): string[][] => {
    return batchRows.value.map((rowObj) =>
        headerKeys.value.map((key) => rowObj[key] ?? '')
    )
}

/** 提交批量新增/替换 */
const submitBatchDialog = async () => {
    if (!innerPath.value) {
        ElMessage.warning('缺少 CSV 地址，无法提交')
        return
    }
    if (!headerKeys.value.length) {
        ElMessage.warning('表头为空，请先查询表头')
        return
    }

    // 1. 根据填写方式整理 batchRows
    if (batchInputMode.value === 'manual') {
        // 手动输入模式：解析 batchManualInput
        const raw = batchManualInput.value || ''
        const lines = raw
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line !== '')

        if (!lines.length) {
            ElMessage.warning('请至少输入一行内容')
            return
        }

        const newBatchRows: Record<string, string>[] = []

        for (const line of lines) {
            const cols = line.split(batchDelimiter.value)

            if (cols.length !== headerKeys.value.length) {
                ElMessage.warning(
                    `输入行的列数与表头列数不匹配，请检查后重新输入。\n` +
                    `表头列数：${headerKeys.value.length}，当前行列数：${cols.length}\n` +
                    `当前行内容：${line}`
                )
                return
            }

            const rowObj: Record<string, string> = {}
            headerKeys.value.forEach((key, idx) => {
                rowObj[key] = cols[idx] ?? ''
            })
            newBatchRows.push(rowObj)
        }

        batchRows.value = newBatchRows
    } else {
        // 表格填写模式：直接使用 batchRows
        if (!batchRows.value.length) {
            ElMessage.warning('当前没有任何行，请先添加行再提交')
            return
        }
    }

    // 2. 将 batchRows 转成接口需要的 newRows: string[][]
    const newRows = buildNewRowsFromBatch()

    // 3. 判断是否至少有一行有内容（完全空行不算）
    const hasAnyValue = newRows.some((cols) =>
        cols.some((v) => String(v || '').trim() !== '')
    )
    if (!hasAnyValue) {
        ElMessage.warning('请至少在一行中填写内容')
        return
    }

    const base: any = { path: innerPath.value }

    try {
        if (batchDialogType.value === 'add') {
            // 新增
            const payload = { ...base, newRows }
            const res = await reqCsvEditAddUrl(payload)
            if (res?.code !== 200) {
                ElMessage.error(res?.errMsg || '新增失败，请稍后重试')
                return
            }
            ElMessage.success('新增成功')
        } else {
            // 替换：需要带上当前 filters（由搜索条件生成）
            const filters = buildFilters()
            const payload: any = { ...base, newRows }
            if (Object.keys(filters).length) {
                payload.filters = filters
            }
            const res = await reqCsvEditReplaceUrl(payload)
            if (res?.code === 200 && res?.data) {
                const replacedCount = res.data.replacedCount || 0
                ElMessage.success(`替换成功，影响行数：${replacedCount}`)
            } else {
                ElMessage.error(res?.errMsg || '替换失败，请稍后重试')
                return
            }
        }

        batchDialogVisible.value = false
        // 提交成功后刷新当前列表
        await queryList()
    } catch (e) {
        console.error(e)
        ElMessage.error(batchDialogType.value === 'add' ? '新增失败' : '替换失败')
    }
}
onMounted(()=>{
    if(props.isDialog&&props.path){
        loadHeader()
    }
})
</script>

<style lang="scss" scoped>
/* 下面这整段就是你原 index.vue 的样式，原封不动 */

.csv-box {
    padding: 16px;
    display: flex;
    flex-direction: column;
    height: calc(100vh - $base-tabbar-height - 10px);
    box-sizing: border-box;
    font-size: 12px;
}

/* 顶部 */
.top-line {
    display: flex;
    align-items: center;
    column-gap: 12px;
    margin-bottom: 16px;

    &__label {
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
    }

    &__input {
        border: 1px solid #d4d4d4;
        border-radius: 4px;
        padding: 6px 8px;
        font-size: 12px;
        outline: none;

        &:focus {
            border-color: #409eff;
            box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.25);
        }

        &--path {
            flex: 1;
        }

        &--path {
            width: 240px;
        }
    }
}

/* 搜索区域 */
.search-panel {
    margin-bottom: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 12px;
    background-color: #f9fafb;
    text-align: left;

    &__tip {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 8px;
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
    }

    &__actions {
        margin-top: 12px;
        display: flex;
        justify-content: flex-end;
        column-gap: 8px;
    }
}

.search-item {
    display: flex;
    flex-direction: column;

    &__label {
        font-size: 12px;
        font-weight: 500;
        color: #374151;
        word-break: break-all;
        margin-bottom: 2px;
    }

    &__input {
        border: 1px solid #d1d5db;
        border-radius: 4px;
        padding: 4px 6px;
        font-size: 12px;
        outline: none;

        &:focus {
            border-color: #409eff;
            box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.25);
        }
    }

    &__error {
        margin-top: 2px;
        font-size: 11px;
        color: #ef4444;
    }
}

/* 表格 */
.table-wrapper {
    flex: 1;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.table-empty-tip {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 13px;
}

.table-scroll {
    flex: 1;
    overflow: hidden;
    /* 交给 vxe-table 控制滚动 */
}

.table-empty-row {
    padding: 24px 0;
    text-align: center;
    color: #9ca3af;
}

/* 底部按钮 */
.table-footer {
    border-top: 1px solid #e5e7eb;
    padding: 10px 0;
    background-color: #fff;
    display: flex;
    justify-content: center;
    column-gap: 16px;
}

/* 按钮与链接按钮 */
.btn {
    min-width: 64px;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.15s;

    &--primary {
        background-color: #409eff;
        border-color: #409eff;
        color: #fff;

        &:hover {
            background-color: #337ecc;
            border-color: #337ecc;
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }

    &--success {
        background-color: #16a34a;
        border-color: #16a34a;
        color: #fff;

        &:hover {
            background-color: #15803d;
            border-color: #15803d;
        }
    }

    &--danger {
        background-color: #ef4444;
        border-color: #ef4444;
        color: #fff;

        &:hover {
            background-color: #dc2626;
            border-color: #dc2626;
        }
    }

    &--warning {
        background-color: #f59e0b;
        border-color: #f59e0b;
        color: #fff;

        &:hover {
            background-color: #d97706;
            border-color: #d97706;
        }
    }

    &--plain {
        background-color: #fff;
        border-color: #d1d5db;
        color: #374151;

        &:hover {
            background-color: #f3f4f6;
        }
    }
}

.link-btn {
    padding: 0 4px;
    border: none;
    background: none;
    font-size: 12px;
    cursor: pointer;

    &--edit {
        color: #16a34a;
    }

    &--delete {
        color: #ef4444;
    }

    &:hover {
        text-decoration: underline;
    }
}

.text-danger {
    color: #ef4444;
}

/* 弹窗通用 */
.dialog-mask {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}

.dialog {
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;

    &--row-edit {
        width: 600px;
        max-height: 80vh;
    }

    &--batch {
        width: 700px;
        max-height: 80vh;
    }

    &__header {
        padding: 8px 12px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 13px;
        font-weight: 500;
    }

    &__body {
        padding: 12px;
        font-size: 12px;

        &--scroll {
            overflow: auto;
        }
    }

    &__footer {
        padding: 8px 12px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        column-gap: 8px;
    }
}

/* 单行编辑表单 */
.dialog-form-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    &__label {
        width: 120px;
        text-align: right;
        padding-right: 8px;
        color: #4b5563;
        word-break: break-all;
    }

    &__input {
        flex: 1;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        padding: 4px 6px;
        font-size: 12px;
    }
}

/* 批量编辑相关 */
.batch-tip {
    margin-bottom: 8px;
    font-size: 12px;
    color: #4b5563;

    &__strong {
        font-weight: 600;
    }
}

.filters-preview {
    margin-bottom: 8px;
    padding: 8px;
    background-color: #f9fafb;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
    font-size: 12px;

    &__title {
        margin-bottom: 4px;
        font-weight: 500;
    }

    &__item {
        display: flex;
        column-gap: 4px;
    }

    &__key {
        color: #4b5563;
    }

    &__value {
        color: #111827;
    }

    &__empty {
        color: #9ca3af;
    }
}

.batch-table-wrap {
    margin-top: 12px;
}

.batch-table-tip {
    margin-top: 4px;
    font-size: 12px;
    color: #6b7280;
}

.batch-cell-input {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 2px 4px;
    font-size: 12px;
}

:deep(.el-dialog__body) {
    text-align: left !important;
}
</style>