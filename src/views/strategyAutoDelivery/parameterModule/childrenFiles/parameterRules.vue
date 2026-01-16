<!-- 参数规则模块 -->
<template>
  <div class="body-box">
    <el-tabs class="type-tabs" v-model="outerTab">
      <!-- 点击 -->
      <el-tab-pane label="点击" name="click"></el-tab-pane>
      <!-- 展示 -->
      <el-tab-pane label="展示" name="imp"></el-tab-pane>
      <!-- 全部 -->
      <el-tab-pane label="全部" name="all"></el-tab-pane>
    </el-tabs>
  </div>

</template>

<script setup lang="ts">
import { ref, computed ,watch} from 'vue'
const outerTab = ref<'click' | 'imp' | 'all'>('all') // 外层 tab：点击/展示/全部
// 引入 cookie store 获取用户角色
import useCookie from "@/store/modules/cookie";
const useCookies = useCookie()
const userRole = useCookies.userRole
const currentUserRole = ref(userRole); // 当前用户角色
// 判断是否为超级管理员 把这个变量传递给子组件使用
const isSuperAdmin = computed(() => currentUserRole.value === 'superAdmin');

</script>

<style scoped lang="scss">
.body-box {
  height: calc(100vh - #{$base-tabbar-height} - 10px); // 计算高度减去底部栏
  padding: 10px 0 0 0; // 上内边距10px

  .type-tabs {
    height: 40px;
    :deep(.el-tabs__header) {
      padding: 0 5px;
      // margin: 0;              // 不额外占高度，只左右加一点内边距
      border-bottom: 1px solid #ebeef5;
    }
    :deep(.el-tabs__item) {
      /* 用 el 默认高度即可，不强制写 height，避免影响你原来的布局 */
      padding: 0 16px;
      font-size: 14px;
    }
    :deep(.el-tabs__item.is-active) {
      font-weight: 500;
    }
  }

}
</style>