<template>
  <el-card>
    <el-button type="primary" icon="Plus" 
    v-has="`btn.Product.add`">添加</el-button>
    <el-table :data="tableData" border>
      <el-table-column
        label="序号"
        type="index"
        width="80"
        align="center"
      ></el-table-column>
      <el-table-column label="品牌名称" prop="date"></el-table-column>
      <el-table-column label="地址" prop="address"></el-table-column>
      <el-table-column label="品牌logo" prop="name">
        <!-- <template #default="{ row }">
          <img :src="row.logoUrl" alt="" style="width: 100px; height: 100px" />
        </template> -->
      </el-table-column>
      <el-table-column label="操作">
        <template>
          <el-button type="primary" icon="Edit" >修改</el-button>
          <el-button type="primary" icon="Plus" v-has="`btn.Product.add`">添加</el-button>
          <el-button type="primary" icon="Delete">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      layout="prev, pager, next, jumper, ->, sizes,total "
      :total="100"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="pageSize"
      :current-page="pageNo"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
    </el-pagination>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
]
// 当前页码
const pageNo = ref<number>(1)
// 每页显示条数
const pageSize = ref<number>(10)

// 每页显示条数改变
const handleSizeChange = (size:number)=>{
  pageSize.value = size
}
// 当前页码改变
const handleCurrentChange = (page:number)=>{
  pageNo.value = page
}
</script>

<style scoped></style>
