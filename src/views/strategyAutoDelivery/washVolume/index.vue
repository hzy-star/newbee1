<!-- 页面将使用tailwindcss -->
<template>
  <div class="developing-wrap">
    <el-card class="dev-card">
      <div class="dev-content">
        <el-icon class="dev-icon">
          <Setting />
        </el-icon>
        <h2>洗量平台化建设页面功能开发中...</h2>
        <p>当前页面正在建设，敬请期待。</p>
        <br>
        <el-button type="primary" @click="backHome">返回首页</el-button>
      </div>


      <el-button @click="openCsvDialog">查看 CSV</el-button>

      <GeneralCsvEditing mode="dialog" v-model:visible="visible" :csv-path="csvPath" title="通用 CSV 编辑" />
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { Setting } from '@element-plus/icons-vue';
import { ref } from 'vue'
import GeneralCsvEditing from '@/components/GeneralCsvEditing/index.vue'

const visible = ref(false)
const csvPath = ref('')

const openCsvDialog = () => {
  csvPath.value = '' // 你的业务里拿到的地址oss://ym-east-data/data/ym_push/zxw_test/rank/flowAlgIMP.csv
  visible.value = true
}

const router = useRouter();

const backHome = () => {
  router.push("/");
};
</script>

<style scoped>
.developing-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
}

.dev-card {
  padding: 40px;
  text-align: center;
}

.dev-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dev-icon {
  font-size: 60px;
  color: #409eff;
  margin-bottom: 16px;
}
</style>