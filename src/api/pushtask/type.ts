


// 定义参数类型
export interface propFormInter {
    etypes: string,
    offerIds: string,
    pkgNames: string,
    appIds: string,
    countries: string,
    taskIds: string,
    bsclick: string,
    status: string,
    taskdate?: string,
    filtercontent: string,
    passcode?:string,
    name?:string,
}


// 定义autoPkgTask参数类型
export interface autoPkgFormInter {
    etype: string,
    offerid: string,
    pkgname: string,
    appid: string,
    country: string,
    jobid: string,
    bsclick: string,
    ce_pkg_filtercontent: string,
    ce_pkg_status: string,
    passcode?:string,
    name?:string,
    status?:string
}