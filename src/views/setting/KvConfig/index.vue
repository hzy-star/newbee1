<template>
  <div class="container">
    <div class="search">
      <el-button type="primary" @click="queryData">Query</el-button>
    </div>
    <vxe-table :data="tableData" style="width: 100%">
      <!-- No.列 -->
      <vxe-column field="No." title="No." type="seq" show-header-overflow align="center" width="5%" />

      <!-- Key列 -->
      <vxe-column field="Key" title="Key" show-header-overflow align="center" width="20%">
        <template #default="{ row }">
          <el-input v-model="row.k" placeholder="Key" />
        </template>
      </vxe-column>

      <!-- Value列 -->
      <vxe-column field="Value" title="Value" show-header-overflow align="center" width="35%">
        <template #default="{ row }">
          <el-input v-model="row.v" placeholder="Value" type="textarea" :autosize="{ minRows: 4, maxRows: 4 }" />
        </template>
      </vxe-column>

      <!-- Detail列 -->
      <vxe-column field="Detail" title="Detail" show-header-overflow align="center" >
        <template #default="{ row }">
          <div class="detail-grid">
            <div class="detail-item">
              <span>group:</span>
              <el-input v-model="row.kvgroup" />
            </div>
            <div class="detail-item">
              <span>desc:</span>
              <el-input v-model="row.kvdesc" />
            </div>
            <div class="detail-item">
              <span>status:</span>
              <el-select v-model="row.status" clearable placeholder="select">
                <el-option label="enabled" value="enabled"></el-option>
                <el-option label="disabled" value="disabled"></el-option>
              </el-select>
            </div>
            <div class="detail-item">
              <span>create:</span>
              <el-input v-model="row.cdate" disabled />
            </div>
            <div class="detail-item">
              <span>update:</span>
              <el-input v-model="row.mdate" disabled />
            </div>
          </div>
        </template>
      </vxe-column>

      <!-- Action列 -->
      <vxe-column field="Action" title="Action" :visible="RolePermissions.showBtn" show-header-overflow align="center" width="15%">
        <template #default="{ row }">
          <el-button type="primary" @click="handleSet(row)">Set</el-button>
          <el-button type="danger" @click="handleDelete(row)">Delete</el-button>
        </template>
      </vxe-column>
    </vxe-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { reqListKvUrl, reqSaveKvUrl, reqDelKvUrl } from '@/api/setting/KvConfig'
import { ElMessage, ElMessageBox } from 'element-plus';
import RolePermission from '@/store/modules/rolePermission'
const RolePermissions = RolePermission()


// 转换原始数据，处理null值
let tableData = ref<TableItem[]>()
interface TableItem {
  k: string | null
  v: string
  kvdesc: string | null
  mdate: string | null
  cdate: string | null
  kvgroup: string | null
  status: string | null
}
let data = ref()
// 查询数据
const queryData = async () => {
  data.value = await reqListKvUrl()
  console.log(data);
  tableData.value = data.value.map((item: TableItem) => ({
    ...item,
    k: item.k || '',
    kvdesc: item.kvdesc || '',
    kvgroup: item.kvgroup || '',
    status: item.status || '',
    cdate: item.cdate || ''
  }))
}
// 处理设置操作
const handleSet = (row: TableItem) => {
  if (row.status == null || row.status == '') {
    ElMessage.error('status不能为空')
    return
  }
  let newConfig = {
    "k": row.k?.trim(),
    "v": row.v.trim(),
    "status": row.status.trim(),
    "group": row.kvgroup?.trim(),
    "kvdesc": row.kvdesc?.trim()
  };
  console.log(newConfig);
  reqSaveKvUrl(newConfig).then(res => {
    if (res) {
      ElMessage.success('保存成功')
      queryData()
    }
  })
  // 这里可以添加保存到服务器的逻辑
}

// 处理删除操作
const handleDelete = (row: TableItem) => {
  console.log('删除:', row);
  debugger
  if (row.k !== null && row.k !== '') {

    ElMessageBox.confirm(`确定删除吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      reqDelKvUrl({ k: row.k?.trim() }).then(res => {
        // 处理返回结果
        if (res) {
          ElMessage.success('删除成功')
          queryData()
        }
      });
    }).catch(() =>{
      ElMessage.info('已取消删除')
    })
  } else {
    ElMessage.error('key不能为空')
  }


}
</script>

<style scoped lang="scss">
.detail-grid {

  .detail-item {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 4px 0;
  }

  .detail-item span {
    min-width: 60px;
    font-weight: bold;
  }
}


:deep(.el-textarea__inner) {
  font-family: monospace;
  line-height: 1.5;
}

.search {
  width: 100%;
  margin: 10px 0;
  display: flex;
  justify-content: flex-end;
  /* 让内容靠右对齐 */
}
</style>