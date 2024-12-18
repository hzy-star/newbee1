// 引入项目中的全局组件
import SvgIcon from './SvgIcon/index.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 全局对象
const allGlobalComponent = { SvgIcon } as any
// 对外暴露插件对象
export default {
  install(app:any) {
    // 注册项目全部的全局组件
    Object.keys(allGlobalComponent).forEach(key => {
        // 注册为全局组件
      app.component(key, allGlobalComponent[key])
    })
    // 注册element-plus图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }
  },
}
// 使用方法
// name = svg矢量图的名字  color = 颜色  width = 宽度  height = 高度
// <svg-icon name="example" color="red" width="20px" height="20px"></svg-icon>

