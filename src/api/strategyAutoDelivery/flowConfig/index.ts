// FlowConfig
import request from "@/utils/request";
import { dataType } from './type'
// 统一管理用户接口
enum API {
    // FlowConfig
    GETFLOWLIST_URL = '/newbee/ce/strategyFlowConfig/list',  //获取FlowConfig 列表 
    GETFLOWID_URL = '/newbee/ce/strategyFlowConfig/get',  //获取某个FlowConfig
    CREATEORUPDATEFLOW_URL = '/newbee/ce/strategyFlowConfig/createOrUpdate',  // 创建或更新FlowConfig
    DELETEFLOW_URL = '/newbee/ce/strategyFlowConfig/delete',  // 删除FlowConfig
    
}

// FlowConfig接口
// 创建或更新FlowConfig
export const reqCreateOrUpdatFlowConfig = (param: any) => request.post<any,any>(API.CREATEORUPDATEFLOW_URL,param,{isForm: true})
// 查询 FlowConfig 列表
export const reqFlowConfig = () => request.get(API.GETFLOWLIST_URL)
// 查询某个 FlowConfig
export const reqFlowConfigId = (param: string) => request.get<any>(API.GETFLOWID_URL,{ params: param })
// 删除 FlowConfig
export const reqDeleteFlowConfig = (param: any) => request.get<any,dataType>(API.DELETEFLOW_URL,{ params: param })
