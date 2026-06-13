<script setup>
import { useAuthStore } from '@/stores/auth';
import { useProductCategoryStore } from '@/stores/productCategory';
import { useWishlistStore } from '@/stores/wishlist';
import { useCartStore } from '@/stores/cart';
import heartGreyIcon from '@/assets/images/icons/heart-grey.svg';
import heartRedIcon from '@/assets/images/icons/heart-red.svg';
import { storeToRefs } from 'pinia';
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const showDropdownProfile = ref(false)
const showDropdownCategories = ref(false)
const searchQuery = ref('')

const authStore = useAuthStore()
const { user, token } = storeToRefs(authStore)
const { checkAuth, logout } = authStore

const productCategoryStore = useProductCategoryStore()
const { productCategories } = storeToRefs(productCategoryStore)

const router = useRouter()

const wishlistStore = useWishlistStore()
const cartStore = useCartStore()

const handleSearch = () => {
    if (searchQuery.value.trim()) {
        router.push({ name: 'app.search', query: { q: searchQuery.value } })
    }
}

const closeDropdowns = (e) => {
    if (!e.target.closest('#Profile-Button') && !e.target.closest('#Profile-Dropdown')) {
        showDropdownProfile.value = false
    }
    if (!e.target.closest('#Categories-Button') && !e.target.closest('#Categories-Dropdown')) {
        showDropdownCategories.value = false
    }
}

onMounted(async () => {
    window.addEventListener('click', closeDropdowns)
    try {
        await checkAuth()
    } catch (error) {
        // ignore if unauthorized
    }
    try {
        await productCategoryStore.fetchProductCategories()
    } catch (error) {
        console.error('Failed to fetch categories:', error)
    }
})

onUnmounted(() => {
    window.removeEventListener('click', closeDropdowns)
})
</script>

<template>
    <section id="Navbar-Wrapper" class="flex h-[168px] w-full mx-auto relative">
        <div class="fixed top-0 w-full bg-white min-h-[168px] border-b border-custom-stroke py-8 z-30">
            <div class="w-full max-w-[1920px] flex flex-col gap-6 px-7 mx-auto">
                <div class="flex items-center gap-6 w-full">
                    <RouterLink :to="{ name: 'app.home' }" class="flex shrink-0">
                        <img src="@/assets/images/logos/logo.svg" class="h-8" alt="logo">
                    </RouterLink>
                    <div class="relative shrink-0">
                        <button type="button" id="Categories-Button" @click="showDropdownCategories = !showDropdownCategories" class="flex items-center gap-2 shrink-0">
                            <img src="@/assets/images/icons/menu-grey.svg" class="size-6 flex shrink-0" alt="icon">
                            <p class="flex items-center gap-1 font-semibold text-custom-grey">
                                Categories
                                <img src="@/assets/images/icons/arrow-down-grey.svg" class="size-4" alt="icon">
                            </p>
                        </button>
                        <div id="Categories-Dropdown" class="absolute transform top-[calc(100%+24px)] left-0 z-30"
                            v-if="showDropdownCategories">
                            <nav
                                class="flex flex-col w-[240px] rounded-[20px] py-4 px-4 gap-3 bg-white shadow-[0px_6px_30px_0px_#00000017] border border-custom-stroke">
                                <RouterLink 
                                    v-for="cat in productCategories" 
                                    :key="cat.id"
                                    :to="{ name: 'app.browse-category', params: { slug: cat.slug } }"
                                    @click="showDropdownCategories = false"
                                    class="flex items-center gap-3 font-semibold text-custom-grey hover:text-custom-blue py-2 px-3 rounded-xl hover:bg-custom-blue/5 transition-300 w-full text-left"
                                >
                                    <img :src="cat.image" class="size-5 shrink-0 object-contain" alt="icon">
                                    <span class="truncate">{{ cat.name }}</span>
                                </RouterLink>
                            </nav>
                        </div>
                    </div>
                    <form @submit.prevent="handleSearch" class="w-full">
                        <label
                            class="flex items-center w-full h-14 rounded-[18px] p-4 px-6 gap-2 bg-white border-[1.5px] border-custom-stroke focus-within:border-custom-black transition-300">
                            <img src="@/assets/images/icons/search-normal-grey.svg" class="flex size-6 shrink-0"
                                alt="icon">
                            <input type="text"
                                class="appearance-none w-full placeholder:text-custom-grey font-semibold focus:outline-none"
                                placeholder="Search any products" v-model="searchQuery">
                        </label>
                    </form>
                    <div class="flex items-center gap-3 shrink-0">
                        <a href="#">
                            <div
                                class="flex size-14 rounded-full bg-custom-icon-background items-center justify-center overflow-hidden">
                                <img src="@/assets/images/icons/notification-black.svg" class="size-6" alt="icon">
                            </div>
                        </a>
                        <RouterLink :to="{ name: 'app.wishlist' }" class="relative">
                            <div
                                class="flex size-14 rounded-full bg-custom-icon-background items-center justify-center overflow-hidden">
                                <img :src="wishlistStore.totalItems > 0 ? heartRedIcon : heartGreyIcon" class="size-6" alt="icon">
                            </div>
                            <span v-if="wishlistStore.totalItems > 0" 
                                  style="position: absolute; top: -4px; right: -4px; background-color: #ef4444; color: white; font-size: 10px; font-weight: 700; border-radius: 9999px; min-width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: 2px solid white; padding: 0 4px;">
                                {{ wishlistStore.totalItems }}
                            </span>
                        </RouterLink>
                        <RouterLink :to="{ name: 'app.cart' }" class="relative">
                            <div
                                class="flex size-14 rounded-full bg-custom-icon-background items-center justify-center overflow-hidden">
                                <img src="@/assets/images/icons/shopping-cart-black.svg" class="size-6" alt="icon">
                            </div>
                            <span v-if="cartStore.totalItems > 0" 
                                  style="position: absolute; top: -4px; right: -4px; background-color: #2563eb; color: white; font-size: 10px; font-weight: 700; border-radius: 9999px; min-width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: 2px solid white; padding: 0 4px;">
                                {{ cartStore.totalItems }}
                            </span>
                        </RouterLink>
                        <RouterLink :to="{ name: 'auth.login' }"
                            class="flex shrink-0 h-14 rounded-[18px] py-4 px-8 bg-custom-blue" v-if="!user">
                            <p class="font-medium text-white">Sign In/Register</p>
                        </RouterLink>
                        <div v-else-if="!user && token" class="flex size-14 rounded-full bg-custom-icon-background items-center justify-center overflow-hidden animate-pulse">
                            <div class="size-full bg-neutral-200"></div>
                        </div>
                        <div class="relative" v-if="user">
                            <button id="Profile-Button" @click="showDropdownProfile = !showDropdownProfile"
                                class="flex size-14 rounded-full bg-custom-icon-background items-center justify-center overflow-hidden">
                                <img :src="user.profile_picture" class="size-full" alt="icon">
                            </button>
                            <div id="Profile-Dropdown" class="absolute transform top-[calc(100%+12px)] right-0 z-30"
                                v-if="showDropdownProfile">
                                <nav
                                    class="flex flex-col w-[201px] rounded-[20px] rounded-tr-none py-6 px-4 gap-[18px] bg-white shadow-[0px_6px_30px_0px_#00000017]">
                                    <RouterLink :to="{ name: 'admin.dashboard' }"
                                        class="flex w-full items-center justify-between">
                                        <span class="font-medium text-custom-grey">Dashboard</span>
                                        <img src="@/assets/images/icons/profile-circle-grey.svg"
                                            class="flex size-6 shrink-0" alt="icon">
                                    </RouterLink>
                                    <RouterLink :to="{ name: 'admin.my-transaction' }"
                                        class="flex w-full items-center justify-between">
                                        <span class="font-medium text-custom-grey">My Transactions</span>
                                        <img src="@/assets/images/icons/stickynote-grey.svg"
                                            class="flex size-6 shrink-0" alt="icon">
                                    </RouterLink>
                                    <a href="#" class="flex w-full items-center justify-between">
                                        <span class="font-medium text-custom-grey">Settings</span>
                                        <img src="@/assets/images/icons/setting-2-grey.svg" class="flex size-6 shrink-0"
                                            alt="icon">
                                    </a>
                                    <hr class="border-custom-stroke">
                                    <a @click="logout" class="flex w-full items-center justify-between">
                                        <span class="font-medium text-custom-grey text-custom-red">Log Out</span>
                                        <img src="@/assets/images/icons/logout.svg" class="flex size-6 shrink-0"
                                            alt="icon">
                                    </a>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-8 flex-wrap">
                    <a href="main.html" class="group flex items-center gap-2 active">
                        <img src="@/assets/images/icons/home-blue-fill.svg"
                            class="hidden size-6 shrink-0 group-[&.active]:flex" alt="icon">
                        <img src="@/assets/images/icons/home-grey.svg"
                            class="flex size-6 shrink-0 group-[&.active]:hidden" alt="icon">
                        <span class="font-semibold text-custom-grey group-[&.active]:text-custom-blue">Homepage</span>
                    </a>
                    <a href="#" class="group flex items-center gap-2">
                        <img src="@/assets/images/icons/flash-grey.svg" class="flex size-6 shrink-0" alt="icon">
                        <span class="font-semibold text-custom-grey">Flash Deals</span>
                    </a>
                    <a href="#" class="group flex items-center gap-2">
                        <img src="@/assets/images/icons/box-search-grey.svg" class="flex size-6 shrink-0" alt="icon">
                        <span class="font-semibold text-custom-grey">Track Order</span>
                    </a>
                    <a href="#" class="group flex items-center gap-2">
                        <img src="@/assets/images/icons/note-grey.svg" class="flex size-6 shrink-0" alt="icon">
                        <span class="font-semibold text-custom-grey">Return & Refund</span>
                    </a>
                    <a href="#" class="group flex items-center gap-2">
                        <img src="@/assets/images/icons/car-delivery-grey.svg" class="flex size-6 shrink-0" alt="icon">
                        <span class="font-semibold text-custom-grey">Shipping Info</span>
                    </a>
                    <a href="#" class="group flex items-center gap-2">
                        <img src="@/assets/images/icons/buildings-grey.svg" class="flex size-6 shrink-0" alt="icon">
                        <span class="font-semibold text-custom-grey">About Us</span>
                    </a>
                    <a href="#" class="group flex items-center gap-2">
                        <img src="@/assets/images/icons/callcenter-grey.svg" class="flex size-6 shrink-0" alt="icon">
                        <span class="font-semibold text-custom-grey">Customer Services</span>
                    </a>
                </div>
            </div>
        </div>
    </section>
</template>