// flow and groups页面接口
import request from "@/utils/request";
import { createorupdateFlow, createorupdateGroup } from './type'
// 统一管理用户接口
enum API {
    // flow
    GETFLOWLIST_URL = '/newbee/ce/strategyFlow/list',  //获取flow 列表 
    GETFLOWID_URL = '/newbee/ce/strategyFlow/get',  //获取某个flow
    CREATEORUPDATEFLOW_URL = '/newbee/ce/strategyFlow/createOrUpdate',  // 创建或更新flow
    DELETEFLOW_URL = '/newbee/ce/strategyFlow/delete',  // 删除flow
    GETFLOWIDS_URL = '/newbee/ce/strategyFlow/getByIds',  // 根据IDs获取flow列表
    // groups
    GETGROUPSLIST_URL = '/newbee/ce/strategyGroup/list',  //获取Group列表 
    GETGROUPID_URL = '/newbee/ce/strategyGroup/get',  //获取某个Group
    CREATEORUPDATEGROUP_URL = '/newbee/ce/strategyGroup/createOrUpdate',  // 创建或更新Group
    DELETEGROUP_URL = '/newbee/ce/strategyGroup/delete',  // 删除Group
    GETGROUPIDS_URL = '/newbee/ce/strategyGroup/getByIds',  // 根据IDs获取Group列表
    
}

// flow接口
// 创建或更新flow
export const reqCreateOrUpdatFlow = (param: any) => request.post<any>(API.CREATEORUPDATEFLOW_URL,param,{isForm: true})
// 查询 flow 列表
export const reqFlow = () => request.get(API.GETFLOWLIST_URL)
// 查询某个 flow
export const reqFlowId = (param: string) => request.get<any>(API.GETFLOWID_URL,{ params: param })
// 删除 flow
export const reqDeleteFlow = (param: any) => request.get<any>(API.DELETEFLOW_URL,{ params: param })
// 根据IDs获取 flow 列表
export const reqFlowIds = (param: any) => request.get<any>(API.GETFLOWIDS_URL,{ params: param })
// --------------分割线-------------------
// groups接口
// 创建或更新Group
export const reqCreateOrUpdateGroup = (param: any) => request.post<any>(API.CREATEORUPDATEGROUP_URL,param,{isForm: true})
// 查询 groups 列表
export const reqGroups = () => request.get(API.GETGROUPSLIST_URL)
// 查询某个 groups
export const reqGroupId = (param: string) => request.get<any>(API.GETGROUPID_URL,{ params: param })
// 删除 groups
export const reqDeleteGroup = (param: any) => request.get<any>(API.DELETEGROUP_URL,{ params: param })
// 根据IDs获取 groups 列表
export const reqGroupsIds = (param: any) => request.get<any>(API.GETGROUPIDS_URL,{ params: param })
