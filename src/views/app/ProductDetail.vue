<script setup>
import ProductCard from '@/components/card/ProductCard.vue';
import { formatRupiah, formatToClientTimezone } from '@/helpers/format';
import StarActive from '@/assets/images/icons/Star-pointy.svg'
import StarOutline from '@/assets/images/icons/Star-pointy-outline.svg'
import PhotoProfileDefault from '@/assets/images/icons/photo-profile-default.svg'
import heartGreyIcon from '@/assets/images/icons/heart-grey.svg'
import heartRedIcon from '@/assets/images/icons/heart-red.svg'
import { useProductStore } from '@/stores/product';
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useWishlistStore } from '@/stores/wishlist'
import { useToastStore } from '@/stores/toast'
import { storeToRefs } from 'pinia';
import { ref, computed } from 'vue';
import { watch } from 'vue';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()

const product = ref({})
const activeImage = ref()

const productStore = useProductStore()
const { products, loading } = storeToRefs(productStore)
const { fetchProductBySlug, fetchProducts } = productStore

const cart = useCartStore()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()
const toastStore = useToastStore()
const quantity = ref(1)

const checkUserAuth = () => {
    if (!authStore.token) {
        router.push({ name: 'auth.login' })
        return false
    }
    return true
}

const currentPage = ref(1)
const reviewsPerPage = 4

const paginatedReviews = computed(() => {
    if (!product.value?.product_reviews) return []
    const start = (currentPage.value - 1) * reviewsPerPage
    const end = start + reviewsPerPage
    return product.value.product_reviews.slice(start, end)
})

const totalPages = computed(() => {
    if (!product.value?.product_reviews) return 0
    return Math.ceil(product.value.product_reviews.length / reviewsPerPage)
})

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

const fetchProduct = async () => {
    const response = await fetchProductBySlug(route.params.slug)

    if (response) {
        product.value = response

        if (product.value.product_images) {
            product.value.product_images.sort((a, b) => {
                return (b.is_thumbnail === true) - (a.is_thumbnail === true)
            })

            activeImage.value = product.value.product_images.find(img => img.is_thumbnail)
        }
    }
}

function setActiveImage(image) {
    activeImage.value = image
}

const increase = () => {
    if (quantity.value < product.value.stock) {
        quantity.value++
    }
}

const decrease = () => {
    if (quantity.value > 1) {
        quantity.value--
    }
}

const addToCart = () => {
    if (!checkUserAuth()) return
    if (!product.value) return
    cart.addToCart({
        ...product.value,
        quantity: quantity.value
    })
    toastStore.showToast(`"${product.value.name}" telah ditambahkan ke keranjang belanja!`)
}

const buyNow = () => {
    if (!checkUserAuth()) return
    if (!product.value || !product.value.store) return
    cart.addToCart({
        ...product.value,
        quantity: quantity.value
    })
    cart.selectedStores.clear()
    cart.selectedStores.add(product.value.store.id)
    cart.saveSelectedStores()
    router.push({ name: 'app.checkout' })
}

const isFavorited = computed(() => {
    return product.value && wishlistStore.isWishlisted(product.value.id)
})

const toggleFavorite = () => {
    if (!checkUserAuth()) return
    if (!product.value) return
    
    const added = wishlistStore.toggleWishlist(product.value)
    if (added) {
        toastStore.showToast(`"${product.value.name}" telah ditambahkan ke daftar Wishlist!`)
    } else {
        toastStore.showToast(`"${product.value.name}" dihapus dari daftar Wishlist!`)
    }
}

onMounted(() => {
    fetchProduct()
    fetchProducts({
        limit: 4,
        random: true
    })
})

watch(
    () => route.params.slug,
    () => {
        currentPage.value = 1
        fetchProduct()
        fetchProducts({
            limit: 4,
            random: true
        })
    }
)
</script>

<template>
    <header class="w-full max-w-[1920px] mx-auto overflow-hidden bg-custom-background">
        <div class="flex flex-col w-full max-w-[1280px] py-6 px-[52px] gap-3 mx-auto">
            <div class="flex items-center gap-3">
                <RouterLink :to="{ name: 'app.home' }"
                    class="font-medium text-lg text-custom-grey last:font-semibold last:text-custom-blue">
                    Homepage
                </RouterLink>
                <span class="font-medium text-xl text-custom-grey">/</span>
                <RouterLink :to="{ name: 'app.browse-category', params: { slug: product?.product_category?.slug || 'unknown' } }"
                    class="font-medium text-lg text-custom-grey last:font-semibold last:text-custom-blue">
                    {{ product?.product_category?.name }}
                </RouterLink>
                <span class="font-medium text-xl text-custom-grey">/</span>
                <a href="#" class="font-medium text-lg text-custom-grey last:font-semibold last:text-custom-blue">
                    Product Details
                </a>
            </div>
        </div>
    </header>
    <main class="flex flex-col gap-[52px] w-full max-w-[1280px] px-[52px] mt-8 mb-[100px] mx-auto">
        <div class="flex gap-[72px] flex-1">
            <div class="flex flex-col w-full gap-[52px]">
                <div id="Gallery" class="flex flex-col gap-3">
                    <div id="Main-Thumbnail"
                        class="flex w-full h-[365px] bg-custom-background rounded-2xl items-center justify-center overflow-hidden">
                        <img :src="activeImage?.image" class="size-full object-contain" alt="thumbnail">
                    </div>
                    <div class="grid grid-cols-4 gap-3">
                        <button
                            class="thumbnail-selector flex items-center justify-center rounded-2xl bg-custom-background overflow-hidden h-[124px] border-2 border-custom-background hover:border-custom-blue transition-300 [&.active]:border-custom-blue"
                            v-for="image in product?.product_images"
                            :class="{ 'active': image.image === activeImage?.image }" @click="setActiveImage(image)">
                            <img :src="image.image" class="size-full object-contain" alt="thumbnail">
                        </button>
                    </div>
                </div>
                <div id="Store"
                    class="flex items-center justify-between rounded-3xl border border-custom-stroke p-5 gap-4">
                    <div class="flex items-center w-full gap-5">
                        <div class="flex items-center gap-[14px] w-full min-w-0">
                            <div class="flex size-[86px] shrink-0 rounded-full bg-custom-background overflow-hidden">
                                <img :src="product?.store?.logo" class="size-full object-cover" alt="photo">
                            </div>
                            <div class="flex flex-col gap-[6px] w-full overflow-hidden">
                                <div class="flex items-center gap-[6px] w-full overflow-hidden">
                                    <p class="font-bold text-lg leading-tight">
                                        {{ product?.store?.name }}
                                    </p>
                                    <img src="@/assets/images/icons/verify-star.svg" class="flex size-6 shrink-0"
                                        alt="icon">
                                </div>
                                <p class="flex items-center gap-1 font-semibold text-custom-grey leading-none">
                                    <img src="@/assets/images/icons/box-grey.svg" class="size-5" alt="icon">
                                    {{ product?.store?.product_count }} Total Products
                                </p>
                            </div>
                        </div>
                        <RouterLink :to="{ name: 'app.store-detail', params: { id: product?.store?.id || '' } }"
                            class="font-semibold text-lg text-custom-blue text-nowrap hover:underline"
                            v-if="product?.store">
                            Visit Store
                        </RouterLink>
                    </div>
                </div>
                <div id="Descriptions" class="group flex flex-col">
                    <p class="font-bold text-lg">Product About</p>
                    <article id="Product-Descriptions"
                        class="mt-3 overflow-y-hidden h-fit max-h-[390px] group-has-[:checked]:max-h-fit"
                        v-html="product?.description">
                    </article>
                    <label>
                        <span
                            class="font-bold text-lg text-custom-blue after:content-['Read_More'] group-has-[:checked]:after:content-['See_Lees']"></span>
                        <input type="checkbox" class="hidden">
                    </label>
                </div>
                <div id="Promo-Card" class="flex gap-5 overflow-hidden">
                    <a href="#" class="overflow-hidden">
                        <img src="@/assets/images/thumbnails/promo-potrait-1.png" class="size-full object-contain"
                            alt="promo">
                    </a>
                    <a href="#" class="overflow-hidden">
                        <img src="@/assets/images/thumbnails/promo-potrait-2.png" class="size-full object-contain"
                            alt="promo">
                    </a>
                </div>
                <div id="Testimony" class="flex flex-col gap-6">
                    <p class="font-bold text-lg">Product Reviews</p>
                    <div class="grid grid-cols-2 gap-4" v-if="paginatedReviews && paginatedReviews.length > 0">
                        <div class="flex flex-col w-full rounded-[20px] border border-custom-stroke p-5 gap-4"
                             v-for="review in paginatedReviews" :key="review.id">
                            <div class="flex items-center gap-[10px]">
                                <div class="flex size-16 rounded-full overflow-hidden bg-custom-background border border-custom-stroke shrink-0">
                                    <img :src="review.buyer?.profile_picture || PhotoProfileDefault" class="size-full object-cover"
                                        alt="photo" @error="(e) => e.target.src = PhotoProfileDefault">
                                </div>
                                <div class="flex flex-col items-start gap-[2px]">
                                    <p class="font-bold text-lg leading-tight">{{ review.buyer?.name || 'Pembeli' }}</p>
                                    <p class="font-medium text-sm text-custom-grey">{{ formatToClientTimezone(review.created_at) }}</p>
                                </div>
                            </div>
                            <p class="font-semibold text-left">“{{ review.review || 'Tidak ada ulasan tertulis.' }}”</p>
                            <div class="flex items-center gap-0.5">
                                <img v-for="n in 5" :key="n"
                                     :src="n <= review.rating ? StarActive : StarOutline" 
                                     class="size-[22px] p-0.5" 
                                     alt="star">
                            </div>
                            <div v-if="review.photo" class="mt-2 w-32 h-32 rounded-2xl overflow-hidden border border-custom-stroke bg-white shrink-0">
                                <img :src="review.photo" class="size-full object-cover" alt="review photo">
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-center justify-center p-8 text-center text-custom-grey border border-custom-stroke rounded-[20px]" v-else>
                        <img src="@/assets/images/icons/note-remove-grey.svg" class="size-12 mb-2 opacity-50" alt="icon">
                        <p class="font-semibold text-sm">Belum ada ulasan untuk produk ini</p>
                    </div>
                    <div id="Pagination" class="flex items-center gap-6" v-if="totalPages > 1">
                        <button @click="prevPage" :disabled="currentPage === 1"
                            class="flex items-center justify-center size-14 rounded-full border border-custom-stroke disabled:opacity-40 disabled:cursor-not-allowed">
                            <img src="@/assets/images/icons/arrow-right-black.svg" class="size-6 rotate-180" alt="icon">
                        </button>
                        <div class="flex items-center gap-2">
                            <button v-for="page in totalPages" :key="page" @click="currentPage = page"
                                class="w-[42px] h-1 rounded-full transition-300"
                                :class="page === currentPage ? 'bg-custom-blue' : 'bg-custom-stroke'"></button>
                        </div>
                        <button @click="nextPage" :disabled="currentPage === totalPages"
                            class="flex items-center justify-center size-14 rounded-full border border-custom-stroke disabled:opacity-40 disabled:cursor-not-allowed">
                            <img src="@/assets/images/icons/arrow-right-black.svg" class="size-6" alt="icon">
                        </button>
                    </div>
                </div>
            </div>
            <div class="relative flex w-[504px] shrink-0">
                <div class="w-full">
                    <div class="sticky top-[200px] flex flex-col gap-6">
                        <div class="flex flex-col gap-3">
                            <h1 class="font-extrabold text-[32px]">{{ product?.name }}</h1>
                            <div class="flex items-center gap-3">
                                <div class="rounded-[4px] p-2 bg-custom-blue/10 flex items-center justify-center">
                                    <span class="font-bold text-custom-blue text-lg">
                                        {{ product?.product_category?.name }}
                                    </span>
                                </div>
                                <p class="flex items-center gap-[6px]">
                                    <img src="@/assets/images/icons/Star-rounded.svg" class="flex size-6 p-0.5 shrink-0"
                                        alt="star">
                                    <span class="font-bold text-lg">5</span>
                                    <span class="font-semibold text-lg text-custom-grey text-nowrap">({{
                                        product?.product_reviews?.length }})</span>
                                </p>
                            </div>
                        </div>
                        <div class="flex flex-col rounded-xl border border-custom-stroke p-5 gap-4">
                            <div class="flex items-center justify-between">
                                <p class="font-semibold text-lg text-custom-grey">Condition:</p>
                                <p class="font-bold text-lg">{{ product?.condition }}</p>
                            </div>
                            <hr class="border-custom-stroke">
                            <div class="flex items-center justify-between">
                                <p class="font-semibold text-lg text-custom-grey">Weight:</p>
                                <p class="font-bold text-lg">{{ product?.weight }} KG</p>
                            </div>
                            <hr class="border-custom-stroke">
                            <div class="flex items-center justify-between">
                                <p class="font-semibold text-lg text-custom-grey">Warranty:</p>
                                <p class="font-bold text-lg">24 Month</p>
                            </div>
                            <hr class="border-custom-stroke">
                            <div class="flex items-center justify-between">
                                <p class="font-semibold text-lg text-custom-grey">Order Status:</p>
                                <p class="font-bold text-lg">Ready to Ship</p>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex flex-col gap-[6px]">
                                <p class="flex items-center gap-1 font-semibold text-custom-grey leading-none">
                                    <img src="@/assets/images/icons/shopping-cart-grey.svg" class="size-5" alt="icon">
                                    Subtotal
                                </p>
                                <p class="font-bold text-2xl text-custom-blue leading-none">Rp {{
                                    formatRupiah(product?.price) }}</p>
                            </div>
                            <div
                                class="quantity-container flex items-center shrink-0 rounded-2xl border border-custom-stroke p-4">
                                <button type="button" class="subtract size-5 flex items-center justify-center"
                                    @click="decrease">
                                    <span class="text-[30px] font-light leading-none align-middle mb-1">-</span>
                                </button>
                                <div class="h-[18px] border border-custom-stroke ml-4"></div>
                                <input type="number" name="" value="1"
                                    class="amount appearance-none w-[70px] pl-5 text-center font-bold text-lg"
                                    v-model="quantity">
                                <div class="h-[18px] border border-custom-stroke mr-4"></div>
                                <button type="button" class="add size-5 flex items-center justify-center"
                                    @click="increase">
                                    <span class="text-[24px] font-light leading-none align-middle mb-1">+</span>
                                </button>
                            </div>
                        </div>
                        <div class="flex flex-col gap-4">
                            <div class="flex items-center gap-3 w-full">
                                <button type="button" @click.prevent="toggleFavorite"
                                    class="flex items-center justify-center size-16 shrink-0 rounded-2xl border transition-300"
                                    :class="isFavorited ? 'border-custom-red bg-custom-red/5' : 'border-custom-stroke hover:bg-custom-red/5'">
                                    <img :src="isFavorited ? heartRedIcon : heartGreyIcon" class="flex size-6 shrink-0"
                                        alt="icon">
                                </button>
                                <button type="button" @click.prevent="addToCart"
                                    class="flex items-center justify-center h-16 w-full rounded-2xl p-4 gap-2 border border-custom-blue hover:bg-custom-blue/5 transition-300">
                                    <img src="@/assets/images/icons/shopping-cart-blue.svg"
                                        class="flex size-6 shrink-0" alt="icon">
                                    <span class="font-bold text-custom-blue">Add to Cart</span>
                                </button>
                                <button type="button" @click.prevent="buyNow"
                                    class="flex items-center justify-center h-16 w-full rounded-2xl p-4 gap-2 bg-custom-blue hover:bg-custom-blue/90 transition-300">
                                    <span class="font-bold text-white">Buy Now</span>
                                </button>
                            </div>
                            <p class="flex items-center gap-1 font-semibold text-custom-red text-lg leading-none">
                                <img src="@/assets/images/icons/bag-tick-red.svg" class="size-5" alt="icon">
                                {{ product?.sold_count ?? 0 }} Units Sold
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <section id="Top-Picks" class="flex flex-col gap-9">
            <div class="flex items-center justify-between">
                <h2 class="font-extrabold text-[32px]">Shop Quality Picks<br>from Top Sellers</h2>
                <a href="#" class="flex items-center h-14 rounded-[18px] py-4 px-6 gap-[10px] bg-custom-black">
                    <span class="font-medium text-white">VIEW ALL</span>
                    <img src="@/assets/images/icons/arrow-right-white.svg" class="flex size-6 shrink-0" alt="icon">
                </a>
            </div>
            <div class="grid grid-cols-4 gap-6">
                <ProductCard v-for="product in products" :key="product.id" :item="product" v-if="!loading" />
            </div>
        </section>
    </main>
</template>