// 统一管理项目用户相关的接口
import request from "@/utils/request";
import { summaryData,MultOfferData } from "./type";
// 统一管理用户接口
enum API {
    SUMMARY_URL = '/newbee/ce/click/proxy/summary',  //查询接口
    MULTOFFER_URL = '/newbee/ce/click/detailMultOffer',  //查询接口
}

// 暴露接口
// 查询summary
export const reqSummaryUrl = (param: summaryData) => request.get<summaryData, any>(API.SUMMARY_URL, { params: param })
// 查询detailMultOffer
export const reqMultOfferUrl = (param: MultOfferData) => request.get<MultOfferData, any>(API.MULTOFFER_URL, { params: param })