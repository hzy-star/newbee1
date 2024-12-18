import type { RouteRecordRaw } from "vue-router"

// 定义用户仓库的state类型
export interface UserState {
    cookie: string,
    menuRoutes: RouteRecordRaw[],
    username: string,
    avatar: string,
    buttons: string[]
}