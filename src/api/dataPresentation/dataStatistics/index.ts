// 统一管理项目用户相关的接口
import request from "@/utils/request";
// import { paramsData } from "./type";
// 统一管理用户接口
enum API {
    SUMMARY_URL = '/newbee/bigdata/proxy/summary',  //get方法
}

// 暴露接口
export const reqSummaryUrl = (param: any) => request.post<any, any>(API.SUMMARY_URL, param )