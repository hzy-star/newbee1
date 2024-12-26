// 统一管理项目用户相关的接口
import request  from "@/utils/request";
// 统一管理用户接口
enum API{
    LIST_URL = '/newbee/list',
    LISTONGGOING_URL = '/newbee/listongoing',
    LISTTASKCR_URL = '/newbee/listTaskCr',
    GETBUNDLEKEY_URL = '/newbee/getAutoTopBundleKeyNames',
    AUDIENCELIST_URL = '/newbee/audience/list',
    TASKGET_URL = '/newbee/task/get',
    SAVETASK_URL = '/newbee/savetask',// show保存接口
    BATCHSAVETASKS_URL = '/newbee/batchSaveTasks',// 多选保存接口

}

// 暴露接口
// 查询pushTask
export const reqlistUrl = (param:any) => request.get<any,any>(API.LIST_URL,{params:param})
// 查询listongoing
export const reqOngoing = (param:any) => request.get<any,any>(API.LISTONGGOING_URL,{params:param})
// 查询listTaskCr
export const reqListTaskCr = () => request.get<any,any>(API.LISTTASKCR_URL)
// 查询getAutoTopBundleKeyNames
export const reqGetBundleKey = () => request.get<any,any>(API.GETBUNDLEKEY_URL)
// 查询audience
export const reqAudienceList = () => request.get<any,any>(API.AUDIENCELIST_URL)
// 通过id查询task
export const reqTaskget = (param:any) => request.get<any,any>(API.TASKGET_URL,{params:param})
// 保存接口
export const reqSaveTask = (param:any) => request.post<any,any>(API.SAVETASK_URL,param)
// 多选保存接口
export const reqBatchSaveTasks = (param:any) => request.post<any,any>(API.BATCHSAVETASKS_URL,param)