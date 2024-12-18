<template>
  <div class="layout_content">
    <!-- 左侧菜单 -->
    <div
      class="layout_silder"
      :class="{ fold: layoutSettingStore.fold ? true : false }"
    >
      <Logo />
      <!-- 菜单 -->
      <el-scrollbar class="scrollbar">
        <el-menu
          :collapse="layoutSettingStore.fold ? true : false"
          :default-active="route.path"
          active-text-color="yellow"
          background-color="#324157"
          class="el-menu-vertical-demo"
          text-color="#bfcbd9"
        >
          <Menu :menuList="userStore.menuRoutes" />
        </el-menu>
      </el-scrollbar>
    </div>
    <!-- 顶部导航 -->
    <div
      class="layout_tabbar"
      :class="{ fold: layoutSettingStore.fold ? true : false }"
    >
      <Tabbar />
    </div>
    <!-- 内容展示 -->
    <div
      class="layout_main"
      :class="{ fold: layoutSettingStore.fold ? true : false }"
    >
      <Main />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import Logo from "./logo/index.vue";
import Menu from "./menu/index.vue";
import Tabbar from "./tabbar/index.vue";
import useUserStore from "@/store/modules/user";
// 右侧内容展示
import Main from "./main/index.vue";
import useLayOutSettingStore from "@/store/modules/setting";

const layoutSettingStore = useLayOutSettingStore();

const userStore = useUserStore();
const route = useRoute();
console.log(route.path);
</script>
<script lang="ts">
export default {
  name: "Layout",
};
</script>

<style scoped lang="scss">
.layout_content {
  width: 100%;
  height: 100vh;
  // background: red;
  .layout_silder {
    width: $base-menu-width;
    height: 100vh;
    background: $base-menu-background;
    color: white;
    transition: all 0.3s;
    .scrollbar {
      width: 100%;
      height: calc(100vh - $base-logo-height);
      .el-menu {
        border-right: none;
      }
    }

    &.fold {
      width: $base-menu-min-width;
    }
  }
  .layout_tabbar {
    position: fixed;
    width: calc(100% - #{$base-menu-width});
    height: $base-tabbar-height;
    // background: $base-tabbar-background;
    top: 0;
    left: $base-menu-width;
    transition: all 0.3s;
    border-bottom: 1px solid #e6e6e6;
    &.fold {
      width: calc(100vw - $base-menu-min-width);
      left: $base-menu-min-width;
    }
  }
  .layout_main {
    position: absolute;
    width: calc(100% - #{$base-menu-width});
    height: calc(100vh - #{$base-tabbar-height});
    top: $base-tabbar-height;
    left: $base-menu-width;
    padding: 20px;
    overflow: auto;
    transition: all 0.3s;
    &.fold {
      width: calc(100vw - $base-menu-min-width);
      left: $base-menu-min-width;
    }
  }
}
</style>
