export interface SplitData {
    id?: string;
    advs: string;
    pkg_name: string;
    country: string;
    top_bundle_range: string;
    common_gateway_range: string;
    near_gateway_range: string;
    create_date?: string;
    update_date?: string;
    status: number;
    advList?: any; // 如果不需要可以去掉
    countryList?: any; // 如果不需要可以去掉
    topBundleRange?: any; // 如果不需要可以去掉
    commonGatewayRange?: any; // 如果不需要可以去掉
    nearGatewayRange?: any; // 如果不需要可以去掉
  }