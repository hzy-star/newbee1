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
                <div v-for="(flow, flowIndex) in flows" :key="flow.id" class="flow-section">
                    <!-- Flow 标题 -->
                    <div class="flow-header">
                        <div class="flow-info">
                            <h2 class="flow-title">
                                <i class="el-icon-s-operation"></i>
                                {{ flow.name }}
                            </h2>
                            <div class="flow-meta">
                                <el-tag :type="flow.status === 'enabled' ? 'success' : 'danger'" size="small">
                                    {{ flow.status === 'enabled' ? '启用' : '禁用' }}
                                </el-tag>
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
                        <el-table :data="flow.groups" border size="small" :row-class-name="tableRowClassName">
                            <el-table-column label="序号" width="60" align="center">
                                <template #default="{ $index }">
                                    <span class="group-seq">G{{ $index + 1 }}</span>
                                </template>
                            </el-table-column>

                            <el-table-column prop="name" label="分组名称" width="120">
                                <template #default="{ row }">
                                    <div class="name-with-icon">
                                        <i class="el-icon-folder-opened"></i>
                                        <el-tooltip :content="row.name" placement="top"
                                            :disabled="row.name.length <= 10">
                                            <span class="truncate-text">{{ row.name }}</span>
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
                                    {{ row.cutoff || '-' }}
                                </template>
                            </el-table-column>

                            <el-table-column prop="returnType" label="返回类型" width="80" align="center">
                                <template #default="{ row }">
                                    {{ row.returnType || '-' }}
                                </template>
                            </el-table-column>

                            <el-table-column prop="formula" label="公式" width="100">
                                <template #default="{ row }">
                                    <el-tooltip :content="row.formula" placement="top"
                                        :disabled="!row.formula || row.formula.length <= 10">
                                        <span class="truncate-text">{{ row.formula || '-' }}</span>
                                    </el-tooltip>
                                </template>
                            </el-table-column>

                            <el-table-column label="策略数量" width="80" align="center">
                                <template #default="{ row }">
                                    <el-tag size="small" type="info">
                                        {{ getTotalStrategyCount(row.strategies) }}
                                    </el-tag>
                                </template>
                            </el-table-column>

                            <el-table-column label="策略列表">
                                <template #default="{ row }">
                                    <div v-if="!row.loaded" class="strategy-loading">
                                        <el-skeleton-item variant="text" style="width: 60%; height: 20px;" />
                                    </div>
                                    <div v-else-if="row.strategies.length === 0" class="no-strategies">
                                        <span class="empty-text">暂无策略</span>
                                    </div>
                                    <div v-else class="strategies-container">
                                        <div class="strategies-simple-list">
                                            <el-tag v-for="(strategyArray, index) in row.strategies" :key="index"
                                                size="small" class="strategy-tag" type="success" effect="light">
                                                <template v-for="(strategy, sIndex) in strategyArray"
                                                    :key="strategy.id">
                                                    <el-tooltip :content="strategy.ruleFile" placement="top">
                                                        <span class="strategy-name-simple">{{ strategy.name }}</span>
                                                        <span v-if="sIndex < strategyArray.length - 1"
                                                            class="strategy-separator"> | </span>
                                                    </el-tooltip>
                                                </template>
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
import { ref, computed } from 'vue'
import { reqFlow } from '@/api/strategyAutoDelivery/flow/index'
import { reqStrategyGroup } from '@/api/strategyAutoDelivery/groups/index'
import { reqStrategys } from '@/api/strategyAutoDelivery/strategyPage/index'

type Status = 'idle' | 'loading' | 'done'
const status = ref<Status>('idle')
const flows = ref<any[]>([])

const totalGroups = computed(() =>
    flows.value.reduce((total, flow) => total + flow.groups.length, 0)
)

const totalStrategies = computed(() =>
    flows.value.reduce((total, flow) => {
        return total + flow.groups.reduce((groupTotal: number, group: any) => {
            return groupTotal + group.strategies.reduce((strategyTotal: number, strategyArray: any) => {
                return strategyTotal + (Array.isArray(strategyArray) ? strategyArray.length : 1)
            }, 0)
        }, 0)
    }, 0)
)

const tableRowClassName = () => 'group-row'
const formatOperator = (operator: string) => {
    const operatorMap: Record<string, string> = {
        big: '>',
        small: '<',
        equal: '='
    }
    return operatorMap[operator] || operator
}
const getOperatorClass = (operator: string) => {
    return {
        big: 'operator-big',
        small: 'operator-small',
        equal: 'operator-equal'
    }[operator] || ''
}
// 计算策略总数
const getTotalStrategyCount = (strategies: any[]) => {
    return strategies.reduce((total, strategyArray) => {
        return total + (Array.isArray(strategyArray) ? strategyArray.length : 1)
    }, 0)
}
const loadDataProgressively = async () => {
    try {
        status.value = 'loading'
        const flowRes: any = await reqFlow(true)
        const flowList: any[] = (flowRes?.data || []).map((flow: any) => ({
            ...flow,
            loaded: false,
            groups: []
        }))
        flows.value = flowList

        await new Promise(r => setTimeout(r, 300))

        for (const flow of flowList) {
            flow.loaded = true
            if (!flow.strategyGroupIds) continue

            const groupIdArr = typeof flow.strategyGroupIds === 'string'
                ? flow.strategyGroupIds.split(',').map((id: string) => id.trim()).filter(Boolean)
                : Array.isArray(flow.strategyGroupIds) ? flow.strategyGroupIds : []

            for (const groupId of groupIdArr) {
                const groupRes: any = await reqStrategyGroup({ ids: groupId }, true)
                const groupData: any = groupRes?.data || {}

                const group = {
                    ...(groupData.hasOwnProperty('0') ? groupData['0'] : groupData),
                    loaded: false,
                    strategies: []
                }

                flow.groups.push(group)
                await new Promise(r => setTimeout(r, 150))
                group.loaded = true

                if (group.strategyIds) {
                    const strategyIdArr = typeof group.strategyIds === 'string'
                        ? group.strategyIds.split(',').map((id: string) => id.trim()).filter(Boolean)
                        : Array.isArray(group.strategyIds) ? group.strategyIds : []

                    const strategyResults = await Promise.all(
                        strategyIdArr.map(async (id: string) => {
                            if (!id) return null
                            const strategyRes: any = await reqStrategys({ ids: id }, true)
                            return strategyRes?.data || null
                        })
                    )
                    group.strategies = strategyResults.filter(Boolean)
                }
            }
        }

        status.value = 'done'
    } catch (err) {
        console.error('加载失败', err)
        status.value = 'idle'
    }
}

defineExpose({ loadDataProgressively })
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