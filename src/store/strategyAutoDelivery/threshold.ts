import { reqStrategyThresholdList } from '@/api/strategyAutoDelivery/threshold'
import { defineStore } from "pinia";

export const ThresholdPinia = defineStore("ThresholdPinia", {
  state: () => ({
    ThresholdList: [],
  }),

  actions: {
    // 调用接口查询任务组
    async getThreshold() {
      const res = await reqStrategyThresholdList();
      this.ThresholdList = res.data;
    },
  },
});