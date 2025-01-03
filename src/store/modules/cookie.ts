// 关于layout组件相关配置
import { defineStore } from 'pinia'
import { localCache } from '@/utils/cache'
import { reqGetUserInfo } from '@/api/user'
const useCookie = defineStore('setCookie', {
    state: () => {
        return {
            cookie: localCache.getCache('cookie')?.value || '', // 存储cookie
            cookieExpireTime: localCache.getCache('cookie')?.timestamp || 0,
            username: '', // 存储用户名
            avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif', // 存储头像
        }
    },
    actions: {
        setCookie(cookie: string) {
            const cookieData = {
                value: cookie,
                timestamp: Date.now() // 存储当前时间戳
            }
            this.cookie = cookie
            this.cookieExpireTime = cookieData.timestamp
            localCache.setCache('cookie', cookieData)
        },
        getCookie() {
            const now = Date.now()
            const cookieAge = now - this.cookieExpireTime
            const hourInMs = 24 * 60 * 60 * 1000 // 24小时的毫秒数

            if (cookieAge > hourInMs) {
                // cookie已过期，清除
                this.clearCookie()
                return ''
            }
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