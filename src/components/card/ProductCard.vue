<script setup>
import { formatRupiah } from '@/helpers/format';
import { useWishlistStore } from '@/stores/wishlist';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import _ from 'lodash'

const props = defineProps({
    item: {
        type: Object,
        required: true
    }
})

const wishlistStore = useWishlistStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const toastStore = useToastStore()
const router = useRouter()

const isOutOfStock = computed(() => {
    return !props.item || props.item.stock <= 0
})

const isFavorited = computed(() => {
    return wishlistStore.isWishlisted(props.item.id)
})

const handleToggleWishlist = () => {
    if (!authStore.token) {
        router.push({ name: 'auth.login' })
        return
    }
    const added = wishlistStore.toggleWishlist(props.item)
    if (added) {
        toastStore.showToast(`"${props.item.name}" telah ditambahkan ke daftar Wishlist!`)
    } else {
        toastStore.showToast(`"${props.item.name}" dihapus dari daftar Wishlist!`)
    }
}

const handleAddToCart = () => {
    if (isOutOfStock.value) return
    if (!authStore.token) {
        router.push({ name: 'auth.login' })
        return
    }
    cartStore.addToCart({
        ...props.item,
        quantity: 1
    })
    toastStore.showToast(`"${props.item.name}" telah ditambahkan ke keranjang belanja!`)
}
</script>

<template>
    <div class="card flex flex-col rounded-t-[20px] overflow-hidden">
        <RouterLink :to="{ name: 'app.product-detail', params: { slug: item.slug } }">
            <div class="thumbnail w-full h-[192px] overflow-hidden bg-custom-background items-center justify-center">
                <img :src="item?.product_images?.find(image => image.is_thumbnail)?.image"
                     class="size-full object-contain" alt="thumbnail">
            </div>
        </RouterLink>
        <div
            class="flex flex-col rounded-b-[20px] overflow-hidden border border-custom-stroke border-t-0 p-5 gap-6 bg-white">
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-3">
                    <div class="rounded-[4px] p-2 bg-custom-blue/10 flex items-center justify-center">
                        <span class="font-bold text-custom-blue">
                            {{ _.truncate(item?.product_category?.name, { length: 12 }) }}
                        </span>
                    </div>
                    <p class="font-semibold text-custom-red">{{ item.sold_count ?? 0 }} Sold</p>
                </div>
                <div class="flex flex-col gap-1 w-full min-w-0 overflow-hidden">
                    <RouterLink :to="{ name: 'app.product-detail', params: { slug: item.slug } }">
                        <p class="font-bold text-xl w-full truncate">{{ item?.name }}</p>
                    </RouterLink>
                    <p class="font-bold text-xl text-custom-blue">Rp {{ formatRupiah(item?.price) }}</p>
                </div>
            </div>
            <div class="flex items-center gap-3 w-full">
                <button @click.prevent="handleToggleWishlist" type="button"
                    class="group flex items-center justify-center size-14 shrink-0 rounded-2xl p-4 gap-2 transition-300"
                    :class="isFavorited ? 'bg-custom-red' : 'bg-custom-red/10 hover:bg-custom-red'">
                    <div class="relative size-6">
                        <img src="@/assets/images/icons/heart-red.svg"
                            class="absolute flex size-6 shrink-0 transition-300"
                            :class="isFavorited ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'"
                            alt="icon">
                        <img src="@/assets/images/icons/heart-white-fill.svg"
                            class="absolute flex size-6 shrink-0 transition-300"
                            :class="isFavorited ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
                            alt="icon">
                    </div>
                </button>
                <button type="button" @click.prevent="handleAddToCart" :disabled="isOutOfStock" class="group flex items-center justify-center h-14 w-full rounded-2xl p-4 gap-[6px] transition-300"
                    :class="isOutOfStock ? 'bg-gray-100 text-custom-grey cursor-not-allowed opacity-50' : 'bg-custom-blue/10 hover:bg-custom-blue'">
                    <div class="flex size-6 shrink-0 relative" v-if="!isOutOfStock">
                        <img src="@/assets/images/icons/shopping-cart-blue.svg"
                            class="absolute flex size-6 shrink-0 opacity-100 group-hover:opacity-0 transition-300"
                            alt="icon">
                        <img src="@/assets/images/icons/shopping-cart-white.svg"
                            class="absolute flex size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-300"
                            alt="icon">
                    </div>
                    <div class="flex size-6 shrink-0 relative" v-else>
                        <img src="@/assets/images/icons/shopping-cart-grey.svg"
                            class="absolute flex size-6 shrink-0 opacity-100 transition-300"
                            alt="icon">
                    </div>
                    <span :class="isOutOfStock ? 'font-semibold text-custom-grey' : 'font-semibold text-custom-blue group-hover:text-white transition-300'">
                        {{ isOutOfStock ? 'Stok Habis' : 'Add to Cart' }}
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>