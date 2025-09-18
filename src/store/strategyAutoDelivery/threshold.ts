import { reqStrategyThresholdList } from "@/api/strategyAutoDelivery/threshold";
import { defineStore } from "pinia";

export const ThresholdPinia = defineStore("ThresholdPinia", {
  state: () => ({
    ThresholdList: [],
    dataUpdated: false,
  }),

  actions: {
    // 调用接口查询任务组
    async getThreshold() {
      const res = (await reqStrategyThresholdList()) as any;
      if (res.success) {
          this.ThresholdList = res.data;
          this.dataUpdated = true; // 数据已更新
      }
    },
  },
});
