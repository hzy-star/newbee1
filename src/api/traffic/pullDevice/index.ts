
// 统一管理项目用户相关的接口
import request from "@/utils/request";
import { paramsData } from "./type";
// 统一管理用户接口
enum API {
    PULLDEVICEQUERY_URL = '/newbee/pullDevice/query',  //查询接口
}

// 暴露接口
// 查询reqPullDeviceUrl
export const reqPullDeviceUrl = (param: paramsData) => request.post<paramsData, any>(API.PULLDEVICEQUERY_URL, param )