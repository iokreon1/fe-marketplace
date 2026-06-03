<script setup>
import Banner from '@/components/app/home/Banner.vue'
import Categories from '@/components/app/home/Categories.vue'
import TopPicks from '@/components/app/home/TopPicks.vue'
import Stores from '@/components/app/home/Stores.vue';
</script>

<template>
    <Banner />

    <main class="flex flex-col gap-[100px] w-full max-w-[1280px] px-[52px] mt-[72px] mb-[100px] mx-auto">
        <Categories />
        <TopPicks />
        <Stores />
    </main>
</template>