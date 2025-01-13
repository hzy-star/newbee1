interface data {
    offers: string
    ds_adx: string
    country: string
    ds_bundle: string
    os: string
    deviceDays: number
    max: number
    created: number
    filters: string
    urlparam: string
    bsclick: number
    target_pkg_name: string
    s: string
    hour: number
    startHour: string
    appId: string
    pkgName: string
    etype: string
    id: number
    updated: number
    status: string
  }
// 定义接口类型
export interface Response {
  data: data;
  message: string;
  success: boolean;
}
