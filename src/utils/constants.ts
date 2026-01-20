// RTA名称常量
export const RTA_NAMES = {
  ALIEXPRESS: 'Aliexpress',
  TIKTOK: 'Tiktok',
  Shopee: 'Shopee',
  Kwai: 'Kwai',
};

// RTA选项列表，用于下拉选择框
export const RTA_OPTIONS = [
  { label: RTA_NAMES.ALIEXPRESS, value: RTA_NAMES.ALIEXPRESS },
  { label: RTA_NAMES.TIKTOK, value: RTA_NAMES.TIKTOK },
  { label: RTA_NAMES.Shopee, value: RTA_NAMES.Shopee },
  { label: RTA_NAMES.Kwai, value: RTA_NAMES.Kwai },
];

// 本地内容类型配置 - 用于参数规则模块
// 这些类型会显示特定的表单内容，其他类型只显示一个 textarea
export const localContentConfig: Record<string, { headers: string[] }> = {
  proxy: {
    headers: ['country', 'pkg_name', 's2s', 'proxy_type']
  },
  // erase: {
  //   headers: [] // 可以为 erase 添加表头配置
  // }
};

// 导出类型列表，方便判断是否为 localContent 类型
export const localContentTypes = Object.keys(localContentConfig);