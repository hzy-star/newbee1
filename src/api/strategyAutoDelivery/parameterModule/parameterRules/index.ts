import { engineRequest } from "@/utils/request";
import { dataType } from './type'
// 统一管理用户接口
enum API {
    // 
    CATEGORY_URL = '/api/functiontype/category',  //功能模块类别
    PAGELIST_URL = '/api/functiontype/page/list',  //功能模块列表分页查询
    CREATEORUPDATE_URL = '/api/functiontype/createOrUpdate',  //功能模块新增/修改
    CREATEORUPDATE2_URL = '/api/functiontype/createOrUpdateV2',  //功能模块新增/修改2
    
}
// 功能模块类别
export const reqCateGory = () => engineRequest.get<any,dataType>(API.CATEGORY_URL)
// 功能模块列表分页查询
export const reqPageList = (param: any) => engineRequest.post<any,dataType>(API.PAGELIST_URL,param);
// 功能模块新增/修改
export const reqCreateOrUpdate = (param: any) => engineRequest.post<any,dataType>(API.CREATEORUPDATE_URL,param);
// 功能模块新增/修改2
export const reqCreateOrUpdate2 = (param: any) => engineRequest.post<any,dataType>(API.CREATEORUPDATE2_URL,param,{ isMultipart: true });