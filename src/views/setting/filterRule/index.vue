<!-- setting.vue -->
<template>
    <div class="container">
        <DeviceDuplicateFilterCard />
        <AlgorithmAbTestToolbar />
    </div>
</template>

<script setup lang="ts">
import { provide ,ref } from 'vue';
import DeviceDuplicateFilterCard from '@/components/setting/filterRule/DeviceDuplicateFilterCard.vue'
import AlgorithmAbTestToolbar from '@/components/setting/filterRule/AlgorithmAbTestToolbar.vue'
import useCookie from '@/store/modules/cookie'
const cookieStore = useCookie()
const showBtn = ref(['tom', 'jeff', 'jasmine'].includes(cookieStore.username))
provide('showBtn', showBtn)
</script>

<style scoped>
.container {
    max-width: 800px;
    margin: 20px auto;
    padding: 0 20px;
    display: grid;
    gap: 2rem;
}
</style>