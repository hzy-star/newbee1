// 策略接口
import request from "@/utils/request";
import { createorupdate,dataType} from './type'
// 统一管理用户接口
enum API {
    // DeviceDuplicateFilter
    CREATEORUPDATE_URL = '/newbee/ce/strategy/createOrUpdate',  //创建策略
    STRATEGYList_URL = '/newbee/ce/strategy/list',  //获取所有strategy
    STRATEGY_URL = '/newbee/ce/strategy',  //获取某个strategy
    DELETESTRATEGY_URL = '/newbee/ce/strategy/delete',  //删除某个strategy
    STRATEGYS_URL = '/newbee/ce/strategy/getByIds',  //根据IDs获取strategy列表
}

// 暴露接口
// 创建策略
export const reqCreateOrUpdate = (param: createorupdate) => request.post<any,dataType>(API.CREATEORUPDATE_URL,param,{isForm: true})
// 查询
export const reqStrategyList = () => request.get(API.STRATEGYList_URL)
// 查询某个策略
export const reqStrategy = (param: string) => request.get<any>(API.STRATEGY_URL,{ params: param })
// 删除某个策略
export const reqDeleteStrategy = (param: any) => request.get<any,dataType>(API.DELETESTRATEGY_URL,{ params: param })
// 根据IDs获取策略列表
export const reqStrategys = (param: any) => request.get<any,dataType>(API.STRATEGYS_URL,{ params: param })