// 接口
import { engineRequest } from '@/utils/request';

// 接口和参数，分页查询：
// GET    "/api/offer/list"    参数：
//     String pkg, Integer appId,
//                             String status,  String offerId ,
//                                   int page, int limit

// 统一管理用户接口
enum API {
    // offer查询
    LIST_URL = '/api/offer/list',
}

// offer分页查询
export const reqList = (params: any) => engineRequest.get<any>(API.LIST_URL, { params })
