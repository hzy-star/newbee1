<template>
  <div class="logo" v-if="setting.logoHidden">
    <img :src=setting.logo alt="">
    <p>{{setting.title}}</p>
  </div>
</template>

<script setup lang="ts">
import setting from '@/setting';

</script>
<script lang="ts">
export default {
  name: "Logo",
}
</script>

<style scoped lang="scss">
.logo {
    width: 100%;
    height: $base-logo-height;
    color: white;
    display: flex;
    align-items: center;
    justify-content:center;
    img{
        width: 50px;
        height: 50px;
    }
    p{
        margin-left: 10px;
        font-size: 20px;
        font-weight: bold;
    }
}
</style>