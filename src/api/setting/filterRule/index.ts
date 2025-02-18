// 统一管理项目用户相关的接口
import request from "@/utils/request";
import {FilterForm,save} from './type'
// 统一管理用户接口
enum API {
    // DeviceDuplicateFilter
    IFAGET_URL = '/newbee/filterrule/ifa/get',  //查询接口
    IFASAVE_URL = '/newbee/filterrule/ifa/save',  //保存接口
    // AlgrithmAbTest
    ALGCONFIGGET_URL = '/newbee/filterrule/algconfig/get',  //查询接口
    ALGCONFIGSAVE_URL = '/newbee/filterrule/algconfig/save',  //保存接口
}

// 暴露接口
// 查询reqIfaGetUrl
export const reqIfaGetUrl = () => request.get(API.IFAGET_URL)
// 保存reqIfaSaveUrl
export const reqIfaSaveUrl = (param: FilterForm) => request.post<FilterForm>(API.IFASAVE_URL,param,{ isForm: true })

// AlgrithmAbTest
// 查询reqAlgconfigGetUrl
export const reqAlgconfigGetUrl = () => request.get(API.ALGCONFIGGET_URL)
// 保存
export const reqAlgconfigSaveUrl = (param: save) => request.post<save>(API.ALGCONFIGSAVE_URL,param,{ isForm: true })