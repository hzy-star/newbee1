// 统一管理项目用户相关的接口
import request from "@/utils/request";
import { paramsData } from "./type";
// 统一管理用户接口
enum API {
    COUNTTASKHOUR_URL = '/newbee/counttaskhour',  //查询接口
}

// 暴露接口
// 查询pushTask
export const reqCountTaskHour = (param: paramsData) => request.get<paramsData, any>(API.COUNTTASKHOUR_URL, { params: param })