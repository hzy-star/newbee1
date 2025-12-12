import { reqStrategyThresholdList } from "@/api/strategyAutoDelivery/threshold";
import { reqListKvUrl } from "@/api/setting/KvConfig";
import { defineStore } from "pinia";

export const ThresholdPinia = defineStore("ThresholdPinia", {
  state: () => ({
    ThresholdList: [],
    dataUpdated: false,
  }),

  actions: {
    // 调用接口查询任务组
    async getThreshold(outerTab?: 'click' | 'imp' | 'all') {
      debugger
      let param = ''
      if(outerTab == 'click'){
        param = 'click,all'
      }else if(outerTab == 'imp'){
        param = 'imp,all'
      }else if(outerTab == 'all'){
        param = 'click,imp,all'
      }else{
        param = undefined as any
      }
      const res = (await reqStrategyThresholdList({ eventType: param })) as any;
      if (res.success) {
        this.ThresholdList = res.data;
        this.dataUpdated = true; // 数据已更新
      }
    },
    // 获取kv配置
    async openDataeye() {
      const params = {
        kvgroup: "",
        k: "dataeye",
        status: "1",
      };
      const res = (await reqListKvUrl(params)) as any;
      const _s = res?.data?.[0]?.v || "";
      // 打开新页面
      if (_s) {
        window.open(_s, "_blank");
      }
    },
  },
});
