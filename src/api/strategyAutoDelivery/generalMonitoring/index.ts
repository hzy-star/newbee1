// 
import { engineRequest } from "@/utils/request";
// 
enum API {
    PKGNAMEMATCHCOUNTRY_URL = '/api/abmonitoring/pkgandcountry', //  查询pkg和pkg对应的国家数据
    DATALIST_URL = '/api/abmonitoring/list', //  查询监控数据
}

// 暴露接口
//   
export const reqPkgMatchCountry = (param:any) => engineRequest.get<any,any>(API.PKGNAMEMATCHCOUNTRY_URL,{ params: param });

export const reqDataList = (param:any) => engineRequest.get<any,any>(API.DATALIST_URL,{ params: param });

