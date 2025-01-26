export interface formatData {
  baseDate: string;
  dayStep: string;
  offerId: string;
  appId: string;
  pkgName: string;
  taskId: string;
  country: string;
  adx?: string;
  os?: string;
  JobGroup?: string;
}

export interface paramsData {
  startday: string; // 假设是日期字符串
  step: number; // 天数步长，转换为 number
  days: string; // 计算得到的天数
  offer: string; // offer ID
  pkg: string; // 包名
  taskid: string; // 任务 ID
  jobgroup: string; // jobgroup
  app: string; // 应用 ID
  country: string; // 国家代码
}

export interface GroupData {
  random: number;
  mdate: string;
  alliance_group: string;
  isMaster: string;
  ip: string;
  name: string;
  id: string;
  filters: string;
  enabled: string;
}
