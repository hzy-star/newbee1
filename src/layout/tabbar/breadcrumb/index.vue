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
         <el-icon>
            <component :is="item.meta.icon"></component>
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