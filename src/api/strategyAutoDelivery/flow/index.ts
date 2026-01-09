// flow and groups页面接口
import request from "@/utils/request";
import { dataType } from './type'
import { engineRequest } from "@/utils/request";
// 统一管理用户接口
enum API {
    // flow
    GETFLOWLIST_URL = '/newbee/ce/strategyFlow/list',  //获取flow 列表 
    GETFLOWID_URL = '/newbee/ce/strategyFlow/get',  //获取某个flow
    CREATEORUPDATEFLOW_URL = '/newbee/ce/strategyFlow/createOrUpdate',  // 创建或更新flow
    DELETEFLOW_URL = '/newbee/ce/strategyFlow/delete',  // 删除flow
    GETFLOWIDS_URL = '/newbee/ce/strategyFlow/getByIds',  // 根据IDs获取flow列表
    CHECKFLOW_URL = '/api/strategyFlow/checkFlow', //校验flow名称是否重复
    
}

// flow接口
// 创建或更新flow
export const reqCreateOrUpdatFlow = (param: any) => request.post<any,any>(API.CREATEORUPDATEFLOW_URL,param,{isForm: true})
// 查询 flow 列表
export const reqFlow = (param?:any,noloading?: boolean) => request.get(API.GETFLOWLIST_URL,{params: param,noloading:noloading})
// 查询某个 flow
export const reqFlowId = (param: string) => request.get<any>(API.GETFLOWID_URL,{ params: param })
// 删除 flow
export const reqDeleteFlow = (param: any) => request.get<any,dataType>(API.DELETEFLOW_URL,{ params: param })
// 根据IDs获取 flow 列表
export const reqFlowIds = (param: any) => request.get<any>(API.GETFLOWIDS_URL,{ params: param })
// 校验flow名称是否重复
export const reqCheckFlow = (param: any) => engineRequest.post<any,dataType>(API.CHECKFLOW_URL,param,{isForm: true});