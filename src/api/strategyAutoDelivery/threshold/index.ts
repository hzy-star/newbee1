// 阈值接口
import request from "@/utils/request";
import { createorupdate,dataType} from './type'
// 统一管理用户接口
enum API {
    // DeviceDuplicateFilter
    CREATEORUPDATE_URL = '/newbee/ce/strategyThreshold/createOrUpdate',  //创建阈值
    STRATEGYList_URL = '/newbee/ce/strategyThreshold/list',  //获取所有strategyThreshold
    STRATEGY_URL = '/newbee/ce/strategyThreshold',  //获取某个strategyThreshold
    DELETESTRATEGY_URL = '/newbee/ce/strategyThreshold/delete',  //删除某个strategyThreshold
    STRATEGYS_URL = '/newbee/ce/strategyThreshold/getByIds',  //根据IDs获取strategyThreshold列表
}

// 暴露接口
// 创建阈值
export const reqCreateOrUpdate = (param: createorupdate) => request.post<any,dataType>(API.CREATEORUPDATE_URL,param,{isForm: true})
// 查询
export const reqStrategyThresholdList = (param: any) => request.get(API.STRATEGYList_URL,{params:param})
// 查询某个阈值
export const reqStrategyThreshold = (param: string) => request.get<any>(API.STRATEGY_URL,{ params: param })
// 删除某个阈值
export const reqDeleteStrategyThreshold = (param: any) => request.get<any,dataType>(API.DELETESTRATEGY_URL,{ params: param })
// 根据IDs获取阈值列表
export const reqStrategysThreshold = (param: any,noloading?: boolean) => request.get<any,dataType>(API.STRATEGYS_URL,{ params: param ,noloading})