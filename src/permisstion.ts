// 路由权限
import router from "./router";
import setting from "./setting";
import NProgress from "nprogress"
// 引入进度条样式
import "nprogress/nprogress.css"
NProgress.configure({ showSpinner: false })
import pinia from "./store";
import useCookie from "./store/modules/cookie";
import { ElMessage } from 'element-plus';
const useCookies = useCookie(pinia)
// 全局前置守卫
router.beforeEach(async (to: any, from: any, next: any) => {
    debugger
    document.title = setting.title + '-' + to.meta.title
    NProgress.start()
    const cookie = useCookies.getCookie()
    const username = useCookies.username
    if (from.path == '') {
        next({ path: '/' })
    }
    // next()
    if (cookie) {
        if (to.path == '/login') {
            next({ path: '/' })
        } else {
            // next()
            // return
            // 登录成功访问其余路由
            if (username) {
                next()
            } else {
                try {
                    // 获取用户信息
                    await useCookies.getUserInfoNew()
                    next({ ...to })
                } catch (error) {
                    // 退出登录
                    useCookies.clearCookie()
                    next({ path: '/login', query: { redirect: to.path } })
                }
            }
        }
    } else {
        if (to.path == '/login') {
            next()
        } else {
            ElMessage.error('登录过期,请重新登录');
            next({ path: '/login', query: { redirect: to.path } })
        }
    }
})

// 全局后置守卫
router.afterEach(() => {

    NProgress.done()
})