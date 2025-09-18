import { defineStore } from "pinia";
import { reqCeQueryGroup } from '@/api/traffic/pulltaskchart'
import { GroupData } from '@/api/traffic/pulltaskchart/type'

export const JobGroupData = defineStore("pulltaskchart", {
  state: () => ({
    JobGroup: [] as GroupData[],
  }),

  actions: {
    // 调用接口查询任务组
    async getJobGroup() {
      const res = await reqCeQueryGroup();
      this.JobGroup = res;
    },
  },
});
