// 统一管理项目用户相关的接口
import request from "@/utils/request";
import { paramsData,GroupData } from "./type";
// 统一管理用户接口
enum API {
    CEQUERYSERVERLIST_URL = '/newbee/cm/queryserverlist', //JobGroup数据
    COUNTTASKHOUR_URL = '/newbee/cm/counttaskhour',  //查询task实际量级接口
    COUNTGROUPHOUR_URL = '/newbee/cm/countgrouphour',  //环境预估量级
}

// 暴露接口
// 查询JobGroup
export const reqCeQueryGroup = () => request.get<GroupData,any>(API.CEQUERYSERVERLIST_URL)
// 查询task实际量级接口
export const reqCountTaskHour = (param: paramsData) => request.get<paramsData, any>(API.COUNTTASKHOUR_URL, { params: param })
// 查询环境预估量级
export const reqCountGtoupHour = (param: paramsData) => request.get<paramsData, any>(API.COUNTGROUPHOUR_URL, { params: param })