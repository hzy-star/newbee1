// 统一管理项目用户相关的接口
import request  from "@/utils/request";
import type { userResponseData } from "./type";
// 统一管理用户接口
enum API{
    LOGIN_URL = '/newbee/useraccess',
    USERINFO_URL = '/user/info',
    GETCURRENTUSER_URL = '/newbee/user/get_current_user'
}

// 暴露接口
// 登录
export const reqLogin = (data:any) => request.get<any,string>(API.LOGIN_URL,{params:data})
// 获取用户信息
export const reqUserInfo = () => request.get<any,userResponseData>(API.USERINFO_URL)
// 获取用户信息(新)
export const reqGetUserInfo = () => request.get<any,any>(API.GETCURRENTUSER_URL)