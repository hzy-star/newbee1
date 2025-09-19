<template>
  <el-tabs v-model="activeTab" class="tabs">
    <!-- 策略 -->
    <el-tab-pane label="策略" name="tab1" class="tabs-1 paneTab">
        <StrategyPage />
    </el-tab-pane>
    <!-- 阈值 -->
    <el-tab-pane label="阈值管理" name="tab5" class="tabs-5 paneTab">
        <StrategythresholdPage />
    </el-tab-pane>
    <!-- 阈值配置 -->
    <el-tab-pane label="阈值配置" name="tab6" class="tabs-6 paneTab">
        <StrategythresholdConfigPage />
    </el-tab-pane>

    <!-- groups -->
    <el-tab-pane label="GROUP组" name="tab2" class="tabs-2 paneTab">
        <GroupsPage />
    </el-tab-pane>
    <!-- flow -->
    <el-tab-pane label="FLOW任务流" name="tab3" class="tabs-3 paneTab">
        <FlowPage />
    </el-tab-pane>
    <!-- config -->
    <el-tab-pane label="AB分流" name="tab4" class="tabs-4 paneTab">
        <FlowConfigPage />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import  StrategyPage  from '@/components/strategyAutoDelivery/strategyPage/index.vue';
import  GroupsPage  from '@/components/strategyAutoDelivery/groups/index.vue';
import  FlowPage  from '@/components/strategyAutoDelivery/flow/index.vue';
import  FlowConfigPage  from '@/components/strategyAutoDelivery/flowConfig/index.vue';
import  StrategythresholdPage  from '@/components/strategyAutoDelivery/threshold/index.vue';
import  StrategythresholdConfigPage  from '@/components/strategyAutoDelivery/thresholdConfig/index.vue';
const activeTab = ref('tab1')


</script>

<style scoped lang="scss">
.tabs {
  margin: 0;
  padding: 0;
  height: calc(100vh - #{$base-tabbar-height} - 10px); // 计算高度减去底部栏
  /* 各个标签页内容区域通用样式 */
  .paneTab {
    flex: 1; // 填充剩余空间
    padding: 0 20px; // 左右内边距
    background: #fff; // 白色背景
    overflow: auto; // 内容溢出时显示滚动条
  }
}

</style>