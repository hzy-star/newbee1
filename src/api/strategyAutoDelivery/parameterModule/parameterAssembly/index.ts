import { engineRequest } from "@/utils/request";
import { dataType } from './type'
// 统一管理用户接口
enum API {
    // 
    CATEGORY_URL = '/api/functiontype/category',  //功能模块类别
    PAGELIST_URL = '/api/functionab/page/list',  //AB分流配置列表分页查询
    CREATEORUPDATE_URL = '/api/functionab/createOrUpdate',  //AB分流配置新增/编辑
    OPTIONS_URL = '/api/functiontype/options' //功能模块下拉查询
    
}
// 功能模块类别
export const reqCateGory = () => engineRequest.get<any,dataType>(API.CATEGORY_URL)
// AB分流配置列表分页查询
export const reqPageList = (param: any) => engineRequest.post<any,dataType>(API.PAGELIST_URL,param);
// AB分流配置新增/编辑
export const reqCreateOrUpdate = (param: any) => engineRequest.post<any,dataType>(API.CREATEORUPDATE_URL,param);
// 功能模块下拉查询
export const reqOptions = (param: any) => engineRequest.post<any,dataType>(API.OPTIONS_URL,param);