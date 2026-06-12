<script setup>
import { useStoreStore } from '@/stores/store';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import StoreCard from '@/components/card/StoreCard.vue';

const storeStore = useStoreStore()
const { stores, loading } = storeToRefs(storeStore)
const { fetchStores } = storeStore

onMounted(() => {
    fetchStores() // Fetches all stores without limit
})
</script>

<template>
    <header class="w-full max-w-[1920px] mx-auto overflow-hidden bg-custom-background p-[52px]">
        <div class="flex flex-col w-full max-w-[1280px] px-[52px] gap-3 mx-auto">
            <div class="flex items-center gap-3">
                <RouterLink :to="{ name: 'app.home' }"
                    class="font-medium text-lg text-custom-grey hover:text-custom-blue transition-300">
                    Homepage
                </RouterLink>
                <span class="font-medium text-xl text-custom-grey">/</span>
                <span class="font-semibold text-lg text-custom-blue">
                    All Trusted Sellers
                </span>
            </div>
            <h1 class="font-extrabold text-[32px] capitalize">Trusted Sellers, Quality Guaranteed</h1>
            <div class="group flex items-center gap-2">
                <img src="@/assets/images/icons/shop-grey.svg" class="flex size-5 shrink-0" alt="icon">
                <span class="font-semibold text-custom-grey">{{ stores.length }} Sellers Found</span>
            </div>
        </div>
    </header>

    <main class="w-full max-w-[1280px] px-[52px] mt-[72px] mb-[100px] mx-auto">
        <section id="All-Stores-List" class="flex flex-col gap-9">
            <div v-if="loading" class="text-center py-20">
                <p class="font-semibold text-custom-grey">Loading sellers...</p>
            </div>
            <div v-else class="grid grid-cols-3 gap-6">
                <StoreCard v-for="store in stores" :key="store.id" :item="store" />
            </div>
        </section>
    </main>
</template>
