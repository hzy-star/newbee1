// 创建用户相关的模块
import { defineStore } from 'pinia'
import { reqLogin, reqUserInfo } from '@/api/user'
import { loginForm } from '@/api/user/type'
import type { UserState } from './types/types'
import { localCache } from '@/utils/cache'
import { constantRoutes, asnycRoute, anyRoute } from '@/router/routes'
import router from '@/router'
import useCookie from "./cookie"
const useCookieStore = useCookie()
// @ts-ignore
import cloneDeep from 'lodash/cloneDeep'

// 定义过滤用户展示的异步路由
function filterAsyncRoute(asnycRoute: any, routes: any) {
    return asnycRoute.filter((item: any) => {
        if (routes.includes(item.name)) {
            if (item.children && item.children.length > 0) {
                item.children = filterAsyncRoute(item.children, routes)
            }
            return true
        }
    })
}

let useUserStore = defineStore('user', {
    state: (): UserState => {
        return {
            // 定义数据
            cookie: localCache.getCache('cookie') || '',   // 用户的token
            menuRoutes: constantRoutes,  // 用户拥有的菜单权限
            username: '',
            avatar: '',
            buttons: [],// 用户拥有的按钮权限
        }
    },
    actions: {
        // 登录方法
        async userLogin(data: loginForm) {
            let res: string = await reqLogin(data)
            if (res == 'success') { // 登录成功
                if (document.cookie) {
                    useCookieStore.setCookie(document.cookie)
                }
                // 登录成功后跳转首页
                router.push({ path: '/' });
                return res
            } else {
                return Promise.reject(new Error(res))
            }

        },
        async getUserInfo() {
            // 获取用户信息
            let res = await reqUserInfo()
            if (res.code == 200) {
                this.username = res.data.checkUser.username
                this.avatar = res.data.checkUser.avatar
                this.buttons = res.data.checkUser.buttons
                // 计算当前用户需要展示的路由
                let userAsyncRoute = filterAsyncRoute(cloneDeep(asnycRoute), res.data.checkUser.routes) as any
                this.menuRoutes = [...constantRoutes, ...userAsyncRoute, anyRoute]
                // 目前路由管理器只有常量路由，计算完毕，需要动态追加异步路由、任意路由
                const userAsyncAndanyRoute = [...userAsyncRoute, anyRoute]
                userAsyncAndanyRoute.forEach((route: any) => {
                    router.addRoute(route)
                })

                return 'ok'
            } else {
                return Promise.reject('获取用户信息失败')
            }

        },
        // 退出登录
        async userLogout() {
            useCookieStore.clearCookie()

        }
    },
    getters: {
        // 定义计算属性
    },
    persist: true
})

export default useUserStore