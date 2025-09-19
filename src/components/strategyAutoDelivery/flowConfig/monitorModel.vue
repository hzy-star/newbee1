<!-- 监控弹窗页面 -->
<template>
  <el-dialog
    class="monitor-dialog"
    v-model="innerVisible"
    :fullscreen="isFullscreen"
    title="监控"
    width="90%"
    top="2vh"
    :close-on-click-modal="false"
    :before-close="onClose"
  >
    <template #header="{ titleId, titleClass }">
      <div class="dialog-header">
        <span :id="titleId" :class="titleClass">监控</span>
        <div class="header-actions">
          <el-tooltip v-if="!isFullscreen" content="全屏" placement="top">
            <el-button circle text @click="toggleFullscreen">
              <el-icon><FullScreen /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip v-else content="退出全屏" placement="top">
            <el-button circle text @click="toggleFullscreen">
              <el-icon><ScaleToOriginal /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </template>

    <div class="monitor-wrap">
      <div class="monitor-toolbar">
        <div class="toolbar-left">
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item label="pkgName">
              <!-- 可输入 + 联想；当从 index 带入 pkgName 且不为 default/defult 时置灰不可编辑 -->
              <el-autocomplete
                v-model="header.pkgName"
                :fetch-suggestions="querySearchPkg"
                placeholder="请输入 pkgName"
                clearable
                :trigger-on-focus="true"
                size="small"
                style="width: 260px"
                :disabled="isPkgLocked"
                @select="onSelectPkg"
                @clear="onClearPkg"
              />
            </el-descriptions-item>
            <el-descriptions-item label="flow">
              <span>{{ header.flow || '-' }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="toolbar-middle">
          <div class="time-row">
            <el-date-picker
              v-model="startTime"
              type="datetime"
              placeholder="开始时间"
              :default-time="defaultStartDefaultTime"
              :clearable="false"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 220px"
            />
            <span class="time-sep">-</span>
            <el-date-picker
              v-model="endTime"
              type="datetime"
              placeholder="结束时间"
              :default-time="defaultEndDefaultTime"
              :clearable="false"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
              style="width: 220px"
            />
          </div>
        </div>

        <div class="toolbar-right">
          <el-select
            v-model="selectedCountries"
            multiple
            filterable
            clearable
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="5"
            placeholder="选择国家"
            style="min-width: 260px; max-width: 420px"
          >
            <el-option
              v-for="c in countryOptions"
              :key="c"
              :label="c"
              :value="c"
            />
          </el-select>

          <el-button
            type="primary"
            :loading="loading"
            @click="handleQuery"
            style="margin-left: 12px"
          >
            查询
          </el-button>
        </div>
      </div>

      <!-- 图一：通过量/网关量/目标量 -->
      <div class="chart-card">
        <div v-if="!hasData && !loading" class="empty">
          暂无数据，请调整查询条件后重试
        </div>
        <div ref="chartRef1" class="chart" :style="{ height: chartHeight }" />
      </div>

      <!-- 图二：阈值 -->
      <div class="chart-card">
        <div v-if="!hasData && !loading" class="empty">
          暂无数据，请调整查询条件后重试
        </div>
        <div ref="chartRef2" class="chart" :style="{ height: chartHeight }" />
      </div>

      <!-- 图三：通过率 -->
      <div class="chart-card">
        <div v-if="!hasData && !loading" class="empty">
          暂无数据，请调整查询条件后重试
        </div>
        <div ref="chartRef3" class="chart" :style="{ height: chartHeight }" />
      </div>
    </div>

    <template #footer>
      <el-button @click="onClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { FullScreen, ScaleToOriginal } from '@element-plus/icons-vue'
import { reqHistoryData } from '@/api/strategyAutoDelivery/flowConfig/index'
import { reqListKvUrl } from '@/api/setting/KvConfig'

type FlowTracePoint = {
  partHour: string | null
  pass: number
  count: number
  cutoff: number
  dayClicks: number
  kp: number
  ki: number
  kd: number
  passRatio: number
  step?: number
}
type FlowTraceCountry = Record<string, FlowTracePoint>
type FlowTraceData = Record<string, FlowTraceCountry>
type HistoryResp = {
  pkgName: string
  flow: string
  flowTraceData: FlowTraceData
  optionalCountryMap?: Record<string, string[]>
  optionalCountry?: string[]
}

const props = defineProps<{
  modelValue: boolean
  // 父级传入：{ ...row, flow: flowName }
  data: Partial<{
    id: number | string
    pkgName: string
    flow: string
    country: string // 可能为 'all' 或 'US,TT,AS'
    config: string
  }>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const innerVisible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

// 全屏控制
const isFullscreen = ref(false)
// 三个图表的高度做适配：全屏时每个~30vh，非全屏时320px
const chartHeight = computed(() => (isFullscreen.value ? '30vh' : '320px'))
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  // 切换全屏后重算图表尺寸
  nextTick(() => {
    ensureCharts()
    resizeCharts()
  })
}

// 顶部展示信息
const header = ref<{ pkgName: string; flow: string }>({ pkgName: '', flow: '' })
const isPkgLocked = computed(() => {
  const incoming = (props.data?.pkgName || '').trim()
  // 只要从 index 带入了明确 pkgName 且不为 default/defult，就锁定
  return !!(incoming && !/^defa?ult$/i.test(incoming))
})

// 时间默认值：结束时间=当前时间-8小时；开始时间=结束时间-24小时
const startTime = ref<string>('')
const endTime = ref<string>('')

const defaultStartDefaultTime = computed(() => new Date(0, 0, 0, 0, 0, 0))
const defaultEndDefaultTime = computed(() => new Date(0, 0, 0, 0, 0, 0))

function initDefaultTimes() {
  const end = dayjs().subtract(8, 'hour')
  const start = end.subtract(24, 'hour')
  endTime.value = end.format('YYYY-MM-DD HH:mm:ss')
  startTime.value = start.format('YYYY-MM-DD HH:mm:ss')
}

// 国家下拉
const countryOptions = ref<string[]>([])
const selectedCountries = ref<string[]>([])

// 加载状态
const loading = ref(false)

// 数据有无
const hasData = ref(false)

// 是否首次（打开弹窗后的第一次查询）
const initialLoad = ref(true)

// echart: 三个图表
const chartRef1 = ref<HTMLDivElement | null>(null) // 通过量/网关量/目标量
const chartRef2 = ref<HTMLDivElement | null>(null) // 阈值
const chartRef3 = ref<HTMLDivElement | null>(null) // 通过率
let chart1: echarts.ECharts | null = null
let chart2: echarts.ECharts | null = null
let chart3: echarts.ECharts | null = null
let resizeBound = false

function ensureCharts() {
  if (chartRef1.value && !chart1) {
    chart1 = echarts.init(chartRef1.value)
  }
  if (chartRef2.value && !chart2) {
    chart2 = echarts.init(chartRef2.value)
  }
  if (chartRef3.value && !chart3) {
    chart3 = echarts.init(chartRef3.value)
  }
  if (!resizeBound && (chart1 || chart2 || chart3)) {
    window.addEventListener('resize', resizeCharts)
    resizeBound = true
  }
}
function resizeCharts() {
  chart1?.resize()
  chart2?.resize()
  chart3?.resize()
}
function disposeCharts() {
  if (chart1) {
    chart1.dispose()
    chart1 = null
  }
  if (chart2) {
    chart2.dispose()
    chart2 = null
  }
  if (chart3) {
    chart3.dispose()
    chart3 = null
  }
  if (resizeBound) {
    window.removeEventListener('resize', resizeCharts)
    resizeBound = false
  }
}
onBeforeUnmount(() => {
  disposeCharts()
})

// pkgName 联想提示池
const pkgNameHints = ref<string[]>([])
type SuggestItem = { value: string }
const querySearchPkg = (queryString: string, cb: (items: SuggestItem[]) => void) => {
  const q = (queryString || '').toLowerCase()
  const list = !q
    ? pkgNameHints.value
    : pkgNameHints.value.filter(v => v.toLowerCase().includes(q))
  cb(list.slice(0, 20).map(v => ({ value: v })))
}
function onSelectPkg(item: SuggestItem) {
  header.value.pkgName = item.value
  // 用户主动选择 pkg 后，重新拉取并用该 pkg 的国家
  initialLoad.value = false
  selectedCountries.value = []
  fetchHistory()
}
function onClearPkg() {
  // 清空不自动查询，等待用户选择/输入
  selectedCountries.value = []
  countryOptions.value = []
}

// optionalCountryMap 提取工具：根据 pkgName（大小写不敏感）取国家列表
function getCountriesFromMap(map: Record<string, string[]> | undefined, pkg: string): string[] {
  if (!map || !pkg) return []
  if (map[pkg]) return map[pkg]
  const key = Object.keys(map).find(k => k.toLowerCase() === pkg.toLowerCase())
  return key ? (map[key] || []) : []
}

// 兼容地汇总“所有国家”用于 pkg 为空时的场景
function unionAllCountries(data?: HistoryResp): string[] {
  const set = new Set<string>()
  if (!data) return []
  if (data.flowTraceData && typeof data.flowTraceData === 'object') {
    Object.keys(data.flowTraceData).forEach(c => set.add(c))
  }
  if (Array.isArray((data as any).optionalCountry)) {
    (data as any).optionalCountry.forEach((c: string) => set.add(c))
  }
  if (data.optionalCountryMap) {
    Object.values(data.optionalCountryMap).forEach(arr => {
      (arr || []).forEach(c => set.add(c))
    })
  }
  return Array.from(set)
}

// 计算默认选中国家（全部小写匹配）
function computeDefaultSelectedCountries(incomingCountry: string | undefined, options: string[]) {
  if (!options || options.length === 0) {
    selectedCountries.value = []
    return
  }
  const optsSet = new Set(options.map(o => o.toLowerCase()))
  if (!incomingCountry || incomingCountry.trim() === '') {
    selectedCountries.value = options.slice(0, Math.min(5, options.length))
    return
  }
  if (incomingCountry.toLowerCase() === 'all') {
    selectedCountries.value = options.slice(0, Math.min(5, options.length))
    return
  }
  const want = incomingCountry.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  const valid = want.filter(c => optsSet.has(c))
  if (valid.length > 0) {
    const mapLowerToReal = new Map(options.map(o => [o.toLowerCase(), o]))
    selectedCountries.value = valid.map(v => mapLowerToReal.get(v)!).filter(Boolean)
  } else {
    selectedCountries.value = options.slice(0, Math.min(5, options.length))
  }
}

async function fetchHistory() {
  // 当输入 'default' 或 'defult' 时按空字符串传参
  const pkgNameRaw = (header.value.pkgName || '')
  const pkgName = /^defa?ult$/i.test(pkgNameRaw) ? '' : pkgNameRaw
  const flow = header.value.flow

  loading.value = true
  hasData.value = false
  try {
    // 关键：
    // 首次打开(initialLoad=true)：沿用入口携带的 country 规则（all => ''）
    // 用户点击“查询”之后(initialLoad=false)：一律使用 selectedCountries（逗号拼接，未选则传空）
    const countryParam = initialLoad.value
      ? ((props.data?.country || '').toLowerCase() === 'all' ? '' : (props.data?.country || ''))
      : (selectedCountries.value.length ? selectedCountries.value.join(',') : '')

    const params: any = {
      pkgName,
      flow,
      startTime: startTime.value,
      endTime: endTime.value,
      country: countryParam,
    }
    const resp: { success?: boolean; message?: string; data?: HistoryResp } = await reqHistoryData(params)
    const ok = resp?.success === true
    const data = resp?.data
    if (!ok || !data) {
      ElMessage.error(resp?.message || '查询失败')
      return
    }

    // 顶部展示
    if (!header.value.pkgName && data.pkgName) header.value.pkgName = data.pkgName
    header.value.flow = data.flow || header.value.flow

    // 国家选项
    const effectivePkg = (data.pkgName || header.value.pkgName || pkgNameRaw).trim()
    if (!effectivePkg) {
      // pkgName 为空：下拉展示“所有国家”；默认选中前 5，其它国家需手动选择后查询
      const allCountries = unionAllCountries(data)
      countryOptions.value = allCountries

      if (initialLoad.value && selectedCountries.value.length === 0) {
        selectedCountries.value = allCountries.slice(0, Math.min(5, allCountries.length))
      } else {
        selectedCountries.value = selectedCountries.value.filter(c => countryOptions.value.includes(c))
      }
    } else {
      // 指定 pkgName：仅展示该 pkg 的国家
      const optCountries = getCountriesFromMap(data.optionalCountryMap, effectivePkg)
      countryOptions.value = Array.isArray(optCountries) ? optCountries : []

      if (selectedCountries.value.length === 0) {
        if (initialLoad.value) {
          computeDefaultSelectedCountries(props.data?.country, countryOptions.value)
        } else {
          selectedCountries.value = countryOptions.value.slice(0, Math.min(5, countryOptions.value.length))
        }
      } else {
        selectedCountries.value = selectedCountries.value.filter(c => countryOptions.value.includes(c))
        if (selectedCountries.value.length === 0) {
          selectedCountries.value = countryOptions.value.slice(0, Math.min(5, countryOptions.value.length))
        }
      }
    }

    // 渲染图（改为三个图表）
    await nextTick()
    ensureCharts()
    renderCharts(data.flowTraceData || {})
  } catch (e) {
    console.error(e)
    ElMessage.error('查询异常')
  } finally {
    loading.value = false
    initialLoad.value = false
  }
}

// 渲染三个图表
function renderCharts(flowTraceData: FlowTraceData) {
  if (!chart1 || !chart2 || !chart3) return

  // 聚合所有时间点（根据当前选中国家）
  const chosen = selectedCountries.value
  const timeSet = new Set<string>()
  for (const c of chosen) {
    const one = (flowTraceData?.[c] || {}) as FlowTraceCountry
    Object.keys(one).forEach(t => timeSet.add(t))
  }
  const timeKeys = Array.from(timeSet).sort((a, b) => (a > b ? 1 : -1))

  const makeEmptyOption = (title: string): echarts.EChartsOption => ({
    title: { text: `${title} (${header.value.pkgName || 'ALL'} / ${header.value.flow})` },
    xAxis: { type: 'category', data: [] },
    yAxis: { type: 'value' },
    series: [],
    legend: { data: [] }
  })

  if (timeKeys.length === 0) {
    hasData.value = false
    chart1.clear(); chart2.clear(); chart3.clear()
    chart1.setOption(makeEmptyOption('通过量/网关量/目标量'))
    chart2.setOption(makeEmptyOption('阈值'))
    chart3.setOption(makeEmptyOption('通过率'))
    return
  }

  hasData.value = true

  // 公共坐标轴配置
  const commonXAxis: echarts.XAXisComponentOption = {
    type: 'category',
    boundaryGap: false,
    data: timeKeys,
    axisLabel: {
      formatter: (val: string) => {
        if (/^\d{10}$/.test(val)) {
          const MM = val.slice(4, 6)
          const DD = val.slice(6, 8)
          const HH = val.slice(8, 10)
          return `${MM}-${DD} ${HH}`
        }
        return val
      },
    },
  }
  const commonDataZoom: echarts.DataZoomComponentOption[] = [
    { type: 'inside', start: 0, end: 100 },
    { type: 'slider', start: 0, end: 100, bottom: 2 },
  ]
  const commonGrid: echarts.GridComponentOption = { top: 70, left: 80, right: 30, bottom: 60 }

  // 图一：通过量/网关量/目标量
  const metrics1: Array<{ key: keyof FlowTracePoint; label: string }> = [
    { key: 'pass', label: '通过量' },
    { key: 'count', label: '网关量' },
    { key: 'dayClicks', label: '目标量' },
  ]
  const series1: echarts.SeriesOption[] = []
  const seriesMeta1: Array<{ country: string; metric: string }> = []
  for (const c of chosen) {
    const one = (flowTraceData?.[c] || {}) as FlowTraceCountry
    for (const m of metrics1) {
      const dataArr = timeKeys.map(t => {
        const v = one?.[t]?.[m.key]
        return typeof v === 'number' ? v : (v ?? null)
      })
      seriesMeta1.push({ country: c, metric: m.label })
      series1.push({
        type: 'line',
        name: m.label,
        id: `${m.label}|${c}`,
        data: dataArr,
        symbol: 'circle',
        smooth: true,
        showSymbol: false,
        emphasis: { focus: 'series' },
        connectNulls: true,
      })
    }
  }
  const option1: echarts.EChartsOption = {
    title: {
      text: `通过量/网关量/目标量 (${header.value.pkgName || 'ALL'} / ${header.value.flow})`,
      left: 'center',
      textStyle: { fontSize: 14 },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        const arr = Array.isArray(params) ? params : [params]
        const head = (arr[0] as any).axisValueLabel ?? String(arr[0]?.axisValue ?? '')
        const lines = arr.map((p: any) => {
          const meta = seriesMeta1[p.seriesIndex]
          const val = p.value
          const textVal = Array.isArray(val) ? val[1] : (val ?? '-')
          return `${p.marker}[${meta?.country || '-'}] ${meta?.metric || p.seriesName}: ${textVal}`
        })
        return [head, ...lines].join('<br/>')
      }
    },
    legend: {
      type: 'scroll',
      top: 28,
      data: metrics1.map(m => m.label),
    },
    grid: commonGrid,
    dataZoom: commonDataZoom,
    xAxis: commonXAxis,
    yAxis: { type: 'value', name: '值', axisLabel: { formatter: '{value}' }, splitLine: { show: true } },
    series: series1,
    animation: false,
  }

  // 图二：阈值（按国家）
  const series2: echarts.SeriesOption[] = []
  for (const c of chosen) {
    const one = (flowTraceData?.[c] || {}) as FlowTraceCountry
    const dataArr = timeKeys.map(t => {
      const v = one?.[t]?.cutoff
      return typeof v === 'number' ? v : (v ?? null)
    })
    series2.push({
      type: 'line',
      name: c,
      id: `阈值|${c}`,
      data: dataArr,
      symbol: 'circle',
      smooth: true,
      showSymbol: false,
      emphasis: { focus: 'series' },
      connectNulls: true,
    })
  }
  const option2: echarts.EChartsOption = {
    title: {
      text: `阈值 (${header.value.pkgName || 'ALL'} / ${header.value.flow})`,
      left: 'center',
      textStyle: { fontSize: 14 },
    },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    // legend: { type: 'scroll', top: 28, data: chosen },
    legend: { show: false }, // 修改：不显示 legend
    grid: commonGrid,
    dataZoom: commonDataZoom,
    xAxis: commonXAxis,
    yAxis: { type: 'value', name: '阈值', axisLabel: { formatter: '{value}' }, splitLine: { show: true } },
    series: series2,
    animation: false,
  }

  // 图三：通过率（按国家）
  const series3: echarts.SeriesOption[] = []
  for (const c of chosen) {
    const one = (flowTraceData?.[c] || {}) as FlowTraceCountry
    const dataArr = timeKeys.map(t => {
      const v = one?.[t]?.passRatio
      return typeof v === 'number' ? v : (v ?? null)
    })
    series3.push({
      type: 'line',
      name: c,
      id: `通过率|${c}`,
      data: dataArr,
      symbol: 'circle',
      smooth: true,
      showSymbol: false,
      emphasis: { focus: 'series' },
      connectNulls: true,
    })
  }
  const option3: echarts.EChartsOption = {
    title: {
      text: `通过率 (${header.value.pkgName || 'ALL'} / ${header.value.flow})`,
      left: 'center',
      textStyle: { fontSize: 14 },
    },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    // legend: { type: 'scroll', top: 28, data: chosen },
    legend: { show: false }, // 修改：不显示 legend
    grid: commonGrid,
    dataZoom: commonDataZoom,
    xAxis: commonXAxis,
    yAxis: { type: 'value', name: '通过率', axisLabel: { formatter: '{value}' }, splitLine: { show: true } },
    series: series3,
    animation: false,
  }

  chart1.clear(); chart2.clear(); chart3.clear()
  chart1.setOption(option1, true)
  chart2.setOption(option2, true)
  chart3.setOption(option3, true)
}

function onClose() {
  innerVisible.value = false
  // 关闭时自动退出全屏，避免下次打开仍是全屏
  isFullscreen.value = false
  nextTick(() => resizeCharts())
}

// 查询：将本次输入的 pkgName 和当前选中的 country 作为参数发起请求
function handleQuery() {
  if (!startTime.value || !endTime.value) {
    ElMessage.warning('请选择开始时间和结束时间')
    return
  }
  const s = dayjs(startTime.value)
  const e = dayjs(endTime.value)
  if (!s.isValid() || !e.isValid()) {
    ElMessage.warning('时间格式不正确')
    return
  }
  if (e.isBefore(s)) {
    ElMessage.warning('结束时间不能早于开始时间')
    return
  }
  // 强制走“用户查询”路径：使用 header.pkgName 与 selectedCountries 作为查询参数
  initialLoad.value = false
  fetchHistory()
}

// 查询 pkgName 所有值（逗号分隔）
const allPkgNames = ref<any>()
const fetchAllPkgNames = async () => {
  const params = {
    kvgroup: '',
    k: 'monitorData',
    status: '1'
  }
  allPkgNames.value = await reqListKvUrl(params)
  const raw: string = allPkgNames.value?.data?.[0]?.v || ''
  const list = raw.split(',').map(s => s.trim()).filter(Boolean)
  pkgNameHints.value = Array.from(new Set(list))
}

// 打开弹窗时初始化
watch(
  () => innerVisible.value,
  async (v) => {
    if (v) {
      const incomingPkg = (props.data?.pkgName || '').trim()
      header.value = {
        pkgName: /^defa?ult$/i.test(incomingPkg) ? '' : (incomingPkg || ''),
        flow: props.data?.flow || '',
      }
      initDefaultTimes()
      await fetchAllPkgNames()

      await nextTick()
      ensureCharts()
      chart1?.clear()
      chart2?.clear()
      chart3?.clear()

      // 首次加载：使用入口参数
      initialLoad.value = true
      selectedCountries.value = []
      countryOptions.value = []
      fetchHistory()
    }
  }
)

onMounted(() => {
  if (innerVisible.value) {
    ensureCharts()
  }
})
</script>

<style scoped lang="scss">
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 让弹窗有固定高度，body 区域可滚动 */
:deep(.el-dialog.monitor-dialog) {
  display: flex;
  flex-direction: column;
  /* 非全屏时的整体高度，可按需调整 */
  height: 86vh;
}
:deep(.el-dialog.monitor-dialog.is-fullscreen) {
  height: 100vh; /* 全屏时铺满，可在 body 内滚动 */
}
:deep(.el-dialog.monitor-dialog .el-dialog__header) {
  flex: 0 0 auto;
}
:deep(.el-dialog.monitor-dialog .el-dialog__body) {
  flex: 1 1 auto;
  overflow: auto; /* 关键：内容超出时出现滚动条 */
}
:deep(.el-dialog.monitor-dialog .el-dialog__footer) {
  flex: 0 0 auto;
}

.monitor-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.monitor-toolbar {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1.2fr;
  gap: 12px;
  align-items: center;

  .toolbar-left {
    min-width: 360px;
  }
  .toolbar-middle {
    .time-row {
      display: flex;
      align-items: center;
      gap: 8px;
      .time-sep {
        color: #909399;
        user-select: none;
      }
    }
  }
  .toolbar-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}

.chart-card {
  position: relative;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 8px;
  min-height: 240px;
  background: #fff;

  .chart {
    width: 100%;
  }

  .empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
  }
}
</style>