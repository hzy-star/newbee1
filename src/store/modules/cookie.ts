// 关于layout组件相关配置
import { defineStore } from 'pinia'
import { localCache } from '@/utils/cache'
const useCookie = defineStore('setCookie', {
    state: () => {
        return{
            cookie: localCache.getCache('cookie') || '', // 存储cookie
        }
    },
    actions: {
        setCookie(cookie: string) {
            this.cookie = cookie
            localCache.setCache('cookie', cookie)
        },
        getCookie() {
            return this.cookie
        },
        clearCookie() {
            this.cookie = ''
            localCache.removeCache('cookie')
        }
    }
})


export default useCookie