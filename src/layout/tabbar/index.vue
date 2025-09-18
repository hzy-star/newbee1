<template>
  <div class="tabbar">
    <div class="tabber_left">
      <Breadcrumb />
    </div>
    <div class="tabber_right">
      <Setting />
    </div>
  </div>
</template>
<script lang="ts" setup>
import Breadcrumb from "./breadcrumb/index.vue"
import Setting from "./setting/index.vue"
</script>
<script lang="ts">
export default {
  name: "Tabbar",
}
</script>

<style scoped>
.tabbar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .tabber_left {
    display: flex;
    align-items: center;
    margin-left: 10px;
  }
  .tabber_right{
    display: flex;
    align-items: center;
    margin-right: 15px;
  }
}
</style>
