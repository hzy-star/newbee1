
// 定义接口类型
// interface AudienceItem {
//     id: number
//     name: string
// }
// 导出数据类型
export interface  FormDataType {
    etype: string;
    offers: string;
    pkgName: string;
    appId: string;
    affId: string;
    country: string;
    os: string;
    usealg: string;
    bsclick: string;
    weight: string;
    gt: string;
    lt: string;
    ifadupcheck: string;
    checkservice: string;
    sendPlan: string;
    autoCrFilterName: string[];
    autoCrFilterVal: string;
    autoCrClickMin: string;
    autoCr: boolean;
    bundleSizeFilter: string;
    sevenDaysClickFilter: boolean;
    invalidIfaFilter: boolean;
    invalidIfa: string;
    nearGateway: string;
    clickRetry: string;
    randomClick: string;
    abTestVersion: string;
    topLtBundle: string;
    autoTopBundle: string[];
    autoTestVersion: string;
    base64Info: string;
    filter: string;
    urlparams: string;
    clickTimeDelay: string;
    eraseifa: boolean;
    noipuadup: boolean;
    taskStatus: string;
    buttonType?: string;
    proxyType: string;
};