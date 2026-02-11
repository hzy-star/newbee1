import { engineRequest } from "@/utils/request";
import { dataType } from './type'

// 
enum API {
    // ManualStrategy
    DETAIL_URL = '/api/strategyFlow/detail',  //
}

// 暴露接口
export const reqTreeDataList = (params: any) => engineRequest.get<any,dataType>(API.DETAIL_URL, { params });