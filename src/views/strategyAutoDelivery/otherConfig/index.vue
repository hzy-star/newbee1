<!-- <template>
  <div>
    <el-button type="primary" @click="add">新增 SQL</el-button>

    <el-table :data="list" style="width: 100%; margin-top: 15px;">
      <el-table-column prop="sqlName" label="名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />

      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="edit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="remove(row.id)">删除</el-button>
        </template>
      </el-table-column>

    </el-table>

    <el-dialog v-model="visible" title="SQL 规则编辑" width="650px">
    <QueryBuilderFixed
        v-model="conditions"
        :fields="fieldList"
        />

    <template #footer>
      <el-button @click="visible=false">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </template>
  </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue"
import axios from "axios"
import { Delete } from "@element-plus/icons-vue"
import QueryBuilderFixed from "@/components/strategyAutoDelivery/queryBuilder/queryBuilder.vue"

const visible = ref(false)

const list = ref([]) // 表格数据

// 固定字段
const allFields = [
  "country",
  "pkg",
  "date",
  "install_time",
  "cost",
  "impression",
  "click"
]

const form = ref({
  sqlName: "",
  rules: [],
  whereSQL: ""
})

// SQL builder
const builder = reactive({
  table: "ym_data",
  fields: [],
  conditions: [],
  orderBy: "",
  orderType: "ASC"
})

// 固定字段列表
const fieldList = [
  { field: "country", label: "国家" },
  { field: "pkg", label: "包名" },
  { field: "date", label: "日期" },
  { field: "manager", label: "管理员ID" },
  // …你的其他字段
]
// 这里接收 QueryBuilderFixed 返回的 { country:{op:"",value:""}, ... }
const conditions = ref({})

function save() {
  const json = JSON.stringify(conditions.value, null, 2)
  console.log("保存结果 JSON：")
  console.log(json)

  // 你提交给后端即可
  // axios.post('/你的接口', form.value)

  visible.value = false
}

// SQL 生成
const previewSQL = computed(() => {
  let sql = `SELECT ${builder.fields.length ? builder.fields.join(", ") : "*" }
FROM ${builder.table}
WHERE 1 = 1`

  builder.conditions.forEach(c => {
    sql += ` AND ${c.field} ${c.op} '${c.value}'`
  })

  if (builder.orderBy) {
    sql += ` ORDER BY ${builder.orderBy} ${builder.orderType}`
  }

  return sql
})

// CRUD 操作
function add() {
  resetForm()
  visible.value = true
}

function edit(row) {
  resetForm()

  form.id = row.id
  form.sqlName = row.sqlName
  form.description = row.description

  const cfg = JSON.parse(row.sqlConfig)

  Object.assign(builder, cfg)

  visible.value = true
}

function remove(id) {
  axios.delete(`/api/sql/${id}`).then(() => loadData())
}

function addCondition() {
  builder.conditions.push({
    field: "",
    op: "=",
    value: ""
  })
}

function deleteCondition(idx) {
  builder.conditions.splice(idx, 1)
}


function resetForm() {
  form.id = null
  form.sqlName = ""
  form.description = ""

  builder.table = "ym_data"
  builder.fields = []
  builder.conditions = []
  builder.orderBy = ""
  builder.orderType = "ASC"
}

function loadData() {
  axios.get("/api/sql/list").then(res => {
    list.value = res.data
  })
}

loadData()
</script>

<style scoped>
.condition-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
</style> -->
<template>
  <!-- 测试查询engine接口 -->
  <div class="developing-wrap">
    <el-card class="dev-card">
      <div class="dev-content">
        <el-icon class="dev-icon">
          <Setting />
        </el-icon>
        <h2>功能开发中...</h2>
        <p>当前页面正在建设，敬请期待。</p>
        <br>
        <el-button type="primary" @click="testQuery">测试engine查询</el-button>
        <!-- <el-button type="primary" @click="backHome">返回首页</el-button> -->
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { Setting } from '@element-plus/icons-vue';
import { reqTestEngine } from '@/api/otherConfig/otherConfig'
import { ElMessage } from 'element-plus';
const router = useRouter();

const testQuery = async () => {
  try {
    const response = await reqTestEngine();
    console.log("Engine API Response:", response);
    // alert("查询成功，详情请查看控制台日志。");
    ElMessage.success("查询成功，详情请查看控制台日志。");
  } catch (error) {
    console.error("Engine API Error:", error);
    // alert("查询失败，请查看控制台日志。");
    ElMessage.error("查询失败，请查看控制台日志。");
  }
};
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
