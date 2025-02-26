// 统一管理项目用户相关的接口
import request from "@/utils/request";
import { params ,RowVO} from './type'
// 统一管理用户接口
enum API {
    // DeviceDuplicateFilter
    GETUSERACCESS_URL = '/newbee/user/get_user_access',  //查询接口
    SETUSERACCESS_URL = '/newbee/user/set_user_access',  //保存接口
}

// 暴露接口
// 查询
export const reqGetUserAccess = () => request.get<any,RowVO>(API.GETUSERACCESS_URL)
// 保存
export const reqSetUserAccess = (param: params) => request.post<params>(API.SETUSERACCESS_URL,param,{ isForm: true })