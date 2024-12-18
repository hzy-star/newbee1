import { createApp } from 'vue'
import App from '@/App.vue'
// 引入element-plus插件与样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入element-plus的中文语言包
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'virtual:svg-icons-register';
import gloablComponent from '@/components/index'; // 引入组件
import '@/styles/index.scss'
import 'element-plus/theme-chalk/dark/css-vars.css'
import VxeUI from 'vxe-pc-ui'
import 'vxe-pc-ui/lib/style.css'
import VxeUITable from 'vxe-table'
import 'vxe-table/lib/style.css'


// 引入路由
import router from '@/router'
// 引入pinia
import pinia from "@/store"
// 获取应用的根节点
const app = createApp(App)
// 注册全局组件
app.use(gloablComponent)
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(pinia)
app.use(router)
app.use(VxeUI)
app.use(VxeUITable)
import './permisstion'
//引入自定义指令文件
import { isHasButton } from '@/directive/has'
isHasButton(app)
app.mount('#app')
