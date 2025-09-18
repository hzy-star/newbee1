<!-- setting.vue -->
<template>
    <div class="container">
        <DeviceDuplicateFilterCard />
        <AlgorithmAbTestToolbar />
    </div>
</template>

<script setup lang="ts">
import DeviceDuplicateFilterCard from '@/components/setting/filterRule/DeviceDuplicateFilterCard.vue'
import AlgorithmAbTestToolbar from '@/components/setting/filterRule/AlgorithmAbTestToolbar.vue'
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