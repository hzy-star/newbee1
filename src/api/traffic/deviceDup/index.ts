// 统一管理项目用户相关的接口
import request from "@/utils/request";
import { paramsData } from "./type";
// 统一管理用户接口
enum API {
    ADXIFADUP_URL = '/newbee/filterrule/adxIfaDup/get',  //查询接口
}

// 暴露接口
// 查询pushTask
export const reqAdxIfaDupUrl = (param: paramsData) => request.get<paramsData, any>(API.ADXIFADUP_URL, { params: param })