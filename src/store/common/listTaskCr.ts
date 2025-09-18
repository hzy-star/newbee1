// store/taskCrStore.ts
import { defineStore } from 'pinia';
import { reqListTaskCr } from "@/api/pushtask/index"; // 假设这是你获取 TaskCr 的接口

const listTaskCr = defineStore('setTask', {
    state: () => ({
        taskCr: '',  // 存储 TaskCr 数据
        lastUpdated: null as number | null,  // 明确指定类型为 number | null
    }),
    
    actions: {
        // 获取 TaskCr 数据
        async setTaskCr() {
            this.clearTaskCr()
            try {
                const res = await reqListTaskCr();
                this.taskCr = res;  // 将获取的 TaskCr 数据存储到 state 中
                console.log('TaskCr:', Object.entries(this.taskCr).length);
                
                this.lastUpdated = Date.now(); // 更新数据时间戳，类型为 number
                return this.taskCr;
            } catch (error) {
                console.error('Failed to fetch TaskCr:', error);
            }
        },

        // 清空 TaskCr 数据
        clearTaskCr() {
            this.taskCr = '';
            this.lastUpdated = null;  // 清除更新时间
        },

        // 检查是否需要重新加载数据
        shouldFetchData() {
            // 数据为空或者数据超过一定时间阈值才重新加载（例如超过4小时）
            if (!this.taskCr || (this.lastUpdated && Date.now() - this.lastUpdated > 4 * 60 * 60 * 1000)) {
                return true;
            }
            return false;
        },

        // 检查并加载数据，如果需要
        async loadTaskCrIfNeeded() {
            if (this.shouldFetchData()) {
                await this.setTaskCr(); // 重新加载数据
            }
        },
    },

    persist: true,  // 保证数据在页面刷新后能保存
});

export default listTaskCr;
