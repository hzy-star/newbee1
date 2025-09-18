// 统一管理项目用户相关的接口
import request from "@/utils/request";
// 统一管理用户接口
enum API {
    ADVTRAFFICSPLIT_URL = '/newbee/advtrafficsplit/query',  //查询接口
    ADVTRAFFICSAVEORNEW_URL = '/newbee/advtrafficsplit/save' //新增或修改接口
}


// 暴露接口
export const reqAdvTrafficSplitUrl = (param: any) => request.post(API.ADVTRAFFICSPLIT_URL,param,{ isForm: true })
export const reqAdvSaveOrNewUrl = (param: any) => request.post(API.ADVTRAFFICSAVEORNEW_URL,param)