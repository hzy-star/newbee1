<template>
  <el-dialog
    v-model="visible"
    title="Flow 树形结构"
    width="90%"
    :close-on-click-modal="false"
    destroy-on-close
    top="5vh"
    class="cool-dialog"
  >
    <div class="tree-container" ref="chartContainer">
      <!-- 空数据提示 -->
      <div v-if="isEmpty" class="empty-state">
        <div class="empty-icon">🎄</div>
        <div class="empty-title">暂无数据</div>
        <div class="empty-desc">当前 Flow 没有可展示的树形结构</div>
      </div>
      
      <div v-show="!isEmpty" ref="chartRef" class="chart-area"></div>
      
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <!-- 图例 - 左侧 -->
        <div class="legend">
          <div class="legend-item">
            <span class="legend-dot flow"></span>
            <span>Flow</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot group"></span>
            <span>Group</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot strategy"></span>
            <span>Strategy</span>
          </div>
        </div>
        
        <!-- 全屏按钮 - 右侧 -->
        <div class="fullscreen-btn" @click="toggleFullscreen">
          <el-icon :size="18">
            <FullScreen v-if="!isFullscreen" />
            <Close v-else />
          </el-icon>
          <span>{{ isFullscreen ? '退出全屏' : '全屏' }}</span>
        </div>
      </div>
      
      <!-- 自定义气泡确认框 -->
      <div 
        v-show="popconfirmVisible" 
        class="custom-popconfirm"
        :style="{ left: popconfirmPos.x + 'px', top: popconfirmPos.y + 'px' }"
        @click.stop
      >
        <div class="popconfirm-icon">🔗</div>
        <div class="popconfirm-title">{{ currentNodeData?.ruleFile || '暂无URL' }}</div>
        <div class="popconfirm-buttons">
          <el-button size="small" type="primary" @click="handlePreview">
            <span>👁️ 预览</span>
          </el-button>
          <el-button size="small" @click="handleDownload(currentNodeData?.ruleFile)">
            <span>⬇️ 下载</span>
          </el-button>
        </div>
      </div>
    </div>
    <!-- 通用 CSV 预览组件（可复用） -->
    <CsvPreviewDialog ref="csvRef"  :maxPreviewLines="Infinity"
      :style="{ height: '85vh', overflowY: 'auto' }" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { FullScreen, Close } from '@element-plus/icons-vue';
import { reqTreeDataList } from "@/api/strategyAutoDelivery/generalTree/index";
import CsvPreviewDialog from '@/components/CsvPreviewDialog.vue'
import { ElMessage } from 'element-plus'
import { handleDownload } from '@/utils/common'

const props = defineProps<{
  modelValue: boolean;
  flowName: string;
  id: number;
}>();

const emit = defineEmits(['update:modelValue', 'leafClick']);

const visible = ref(false);
const chartRef = ref<HTMLElement>();
const chartContainer = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

// 空数据状态
const isEmpty = ref(false);

// 气泡确认框状态
const popconfirmVisible = ref(false);
const popconfirmPos = ref({ x: 0, y: 0 });
const currentNodeData = ref<any>(null);

// 全屏状态
const isFullscreen = ref(false);

// 切换全屏
const toggleFullscreen = () => {
  const container = chartContainer.value;
  if (!container) return;
  
  if (!isFullscreen.value) {
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if ((container as any).webkitRequestFullscreen) {
      (container as any).webkitRequestFullscreen();
    } else if ((container as any).msRequestFullscreen) {
      (container as any).msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  }
};

// 监听全屏变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
  // 全屏变化后重新调整图表大小
  nextTick(() => {
    chartInstance?.resize();
  });
};

// 炫酷渐变色配置
const levelColors: Record<string, any> = {
  flow: {
    type: 'linear',
    x: 0, y: 0, x2: 1, y2: 1,
    colorStops: [
      { offset: 0, color: '#667eea' },
      { offset: 1, color: '#764ba2' }
    ]
  },
  group: {
    type: 'linear',
    x: 0, y: 0, x2: 1, y2: 1,
    colorStops: [
      { offset: 0, color: '#11998e' },
      { offset: 1, color: '#38ef7d' }
    ]
  },
  strategy: {
    type: 'linear',
    x: 0, y: 0, x2: 1, y2: 1,
    colorStops: [
      { offset: 0, color: '#eb3349' },
      { offset: 1, color: '#f45c43' }
    ]
  }
};

// 发光阴影配置
const glowShadow: Record<string, any> = {
  flow: { shadowBlur: 20, shadowColor: 'rgba(102, 126, 234, 0.6)' },
  group: { shadowBlur: 15, shadowColor: 'rgba(56, 239, 125, 0.5)' },
  strategy: { shadowBlur: 12, shadowColor: 'rgba(235, 51, 73, 0.5)' }
};

// 生成胶囊形状的 SVG path（根据宽高动态生成）
const getCapsulePath = (width: number, height: number) => {
  const r = height / 2;
  const rectWidth = width - height;
  return `path://M${r},0 A${r},${r} 0 0,0 ${r},${height} L${r + rectWidth},${height} A${r},${r} 0 0,0 ${r + rectWidth},0 Z`;
};

// 计算文字宽度，返回合适的节点宽度
const getNodeWidth = (text: string, fontSize: number = 12) => {
  let width = 0;
  for (const char of text) {
    if (/[\u4e00-\u9fa5]/.test(char)) {
      width += fontSize;
    } else {
      width += fontSize * 0.6;
    }
  }
  return Math.max(width + 24, 60);
};

// 将树形数据转换为 graph 需要的 nodes 和 links
const convertTreeToGraph = (treeData: any, containerWidth: number, containerHeight: number) => {
  const nodes: any[] = [];
  const links: any[] = [];
  
  // 过滤掉 null 和无效的 group
  const groups = (treeData.children || []).filter((g: any) => g && g.name);
  const groupCount = groups.length;
  
  let totalStrategies = 0;
  groups.forEach((group: any) => {
    // 过滤掉 null 的 children
    const validChildren = (group.children || []).filter((s: any) => s && s.name);
    const strategyCount = validChildren.length || 1;
    totalStrategies += strategyCount;
  });
  
  const isLargeData = totalStrategies > 15 || groupCount > 5;
  const flowFontSize = isLargeData ? 12 : 14;
  const groupFontSize = isLargeData ? 10 : 12;
  const strategyFontSize = isLargeData ? 9 : 11;
  
  const chartWidth = containerWidth || 900;
  const chartHeight = containerHeight || 500;
  
  const availableHeight = chartHeight - 100;
  const totalRows = totalStrategies + groupCount;
  const strategySpacingY = Math.max(25, Math.min(45, availableHeight / totalRows));
  const groupPadding = Math.max(20, strategySpacingY * 0.8);
  
  const strategyX = chartWidth * 0.15;
  const groupX = chartWidth * 0.5;
  const flowX = chartWidth * 0.85;
  
  const flowWidth = getNodeWidth(treeData.name, flowFontSize);
  const flowHeight = isLargeData ? 30 : 36;
  
  nodes.push({
    name: treeData.name,
    x: flowX,
    y: chartHeight / 2,
    symbol: getCapsulePath(flowWidth, flowHeight),
    symbolSize: [flowWidth, flowHeight],
    description: treeData.description,
    level: 'flow',
    itemStyle: { 
      color: levelColors.flow,
      borderColor: '#fff',
      borderWidth: 2,
      ...glowShadow.flow
    },
    label: { show: true, fontSize: flowFontSize, fontWeight: 'bold', color: '#fff' }
  });
  
  let currentY = 50;
  
  groups.forEach((group: any) => {
    // 过滤掉 null 和无效的 children
    const strategies = (group.children || []).filter((s: any) => s && s.name);
    const strategyCount = strategies.length || 1;
    const groupHeight = strategyCount * strategySpacingY;
    const groupY = currentY + groupHeight / 2;
    const groupWidth = getNodeWidth(group.name, groupFontSize);
    const groupNodeHeight = isLargeData ? 26 : 32;
    
    nodes.push({
      name: group.name,
      x: groupX,
      y: groupY,
      symbol: getCapsulePath(groupWidth, groupNodeHeight),
      symbolSize: [groupWidth, groupNodeHeight],
      description: group.description,
      method: group.method,
      level: 'group',
      itemStyle: { 
        color: levelColors.group,
        borderColor: '#fff',
        borderWidth: 2,
        ...glowShadow.group
      },
      label: { show: true, fontSize: groupFontSize, color: '#fff', fontWeight: 500 }
    });
    
    links.push({
      source: group.name,
      target: treeData.name,
      label: {
        show: true,
        formatter: group.method || '',
        fontSize: isLargeData ? 9 : 11,
        color: '#667eea',
        fontWeight: 'bold',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: [2, 6],
        borderRadius: 3
      },
      lineStyle: {
        type: 'solid',
        width: 2,
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#38ef7d' },
            { offset: 1, color: '#667eea' }
          ]
        },
        curveness: groupCount > 1 ? 0.15 : 0
      }
    });
    
    const strategyStartY = currentY;
    
    strategies.forEach((strategy: any, sIndex: number) => {
      const strategyY = strategyStartY + sIndex * strategySpacingY + strategySpacingY / 2;
      const nodeName = `${group.name}_${strategy.name}_${sIndex}`;
      const strategyWidth = getNodeWidth(strategy.name, strategyFontSize);
      const strategyNodeHeight = isLargeData ? 22 : 28;
      
      nodes.push({
        name: nodeName,
        displayName: strategy.name,
        x: strategyX,
        y: strategyY,
        symbol: getCapsulePath(strategyWidth, strategyNodeHeight),
        symbolSize: [strategyWidth, strategyNodeHeight],
        description: strategy.description,
        ruleFile: strategy.ruleFile,
        level: 'strategy',
        itemStyle: { 
          color: levelColors.strategy,
          borderColor: '#fff',
          borderWidth: 2,
          ...glowShadow.strategy
        },
        label: { 
          show: true, 
          fontSize: strategyFontSize,
          color: '#fff',
          fontWeight: 500,
          formatter: strategy.name
        }
      });
      
      links.push({
        source: nodeName,
        target: group.name,
        lineStyle: {
          type: 'solid',
          width: 2,
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#f45c43' },
              { offset: 1, color: '#38ef7d' }
            ]
          },
          curveness: 0
        }
      });
    });
    
    currentY += groupHeight + groupPadding;
  });
  
  return { nodes, links };
};

// 获取树形数据
const fetchTreeData = async () => {
  try {
    const res = await reqTreeDataList({ flow: props.flowName, configId: props.id });
    if (res.success && res.data) {
      isEmpty.value = false;
      initChart(res.data);
    } else {
      isEmpty.value = true;
    }
  } catch (error) {
    console.error('获取树形数据失败:', error);
    isEmpty.value = true;
  }
};

// 初始化图表
const initChart = (treeData: any) => {
  if (!chartRef.value) return;
  
  const containerWidth = chartContainer.value?.clientWidth || 900;
  const containerHeight = chartRef.value?.clientHeight || 500;
  
  chartInstance = echarts.init(chartRef.value);
  const { nodes, links } = convertTreeToGraph(treeData, containerWidth, containerHeight);
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: 'rgba(102, 126, 234, 0.2)',
      borderWidth: 1,
      padding: [12, 18],
      textStyle: { color: '#334155' },
      extraCssText: 'box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); border-radius: 12px;',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const { data } = params;
          const name = data.displayName || data.name;
          const levelEmoji: Record<string, string> = {
            flow: '🌊',
            group: '📦',
            strategy: '🎯'
          };
          let html = `<div style="font-weight: bold; margin-bottom: 8px; font-size: 14px; color: #334155;">
            ${levelEmoji[data.level] || ''} ${name}
          </div>`;
          if (data.description) {
            html += `<div style="color: #64748b; font-size: 12px;">${data.description}</div>`;
          }
          if (data.ruleFile) {
            html += `<div style="color: #667eea; margin-top: 8px; font-size: 11px;">
              ✨ 点击查看操作选项
            </div>`;
          }
          return html;
        }
        return '';
      }
    },
    series: [
      {
        type: 'graph',
        layout: 'none',
        roam: true,
        zoom: 1,
        label: { show: true },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [8, 14],
        edgeLabel: { fontSize: 11 },
        data: nodes,
        links: links,
        lineStyle: {
          opacity: 0.9,
          width: 2,
          curveness: 0.1
        },
        emphasis: {
          focus: 'adjacency',
          scale: true,
          scaleSize: 1.2,
          lineStyle: { 
            width: 4,
            shadowBlur: 10,
            shadowColor: 'rgba(102, 126, 234, 0.5)'
          },
          itemStyle: {
            shadowBlur: 30,
            shadowColor: 'rgba(102, 126, 234, 0.8)'
          }
        },
        nodeScaleRatio: 0.6,
        animation: true,
        animationDuration: 1500,
        animationEasing: 'elasticOut',
        animationDelay: (idx: number) => idx * 100
      }
    ]
  };
  
  chartInstance.setOption(option);
  
  chartInstance.on('click', (params: any) => {
    console.log('点击事件:', params);
    if (params.dataType === 'node' && params.data.level === 'strategy') {
      popconfirmVisible.value = false;
      
      currentNodeData.value = params.data;
      
      const containerRect = chartContainer.value?.getBoundingClientRect();
      const offsetX = params.event?.event?.offsetX || params.event?.offsetX || 200;
      const offsetY = params.event?.event?.offsetY || params.event?.offsetY || 200;
      
      popconfirmPos.value = {
        x: Math.min(offsetX + 10, (containerRect?.width || 600) - 150),
        y: Math.max(offsetY - 80, 10)
      };
      
      setTimeout(() => {
        popconfirmVisible.value = true;
      }, 10);
      
      emit('leafClick', params.data);
    } else {
      popconfirmVisible.value = false;
    }
  });
};

// 预览
// 预览（调用通用组件）
const csvRef = ref<InstanceType<any> | null>(null)
const handlePreview = () => {
  popconfirmVisible.value = false;
  const objectName = String(currentNodeData.value?.ruleFile || '').trim()
  if (!objectName) {
    ElMessage.warning('规则文件路径为空，无法预览')
    return
  }
  csvRef.value?.open(objectName, `CSV 预览 - ${currentNodeData.value?.name || ''}`)
};


// 点击其他地方关闭气泡
const closePopconfirm = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target.closest('.custom-popconfirm')) {
    return;
  }
  popconfirmVisible.value = false;
};

// 监听 modelValue
watch(() => props.modelValue, (val) => {
  visible.value = val;
  if (val) {
    nextTick(() => {
      fetchTreeData();
      document.addEventListener('click', closePopconfirm);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      // 默认进入全屏
    //   setTimeout(() => {
    //     toggleFullscreen();
    //   }, 300);
    });
  } else {
    chartInstance?.dispose();
    chartInstance = null;
    isEmpty.value = false;
    document.removeEventListener('click', closePopconfirm);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    // 退出时如果还在全屏则退出
    if (isFullscreen.value) {
      document.exitFullscreen?.();
    }
  }
});

// 同步关闭状态
watch(visible, (val) => {
  emit('update:modelValue', val);
});

onUnmounted(() => {
  chartInstance?.dispose();
  document.removeEventListener('click', closePopconfirm);
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});
</script>

<style lang="scss" scoped>
.cool-dialog {
  :deep(.el-dialog) {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 16px;
    border: 1px solid rgba(102, 126, 234, 0.2);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  }
  
  :deep(.el-dialog__header) {
    background: transparent;
    border-bottom: 1px solid rgba(102, 126, 234, 0.15);
    padding: 20px 24px;
  }
  
  :deep(.el-dialog__title) {
    color: #334155;
    font-size: 18px;
    font-weight: 600;
    background: linear-gradient(90deg, #667eea, #764ba2);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  :deep(.el-dialog__body) {
    padding: 0;
  }
  
  :deep(.el-dialog__headerbtn .el-dialog__close) {
    color: #64748b;
    font-size: 20px;
    
    &:hover {
      color: #667eea;
    }
  }
}

.tree-container {
  position: relative;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 0 0 16px 16px;
  overflow: hidden;
  
  &:fullscreen {
    border-radius: 0;
    
    .chart-area {
      height: 100vh !important;
    }
  }
}

.chart-area {
  width: 100%;
  height: 70vh;
  position: relative;
  z-index: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  color: #64748b;
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.6;
  }
  
  .empty-title {
    font-size: 18px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 8px;
  }
  
  .empty-desc {
    font-size: 14px;
    color: #94a3b8;
  }
}

.toolbar {
  position: absolute;
  top: 5px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.legend {
  display: flex;
  gap: 16px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #334155;
    font-size: 12px;
    font-weight: 500;
  }
  
  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    
    &.flow {
      background: linear-gradient(135deg, #667eea, #764ba2);
      box-shadow: 0 0 8px rgba(102, 126, 234, 0.5);
    }
    
    &.group {
      background: linear-gradient(135deg, #11998e, #38ef7d);
      box-shadow: 0 0 8px rgba(56, 239, 125, 0.5);
    }
    
    &.strategy {
      background: linear-gradient(135deg, #eb3349, #f45c43);
      box-shadow: 0 0 8px rgba(235, 51, 73, 0.5);
    }
  }
}

.fullscreen-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.15);
  color: #334155;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.2);
  }
  
  .el-icon {
    color: #667eea;
  }
}

.custom-popconfirm {
  position: absolute;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 16px 20px;
  z-index: 999;
  min-width: 160px;
  max-width: 400px;
  
  .popconfirm-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }
  
  .popconfirm-title {
    color: #334155;
    font-size: 13px;
    margin-bottom: 14px;
    word-break: break-all;
    line-height: 1.5;
  }
  
  .popconfirm-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    
    :deep(.el-button) {
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }
    }
    
    :deep(.el-button--primary) {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
    }
    
    :deep(.el-button--default) {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #334155;
      
      &:hover {
        background: #e2e8f0;
        border-color: #cbd5e1;
      }
    }
  }
}
</style>
