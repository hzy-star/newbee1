<template>
  <!-- 左侧图标 -->
  <el-icon style="margin-right: 10px; font-size: 25px" @click="changeIcon">
    <!-- <Fold></Fold> -->
     <component :is="LayOutSettingStore.fold ? 'Expand' : 'Fold'"></component>
  </el-icon>
  <!-- 面包屑 -->
  <el-breadcrumb separator-icon="ArrowRight">
    <!-- 面包屑动态展示路由与标题 -->
    <el-breadcrumb-item v-for="(item, index) in route.matched" :key="index" @click="handLer" v-show="item.meta.title" :to="item.path">
        <!-- 图标 -->
         <el-icon v-if="!item.meta.customIcon">
            <component :is="item.meta.icon"></component>
         </el-icon>
         <el-icon v-else class="custom-icon-wrapper">
            <svg-icon :name="item.meta.icon" width="1em" height="1em" />
         </el-icon>
        <!-- 标题 -->
      {{ item.meta.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import useLayOutSettingStore from "@/store/modules/setting"
const LayOutSettingStore = useLayOutSettingStore();

const changeIcon = () => {
    LayOutSettingStore.fold = !LayOutSettingStore.fold;
}
const route = useRoute();
const handLer = () => {
    console.log(route);
    
}
</script>

<script lang="ts">
export default {
  name: "Breadcrumb",
}
</script>

<style scoped lang="scss">
.custom-icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: tomato;
    :deep(div > svg) {
      margin: 0 !important;
    }
}
</style>
