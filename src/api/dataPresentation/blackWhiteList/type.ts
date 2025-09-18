// 查询
export interface paramsData {
  etype: string; // 类型imp/click
  listtype: string; // 名单类型blacklist/whitelist
  country: string; // 国家
  pkgname: string; // 包名
  field?: string; // 来源adx/bundle
  os?: string; // 操作系统
  tag?: string; // 标签
}

// 替换
export interface replaceData {
  queryParam: paramsData;
  listDto: ListDto;
  dataList: string[];
}

// 新增
export interface addData {
  listDto: ListDto;
  dataList: string[];
}





export interface ListDto {
  etype: string;
  pkgname: string;
  country: string;
  field: string;
  listtype: string;
  rate: number | null;
  tag: string;
  os: string;
}