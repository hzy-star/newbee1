<template>
  <el-button
    size="small"
    icon="Refresh"
    circle
    @click="updateRefsh"
  ></el-button>
  <el-button
    size="small"
    icon="FullScreen"
    circle
    @click="fullScreen"
  ></el-button>

  <el-popover placement="bottom" title="主题设置" :width="300" trigger="hover">
    <!-- 表单元素 -->
    <el-form>
      <el-form-item label="主题颜色">
        <el-color-picker
          @change="setColor"
          v-model="color"
          size="small"
          show-alpha
          :predefine="predefineColors"
          :teleported="false"
        />
      </el-form-item>
      <el-form-item label="暗黑模式">
        <el-switch
          @change="changeDark"
          v-model="dark"
          class="mt-2"
          style="margin-left: 24px"
          inline-prompt
          active-icon="MoonNight"
          inactive-icon="Sunny"
        />
      </el-form-item>
    </el-form>
    <template #reference>
      <el-button size="small" icon="Setting" circle></el-button>
    </template>
  </el-popover>
  <img
    :src="cookieStore.avatar"
    style="width: 24px; height: 24px; margin: 0px 10px; border-radius: 50%"
  />
  
  <!-- 下拉菜单 -->
  <el-dropdown>
    <span class="el-dropdown-link">
      {{ cookieStore.username }}
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import listTaskCr from "@/store/common/listTaskCr"
//获取用户相关的小仓库
import useUserStore from '@/store/modules/user'
// 获取用户信息(新)
import useCookie from '@/store/modules/cookie'
//获取骨架的小仓库
import useLayOutSettingStore from '@/store/modules/setting'
import { VxeUI } from 'vxe-table'
let layoutSettingStore = useLayOutSettingStore()
const cookieStore = useCookie()
let userStore = useUserStore()
//获取路由器对象
let $router = useRouter()
//获取路由对向
let $route = useRoute()
//收集开关的数据
let dark = ref<boolean>(false)
//刷新按钮点击回调
// 刷新页面的时候，重新获取cr数据
const getTaskCr = listTaskCr()
const updateRefsh = async () => {
  layoutSettingStore.refsh = !layoutSettingStore.refsh
  await getTaskCr.setTaskCr(); // 重新加载数据
}
//全屏按钮点击的回调
const fullScreen = () => {
  //DOM对象的一个属性:可以用来判断当前是不是全屏模式[全屏:true,不是全屏:false]
  let full = document.fullscreenElement
  //切换为全屏模式
  if (!full) {
    //文档根节点的方法requestFullscreen,实现全屏模式
    document.documentElement.requestFullscreen()
  } else {
    //变为不是全屏模式->退出全屏模式
    document.exitFullscreen()
  }
}
//退出登录点击回调
const logout = async () => {
  //需要向服务器发请求[退出登录接口]******
  //仓库当中关于用于相关的数据清空[token|username|avatar]
  //跳转到登录页面
  await userStore.userLogout()
  //跳转到登录页面
  $router.push({ path: '/login', query: { redirect: $route.path } })
}

//颜色组件组件的数据
const color = ref('rgba(255, 69, 0, 0.68)')
const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsva(120, 40, 94, 0.5)',
  'hsl(181, 100%, 37%)',
  'hsla(209, 100%, 56%, 0.73)',
  '#c7158577',
])

//switch开关的chang事件进行暗黑模式的切换
const changeDark = () => {
  //获取HTML根节点
  let html = document.documentElement
  //判断HTML标签是否有类名dark
  dark.value ? (html.className = 'dark') : (html.className = '')
  dark.value ? VxeUI.setTheme('dark') : VxeUI.setTheme('light')
}

//主题颜色的设置
const setColor = () => {
  //通知js修改根节点的样式对象的属性与属性值
  const html = document.documentElement
  html.style.setProperty('--el-color-primary', color.value)
  // 设置不同的主题颜色
  html.style.setProperty('--el-color-primary', color.value); // 修改主色
  html.style.setProperty('--el-color-success', color.value); // 修改成功色
  html.style.setProperty('--el-color-warning', color.value); // 修改警告色
  html.style.setProperty('--el-color-danger', color.value); // 修改危险色
  html.style.setProperty('--el-color-info', color.value); // 修改信息色
}
</script>

<script lang="ts">
export default {
  name: 'Setting',
}
</script>
<style scoped>
.el-dropdown-link{
  /* color: #fff; */
  font-size: larger;
  font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  /* margin: 0px 10px; */
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>
