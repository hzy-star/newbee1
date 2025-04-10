<template>
  <el-tabs v-model="activeTab">
    <!-- Tab 1 -->
    <el-tab-pane label="summary" name="tab1">
      <el-form :inline="true" :model="form1" class="mb-4">
        <el-form-item label="App">
          <el-input v-model="form1.app" placeholder="App" />
        </el-form-item>
        <el-form-item label="Offer">
          <el-input v-model="form1.offer" placeholder="Offer" />
        </el-form-item>
        <el-form-item label="Pkg">
          <el-input v-model="form1.pkg" placeholder="Pkg" />
        </el-form-item>
        <el-form-item label="Country">
          <el-input v-model="form1.country" placeholder="Country" />
        </el-form-item>
        <el-form-item label="Day">
          <el-input v-model="form1.day" placeholder="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch1">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData1" style="width: 100%" border >
        <el-table-column
          v-for="col in tableColumns1"
          :key="col"
          :prop="col"
          :label="fieldMap[col] || col"
        />
      </el-table>
    </el-tab-pane>

    <!-- Tab 2 -->
    <el-tab-pane label="detailMultOffer" name="tab2">
      <el-form :inline="true" :model="form2" class="mb-4">
        <el-form-item label="OfferIds">
          <el-input v-model="form2.offerIds" placeholder="OfferIds" />
        </el-form-item>
        <el-form-item label="Day">
          <el-input v-model="form2.day" placeholder="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch2">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData2" style="width: 100%" border >
        <el-table-column
          v-for="col in tableColumns2"
          :key="col"
          :prop="col"
          :label="fieldMap[col] || col"
          :formatter="(row: Record<string, any>) => formatField(col, row[col])"
        />
      </el-table>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { reqSummaryUrl, reqMultOfferUrl } from '@/api/traffic/gAgencyToStoreRate'

const activeTab = ref('tab1')

// 表单数据
const form1 = ref({
  offer: '',
  app: '',
  pkg: '',
  country: '',
  day: '',
})

const form2 = ref({
  offerIds: '',
  day: '',
})

// 表格数据
const tableData1 = ref<any[]>([])
const tableData2 = ref<any[]>([])

// 表格列名
const tableColumns1 = ref<string[]>([])
const tableColumns2 = ref<string[]>([])

// 字段名映射（可根据需要扩展）
const fieldMap: Record<string, string> = {
  pkg_name: 'Pkg Name',
  app: 'App',
  offer: 'Offer',
  pkg: 'Pkg',
  country: 'Country',
  day: 'Day',
  proxy: 'Proxy',
  shop: 'Shop',
  succ: 'Success',
  shopRatio: 'Shop Ratio',
  offerId: 'Offer ID',
  successDetail: 'Success Detail',
  failDetail: 'Fail Detail',
  appId: 'App ID',
  taskId: 'Task ID',
  clickSuccess: 'Click Success',
  clickFail: 'Click Fail',
  clickSent: 'Click Sent',
}

// 查询 summary 接口
const handleSearch1 = async () => {
  const res = await reqSummaryUrl(form1.value)
  debugger
  if (res.data.length > 0) {
    tableData1.value = [...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,]
    tableColumns1.value = Object.keys(res.data[0])
  } else {
    tableData1.value = []
    tableColumns1.value = []
    ElMessage.warning('无数据或查询失败')
  }
}

// 查询 detailMultOffer 接口
const handleSearch2 = async () => {
  // 校验 offerIds 和 day 必填
  if (!form2.value.offerIds || !form2.value.day) {
    ElMessage.warning('OfferIds 和 Day 是必填项')
    return
  }

  const res = await reqMultOfferUrl(form2.value)
  if (res.data.length > 0) {
    tableData2.value = [...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,...res.data,]
    tableColumns2.value = Object.keys(res.data[0])
  } else {
    tableData2.value = []
    tableColumns2.value = []
    ElMessage.warning('无数据或查询失败')
  }
}

const formatField = (key: string, value: any) => {
  if ((key === 'successDetail' || key === 'failDetail') && typeof value === 'string') {
    try {
      const obj = JSON.parse(value)
      return Object.entries(obj)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n') // 每项一行
    } catch (err) {
      return value
    }
  }
  return value
}

</script>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
.el-table .cell {
  white-space: pre-line; /* 支持换行显示 */
}
</style>
