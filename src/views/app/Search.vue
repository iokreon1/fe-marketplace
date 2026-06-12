<script setup>
import { useProductStore } from '@/stores/product';
import ProductCard from '@/components/card/ProductCard.vue';
import { storeToRefs } from 'pinia';
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const productStore = useProductStore()
const { products, loading, meta } = storeToRefs(productStore)
const { fetchProductsPaginated, loadMoreProducts } = productStore

const searchQuery = ref(route.query.q || '')
const currentPage = ref(1)

const loadSearchProducts = async (queryStr, isLoadMore = false) => {
    const params = {
        search: queryStr,
        row_per_page: 8,
        page: currentPage.value
    }
    if (isLoadMore) {
        await loadMoreProducts(params)
    } else {
        currentPage.value = 1
        params.page = 1
        await fetchProductsPaginated(params)
    }
}

const handleLoadMore = async () => {
    if (meta.value.current_page < meta.value.last_page) {
        currentPage.value++
        await loadSearchProducts(searchQuery.value, true)
    }
}

onMounted(() => {
    loadSearchProducts(searchQuery.value)
})

watch(() => route.query.q, (newQuery) => {
    searchQuery.value = newQuery || ''
    loadSearchProducts(searchQuery.value)
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
                    {{ searchQuery ? 'Search Results' : 'All Products' }}
                </span>
            </div>
            <h1 class="font-extrabold text-[32px] capitalize">
                {{ searchQuery ? `Search Results for: "${searchQuery}"` : 'Explore All Products' }}
            </h1>
            <div class="flex items-center gap-4">
                <div class="group flex items-center gap-2">
                    <img src="@/assets/images/icons/box-grey.svg" class="flex size-5 shrink-0" alt="icon">
                    <span class="font-semibold text-custom-grey">{{ meta.total || 0 }} Products Found</span>
                </div>
                <div class="group flex items-center gap-2">
                    <img src="@/assets/images/icons/verify-star-grey.svg" class="flex size-5 shrink-0" alt="icon">
                    <span class="font-semibold text-custom-grey">Best Match</span>
                </div>
            </div>
        </div>
    </header>

    <main class="flex flex-col gap-[100px] w-full max-w-[1280px] px-[52px] mt-[72px] mb-[100px] mx-auto">
        <section id="Search-Results" class="flex flex-col gap-9">
            <div class="grid grid-cols-4 gap-6">
                <ProductCard v-for="product in products" :key="product.id" :item="product" />
            </div>
            
            <div v-if="products.length === 0 && !loading" class="flex flex-col items-center justify-center py-20 gap-4">
                <img src="@/assets/images/icons/box-grey.svg" class="size-20 opacity-30" alt="empty">
                <p class="font-bold text-custom-grey text-xl">No products found matching your search.</p>
            </div>

            <button 
                v-if="meta.current_page < meta.last_page" 
                @click="handleLoadMore"
                class="flex items-center w-fit h-14 rounded-[18px] py-4 px-6 gap-[10px] bg-custom-black mx-auto hover:bg-custom-blue transition-300"
            >
                <span class="font-medium text-white">Load More</span>
                <img src="@/assets/images/icons/arrow-down-white.svg" class="flex size-6 shrink-0" alt="icon">
            </button>
        </section>
    </main>
</template>
