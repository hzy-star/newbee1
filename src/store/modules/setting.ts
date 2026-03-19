// 关于layout组件相关配置
import { defineStore } from 'pinia'

const useLayOutSettingStore = defineStore('SettingStore', {
    state: () => {
        return{
            fold:false,//用户控制菜单是否折叠
            refsh:false,//控制按钮刷新页面
            menuLang: 'zh' as 'zh' | 'en',//菜单语言：zh中文 en英文
            dark: false,//暗黑模式
        }
    },
    persist: {
        pick: ['menuLang', 'dark'],//持久化菜单语言和暗黑模式
    },
})


export default useLayOutSettingStore