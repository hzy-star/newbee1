// 统一管理项目用户相关的接口
import request from "@/utils/request";
import { paramsData } from "./type";
// 统一管理用户接口
enum API {
    COUNTDEVHOUR_URL = '/newbee/countdevhour',  //查询接口
    COUNTDEVHOURNODUP_URL = '/newbee/countdevhournodup',  //查询接口
}

// 暴露接口
// 查询pushTask
export const reqCountDevHour = (param: paramsData) => request.get<paramsData, any>(API.COUNTDEVHOUR_URL, { params: param })
export const reqCountDevHourNoDup = (param: paramsData) => request.get<paramsData, any>(API.COUNTDEVHOURNODUP_URL, { params: param })