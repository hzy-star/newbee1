// 统一管理接口
import request from "@/utils/request";
// import { paramsData,GroupData } from "./type";
//接口
enum API {
  STATISTIC_URL = "/newbee/bigdata/traffic/statistic", //查询接口
}

// 暴露接口
export const reqStatistic = (param:any) => request.post<any, any>(API.STATISTIC_URL,param);
