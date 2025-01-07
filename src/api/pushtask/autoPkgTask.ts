// 统一管理项目用户相关的接口
import request from "@/utils/request";
// 统一管理用户接口
enum API {
    PKGTASKLIST_URL = '/newbee/ce/pkgtask/list',  //查询接口 findjob
}

// 暴露接口
// 查询pushTask
export const reqPkgTaskUrl = (param: any) => request.get<any, any>(API.PKGTASKLIST_URL, { params: param })
// 保存接口
// export const reqSaveTask = (param: any) => request.post<any, any>(API.SAVETASK_URL, param,{ isForm: true })