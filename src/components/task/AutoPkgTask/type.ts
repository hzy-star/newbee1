// 定义接口类型
// interface AudienceItem {
//     id: number
//     name: string
// }
// 导出数据类型
export interface FormDataType {
  etype: string;
  pkgName: string;
  appId: string;
  country: string;
  os: string;
  status?: string;
  s: string;
  ds_adx: string;
  ds_bundle: string;
  urlparam: string;
  offers: string;
  target_pkg_name: string;
  buttonType?: string;
  bsclick: string;
  max: string;
  hour: string;
  startHour: string;
  deviceDays: string;
  proxyTarget: string;
  rtaName: string;
  top_lt_bundle: string; // 新增字段
  abtest_version: string; // 新增字段
}
// 定义history数据类型

export interface historyDataType {
  country: string;
  hitCount: number;
  queryCount: number;
  validCount: number;
  fetchOver: number;
  bsclick: number;
  hour: number;
  appId: string;
  pkgName: string;
  startTime: string;
  etype: string;
  currentFile: null | string;
  id: number;
  offers: string;
  pkgtaskId: number;
  os: string;
  max: number;
  succCount: number;
  filters: string;
  sendCount: number;
  urlparam: string;
  sendTime: null | string;
  resultDetail: null | string;
  endTime: string;
  status: number;
}