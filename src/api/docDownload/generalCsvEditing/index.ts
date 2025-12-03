// 统一管理项目用户相关的接口
import request from "@/utils/request";
// import { paramsData } from "./type";
// 统一管理用户接口
enum API {
    CSVEDITHEADER_URL = '/newbee/csvedit/header',  // 1.1 获取CSV文件表头
    CSVEDITQUERY_URL = '/newbee/csvedit/query',  //1.2 CSV文件内容搜索
    CSVEDITQUERYSIMPLIFY_URL = '/newbee/csvedit/querysimplify',  // 1.3 CSV文件内容搜索简化版
    CSVEDITADD_URL = '/newbee/csvedit/add',  // 1.4 CSV文件内容新增
    CSVEDITREPLACE_URL = '/newbee/csvedit/replace',  //1.5 CSV文件内容替换
    CSVEDITDELETE_URL = '/newbee/csvedit/delete',  //1.6 CSV文件内容删除
}

// 暴露接口
// 获取CSV文件表头
export const reqCsvEditHeaderUrl = (param: any) => request.get<any, any>(API.CSVEDITHEADER_URL, {params: param})
// CSV文件内容搜索
export const reqCsvEditQueryUrl = (param: any) => request.post<any, any>(API.CSVEDITQUERY_URL, param)
// CSV文件内容搜索简化版
export const reqCsvEditQuerySimplifyUrl = (param: any) => request.post<any, any>(API.CSVEDITQUERYSIMPLIFY_URL, param)
// CSV文件内容新增
export const reqCsvEditAddUrl = (param: any) => request.post<any, any>(API.CSVEDITADD_URL, param)
// CSV文件内容替换
export const reqCsvEditReplaceUrl = (param: any) => request.post<any, any>(API.CSVEDITREPLACE_URL, param)
// CSV文件内容删除
export const reqCsvEditDeleteUrl = (param: any) => request.post<any, any>(API.CSVEDITDELETE_URL, param)