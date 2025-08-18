
// 统一管理项目用户相关的接口
import request from "@/utils/request";
import { paramsData,replaceData,addData} from "./type";
// 统一管理用户接口
enum API {
    THRESHOLDCONFIG = '/newbee/strategyThreshold/query',  //查询接口
    REPLACE_URL = '/newbee/strategyThreshold/replace',  //替换接口
    ADD_URL = '/newbee/strategyThreshold/add',  // 新增接口
    DELETE_URL = '/newbee/strategyThreshold/delete',  //删除接口
}

// 暴露接口
// 查询接口
export const reqThresholdConfigUrl = (param: paramsData) => request.post<paramsData, any>(API.THRESHOLDCONFIG, param )
// 替换接口
export const reqReplaceUrl = (param: replaceData) => request.post<replaceData, any>(API.REPLACE_URL, param )
// 新增接口
export const reqAddUrl = (param: addData) => request.post<addData, any>(API.ADD_URL, param )
// 删除接口
export const reqDeleteUrl = (param: paramsData) => request.post<paramsData, any>(API.DELETE_URL, param )