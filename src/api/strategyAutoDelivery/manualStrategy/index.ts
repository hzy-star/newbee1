import { engineRequest } from "@/utils/request";

// 统一管理用户接口2. 策略页签(Engine)
enum API {
    // ManualStrategy
    STRATEGYList_URL = '/api/strategy/page/list',  //2.1 列表分页查询
    RETURNTYPE_TYPE = '/api/strategy/returntype', //2.2 策略returntype信息获取
    CREATEOFUPDATE_URL = '/api/strategy/createOrUpdateV2', //2.3 策略新增修改
    DEVICECOUNT_URL = '/api/strategy/devicecount' //2.4 策略对应的设备个数（预估个数）
}

// 暴露接口
// 2.1 列表分页查询
export const reqManualStrategyList = (param: any) => engineRequest.post<any>(API.STRATEGYList_URL, param);
// 2.2 策略returntype信息获取
export const reqReturnTypeType = () => engineRequest.get<any>(API.RETURNTYPE_TYPE);
// 2.3 策略新增修改
export const reqCreateOrUpdate = (param: any) => engineRequest.post<any>(API.CREATEOFUPDATE_URL, param,{ isMultipart: true });
// 2.4 策略对应的设备个数（预估个数） GET
export const reqDeviceCount = (params: any) => engineRequest.get<any>(API.DEVICECOUNT_URL, { params });