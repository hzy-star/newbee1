// 统一管理项目用户相关的接口
import request from "@/utils/request";
// 统一管理用户接口
enum API {
    RTADATA_URL = '/newbee/rta/count',  //查询接口 findjob
}

// 暴露接口
export const reqRtaData = (param: any) => request.post<any, any>(API.RTADATA_URL, param)
