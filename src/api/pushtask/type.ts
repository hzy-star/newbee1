// 定义参数类型
export interface propFormInter {
  etypes: string;
  offerIds: string;
  pkgNames: string;
  appIds: string;
  countries: string;
  taskIds: string;
  bsclick: string;
  status: string;
  taskdate?: string;
  passcode?: string;
  name?: string;
}

// 定义autoPkgTask参数类型
export interface autoPkgFormInter {
  etype: string;
  offerid: string;
  pkgname: string;
  appid: string;
  country: string;
  jobid: string;
  bsclick: string;
  ce_pkg_status: string;
  passcode?: string;
  name?: string;
  status?: string;
}

// 定义autoTask参数类型
export interface autoTaskFormInter {
  etypes: string;
  offerIds: string;
  pkgNames: string;
  apps: string;
  countries: string;
  ce_filtercontent?: string;
  status: string;
  passcode?: string;
  name?: string;
}
// ---------定义reqPkgTaskUrl接口返回值类型-------
export interface Root {
  offers: string;
  ds_adx: string;
  country: string;
  ds_bundle: any;
  os: string;
  crInfo: CrInfo;
  deviceDays: number;
  max: number;
  runnerStatus: RunnerStatus;
  created: string;
  filters: string;
  bsclick: number;
  target_pkg_name: any;
  s: any;
  hour: number;
  startHour: string;
  appId: string;
  pkgName: string;
  etype: string;
  id: number;
  updated: string;
  status: string;
}

export interface CrInfo {
  ctr: number;
  ctr_offer: number;
  ivr: number;
  ivr_offer: number;
  conv: number;
  click: number;
  imp: number;
  roi: number;
  ecpc: number;
}

export interface RunnerStatus {
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
  currentFile: any;
  id: number;
  offers: string;
  pkgtaskId: number;
  os: string;
  max: number;
  succCount: number;
  filters: string;
  sendCount: number;
  urlparam: any;
  sendTime: any;
  resultDetail: any;
  endTime: any;
  status: number;
}
// ---------定义reqPkgTaskUrl接口返回值类型-------
