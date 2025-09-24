<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="90%"
    top="5vh"
    :close-on-click-modal="false"
    append-to-body
  >
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="输入关键字筛选（全列模糊搜索）"
        clearable
        size="small"
        style="max-width: 360px"
      />
      <div class="meta">
        <!-- 显示“表格实际可见行数 / 总行数” -->
        <span>预览行数：{{ displayedCount }} / 约 {{ totalLines }}</span>
      </div>
    </div>

    <div v-loading="loading" class="preview-wrap">
      <el-alert v-if="error" type="error" :title="error" show-icon class="mb8" />

      <vxe-table
        v-else
        ref="xTable"
        :data="filteredRows"
        border
        auto-resize
        height="auto"
        :column-config="{ resizable: true }"
        show-overflow
        :cell-config="{ verticalAlign: 'center' }"
        :row-config="{ isCurrent: false, isHover: true }"
        :scroll-y="{ enabled: true, gt: 0 }"
        :sort-config="{ trigger: 'cell' }"
        :empty-text="loading ? '加载中...' : '无数据'"
        :virtual-y-config="{ enabled: true, gt: 0 }"
        @filter-change="onVxeFilterChange"
      >
        <vxe-column type="seq" width="60" title="#" align="center" />
        <vxe-column
          v-for="col in columns"
          :key="col.field"
          :field="col.field"
          :title="col.title"
          :sortable="false"
          :sort-by="col.sortBy"
          :filters="col.filters"
          :filter-multiple="true"
          :min-width="col.minWidth"
          show-overflow
        />
      </vxe-table>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { reqDownloadUrl as defaultFetcher } from '@/api/docDownload/ossDownload'

type FetcherFn = (args: { objectName: string }) => Promise<{ headers?: any; data: any }>

const props = withDefaults(defineProps<{
  fetcher?: FetcherFn
  maxPreviewLines?: number
  maxFilterOptions?: number
}>(), {
  maxPreviewLines: Infinity, // 默认不限制
  maxFilterOptions: 100
})

const visible = ref(false)
const title = ref('CSV 预览')
const loading = ref(false)
const error = ref<any | null>(null)

const columns = ref<Array<{
  field: string
  title: string
  filters: Array<{ label: string; value: string }>
  sortBy: (row: any) => any
  minWidth: number
}>>([])
const rows = ref<any[]>([])
const totalLines = ref(0)

const keyword = ref('')

// vxe-table 实例
const xTable = ref<any>(null)
// 实际可见行数（关键：包含列筛选的结果）
const displayedCount = ref(0)

// 暴露给父组件的打开方法
async function open(objectName: string, dialogTitle?: string) {
  visible.value = true
  title.value = dialogTitle || `CSV 预览 - ${objectName.split('/').pop() || objectName}`

  loading.value = true
  error.value = null
  columns.value = []
  rows.value = []
  totalLines.value = 0
  keyword.value = ''
  displayedCount.value = 0

  try {
    const fetcher: FetcherFn = props.fetcher || (defaultFetcher as unknown as FetcherFn)
    if (!fetcher) {
      throw new Error('未提供获取文件内容的 fetcher 函数')
    }
    const resp: any = await fetcher({ objectName })
    const headers: Record<string, string> = resp?.headers || {}
    const contentType = headers['content-type'] || headers['Content-Type'] || 'text/csv;charset=utf-8'

    // 标准化为 Blob
    const blob: Blob = resp?.data instanceof Blob ? resp.data : new Blob([resp?.data], { type: contentType })
    const { text } = await blobToText(blob, contentType)

    const { cols, data, total } = parseCsv(text, props.maxPreviewLines, props.maxFilterOptions)
    columns.value = cols
    rows.value = data
    totalLines.value = total

    // 数据渲染完成后，根据表格当前筛选状态计算可见行数
    await nextTick()
    computeDisplayedCount()
  } catch (e: any) {
    console.error(e)
    error.value = e?.message || '预览失败：无法获取或解析文件'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}
defineExpose({ open })

// 将 Blob 解码为文本
async function blobToText(blob: Blob, contentTypeHeader?: string): Promise<{ text: string; enc: string }> {
  let enc = 'utf-8'
  const m = /charset=([^;]+)/i.exec(contentTypeHeader || '')
  if (m && m[1]) enc = m[1].trim().toLowerCase()

  try {
    const head = new Uint8Array(await blob.slice(0, 3).arrayBuffer())
    if (head.length >= 3 && head[0] === 0xef && head[1] === 0xbb && head[2] === 0xbf) {
      enc = 'utf-8'
    }
  } catch {}

  try {
    const ab = await blob.arrayBuffer()
    const dec = new TextDecoder(enc as any, { fatal: false })
    const text = dec.decode(new Uint8Array(ab)).replace(/^\uFEFF/, '')
    return { text, enc }
  } catch {
    const text = await (blob as any).text()
    return { text: text.replace(/^\uFEFF/, ''), enc: 'utf-8' }
  }
}

// CSV 工具
function detectDelimiter(sample: string) {
  const candidates = [',', '\t', '|', ';']
  let best = ',', bestCount = -1
  for (const d of candidates) {
    const count = (sample.match(new RegExp(`\\${d}`, 'g')) || []).length
    if (count > bestCount) { best = d; bestCount = count }
  }
  return bestCount > 0 ? best : ','
}

function splitCsvLine(line: string, delimiter: string) {
  const out: string[] = []
  let cur = '', inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === delimiter) {
        out.push(cur)
        cur = ''
      } else {
        cur += ch
      }
    }
  }
  out.push(cur)
  return out
}

function isNumericLike(s: any): boolean {
  if (s === null || s === undefined) return false
  if (typeof s === 'number') return Number.isFinite(s)
  const str = String(s).trim()
  if (!str) return false
  return /^[+-]?(\d+(\.\d+)?|\.\d+)(e[+-]?\d+)?$/i.test(str)
}

function parseCsv(
  text: string,
  maxPreviewLines = 1000,
  maxFilterOptions = 100
): { cols: any[]; data: any[]; total: number } {
  const allLinesRaw = text.split(/\r?\n/)
  const allLines = allLinesRaw.filter(l => l.length > 0)
  const total = allLines.length
  if (allLines.length === 0) {
    return { cols: [], data: [], total: 0 }
  }

  const limit = !Number.isFinite(maxPreviewLines) || maxPreviewLines <= 0
    ? allLines.length
    : Math.min(maxPreviewLines + 1, allLines.length)
  const sampleLines = allLines.slice(0, limit)

  const firstNonEmpty = sampleLines.find(l => l.trim().length > 0) || ''
  const delimiter = detectDelimiter(firstNonEmpty)

  const parsed = sampleLines.map(l => splitCsvLine(l, delimiter))
  const heads = parsed[0] || []
  const maxCols = parsed.reduce((m, r) => Math.max(m, r.length), heads.length)
  const colTitles = heads.length > 0 ? heads.slice() : Array.from({ length: maxCols }, (_, i) => `col_${i + 1}`)
  for (let i = colTitles.length; i < maxCols; i++) colTitles.push(`col_${i + 1}`)

  const dataRows = parsed.slice(1)
  const data = dataRows.map(r => {
    const o: Record<string, any> = {}
    colTitles.forEach((k, i) => { o[k] = r[i] ?? '' })
    return o
  })

  // 判断每列是否数值型（基于样本）
  const isNumCol: boolean[] = colTitles.map((k) => {
    let numCount = 0
    let seen = 0
    for (let i = 0; i < Math.min(data.length, 200); i++) {
      const v = data[i]?.[k]
      if (v !== '' && v !== null && v !== undefined) {
        seen++
        if (isNumericLike(v)) numCount++
      }
    }
    return seen > 0 && numCount / seen >= 0.8
  })

  // 构建列定义，包含排序/过滤
  const cols = colTitles.map((k, idx) => {
    const uniques = new Set<string>()
    for (const row of data) {
      const v = row[k]
      uniques.add(String(v ?? ''))
      if (uniques.size >= maxFilterOptions) break
    }
    const options = Array.from(uniques).sort().map(v => ({ label: v === '' ? '(空)' : v, value: v }))
    return {
      field: k,
      title: k,
      minWidth: Math.max(120, Math.min(260, k.length * 16)),
      sortBy: (row: any) => {
        const v = row?.[k]
        if (isNumCol[idx]) return Number(v)
        return String(v ?? '')
      },
      filters: options
    }
  })

  return { cols, data, total }
}

// 关键字全局过滤（客户端）
const filteredRows = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return rows.value
  const fields = columns.value.map(c => c.field)
  return rows.value.filter(r => fields.some(f => String(r[f] ?? '').toLowerCase().includes(kw)))
})

// 当关键字或数据变化时，等待表格渲染后重新计算“可见行数”
watch([filteredRows, columns], async () => {
  await nextTick()
  computeDisplayedCount()
})

// vxe 列筛选变化时，更新“可见行数”
function onVxeFilterChange() {
  computeDisplayedCount()
}

// 计算 vxe-table 实际可见的数据行数
function computeDisplayedCount() {
  const table = xTable.value
  if (!table) {
    displayedCount.value = filteredRows.value.length
    return
  }
  try {
    // 优先用 getTableData().visibleData 或 tableData
    const td = table.getTableData ? table.getTableData() : null
    const len =
      (td?.visibleData && Array.isArray(td.visibleData) && td.visibleData.length) ||
      (td?.tableData && Array.isArray(td.tableData) && td.tableData.length) ||
      (table.getData ? table.getData().length : 0)

    displayedCount.value = len || filteredRows.value.length
  } catch {
    displayedCount.value = filteredRows.value.length
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #606266;
  font-size: 12px;
}

.preview-wrap {
  min-height: 200px;
  height: calc(100vh - 300px);
}

.mb8 {
  margin-bottom: 8px;
}
</style>