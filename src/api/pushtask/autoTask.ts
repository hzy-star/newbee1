// 统一管理项目用户相关的接口
import request from "@/utils/request";
import { Root,autoTaskEnabled } from "./type";
// 统一管理用户接口
enum API {
    PKGTASKLIST_URL = '/newbee/ce/tasks',  //查询接口 findjob
    NEWSAVETASK_URL = '/newbee/ce/createtask', //保存/新增接口
    BATCHEDIT_URL = '/newbee/ce/task/batchedit', //批量保存接口
    BATCHENABLED_URL = '/newbee/ce/enabletask', //批量enabled接口,单独启用接口
    DISBATCHENABLED_URL = '/newbee/ce/disabletask', //批量DISenabled接口,单独禁用接口
}

// 暴露接口
// 查询pushTask
export const reqAutoTaskUrl = (param: any) => request.get<Root,any>(API.PKGTASKLIST_URL, { params: param })
// 保存/新增接口
export const reqNewSaveTask = (param: any) => request.post<any, any>(API.NEWSAVETASK_URL, param,{ isForm: true })
// 批量保存接口
export const reqBatchEdits = (param: any) => request.post<any, any>(API.BATCHEDIT_URL, param,{ isForm: true })
// 单独/批量启用接口
export const reqBatchEnabled = (param: any) => request.get<autoTaskEnabled, any>(API.BATCHENABLED_URL, { params: param })
// 单独/批量禁用接口
export const reqDisBatchEnabled = (param: any) => request.get<autoTaskEnabled, any>(API.DISBATCHENABLED_URL, { params: param })
