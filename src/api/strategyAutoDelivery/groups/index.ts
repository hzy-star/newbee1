// 策略接口
import request from "@/utils/request";
import { Groups,dataType} from './type'
// 统一管理用户接口
enum API {
    CREATEORUPDATE_URL = '/newbee/ce/strategyGroup/createOrUpdate',  //创建策略
    STRATEGYGROUPList_URL = '/newbee/ce/strategyGroup/list',  //获取所有group
    GETSTRATEGYGROUP_URL = '/newbee/ce/strategyGroup/getByIds',  //获取某个/多个group 传ids
    DELETESTRATEGYGROUP_URL = '/newbee/ce/strategyGroup/delete', //删除某个group     传id
    STRATEGYS_URL = '/newbee/ce/strategy/getByIds',  //根据IDs获取strategy列表
}

// 暴露接口
// 创建策略
export const reqCreateOrUpdate = (param: Groups) => request.post<any,dataType>(API.CREATEORUPDATE_URL,param,{isForm: true});
// 查询
export const reqStrategyGroupList = (param: any) => request.get(API.STRATEGYGROUPList_URL,{ params: param });
// 查询某个策略
export const reqStrategyGroup = (param: any,noloading?:boolean) => request.get<any>(API.GETSTRATEGYGROUP_URL,{ params: param ,noloading});
// 删除某个策略
export const reqDeleteStrategyGroup = (param: any) => request.get<any,dataType>(API.DELETESTRATEGYGROUP_URL, { params: param });
// 根据IDs获取策略列表
export const reqStrategys = (param: any) => request.get<any,dataType>(API.STRATEGYS_URL,{ params: param })

