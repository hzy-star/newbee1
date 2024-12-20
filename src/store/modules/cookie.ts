// 关于layout组件相关配置
import { defineStore } from 'pinia'
import { localCache } from '@/utils/cache'
import { reqGetUserInfo } from '@/api/user'
const useCookie = defineStore('setCookie', {
    state: () => {
        return {
            cookie: localCache.getCache('cookie') || '', // 存储cookie
            username: '', // 存储用户名
            avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif', // 存储头像
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
            this.username = ''
            localCache.removeCache('cookie')
        },
        // 获取用户信息(新)
        async getUserInfoNew() {
            let res = await reqGetUserInfo()
            this.username = res
            return res
        },
    }
})


export default useCookie