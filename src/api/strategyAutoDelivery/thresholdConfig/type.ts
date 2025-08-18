// 查询
export interface paramsData {
  ruleFile: string; // 类型imp/click
  country: string; // 国家
  pkgName: string; // 包名
}

// 替换
export interface replaceData {
  // queryParam: paramsData;
  // listDto: ListDto;
  ruleFile: string;
  pkgName: string;
  country: string;
  threshold: string | null;
}

// 新增
export interface addData {
  
  ruleFile: string;
  pkgName: string;
  country: string;
  threshold: string | null;
}



