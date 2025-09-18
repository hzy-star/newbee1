<template>
  <el-tabs v-model="activeTab" class="tabs">
    <!-- Tab 1 -->
    <el-tab-pane label="summary" name="tab1" class="tabs-1">
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
          <el-button type="primary" @click="ExportSummary">导出</el-button>
        </el-form-item>
      </el-form>

      <div class="overflow-x-auto">
        <vxe-table auto-resize height="auto" :column-config="{ resizable: true }" show-overflow
          :cell-config="{ verticalAlign: 'center' }" :row-config="{ isCurrent: false, isHover: true }"
          :scroll-y="{ enabled: true, gt: 0 }" :data="tableData1" ref="summaryTable" size="mini" round>
          <vxe-column type="seq" width="70" title="csv">
            <template #header>
              <div style="display: flex; align-items: center; justify-content: center;">
                <span>序号</span>
                <!-- <svg-icon name="csvExport" width="15px" height="15px" @click="ExportSummary" title="csv"></svg-icon> -->
              </div>
            </template>
          </vxe-column>
          <vxe-column v-for="col in tableColumns1" :key="col" :field="col" :title="fieldMap[col] || col"></vxe-column>
        </vxe-table>
      </div>
    </el-tab-pane>

    <!-- Tab 2 -->
    <el-tab-pane label="detailMultOffer" name="tab2" class="tabs-2">
      <el-form :inline="true" :model="form2" class="mb-4">
        <el-form-item label="OfferIds">
          <el-input v-model="form2.offerIds" placeholder="OfferIds" />
        </el-form-item>
        <el-form-item label="Day">
          <el-input v-model="form2.day" placeholder="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch2">查询</el-button>
          <el-button type="primary" @click="ExportdetailMultOffer">导出</el-button>
        </el-form-item>
      </el-form>

      <div class="overflow-x-auto">
        <vxe-table auto-resize height="auto" :column-config="{ resizable: true }" show-overflow
          :cell-config="{ verticalAlign: 'center' }" :row-config="{ isCurrent: false, isHover: true }"
          :scroll-y="{ enabled: true, gt: 0 }" :data="tableData2" ref="detailMultOfferTable" size="mini" round>
          <vxe-column type="seq" width="70" title="csv">
            <template #header>
              <div style="display: flex; align-items: center; justify-content: center;">
                <span>序号</span>
                <!-- <svg-icon name="csvExport" width="15px" height="15px" @click="ExportdetailMultOffer"
                  title="csv"></svg-icon> -->
              </div>
            </template>
          </vxe-column>
          <vxe-column v-for="col in tableColumns2" :key="col" :field="col" :title="fieldMap[col] || col"
            :formatter="formatColumn"></vxe-column>
        </vxe-table>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { reqSummaryUrl, reqMultOfferUrl } from '@/api/traffic/gAgencyToStoreRate'
import type { VxeColumnPropTypes, VxeTableInstance } from 'vxe-table'
const formatColumn: VxeColumnPropTypes.Formatter = ({ column, cellValue }) => {
  return formatField(column.field, cellValue)
}
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
  if (res && res?.data.length > 0) {
    tableData1.value = res.data
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
  if (res && res?.data.length > 0) {
    tableData2.value = res.data
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
const summaryTable = ref<VxeTableInstance>()
// 导出summary
const ExportSummary = () => {
  const rows = tableData1.value;
  if (!rows || rows.length === 0) {
    ElMessage.error('暂无数据可导出');
    return;
  }
  const $table = summaryTable.value
  if ($table) {
    $table.exportData({
      type: 'csv'
    })
  }
}
const detailMultOfferTable = ref<VxeTableInstance>()
// 导出detailMultOffer
const ExportdetailMultOffer = () => {
  const rows = tableData2.value;
  if (!rows || rows.length === 0) {
    ElMessage.error('暂无数据可导出');
    return;
  }
  const $table = detailMultOfferTable.value
  if ($table) {
    $table.exportData({
      type: 'csv'
    })
  }
}

</script>

<!-- <style scoped lang="scss">
.tabs {
  margin: 0;
  padding: 0;

  .tabs-1,
  .tabs-2 {
    width: 100%;
    padding: 0 20px;
    background: #fff;
    border-radius: 0;
    height: 100%;

    .overflow-x-auto {
      height: calc(100vh - 250px);
    }
  }

}

.mb-4 {
  margin-bottom: 1rem;
}
</style> -->
<style scoped lang="scss">
.tabs {
  margin: 0;
  padding: 0;
  height: calc(100vh - #{$base-tabbar-height} - 10px);

  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;

    .el-tab-pane {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  .tabs-1,
  .tabs-2 {
    flex: 1;
    padding: 0 20px;
    background: #fff;
    display: flex;
    flex-direction: column;

    .el-form {
      flex-shrink: 0; // 防止表单被压缩
    }

    .overflow-x-auto {
      flex: 1;
      min-height: 100px; // 最小高度防止内容过少时挤压
      display: flex;
      flex-direction: column;

      .vxe-table {
        flex: 1;

        :deep(.vxe-table--body-wrapper) {
          flex: 1;
        }
      }
    }
  }
}

.mb-4 {
}
</style>