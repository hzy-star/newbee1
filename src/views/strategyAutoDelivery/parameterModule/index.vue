<template>
  <div class="parameter-module">
    <!-- 路由组件出口的位置 -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <!-- 渲染参数模块的子路由 -->
        <div v-if="flag">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </div>
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import useLayOutSettingStore from '@/store/modules/setting'

const layoutOutSettingStore = useLayOutSettingStore()

// 控制当前组件是否销毁重建
let flag = ref(true)

// 监听仓库 refsh 是否发生变化
watch(
  () => layoutOutSettingStore.refsh,
  () => {
    flag.value = false
    nextTick(() => {
      flag.value = true
    })
  }
)
</script>

<script lang="ts">
export default {
  name: 'ParameterModule'
}
</script>

<style scoped lang="scss">
.parameter-module {
  height: 100%;
  width: 100%;
}

// 页面切换动画
.fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.fade-enter-active {
  transition: all 0.3s ease;
}
.fade-enter-to {
  opacity: 1;
  transform: scale(1);
}
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
