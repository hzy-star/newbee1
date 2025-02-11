<template>
  <!-- 路由组件出口的位置 -->
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <!-- 渲染layout一级路由的子路由 -->
      <!-- <component :is="Component" v-if="flag" /> -->
      <div v-if="flag">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </div>
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import useLayOutSettingStore from "@/store/modules/setting";
import { ref, watch, nextTick } from "vue";
const layoutOutSettingStore = useLayOutSettingStore();
// 控制当前组件是否销毁重建
let flag = ref(true);
// 监听仓库refsh是否发生变化
watch(
  () => layoutOutSettingStore.refsh,
  () => {
    flag.value = false;
    nextTick(() => {
      flag.value = true;
    });
  }
);
</script>
<script lang="ts">
export default {
  name: "Main",
};
</script>

<style scoped lang="scss">
.fade-enter-from {
  opacity: 0;
  transform: scale(0);
}
.fade-enter-active {
  transition: all 0.5s;
}
.fade-enter-to {
  opacity: 1;
  transform: scale(1);
}
</style>
