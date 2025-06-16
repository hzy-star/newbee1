// 统一管理项目用户相关的接口
import request from "@/utils/request";
import { queryListKv, saveKv, delKv } from "./type";
// 统一管理用户接口
enum API {
  // DeviceDuplicateFilter
  LISTKV_URL = "/newbee/kvconfig/list", //查询接口
  SAVEKV_URL = "/newbee/kvconfig/save", //新增和保存接口
  DELKV_URL = "/newbee/kvconfig/delete", //del接口
}

// 暴露接口
// 查询
export const reqListKvUrl = (param: queryListKv) =>
  request.post(API.LISTKV_URL, param);
// 保存
export const reqSaveKvUrl = (param: saveKv) =>
  request.post<saveKv,any>(API.SAVEKV_URL, param);
// delete
export const reqDelKvUrl = (param: delKv) =>
  request.post<delKv>(API.DELKV_URL, param,{isForm: true});
