// 关于layout组件相关配置
import { defineStore } from 'pinia'

const useLayOutSettingStore = defineStore('SettingStore', {
    state: () => {
        return{
            fold:false,//用户控制菜单是否折叠
            refsh:false,//控制按钮刷新页面
        }
    }
})


export default useLayOutSettingStore