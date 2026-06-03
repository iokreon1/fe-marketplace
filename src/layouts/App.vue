<script setup lang="ts">
import Navbar from '@/components/app/Navbar.vue';
import Footer from '@/components/app/Footer.vue';
</script>

<template>
    <Navbar />

    <main class="w-full max-w-[1920px] mx-auto relative pt-8 pb-[100px]">
        <RouterView />
    </main>

    <Footer />
</template>