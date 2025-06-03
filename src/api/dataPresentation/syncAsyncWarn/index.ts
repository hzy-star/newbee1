// 统一管理项目用户相关的接口
import request from "@/utils/request";
// 统一管理用户接口
enum API {
    CONVWARN_URL = '/newbee/bigdata/sendtype/convwarn',  //get方法
}

// 暴露接口
export const reqConvWarnUrl = (params: any) => request.get<any, any>(API.CONVWARN_URL, { params });