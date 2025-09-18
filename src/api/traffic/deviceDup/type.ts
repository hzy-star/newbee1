// 定义参数类型
export interface propFormInter {
  taskdate?: string;
  searchDup: string;
  dayOffset: number | string;
}
// 查询接口参数
export interface paramsData {
  day: string;
  searchDup: string;
  dayOffset: number | string | null;
}
