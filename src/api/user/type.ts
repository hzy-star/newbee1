// 登录接口需要携带的参数ts类型
export interface loginForm {
    name: string,
    password: string
}

interface userInfo {
    userId: number,
    avatar: string,
    username: string,
    password: string,
    desc: string,
    roles: string[],
    buttons: string[],
    routes: string[],
    token: string,
}
interface user {
    checkUser:userInfo
}
// 定义服务器返回用户信息的类型
export interface userResponseData {
    code: number,
    data: user
}