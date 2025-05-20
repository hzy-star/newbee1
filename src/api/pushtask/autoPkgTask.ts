// 统一管理项目用户相关的接口
import request from "@/utils/request";
import { Root } from "./type";
// 统一管理用户接口
enum API {
    PKGTASKLIST_URL = '/newbee/ce/pkgtask/list',  //查询接口 findjob
    NEWSAVETASK_URL = '/newbee/ce/pkgtask/createOrUpdate', //保存/新增接口
    BATCHEDIT_URL = '/newbee/ce/pkgtask/batchedit', //批量保存接口
    ENABLEDORDISABLED_URL = '/newbee/ce/pkgtask/batchUpdate', //批量enabled/disabled接口,单独启用禁用接口
    TRYORRUN_URL = '/newbee/ce/pkgtask/trigger', //try/run接口
    HISTORY_URL = '/newbee/ce/pkgtaskrunner/history', //history查询接口
    PROXYTARGET_URL = '/newbee/ce/pkgtask/proxytarget', //proxytarget查询接口
}

// 暴露接口
// 查询pushTask
export const reqPkgTaskUrl = (param: any) => request.get<Root,any>(API.PKGTASKLIST_URL, { params: param })
// 保存/新增接口
export const reqNewSaveTask = (param: any) => request.post<any, any>(API.NEWSAVETASK_URL, param,{ isForm: true })
// 批量保存接口
export const reqBatchEdits = (param: any) => request.post<any, any>(API.BATCHEDIT_URL, param,{ isForm: true })
// 批量启用禁用接口
export const reqBatchEnabledOrDisabled = (param: any) => request.post<any, any>(API.ENABLEDORDISABLED_URL, param,{ isForm: true })
// try/run接口
export const reqTryOrRunUrl = (param: any) => request.get<Root,any>(API.TRYORRUN_URL, { params: param })
// history查询接口
export const reqHistoryUrl = (param: any) => request.get<Root,any>(API.HISTORY_URL, { params: param })
// proxytarget查询接口
export const reqProxyTargetUrl = () => request.post<any, any>(API.PROXYTARGET_URL,null,{ isForm: true })