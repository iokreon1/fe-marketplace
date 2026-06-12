<script setup>
import { useProductCategoryStore } from '@/stores/productCategory';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

const productCategoryStore = useProductCategoryStore()
const { productCategories, loading } = storeToRefs(productCategoryStore)
const { fetchProductCategories } = productCategoryStore

onMounted(() => {
    fetchProductCategories() // Fetches all categories without limit
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
                    All Categories
                </span>
            </div>
            <h1 class="font-extrabold text-[32px] capitalize">Explore All Categories</h1>
            <div class="group flex items-center gap-2">
                <img src="@/assets/images/icons/bag-grey.svg" class="flex size-5 shrink-0" alt="icon">
                <span class="font-semibold text-custom-grey">{{ productCategories.length }} Categories Found</span>
            </div>
        </div>
    </header>

    <main class="w-full max-w-[1280px] px-[52px] mt-[72px] mb-[100px] mx-auto">
        <section id="All-Categories-List" class="flex flex-col gap-9">
            <div v-if="loading" class="text-center py-20">
                <p class="font-semibold text-custom-grey">Loading categories...</p>
            </div>
            <div v-else class="grid grid-cols-5 gap-6">
                <RouterLink :to="{ name: 'app.browse-category', params: { slug: category.slug } }" class="group card"
                    v-for="category in productCategories" :key="category.id">
                    <div
                        class="flex flex-col rounded-[20px] ring-1 ring-custom-stroke py-8 px-6 items-center gap-6 group-hover:ring-2 group-hover:ring-custom-blue group-hover:bg-custom-blue/5 transition-300 bg-white">
                        <img :src="category.image" class="size-9 object-contain" alt="icon">
                        <div class="flex flex-col items-center gap-1">
                            <p class="font-bold text-xs capitalize text-center">{{ category.name }}</p>
                            <p class="font-medium text-custom-grey leading-none">{{ category.product_count }} items</p>
                        </div>
                    </div>
                </RouterLink>
            </div>
        </section>
    </main>
</template>
