<template>
  <el-dialog
    v-model="visible"
    title="Flow 树形结构"
    width="90%"
    :close-on-click-modal="false"
    destroy-on-close
    top="5vh"
  >
    <div class="tree-container" ref="chartContainer">
      <div ref="chartRef" style="width: 100%; height: 70vh;"></div>
      
      <!-- 自定义气泡确认框 -->
      <div 
        v-show="popconfirmVisible" 
        class="custom-popconfirm"
        :style="{ left: popconfirmPos.x + 'px', top: popconfirmPos.y + 'px' }"
        @click.stop
      >
        <div class="popconfirm-title">{{ currentNodeData?.url || '暂无URL' }}</div>
        <div class="popconfirm-buttons">
          <el-button size="small" type="primary" @click="handlePreview">预览</el-button>
          <el-button size="small" @click="handleDownload">下载</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { reqTreeDataList } from "@/api/strategyAutoDelivery/generalTree/index";

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

// 气泡确认框状态
const popconfirmVisible = ref(false);
const popconfirmPos = ref({ x: 0, y: 0 });
const currentNodeData = ref<any>(null);

// 颜色配置
const levelColors: Record<string, string> = {
  flow: '#5470c6',
  group: '#91cc75', 
  strategy: '#ee6666'
};

// 生成胶囊形状的 SVG path（根据宽高动态生成）
// 胶囊形状：左右两端是半圆，中间是矩形
const getCapsulePath = (width: number, height: number) => {
  const r = height / 2;  // 半圆半径 = 高度的一半
  const rectWidth = width - height;  // 中间矩形的宽度
  // SVG path: 从左边半圆开始，顺时针绘制
  // M: 移动到起点（左边半圆的顶部）
  // A: 绘制左边半圆（逆时针）
  // L: 绘制底边
  // A: 绘制右边半圆（逆时针）
  // L: 绘制顶边回到起点
  // Z: 闭合路径
  return `path://M${r},0 A${r},${r} 0 0,0 ${r},${height} L${r + rectWidth},${height} A${r},${r} 0 0,0 ${r + rectWidth},0 Z`;
};

// 计算文字宽度，返回合适的节点宽度
const getNodeWidth = (text: string, fontSize: number = 12) => {
  // 中文字符约等于字体大小，英文约等于字体大小的0.6倍
  let width = 0;
  for (const char of text) {
    if (/[\u4e00-\u9fa5]/.test(char)) {
      width += fontSize;
    } else {
      width += fontSize * 0.6;
    }
  }
  return Math.max(width + 24, 60); // 最小宽度60，左右各留12px padding
};

// 将树形数据转换为 graph 需要的 nodes 和 links
const convertTreeToGraph = (treeData: any, containerWidth: number, containerHeight: number) => {
  const nodes: any[] = [];  // 存储所有节点
  const links: any[] = [];  // 存储所有连线
  
  const groups = treeData.children || [];
  const groupCount = groups.length;
  
  // 计算每个 group 需要的高度（基于其 strategy 数量）
  let totalStrategies = 0;
  groups.forEach((group: any) => {
    const strategyCount = group.children?.length || 1;
    totalStrategies += strategyCount;
  });
  
  // ==================== 自适应配置 ====================
  // 根据数据量调整字体大小
  const isLargeData = totalStrategies > 15 || groupCount > 5;
  const flowFontSize = isLargeData ? 12 : 14;
  const groupFontSize = isLargeData ? 10 : 12;
  const strategyFontSize = isLargeData ? 9 : 11;
  
  // 使用容器实际尺寸
  const chartWidth = containerWidth || 900;
  const chartHeight = containerHeight || 500;
  
  // 根据容器高度和数据量计算间距
  const availableHeight = chartHeight - 100;  // 留出上下边距
  const totalRows = totalStrategies + groupCount;  // 总行数
  const strategySpacingY = Math.max(25, Math.min(45, availableHeight / totalRows));  // 动态间距，25-45之间
  const groupPadding = Math.max(20, strategySpacingY * 0.8);  // group 之间的间距
  
  // 计算三列的 x 坐标（均匀分布）
  const strategyX = chartWidth * 0.15;   // 左侧 15%
  const groupX = chartWidth * 0.5;       // 中间 50%
  const flowX = chartWidth * 0.85;       // 右侧 85%
  
  // 计算根节点宽度
  const flowWidth = getNodeWidth(treeData.name, flowFontSize);
  const flowHeight = isLargeData ? 30 : 36;
  
  // ==================== 根节点（flow）配置 - 最右侧 ====================
  nodes.push({
    name: treeData.name,
    x: flowX,
    y: chartHeight / 2,
    symbol: getCapsulePath(flowWidth, flowHeight),
    symbolSize: [flowWidth, flowHeight],
    description: treeData.description,
    level: 'flow',
    itemStyle: { color: levelColors.flow },
    label: { show: true, fontSize: flowFontSize, fontWeight: 'bold', color: '#fff' }
  });
  
  // 计算每个 group 的起始 y 坐标
  let currentY = 50;
  
  groups.forEach((group: any) => {
    const strategies = group.children || [];
    const strategyCount = strategies.length || 1;
    
    // 计算当前 group 区域的高度
    const groupHeight = strategyCount * strategySpacingY;
    
    // group 节点的 y 坐标在其 strategy 区域的中心
    const groupY = currentY + groupHeight / 2;
    const groupWidth = getNodeWidth(group.name, groupFontSize);
    const groupNodeHeight = isLargeData ? 26 : 32;
    
    // ==================== 子节点（group）配置 - 中间 ====================
    nodes.push({
      name: group.name,
      x: groupX,
      y: groupY,
      symbol: getCapsulePath(groupWidth, groupNodeHeight),
      symbolSize: [groupWidth, groupNodeHeight],
      description: group.description,
      method: group.method,
      level: 'group',
      itemStyle: { color: levelColors.group },
      label: { show: true, fontSize: groupFontSize, color: '#fff' }
    });
    
    // ==================== group -> flow 连线配置 ====================
    links.push({
      source: group.name,
      target: treeData.name,
      label: {
        show: true,
        formatter: group.method || '',
        fontSize: isLargeData ? 9 : 11,
        color: '#333'
      },
      lineStyle: {
        type: 'dashed',
        width: 2,
        color: '#333',
        curveness: groupCount > 1 ? 0.1 : 0
      }
    });
    
    // 计算 strategy 节点的起始 y 坐标
    const strategyStartY = currentY;
    
    strategies.forEach((strategy: any, sIndex: number) => {
      const strategyY = strategyStartY + sIndex * strategySpacingY + strategySpacingY / 2;
      const nodeName = `${group.name}_${strategy.name}_${sIndex}`;
      const strategyWidth = getNodeWidth(strategy.name, strategyFontSize);
      const strategyNodeHeight = isLargeData ? 22 : 28;
      
      // ==================== 孙节点（strategy）配置 - 最左侧 ====================
      nodes.push({
        name: nodeName,
        displayName: strategy.name,
        x: strategyX,
        y: strategyY,
        symbol: getCapsulePath(strategyWidth, strategyNodeHeight),
        symbolSize: [strategyWidth, strategyNodeHeight],
        description: strategy.description,
        url: strategy.url,
        level: 'strategy',
        itemStyle: { color: levelColors.strategy },
        label: { 
          show: true, 
          fontSize: strategyFontSize,
          color: '#fff',
          formatter: strategy.name
        }
      });
      
      // ==================== strategy -> group 连线配置 ====================
      links.push({
        source: nodeName,
        target: group.name,
        lineStyle: {
          type: 'dashed',
          width: 1.5,
          color: '#333',
          curveness: 0
        }
      });
    });
    
    // 更新下一个 group 的起始 y 坐标
    currentY += groupHeight + groupPadding;
  });
  
  return { nodes, links };
};

// 获取树形数据
const fetchTreeData = async () => {
  try {
    const res = await reqTreeDataList({ flowName: props.flowName, id: props.id });
    if (res.success && res.data) {
      initChart(res.data);
    }
  } catch (error) {
    console.error('获取树形数据失败:', error);
  }
};

// 初始化图表
const initChart = (treeData: any) => {
  if (!chartRef.value) return;
  
  // 获取容器尺寸
  const containerWidth = chartContainer.value?.clientWidth || 900;
  const containerHeight = chartRef.value?.clientHeight || 500;
  
  chartInstance = echarts.init(chartRef.value);
  const { nodes, links } = convertTreeToGraph(treeData, containerWidth, containerHeight);
  
  const option = {
    // ==================== 提示框配置 ====================
    tooltip: {
      trigger: 'item',                              // 触发类型：数据项触发
      backgroundColor: 'rgba(255, 255, 255, 0.95)', // 提示框背景色
      borderColor: '#e4e7ed',                       // 提示框边框颜色
      borderWidth: 1,                               // 提示框边框宽度
      padding: [10, 15],                            // 提示框内边距 [上下, 左右]
      textStyle: { color: '#333' },                 // 提示框文字样式
      // 自定义提示框内容
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const { data } = params;
          const name = data.displayName || data.name;
          let html = `<div style="font-weight: bold; margin-bottom: 5px;">${name}</div>`;
          if (data.description) {
            html += `<div style="color: #666;">${data.description}</div>`;
          }
          if (data.url) {
            html += `<div style="color: #409eff; margin-top: 5px; font-size: 12px;">可点击操作</div>`;
          }
          return html;
        }
        return '';
      }
    },
    // ==================== 系列配置 ====================
    series: [
      // 关系图（节点和连线）
      {
        type: 'graph',                    // 图表类型：关系图
        layout: 'none',                   // 布局方式：不使用自动布局，使用节点的 x, y 坐标
        roam: true,                       // 是否开启鼠标缩放和平移漫游
        label: { show: true },            // 显示节点标签
        
        // ========== 边（连线）配置 ==========
        edgeSymbol: ['none', 'arrow'],    // 边两端的标记：[起点, 终点]，起点无标记，终点箭头
        edgeSymbolSize: [6, 12],          // 边两端标记的大小：[起点大小, 终点箭头大小]
        edgeLabel: { fontSize: 11 },      // 边上标签的字体大小
        
        // ========== 数据配置 ==========
        data: nodes,                      // 节点数据数组
        links: links,                     // 连线数据数组
        
        // ========== 连线样式 ==========
        lineStyle: {
          opacity: 0.9,                   // 线条透明度
          width: 2,                       // 线条宽度
          color: '#333',                  // 线条颜色
          type: [10, 10]                  // 虚线样式 [实线长度, 空白长度]，配合 CSS 动画
        },
        
        // ========== 高亮状态配置 ==========
        emphasis: {
          focus: 'adjacency',             // 高亮时聚焦方式：adjacency 表示高亮相邻节点和边
          lineStyle: { width: 3 }         // 高亮时线条宽度
        },
        
        // ========== 其他配置 ==========
        nodeScaleRatio: 0.6               // 节点缩放比例，用于增加节点与边的间距，避免箭头被遮挡
      }
    ]
  };
  
  chartInstance.setOption(option);
  
  // 节点点击事件 - 只有 strategy 级别可点击
  chartInstance.on('click', (params: any) => {
    console.log('点击事件:', params);
    if (params.dataType === 'node' && params.data.level === 'strategy') {
      // 先关闭之前的气泡，再打开新的
      popconfirmVisible.value = false;
      
      currentNodeData.value = params.data;
      
      // 获取点击位置，确保气泡在可视区域内
      const containerRect = chartContainer.value?.getBoundingClientRect();
      const offsetX = params.event?.event?.offsetX || params.event?.offsetX || 200;
      const offsetY = params.event?.event?.offsetY || params.event?.offsetY || 200;
      
      popconfirmPos.value = {
        x: Math.min(offsetX + 10, (containerRect?.width || 600) - 150),
        y: Math.max(offsetY - 80, 10)
      };
      
      // 延迟显示，避免被 closePopconfirm 立即关闭
      setTimeout(() => {
        popconfirmVisible.value = true;
      }, 10);
      
      emit('leafClick', params.data);
    } else {
      // 点击非 strategy 节点时关闭气泡
      popconfirmVisible.value = false;
    }
  });
};

// 预览
const handlePreview = () => {
  console.log('预览 URL:', currentNodeData.value?.url);
  popconfirmVisible.value = false;
};

// 下载
const handleDownload = () => {
  console.log('下载 URL:', currentNodeData.value?.url);
  popconfirmVisible.value = false;
};

// 点击其他地方关闭气泡
const closePopconfirm = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  // 点击气泡框内部不关闭
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
    });
  } else {
    chartInstance?.dispose();
    chartInstance = null;
    document.removeEventListener('click', closePopconfirm);
  }
});

// 同步关闭状态
watch(visible, (val) => {
  emit('update:modelValue', val);
});

onUnmounted(() => {
  chartInstance?.dispose();
  document.removeEventListener('click', closePopconfirm);
});
</script>

<style lang="scss" scoped>
.tree-container {
  position: relative;
  border: 1px solid ;
  background:#f5f7fa;
  border-radius: 5px;
}

.custom-popconfirm {
  position: absolute;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 12px;
  z-index: 999;
  min-width: 120px;
  max-width: 400px;
  
  .popconfirm-title {
    color: #606266;
    font-size: 13px;
    margin-bottom: 10px;
    word-break: break-all;
  }
  
  .popconfirm-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
