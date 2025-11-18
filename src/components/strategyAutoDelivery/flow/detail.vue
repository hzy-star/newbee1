<template>
    <div class="dashboard-container">
        <!-- 空态 -->
        <div v-if="status === 'idle'" class="empty-wrapper">
            <el-empty description="暂无数据" :image-size="120" />
        </div>

        <!-- 加载中 -->
        <div v-else-if="status === 'loading'" class="loading-wrapper">
            <el-skeleton :rows="8" animated />
            <div class="loading-tip">当前加载详情较慢，请耐心等待...</div>
        </div>

        <!-- 加载完成 -->
        <div v-else class="content-wrapper">
            <!-- 统计栏 -->
            <div class="stats-bar">
                <div class="stat-item">
                    <span class="stat-label">总流程数:</span>
                    <span class="stat-value">{{ flows.length }}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">总分组数:</span>
                    <span class="stat-value">{{ totalGroups }}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">总策略数:</span>
                    <span class="stat-value">{{ totalStrategies }}</span>
                </div>
            </div>

            <!-- Flow 渐进渲染 -->
            <div class="table-container">
                <!-- 使用过滤后的列表渲染 -->
                <div v-for="(flow, flowIndex) in filteredFlows" :key="flow.id" class="flow-section flow-contain">
                    <!-- Flow 标题 -->
                    <div class="flow-header">
                        <div class="flow-info">
                            <h2 class="flow-title">
                                <el-icon>
                                    <operation />
                                </el-icon>
                                {{ flow.name || '-' }}
                                <span class="span-text"
                                    :class="flow.deviceSource === 'online' ? 'span-online' : 'span-offline'">{{
                                        flow.deviceSource === 'online' ? '(实时)' : flow.deviceSource === 'offline' ? '(离线)' :
                                    '' }}</span>
                                <el-tag :type="flow.status === 'enabled' ? 'success' : 'danger'" size="default">
                                    {{ flow.status === 'enabled' ? '启用' : '禁用' }}
                                </el-tag>
                            </h2>
                            <div class="flow-meta">
                                <el-button size="small" type="primary" plain @click="handleView(flow)">查看</el-button>
                                <el-button size="small" type="success" plain
                                    @click="handleEditFlow(flow)">编辑</el-button>
                                <el-button size="small" type="danger" plain @click="handleDelete(flow)"
                                    :disabled="!props.isSuperAdmin">删除</el-button>
                                <el-button size="small" type="warning" plain @click="handleCopy(flow)">复制</el-button>
                                <span class="group-count">{{ flow.groups.length }} 个分组</span>
                            </div>
                        </div>
                    </div>

                    <!-- Flow 下的 Group 渐进渲染 -->
                    <div v-if="!flow.loaded" class="loading-section">
                        <el-skeleton :rows="3" animated />
                    </div>

                    <div v-else-if="flow.groups.length === 0" class="empty-section">
                        <el-empty description="暂无分组数据" :image-size="80" />
                    </div>

                    <div v-else class="groups-table">
                        <el-table :data="flow.groups" border size="small" :row-class-name="tableRowClassName"
                            row-key="id">
                            <el-table-column label="序号" width="60" align="center">
                                <template #default="{ $index }">
                                    <span class="group-seq">G{{ $index + 1 }}</span>
                                </template>
                            </el-table-column>

                            <el-table-column prop="name" label="分组名称" width="120">
                                <template #default="{ row }">
                                    <div class="name-with-icon">
                                        <i class="el-icon-folder-opened"></i>
                                        <el-tooltip :content="row.name || '-'" placement="top"
                                            :disabled="!(row.name && row.name.length > 10)">
                                            <span class="truncate-text">{{ row.name || '-' }}</span>
                                        </el-tooltip>
                                    </div>
                                </template>
                            </el-table-column>

                            <el-table-column prop="status" label="状态" width="60" align="center">
                                <template #default="{ row }">
                                    <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'" size="small">
                                        {{ row.status === 'enabled' ? '启用' : '禁用' }}
                                    </el-tag>
                                </template>
                            </el-table-column>

                            <el-table-column prop="operator" label="操作符" width="60" align="center">
                                <template #default="{ row }">
                                    <span class="operator" :class="getOperatorClass(row.operator)">
                                        {{ formatOperator(row.operator) }}
                                    </span>
                                </template>
                            </el-table-column>

                            <el-table-column prop="cutoff" label="截止值" width="80" align="center">
                                <template #default="{ row }">
                                    {{ row.cutoff ?? '-' }}
                                </template>
                            </el-table-column>

                            <el-table-column prop="returnType" label="返回类型" width="80" align="center">
                                <template #default="{ row }">
                                    {{ row.returnType || '-' }}
                                </template>
                            </el-table-column>

                            <el-table-column prop="formula" label="公式" width="100">
                                <template #default="{ row }">
                                    <el-tooltip :content="row.formula || '-'" placement="top"
                                        :disabled="!(row.formula && row.formula.length > 10)">
                                        <span class="truncate-text">{{ row.formula || '-' }}</span>
                                    </el-tooltip>
                                </template>
                            </el-table-column>

                            <el-table-column label="策略数量" width="80" align="center">
                                <template #default="{ row }">
                                    <el-tag size="small" type="info">
                                        {{ row.strategyCount ?? 0 }}
                                    </el-tag>
                                </template>
                            </el-table-column>

                            <el-table-column label="策略列表">
                                <template #default="{ row }">
                                    <div v-if="!row.loaded" class="strategy-loading">
                                        <el-skeleton-item variant="text" style="width: 60%; height: 20px;" />
                                    </div>

                                    <div v-else-if="(row.tagTexts?.length || 0) === 0" class="no-strategies">
                                        <span class="empty-text">暂无策略</span>
                                    </div>

                                    <div v-else class="strategies-container">
                                        <div class="strategies-simple-list">
                                            <!-- 仅一层 v-for，每个 tag 一个 tooltip，样式不变 -->
                                            <el-tag v-for="(text, index) in row.tagTexts"
                                                :key="row.tagKeys[index] || index" size="small" class="strategy-tag"
                                                type="success" effect="light">
                                                <el-tooltip :content="row.tagTips[index]" placement="top"
                                                    :disabled="!row.tagTips[index]">
                                                    <span class="strategy-name-simple">{{ text }}</span>
                                                </el-tooltip>
                                            </el-tag>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, markRaw, watch } from 'vue'
import { reqFlow } from '@/api/strategyAutoDelivery/flow/index'
import { reqStrategyGroup } from '@/api/strategyAutoDelivery/groups/index'
import { reqStrategys } from '@/api/strategyAutoDelivery/strategyPage/index'

type Status = 'idle' | 'loading' | 'done'
const status = ref<Status>('idle')
const flows = ref<any[]>([])
const flowsData = ref<any[]>([])
const totalGroups = computed(() =>
    flows.value.reduce((total, flow) => total + (flow.groups?.length || 0), 0)
)
const totalStrategies = computed(() =>
    flows.value.reduce((total, flow) => {
        return total + flow.groups.reduce((gt: number, g: any) => gt + (g.strategyCount || 0), 0)
    }, 0)
)

const tableRowClassName = () => 'group-row'
const formatOperator = (operator: string) => {
    const operatorMap: Record<string, string> = { big: '>', small: '<', equal: '=' }
    return operatorMap[operator] || operator || '-'
}
const getOperatorClass = (operator: string) =>
    ({ big: 'operator-big', small: 'operator-small', equal: 'operator-equal' }[operator] || '')

const parseIds = (val: unknown): string[] => {
    if (!val) return []
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean)
    if (Array.isArray(val)) return val.map(String).map(s => s.trim()).filter(Boolean)
    return []
}
const toArray = (data: any): any[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    return Object.values(data) // 兼容对象返回
}
const uniq = <T,>(arr: T[]) => Array.from(new Set(arr))
function applyDetailFilters() {
    const src = (props.detailOption === 'online' || props.detailOption === 'offline') ? props.detailOption : ''
    const stat = (props.detailDeviceStatus === 'enabled' || props.detailDeviceStatus === 'disabled') ? props.detailDeviceStatus : ''
    const base = flowsData.value || []

    flows.value = base.filter(f =>
        (!src || f.deviceSource === src) &&
        (!stat || f.status === stat)
    )
}
// 并发批量加载（两阶段）
const loadDataProgressively = async () => {
    try {
        status.value = 'loading'

        // 1) flows
        const flowRes: any = await reqFlow(true)
        const flowList: any[] = toArray(flowRes?.data).map((flow: any) => ({
            ...flow,
            loaded: false,
            groups: [] as any[],
        }))
        flows.value = flowList
        const priority: Record<string, number> = { online: 0, offline: 1 }
        flows.value = (flows.value || []).sort((a: any, b: any) => {
            const nameCmp = String(a.name || '').localeCompare(String(b.name || ''), 'zh', { sensitivity: 'base' })
            if (nameCmp !== 0) return nameCmp
            const pa = priority[String(a.deviceSource)] ?? 99
            const pb = priority[String(b.deviceSource)] ?? 99
            return pa - pb
        })
        // 储存一份原始数据备份
        flowsData.value = [...flows.value]

        applyDetailFilters()
        // 2) groups 批量
        const allGroupIds = uniq(flowList.flatMap(f => parseIds(f.strategyGroupIds)))
        if (allGroupIds.length === 0) {
            for (const f of flowList) f.loaded = true
            status.value = 'done'
            return
        }
        const groupRes: any = await reqStrategyGroup({ ids: allGroupIds.join(',') }, true)
        const groupArr: any[] = toArray(groupRes?.data)

        const groupMap = new Map<string, any>()
        for (const g of groupArr) {
            if (!g) continue
            groupMap.set(String(g.id), {
                ...g,
                loaded: false,
                // 运行期只读 UI 字段，避免深度响应
                strategies: markRaw([] as any[]), // 数组的数组（保留数据形状）
                strategyCount: 0,
                tagTexts: markRaw([] as string[]), // 每个 tag 的显示文本（用“ | ”拼接）
                tagTips: markRaw([] as string[]),  // 每个 tag 的 tooltip 内容
                tagKeys: markRaw([] as string[]),  // 每个 tag 的 key（稳定）
            })
        }

        for (const flow of flowList) {
            const ids = parseIds(flow.strategyGroupIds)
            flow.groups = ids.map(id => groupMap.get(String(id))).filter(Boolean)
            flow.loaded = true
        }

        // 3) strategies 批量
        const allStrategyIds = uniq(
            flowList
                .flatMap(f => f.groups)
                .flatMap((g: any) => parseIds(g?.strategyIds).map((s: string) => s.split(':')[0]).filter(Boolean))
        )

        if (allStrategyIds.length > 0) {
            const stratRes: any = await reqStrategys({ ids: allStrategyIds.join(',') }, true)
            const stratArr: any[] = toArray(stratRes?.data)
            const stratMap = new Map<string, any>()
            for (const s of stratArr) stratMap.set(String(s.id), s)

            for (const g of groupMap.values()) {
                const ids = parseIds(g.strategyIds).map((s: string) => s.split(':')[0]).filter(Boolean)

                // 策略数组的数组（保持结构），但模板不再二次遍历
                const strategyArrays = ids.map(id => {
                    const s = stratMap.get(String(id))
                    return s ? [markRaw(s)] : []
                })
                // 渲染用的文本 / tooltip / key
                const tagTexts = strategyArrays.map(arr => arr.map(s => s?.name || '').filter(Boolean).join(' | '))
                const tagTips = strategyArrays.map(arr => arr.map(s => s?.description || '').filter(Boolean).join(' | '))
                const tagKeys = ids.map(id => id)

                g.strategies = markRaw(strategyArrays)
                g.tagTexts = markRaw(tagTexts)
                g.tagTips = markRaw(tagTips)
                g.tagKeys = markRaw(tagKeys)
                g.strategyCount = ids.length
                g.loaded = true
            }
        } else {
            for (const g of groupMap.values()) {
                g.strategies = markRaw([])
                g.tagTexts = markRaw([])
                g.tagTips = markRaw([])
                g.tagKeys = markRaw([])
                g.strategyCount = 0
                g.loaded = true
            }
        }

        status.value = 'done'
    } catch (err) {
        console.error('加载失败', err)
        status.value = 'idle'
    }
}

defineExpose({ loadDataProgressively })

// 接收父组件的 props（包含搜索关键字）
const props = defineProps<{
    filterName: string,
    isSuperAdmin: boolean,
    detailOption: string,
    detailDeviceStatus: string
}>()
// flowsData 变化或筛选项变化时都重算
watch(flowsData, applyDetailFilters)
watch([() => props.detailOption, () => props.detailDeviceStatus], applyDetailFilters, { immediate: true })
// 新增：搜索过滤（支持 Flow 名称、Group 名称、Group 的 tagTexts）
const filteredFlows = computed(() => {
    const kw = String(props.filterName || '').trim().toLowerCase()
    if (!kw) return flows.value
    const includesKw = (s: any) => String(s ?? '').toLowerCase().includes(kw)

    return (flows.value || []).reduce<any[]>((acc, flow) => {
        const flowMatch = includesKw(flow.name)
        // 命中 group：组名或 tagTexts 任意一个包含关键字
        const matchedGroups = (flow.groups || []).filter((g: any) => {
            const nameHit = includesKw(g?.name)
            const tagHit = Array.isArray(g?.tagTexts) && g.tagTexts.some((t: string) => includesKw(t))
            return nameHit || tagHit
        })

        if (flowMatch) {
            // 命中 Flow 名：保留该 Flow 全部分组
            acc.push({ ...flow, groups: flow.groups })
        } else if (matchedGroups.length > 0) {
            // 未命中 Flow 名但命中分组/标签：仅保留命中的分组
            acc.push({ ...flow, groups: matchedGroups })
        }
        return acc
    }, [])
})

// 这些事件仍保留（查看/编辑/删除/复制）
const emit = defineEmits<{
    (e: 'view', flow: any): void
    (e: 'edit', flow: any): void
    (e: 'delete', flow: any): void
    (e: 'copy', flow: any): void
}>()

const handleView = (flow: any) => emit('view', flow)
const handleEditFlow = (flow: any) => emit('edit', flow)
const handleDelete = (flow: any) => emit('delete', flow)
const handleCopy = (flow: any) => emit('copy', flow)
</script>

<style lang="scss" scoped>
.dashboard-container {
    padding: 20px;
    min-height: 100vh;

    .loading-wrapper {
        padding: 30px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
    }

    .content-wrapper {
        .stats-bar {
            display: flex;
            gap: 30px;
            margin-bottom: 20px;
            padding: 15px 20px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

            .stat-item {
                display: flex;
                align-items: center;
                gap: 8px;

                .stat-label {
                    color: #666;
                    font-size: 14px;
                }

                .stat-value {
                    color: #409EFF;
                    font-size: 18px;
                    font-weight: bold;
                }
            }
        }

        .table-container {
            .flow-section {
                margin-bottom: 30px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }

            /* 关键优化：视口外内容不参与布局绘制 */
            .flow-contain {
                content-visibility: auto;
                contain-intrinsic-size: 600px 400px;
                /* 预估尺寸，可按实际调整 */
            }

            .flow-header {
                background: linear-gradient(135deg, #409EFF 0%, #66b3ff 100%);
                color: #fff;
                padding: 15px 20px;

                .flow-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    .flow-title {
                        margin: 0;
                        font-size: 18px;
                        font-weight: 600;

                        i {
                            margin-right: 8px;
                        }

                        .span-text {
                            margin-left: 6px;
                            font-size: 14px;
                            font-weight: normal;
                            margin-right: 5px;
                        }

                        .span-online {
                            color: #e4ec0a;
                        }

                        .span-offline {
                            color: #e33434;
                        }
                    }

                    .flow-meta {
                        display: flex;
                        align-items: center;
                        gap: 15px;

                        .group-count {
                            font-size: 14px;
                            opacity: 0.9;
                        }
                    }
                }
            }

            .loading-section,
            .empty-section {
                padding: 40px;
                text-align: center;
            }

            .groups-table {
                :deep(.el-table) {
                    .group-row {
                        &:hover {
                            td {
                                background-color: #f5f7fa;
                            }
                        }

                        .group-seq {
                            display: inline-block;
                            background: #67C23A;
                            color: #fff;
                            padding: 2px 6px;
                            border-radius: 4px;
                            font-weight: bold;
                            font-size: 12px;
                        }

                        .name-with-icon {
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            font-weight: 600;
                            color: #67C23A;

                            i {
                                color: #67C23A;
                            }
                        }

                        .truncate-text {
                            max-width: 100px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }

                        .operator {
                            font-weight: bold;
                            font-size: 16px;

                            &.operator-big {
                                color: #67c23a;
                            }

                            &.operator-small {
                                color: #f56c6c;
                            }

                            &.operator-equal {
                                color: #e6a23c;
                            }
                        }

                        .strategies-container {
                            .strategies-simple-list {
                                display: flex;
                                flex-wrap: wrap;
                                gap: 4px;
                                align-items: center;

                                .strategy-tag {
                                    margin: 1px;
                                    font-size: 11px;
                                    max-width: 120px;

                                    .strategy-name-simple {
                                        display: inline-block;
                                        max-width: 80px;
                                        overflow: hidden;
                                        text-overflow: ellipsis;
                                        white-space: nowrap;
                                    }

                                    .strategy-separator {
                                        margin: 0 2px;
                                        color: #999;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .dashboard-container {
        .content-wrapper {
            .stats-bar {
                flex-direction: column;
                gap: 15px;
            }

            .table-container {
                overflow-x: auto;
            }
        }
    }
}

.empty-wrapper {
    padding: 50px;
}

.loading-wrapper {
    padding: 30px;
    background: #fff;
    border-radius: 8px;
    text-align: center;
}

.loading-tip {
    margin-top: 12px;
    color: #999;
    font-size: 14px;
}

.strategy-loading {
    display: flex;
    justify-content: center;
    padding: 8px 0;
}
</style>