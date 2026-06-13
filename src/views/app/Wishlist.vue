<script setup>
import { formatRupiah } from '@/helpers/format';
import { useWishlistStore } from '@/stores/wishlist';
import { useCartStore } from '@/stores/cart';
import { useToastStore } from '@/stores/toast';
import { storeToRefs } from 'pinia';

const wishlistStore = useWishlistStore()
const { items } = storeToRefs(wishlistStore)
const { removeFromWishlist } = wishlistStore

const cart = useCartStore()
const toastStore = useToastStore()

const handleAddToCart = (product) => {
    cart.addToCart({
        ...product,
        quantity: 1
    })
    toastStore.showToast(`"${product.name}" telah ditambahkan ke keranjang belanja!`)
}
</script>

<template>
    <div class="flex flex-col gap-6 w-full max-w-[1280px] px-[52px] mx-auto min-h-[500px]">
        <h1 class="font-bold text-[32px]">My Wishlist</h1>
        <div class="flex gap-5 w-full">
            <section id="Wishlist-Container" class="flex flex-col gap-5 w-full min-w-0">
                <!-- Empty State -->
                <div id="Empty-Wishlist-State"
                    class="flex flex-col flex-1 items-center justify-center rounded-[20px] bg-white gap-9 py-20 border border-custom-stroke"
                    v-if="items.length === 0">
                    <img src="@/assets/images/icons/heart-grey.svg" class="size-16 opacity-40" alt="icon">
                    <div class="text-center">
                        <p class="font-bold text-2xl">Oops! Your wishlist is empty.</p>
                        <p class="font-semibold text-custom-grey mt-2">Find something you love and save it here!</p>
                    </div>
                    <RouterLink :to="{ name: 'app.home' }"
                        class="flex items-center justify-center h-14 w-fit rounded-2xl p-4 px-6 gap-2 bg-custom-blue">
                        <span class="font-bold text-white">Find Products</span>
                        <img src="@/assets/images/icons/arrow-right-circle-white-thick.svg" class="flex size-6 shrink-0"
                            alt="icon">
                    </RouterLink>
                </div>

                <!-- Wishlist Items List -->
                <div v-else class="grid grid-cols-1 gap-4 w-full">
                    <div class="flex flex-col w-full rounded-[20px] p-5 bg-white border border-custom-stroke" v-for="product in items" :key="product.id">
                        <div class="flex items-center gap-[20px] overflow-hidden">
                            <!-- Image -->
                            <div class="flex size-[92px] shrink-0 rounded-2xl bg-custom-background overflow-hidden items-center justify-center">
                                <img :src="product.product_images?.find(i => i.is_thumbnail)?.image"
                                    class="size-full object-contain" alt="icon">
                            </div>
                            <!-- Details -->
                            <div class="flex flex-col flex-1 gap-[6px] overflow-hidden text-left">
                                <RouterLink :to="{ name: 'app.product-detail', params: { slug: product.slug } }">
                                    <p class="font-bold text-lg truncate hover:text-custom-blue transition-300">{{ product.name }}</p>
                                </RouterLink>
                                <p class="font-semibold leading-none text-custom-grey flex items-center gap-[6px]">
                                    <span class="font-bold text-custom-blue">{{ product.product_category?.name }}</span>
                                    <span class="text-[22px] leading-none">•</span>
                                    <span>{{ product.weight }} KG</span>
                                </p>
                                <p class="font-bold text-lg text-custom-blue mt-1">Rp {{ formatRupiah(product.price) }}</p>
                            </div>
                            <!-- Actions -->
                            <div class="flex items-center gap-3">
                                <button type="button" @click="handleAddToCart(product)"
                                    class="flex items-center justify-center h-12 rounded-xl px-5 gap-2 bg-custom-blue text-white font-semibold hover:bg-custom-blue/90 transition-300">
                                    <img src="@/assets/images/icons/shopping-cart-white.svg" class="size-5 shrink-0" alt="icon">
                                    <span>Add to Cart</span>
                                </button>
                                <button type="button" @click="removeFromWishlist(product.id)"
                                    class="flex items-center justify-center size-12 rounded-xl bg-custom-red/10 hover:bg-custom-red/20 transition-300">
                                    <img src="@/assets/images/icons/trash-red.svg" class="size-5 shrink-0" alt="icon">
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>
