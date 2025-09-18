<template>
  <el-card>
    <div class="box">
      <img :src="cookieStore.avatar" alt="" class="avatar" />
      <div>
        <h3>{{ cookieStore.username }}{{ getTime() }}</h3>
      </div>
    </div>
  </el-card>
  <div class="bottom">
    <svg-icon name="welcome" width="500px" height="500px" ></svg-icon>
  </div>
</template>

<script setup lang="ts">
import { getTime } from "@/utils/time";
import useCookie from "@/store/modules/cookie";
const cookieStore = useCookie();
</script>

<style scoped>
.box {
  display: flex;
  align-items: center;
  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-right: 20px;
  }
}
.bottom{
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
