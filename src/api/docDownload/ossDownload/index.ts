// 统一管理项目用户相关的接口
import request from "@/utils/request";
// import { paramsData } from "./type";
// 统一管理用户接口
enum API {
    LISTBYKVGROUP_URL = '/newbee/kvconfig/list',  //get方法   kvgroup 请求参数固定为ossdir
    DOWNLOAD_URL = '/newbee/oss/download',  //download 请求参数 objectName 就是之前的v值
}

// 暴露接口
// listbykvgroup
export const reqlistByKvGroup = (param: any) => request.post<any, any>(API.LISTBYKVGROUP_URL, param)
// download
export const reqDownloadUrl = (param: any) => request.get<any, any>(API.DOWNLOAD_URL, { params: param, responseType: 'blob' })