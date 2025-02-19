// 统一管理项目用户相关的接口
import request from "@/utils/request";
import { saveKv , delKv} from './type'
// 统一管理用户接口
enum API {
    // DeviceDuplicateFilter
    LISTKV_URL = '/newbee/listkv',  //查询接口
    SAVEKV_URL = '/newbee/savekv',  //set接口
    DELKV_URL = '/newbee/delkv',  //del接口
}

// 暴露接口
// 查询
export const reqListKvUrl = () => request.get(API.LISTKV_URL)
// 保存
export const reqSaveKvUrl = (param: saveKv) => request.post<saveKv>(API.SAVEKV_URL,param,{ isForm: true })
// delete
export const reqDelKvUrl = (param: delKv) => request.post<delKv>(API.DELKV_URL,param,{ isForm: true })