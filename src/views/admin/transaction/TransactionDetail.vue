<script setup>
import Placeholder from '@/assets/images/icons/gallery-grey.svg'
import DeliveringPlaceholder from '@/assets/images/thumbnails/delivering.svg'
import Alert from '@/components/admin/Alert.vue';
import { formatRupiah, formatToClientTimezone } from '@/helpers/format';
import { useTransactionStore } from '@/stores/transaction';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import StarActive from '@/assets/images/icons/Star-pointy.svg'
import StarOutline from '@/assets/images/icons/Star-pointy-outline.svg'

const route = useRoute()

const transaction = ref({})
const showProducts = ref(true)

const transactionStore = useTransactionStore()
const { loading, success, error } = storeToRefs(transactionStore)
const { fetchTransactionById, updateTransaction } = transactionStore

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const notificationStore = useNotificationStore()

const reviewsData = ref({})

const isProductReviewed = (productId) => {
    if (!transaction.value?.product_reviews) return false
    return transaction.value.product_reviews.some(r => r.product_id === productId)
}

const getProductReview = (productId) => {
    if (!transaction.value?.product_reviews) return null
    return transaction.value.product_reviews.find(r => r.product_id === productId)
}

const triggerPhotoInput = (productId) => {
    document.getElementById(`photo-input-${productId}`).click()
}

const handlePhotoChange = (e, productId) => {
    const file = e.target.files[0]
    if (!file) return;

    if (reviewsData.value[productId]) {
        reviewsData.value[productId].photo = file
        reviewsData.value[productId].photoPreview = URL.createObjectURL(file)
    }
}

const removePhoto = (productId) => {
    if (reviewsData.value[productId]) {
        reviewsData.value[productId].photo = null
        if (reviewsData.value[productId].photoPreview) {
            URL.revokeObjectURL(reviewsData.value[productId].photoPreview)
            reviewsData.value[productId].photoPreview = null
        }
        // Clear input element
        const input = document.getElementById(`photo-input-${productId}`)
        if (input) input.value = ''
    }
}

const submitReview = async (productId) => {
    const data = reviewsData.value[productId]
    if (!data) return;

    try {
        const formData = new FormData()
        formData.append('transaction_id', transaction.value.id)
        formData.append('product_id', productId)
        formData.append('rating', data.rating)
        formData.append('review', data.review || '')
        
        if (data.photo) {
            formData.append('photo', data.photo)
        }

        await transactionStore.createProductReview(formData)
        fetchData()
    } catch (error) {
        console.error(error)
    }
}

const fetchData = async () => {
    const response = await fetchTransactionById(route.params.id)

    transaction.value = response
    transaction.value.delivery_proof_url = Placeholder

    if (response && response.transaction_details) {
        response.transaction_details.forEach(detail => {
            const prodId = detail.product?.id
            if (prodId && !reviewsData.value[prodId]) {
                reviewsData.value[prodId] = {
                    rating: 5,
                    review: '',
                    photo: null,
                    photoPreview: null
                }
            }
        })
    }
}

const handleUpdateData = async (updatePayload) => {
    await updateTransaction({
        id: transaction.value.id,
        ...updatePayload
    })

    fetchData()
    notificationStore.fetchUnreadCount()
}

const handleSimulatePayment = async () => {
    await transactionStore.simulatePayment(transaction.value.id)
    fetchData()
    notificationStore.fetchUnreadCount()
}

const handleAcceptOrder = () => {
    handleUpdateData({
        delivery_status: 'processing'
    })
}

const handleDeliverySubmit = () => {
    const payload = {
        delivery_status: 'delivering',
        tracking_number: transaction.value.tracking_number
    }
    if (transaction.value.delivery_proof instanceof File) {
        payload.delivery_proof = transaction.value.delivery_proof
    }
    handleUpdateData(payload)
}

const handleCompletedOrder = () => {
    handleUpdateData({
        delivery_status: 'completed'
    })
}

const handleImageChange = (e) => {
    const file = e.target.files[0]

    transaction.value.delivery_proof = file
    transaction.value.delivery_proof_url = URL.createObjectURL(file)
}


onMounted(fetchData)
</script>

<template>
    <div class="flex flex-1 gap-5">
        <div class="flex flex-col gap-5 w-full">
            <div class="relative w-full rounded-[20px] bg-custom-yellow overflow-hidden"
                v-if="transaction.delivery_status === 'pending'">
                <img src="@/assets/images/backgrounds/round-ornament.svg"
                    class="size-full object-contain object-right opacity-55 absolute" alt="icon">
                <div class="relative flex items-center min-h-[68px] gap-[10px] p-4">
                    <img src="@/assets/images/icons/timer-chocolate.svg" class="flex size-9 shrink-0" alt="icon">
                    <p class="font-bold text-lg text-[#544607]">Order pending. Kindly wait for review 🙌</p>
                </div>
            </div>
            <div class="relative w-full rounded-[20px] bg-custom-blue overflow-hidden"
                v-if="transaction.delivery_status === 'processing'">
                <img src="@/assets/images/backgrounds/round-ornament.svg"
                    class="size-full object-contain object-right opacity-55 absolute" alt="icon">
                <div class="relative flex items-center min-h-[68px] gap-[10px] p-4">
                    <img src="@/assets/images/icons/truck-time-white-fill.svg" class="flex size-9 shrink-0" alt="icon">
                    <p class="font-bold text-lg text-white" v-if="user?.role === 'store' || user?.role === 'admin'">Prepare the item for pickup by the courier</p>
                    <p class="font-bold text-lg text-white" v-else>Penjual sedang menyiapkan barang Anda 🙌</p>
                </div>
            </div>
            <div class="relative w-full rounded-[20px] bg-custom-orange overflow-hidden"
                v-if="transaction.delivery_status === 'delivering'">
                <img src="@/assets/images/backgrounds/round-ornament.svg"
                    class="size-full object-contain object-right opacity-55 absolute" alt="icon">
                <div class="relative flex items-center min-h-[68px] gap-[10px] p-4">
                    <img src="@/assets/images/icons/truck-time-white-fill.svg" class="flex size-9 shrink-0" alt="icon">
                    <p class="font-bold text-lg text-white">The order is heading to customer address</p>
                </div>
            </div>
            <div class="relative w-full rounded-[20px] bg-custom-green overflow-hidden"
                v-if="transaction.delivery_status === 'completed'">
                <img src="@/assets/images/backgrounds/round-ornament.svg"
                    class="size-full object-contain object-right opacity-55 absolute" alt="icon">
                <div class="relative flex items-center min-h-[68px] gap-[10px] p-4">
                    <img src="@/assets/images/icons/truck-time-white-fill.svg" class="flex size-9 shrink-0" alt="icon">
                    <p class="font-bold text-lg text-white">The order is arrived to customer address</p>
                </div>
            </div>
            <section class="flex flex-col w-full rounded-[20px] p-5 gap-5 bg-white">
                <p class="font-bold text-xl">Order Reviews</p>
                <div class="flex items-center gap-[14px] w-full min-w-0">
                    <div class="flex size-[92px] shrink-0 rounded-full bg-custom-background overflow-hidden">
                        <img :src="transaction?.store?.logo" class="size-full object-cover" alt="photo">
                    </div>
                    <div class="flex flex-col gap-[6px] w-full overflow-hidden">
                        <p class="font-bold text-[22px] leading-tight w-full truncate">
                            {{ transaction?.store?.name }}
                        </p>
                        <p class="flex items-center gap-1 font-semibold text-lg text-custom-grey leading-none">
                            <img src="@/assets/images/icons/user-grey.svg" class="size-5" alt="icon">
                            {{ transaction?.store?.user?.name }}
                        </p>
                    </div>
                </div>
                <div class="flex flex-col rounded-[20px] border border-custom-stroke p-4 gap-5">
                    <div class="flex items-center gap-[10px] w-[260px]">
                        <div
                            class="flex size-14 shrink-0 rounded-full bg-custom-icon-background overflow-hidden items-center justify-center">
                            <img src="@/assets/images/icons/shopping-cart-black.svg" class="flex size-6 shrink-0"
                                alt="icon">
                        </div>
                        <div class="flex flex-col gap-1">
                            <p class="font-bold text-lg leading-none">{{ transaction?.transaction_details?.length }}</p>
                            <p class="font-semibold text-custom-grey">Total Products</p>
                        </div>
                    </div>
                    <hr class="border-custom-stroke last:hidden">
                    <div class="flex items-center gap-[10px] w-[260px]">
                        <div
                            class="flex size-14 shrink-0 rounded-full bg-custom-icon-background overflow-hidden items-center justify-center">
                            <img src="@/assets/images/icons/box-black.svg" class="flex size-6 shrink-0" alt="icon">
                        </div>
                        <div class="flex flex-col gap-1">
                            <p class="font-bold text-lg leading-none">
                                {{transaction?.transaction_details?.reduce((total, detail) => total + detail.qty, 0)}}
                            </p>
                            <p class="font-semibold text-custom-grey">Total Quantity</p>
                        </div>
                    </div>
                    <hr class="border-custom-stroke last:hidden">
                    <div class="flex items-center gap-[10px] w-[260px]">
                        <div
                            class="flex size-14 shrink-0 rounded-full bg-custom-icon-background overflow-hidden items-center justify-center">
                            <img src="@/assets/images/icons/calendar-2-black.svg" class="flex size-6 shrink-0"
                                alt="icon">
                        </div>
                        <div class="flex flex-col gap-1">
                            <p class="font-bold text-lg leading-none">{{ formatToClientTimezone(transaction?.created_at)
                                }}</p>
                            <p class="font-semibold text-custom-grey">Date Transaction</p>
                        </div>
                    </div>
                    <hr class="border-custom-stroke last:hidden">
                </div>
            </section>
            <section class="flex flex-col w-full rounded-[20px] p-5 bg-white">
                <button @click="showProducts = !showProducts" class="flex justify-between w-full">
                    <div class="flex flex-col gap-2 text-left">
                        <p class="font-bold text-xl">Product Details</p>
                        <div class="flex items-center gap-1">
                            <img src="@/assets/images/icons/shopping-cart-grey.svg" class="flex size-6 shrink-0"
                                alt="icon">
                            <p class="font-semibold text-custom-grey">{{ transaction?.transaction_details?.length }}
                                Total Products</p>
                        </div>
                    </div>
                    <img src="@/assets/images/icons/arrow-circle-up.svg" class="size-6 flex shrink-0 transition-300"
                        :class="{ 'rotate-180': !showProducts }" alt="icon">
                </button>
                <div id="Products" class="flex flex-col gap-4 mt-5" v-show="showProducts">
                    <div class="card flex flex-col rounded-2xl border border-custom-stroke p-4 gap-5"
                        v-for="product in transaction?.transaction_details">
                        <div class="flex items-center w-full gap-5">
                            <div class="flex items-center gap-[14px] w-full min-w-0 overflow-hidden">
                                <div class="flex size-[92px] rounded-2xl bg-custom-background overflow-hidden shrink-0">
                                    <img :src="product?.product?.product_images?.find(image => image.is_thumbnail)?.image ?? Placeholder"
                                        class="size-full object-contain" alt="thumbnail">
                                </div>
                                <div class="flex flex-col gap-[6px] w-full overflow-hidden">
                                    <p class="font-bold text-lg leading-tight w-full ">
                                        {{ product?.product?.name }}
                                    </p>
                                    <p class="flex items-center gap-1 font-semibold text-custom-grey leading-none">
                                        <img src="@/assets/images/icons/bag-grey.svg" class="size-5" alt="icon">
                                        {{ product?.product?.product_category?.name }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex flex-col gap-2 shrink-0 text-right">
                                <p class="font-bold text-custom-blue">Rp {{ formatRupiah(product?.product?.price) }}</p>
                                <p class="font-semibold leading-none text-custom-grey">({{ product.qty }}x)</p>
                            </div>
                        </div>
                        <hr class="border-custom-stroke">
                        <div class="flex items-center justify-between">
                            <p class="flex items-center gap-1 font-semibold text-custom-grey leading-none">
                                <img src="@/assets/images/icons/shopping-cart-grey.svg" class="size-5" alt="icon">
                                Subtotal
                            </p>
                            <p class="font-bold text-lg text-custom-blue">Rp {{ formatRupiah(product.subtotal) }}</p>
                        </div>

                        <!-- Review Section for Completed Transaction -->
                        <div v-if="transaction.delivery_status === 'completed'" class="w-full">
                            <hr class="border-custom-stroke my-3">
                            
                            <!-- 1. Buyer: Form to Write Review -->
                             <div v-if="user?.role === 'buyer' && !isProductReviewed(product.product.id)" class="p-4 rounded-xl bg-custom-background border border-custom-stroke flex flex-col gap-3">
                                 <p class="font-bold text-sm text-custom-black text-left">Beri Ulasan Produk Ini</p>
                                 <div class="flex items-center gap-2">
                                     <span class="font-semibold text-xs text-custom-grey">Rating:</span>
                                     <div class="flex gap-1">
                                         <button v-for="n in 5" :key="n" @click="reviewsData[product.product.id] ? (reviewsData[product.product.id].rating = n) : null" type="button" class="focus:outline-none">
                                             <img :src="reviewsData[product.product.id] && n <= reviewsData[product.product.id].rating ? StarActive : StarOutline" class="size-6" alt="star">
                                         </button>
                                     </div>
                                 </div>
                                 <div class="flex flex-col gap-1 text-left">
                                     <span class="font-semibold text-xs text-custom-grey">Ulasan:</span>
                                     <textarea v-model="reviewsData[product.product.id].review" rows="2" class="w-full rounded-lg border border-custom-stroke p-2 text-sm focus:outline-none focus:border-custom-blue" placeholder="Bagikan pendapat Anda tentang produk ini..."></textarea>
                                 </div>
                                 <div class="flex flex-col gap-1.5 text-left">
                                     <span class="font-semibold text-xs text-custom-grey">Foto Produk (Opsional):</span>
                                     <div class="flex items-center gap-3">
                                         <input type="file" :id="'photo-input-' + product.product.id" accept="image/*" class="hidden" @change="(e) => handlePhotoChange(e, product.product.id)">
                                         <button type="button" @click="triggerPhotoInput(product.product.id)" class="flex items-center gap-2 rounded-xl border border-dashed border-custom-stroke p-3 text-xs font-semibold text-custom-grey hover:bg-gray-50 transition-300">
                                             <img src="@/assets/images/icons/gallery-add-photo.svg" class="size-5" alt="icon">
                                             <span>Pilih Foto</span>
                                         </button>
                                         <div v-if="reviewsData[product.product.id]?.photoPreview" class="relative size-14 rounded-xl overflow-hidden border border-custom-stroke bg-white">
                                             <img :src="reviewsData[product.product.id].photoPreview" class="size-full object-cover" alt="preview">
                                             <button type="button" @click="removePhoto(product.product.id)" class="absolute top-0 right-0 p-0.5 bg-custom-red/80 hover:bg-custom-red text-white rounded-bl-lg transition-300">
                                                 <img src="@/assets/images/icons/trash-white.svg" class="size-3.5" alt="trash">
                                             </button>
                                         </div>
                                     </div>
                                 </div>
                                 <button @click="submitReview(product.product.id)" class="w-full sm:w-fit self-end rounded-full px-6 py-3 bg-custom-blue text-white text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-300">
                                     Kirim Ulasan
                                 </button>
                             </div>
                             
                             <!-- 2. Buyer/Seller/Admin: Display Existing Review -->
                             <div v-else-if="isProductReviewed(product.product.id)" class="p-4 rounded-xl bg-custom-background border border-custom-stroke flex flex-col gap-2 text-left">
                                 <div class="flex items-center justify-between">
                                     <span class="font-bold text-sm text-custom-black">Ulasan Produk</span>
                                     <div class="flex gap-0.5">
                                         <img v-for="n in 5" :key="n" :src="n <= getProductReview(product.product.id).rating ? StarActive : StarOutline" class="size-5" alt="star">
                                     </div>
                                 </div>
                                 <p class="text-sm text-custom-grey italic">“{{ getProductReview(product.product.id).review || 'Tidak ada ulasan tertulis.' }}”</p>
                                 <div v-if="getProductReview(product.product.id)?.photo" class="mt-2 w-32 h-32 rounded-xl overflow-hidden border border-custom-stroke bg-white">
                                     <img :src="getProductReview(product.product.id).photo" class="size-full object-cover" alt="review photo">
                                 </div>
                             </div>
                            
                            <!-- 3. Seller/Admin: Show "No Review" yet -->
                            <div v-else class="p-4 rounded-xl bg-custom-background border border-custom-stroke text-center text-custom-grey text-xs">
                                Ulasan belum ditulis oleh pembeli.
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <div class="flex flex-col gap-5 w-[470px] shrink-0">
            <section class="flex flex-col w-full rounded-[20px] p-5 gap-5 bg-white">
                <p class="font-bold text-xl">Customer Details</p>
                <div class="flex items-center gap-[10px] w-full min-w-0">
                    <div class="flex size-[92px] shrink-0 rounded-full bg-custom-background overflow-hidden">
                        <img :src="transaction.buyer?.user?.profile_picture" class="size-full object-cover" alt="photo">
                    </div>
                    <div class="flex flex-col gap-[6px] w-full overflow-hidden">
                        <p class="font-bold text-[22px] leading-tight w-full truncate">
                            {{ transaction?.buyer?.user?.name }}
                        </p>
                        <p class="flex items-center gap-1 font-semibold text-lg text-custom-grey leading-none">
                            <img src="@/assets/images/icons/call-grey.svg" class="size-5" alt="icon">
                            {{ transaction?.buyer?.phone_number }}
                        </p>
                    </div>
                </div>
                <div class="flex flex-col rounded-[20px] border border-custom-stroke p-4 gap-5">
                    <div class="flex items-center gap-[10px] w-[260px]">
                        <div
                            class="flex size-14 shrink-0 rounded-full bg-custom-icon-background overflow-hidden items-center justify-center">
                            <img src="@/assets/images/icons/sms-black.svg" class="flex size-6 shrink-0" alt="icon">
                        </div>
                        <div class="flex flex-col gap-1">
                            <p class="font-bold text-lg leading-none">
                                {{ transaction?.buyer?.user?.email }}
                            </p>
                            <p class="font-semibold text-custom-grey">Email Address</p>
                        </div>
                    </div>
                    <hr class="border-custom-stroke last:hidden">
                    <div class="flex items-center gap-[10px] w-[260px]">
                        <div
                            class="flex size-14 shrink-0 rounded-full bg-custom-icon-background overflow-hidden items-center justify-center">
                            <img src="@/assets/images/icons/buildings-black.svg" class="flex size-6 shrink-0"
                                alt="icon">
                        </div>
                        <div class="flex flex-col gap-1">
                            <p class="font-bold text-lg leading-none">{{ transaction?.city }}</p>
                            <p class="font-semibold text-custom-grey">City Location</p>
                        </div>
                    </div>
                    <hr class="border-custom-stroke last:hidden">
                    <div class="flex items-center gap-[10px] w-[260px]">
                        <div
                            class="flex size-14 shrink-0 rounded-full bg-custom-icon-background overflow-hidden items-center justify-center">
                            <img src="@/assets/images/icons/routing-black.svg" class="flex size-6 shrink-0" alt="icon">
                        </div>
                        <div class="flex flex-col gap-1">
                            <p class="font-bold text-lg leading-none">{{ transaction?.address }}</p>
                            <p class="font-semibold text-custom-grey">Street Address</p>
                        </div>
                    </div>
                    <hr class="border-custom-stroke last:hidden">
                    <div class="flex items-center gap-[10px] w-[260px]">
                        <div
                            class="flex size-14 shrink-0 rounded-full bg-custom-icon-background overflow-hidden items-center justify-center">
                            <img src="@/assets/images/icons/keyboard-black.svg" class="flex size-6 shrink-0" alt="icon">
                        </div>
                        <div class="flex flex-col gap-1">
                            <p class="font-bold text-lg leading-none">{{ transaction?.postal_code }}</p>
                            <p class="font-semibold text-custom-grey">Post Code</p>
                        </div>
                    </div>
                    <hr class="border-custom-stroke last:hidden">
                </div>
            </section>
            <section class="flex flex-col w-full rounded-[20px] p-5 gap-5 bg-white">
                <p class="font-bold text-xl">Transaction Details</p>
                <div class="flex flex-col rounded-[20px] border border-custom-stroke p-4 gap-4">
                    <div class="flex items-center justify-between">
                        <p class="flex items-center gap-1 font-semibold text-lg text-custom-grey leading-none">
                            <img src="@/assets/images/icons/bag-grey.svg" class="size-6" alt="icon">
                            Subtotal
                        </p>
                        <p class="font-bold text-lg leading-none">
                            Rp {{formatRupiah(transaction?.transaction_details?.reduce((total, detail) => total +
                                detail.subtotal, 0))}}
                        </p>
                    </div>
                    <hr class="border-custom-stroke last:hidden">
                    <div class="flex items-center justify-between">
                        <p class="flex items-center gap-1 font-semibold text-lg text-custom-grey leading-none">
                            <img src="@/assets/images/icons/car-delivery-grey.svg" class="size-6" alt="icon">
                            Delivery Fee
                        </p>
                        <p class="font-bold text-lg leading-none">Rp {{ formatRupiah(transaction?.shipping_cost) }}</p>
                    </div>
                    <hr class="border-custom-stroke last:hidden">
                    <div class="flex items-center justify-between">
                        <p class="flex items-center gap-1 font-semibold text-lg text-custom-grey leading-none">
                            <img src="@/assets/images/icons/receipt-2-grey.svg" class="size-6" alt="icon">
                            PPN 11%
                        </p>
                        <p class="font-bold text-lg leading-none">Rp {{ formatRupiah(transaction?.tax) }}</p>
                    </div>
                    <hr class="border-custom-stroke last:hidden">
                    <div class="flex items-center justify-between">
                        <p class="flex items-center gap-1 font-semibold text-lg text-custom-grey leading-none">
                            <img src="@/assets/images/icons/discount-shape-grey.svg" class="size-6" alt="icon">
                            Discount
                        </p>
                        <p class="font-bold text-lg leading-none">Rp 0</p>
                    </div>
                    <hr class="border-custom-stroke last:hidden">
                    <div class="flex items-center justify-between">
                        <p class="flex items-center gap-1 font-semibold text-lg text-custom-grey leading-none">
                            <img src="@/assets/images/icons/money-grey.svg" class="size-6" alt="icon">
                            Grand Total
                        </p>
                        <p class="font-bold text-lg leading-none text-custom-blue">Rp
                            {{ formatRupiah(transaction?.grand_total) }}</p>
                    </div>
                    <hr class="border-custom-stroke last:hidden">
                    <div class="flex items-center justify-between">
                        <p class="flex items-center gap-1 font-semibold text-lg text-custom-grey leading-none">
                            <img src="@/assets/images/icons/money-grey.svg" class="size-6" alt="icon">
                            Payment Status
                        </p>
                        <div class="flex items-center gap-2">
                            <p class="font-bold text-lg leading-none text-custom-blue uppercase">
                                {{ transaction.payment_status }}
                            </p>
                            <button v-if="transaction.payment_status === 'unpaid'" @click="handleSimulatePayment"
                                class="rounded-lg px-3 py-1 bg-custom-green text-white font-semibold text-xs transition-300 hover:opacity-90 active:scale-95">
                                Simulasi Bayar
                            </button>
                        </div>
                    </div>
                    <hr class="border-custom-stroke last:hidden">
                </div>
            </section>
            <section class="flex flex-col w-full rounded-[20px] p-5 gap-5 bg-white"
                v-if="transaction?.delivery_status === 'pending'">
                <p class="font-bold text-xl">Order Status</p>
                <div class="grid grid-cols-3 relative min-h-[90px] w-full">
                    <div id="Progress-Bar"
                        class="absolute w-full top-[26px] h-3 rounded-full bg-custom-stroke overflow-hidden">
                        <div class="w-1/3 h-full bg-custom-lime-green"></div>
                    </div>
                    <div class="relative flex flex-col py-4 gap-[6px] items-center">
                        <div
                            class="flex size-8 shrink-0 rounded-full bg-custom-lime-green overflow-hidden items-center justify-center">
                            <span class="font-bold">1</span>
                        </div>
                        <p class="font-bold text-center">Book Review</p>
                    </div>
                    <div class="relative flex flex-col py-4 gap-[6px] items-center">
                        <div
                            class="flex size-8 shrink-0 rounded-full bg-custom-stroke overflow-hidden items-center justify-center">
                            <span class="font-bold">2</span>
                        </div>
                        <p class="font-bold text-center">Processing</p>
                    </div>
                    <div class="relative flex flex-col py-4 gap-[6px] items-center">
                        <div
                            class="flex size-8 shrink-0 rounded-full bg-custom-stroke overflow-hidden items-center justify-center">
                            <span class="font-bold">?</span>
                        </div>
                        <p class="font-bold text-center">2+ More</p>
                    </div>
                </div>
                <div class="flex items-center justify-between">
                    <p class="flex items-center gap-1 font-medium text-custom-grey leading-none">
                        <img src="@/assets/images/icons/car-delivery-moves-grey.svg" class="size-6" alt="icon">
                        Delivery Status
                    </p>
                    <p
                        class="badge rounded-full py-3 px-[18px] flex shrink-0 font-bold uppercase bg-custom-yellow text-[#544607]">
                        pending
                    </p>
                </div>
                <div class="flex flex-col text-center gap-4" v-if="transaction?.payment_status === 'paid' && (user?.role === 'store' || user?.role === 'admin')">
                    <button @click="handleAcceptOrder"
                        class="h-14 w-full rounded-full flex items-center justify-center py-4 px-6 bg-custom-blue disabled:bg-custom-stroke transition-300">
                        <span class="font-semibold text-lg text-white">Accept Order</span>
                    </button>
                    <div class="flex items-center justify-center gap-[6px]">
                        <p class="font-semibold text-custom-grey">Why can't I decline the order?</p>
                        <img src="@/assets/images/icons/info-circle-grey.svg" class="size-[18px]" alt="icon">
                    </div>
                </div>
            </section>
            <section class="flex flex-col w-full rounded-[20x] p-5 gap-5 bg-white"
                v-if="transaction?.delivery_status === 'processing'">
                <p class="font-bold text-xl">Order Status</p>
                <div class="grid grid-cols-3 relative min-h-[90px] w-full">
                    <div id="Progress-Bar"
                        class="absolute w-full top-[26px] h-3 rounded-full bg-custom-stroke overflow-hidden">
                        <div class="w-2/3 h-full bg-custom-lime-green"></div>
                    </div>
                    <div class="relative flex flex-col py-4 gap-[6px] items-center">
                        <div
                            class="flex size-8 shrink-0 rounded-full bg-custom-lime-green overflow-hidden items-center justify-center">
                            <span class="font-bold">1</span>
                        </div>
                        <p class="font-bold text-center">Book Review</p>
                    </div>
                    <div class="relative flex flex-col py-4 gap-[6px] items-center">
                        <div
                            class="flex size-8 shrink-0 rounded-full bg-custom-lime-green overflow-hidden items-center justify-center">
                            <span class="font-bold">2</span>
                        </div>
                        <p class="font-bold text-center">Processing</p>
                    </div>
                    <div class="relative flex flex-col py-4 gap-[6px] items-center">
                        <div
                            class="flex size-8 shrink-0 rounded-full bg-custom-stroke overflow-hidden items-center justify-center">
                            <span class="font-bold">?</span>
                        </div>
                        <p class="font-bold text-center">2+ More</p>
                    </div>
                </div>
                <div class="flex items-center justify-between">
                    <p class="flex items-center gap-1 font-medium text-custom-grey leading-none">
                        <img src="@/assets/images/icons/car-delivery-moves-grey.svg" class="size-6" alt="icon">
                        Delivery Status
                    </p>
                    <p
                        class="badge rounded-full py-3 px-[18px] flex shrink-0 font-bold uppercase bg-custom-blue/10 text-custom-blue">
                        processing
                    </p>
                </div>
                <div class="flex flex-col gap-5" v-if="user?.role === 'store' || user?.role === 'admin'">
                    <div class="flex items-center justify-between w-full">
                        <div
                            class="group relative flex size-[100px] rounded-2xl overflow-hidden items-center justify-center bg-custom-background">
                            <img id="Thumbnail" :src="transaction.delivery_proof_url"
                                data-default="@/assets/images/icons/gallery-default.svg" class="size-full object-contain"
                                alt="icon" />
                            <input type="file" id="File-Input" accept="image/*"
                                class="absolute inset-0 opacity-0 cursor-pointer" @change="handleImageChange" />
                        </div>
                        <button type="button" id="Add-Photo"
                            class="flex items-center justify-center rounded-2xl py-4 px-6 bg-custom-black text-white font-semibold text-lg">
                            Add Photo
                        </button>
                    </div>
                    <div class="flex flex-col gap-3">
                        <p class="font-semibold text-custom-grey">Tracking Number</p>
                        <div class="group/errorState flex flex-col gap-2">
                            <label class="group relative">
                                <div class="input-icon">
                                    <img src="@/assets/images/icons/barcode-grey.svg" class="flex size-6 shrink-0"
                                        alt="icon">
                                </div>
                                <p class="input-placeholder">
                                    Enter Tracking Number
                                </p>
                                <input type="number" id="Tracking" class="custom-input" placeholder=""
                                    v-model="transaction.tracking_number">
                            </label>
                            <span class="input-error">Lorem dolor error message here</span>
                        </div>
                    </div>
                    <button type="submit" id="Update-Status"
                        class="h-14 w-full rounded-full flex items-center justify-center py-4 px-6 bg-custom-blue disabled:bg-custom-stroke transition-300"
                        @click="handleDeliverySubmit">
                        <span class="font-semibold text-lg text-white">Update Status</span>
                    </button>
                </div>
            </section>
            <section class="flex flex-col w-full rounded-[20px] p-5 gap-5 bg-white"
                v-if="transaction?.delivery_status === 'delivering'">
                <p class="font-bold text-xl">Order Status</p>
                <div class="grid grid-cols-3 relative min-h-[90px] w-full">
                    <div id="Progress-Bar"
                        class="absolute w-full top-[26px] h-3 rounded-full bg-custom-stroke overflow-hidden">
                        <div class="w-2/3 h-full bg-custom-lime-green"></div>
                    </div>
                    <div class="relative flex flex-col py-4 gap-[6px] items-center">
                        <div
                            class="flex size-8 shrink-0 rounded-full bg-custom-lime-green overflow-hidden items-center justify-center">
                            <span class="font-bold">2</span>
                        </div>
                        <p class="font-bold text-center">Processing</p>
                    </div>
                    <div class="relative flex flex-col py-4 gap-[6px] items-center">
                        <div
                            class="flex size-8 shrink-0 rounded-full bg-custom-lime-green overflow-hidden items-center justify-center">
                            <span class="font-bold">3</span>
                        </div>
                        <p class="font-bold text-center">Delivering</p>
                    </div>
                    <div class="relative flex flex-col py-4 gap-[6px] items-center">
                        <div
                            class="flex size-8 shrink-0 rounded-full bg-custom-stroke overflow-hidden items-center justify-center">
                            <span class="font-bold">4</span>
                        </div>
                        <p class="font-bold text-center">Completed</p>
                    </div>
                </div>
                <div class="h-[260px] w-full rounded-2xl overflow-hidden bg-custom-background">
                    <img :src="transaction.delivery_proof || DeliveringPlaceholder" class="size-full object-cover" alt="thumbnail">
                </div>
                <div class="flex items-center justify-between">
                    <p class="flex items-center gap-1 font-medium text-custom-grey leading-none">
                        <img src="@/assets/images/icons/car-delivery-moves-grey.svg" class="size-6" alt="icon">
                        Delivery Status
                    </p>
                    <p
                        class="badge rounded-full py-3 px-[18px] flex shrink-0 font-bold uppercase bg-custom-orange/10 text-custom-orange">
                        Delivering
                    </p>
                </div>
                <div class="flex items-center justify-between">
                    <p class="flex items-center gap-1 font-medium text-custom-grey leading-none">
                        <img src="@/assets/images/icons/routing-grey.svg" class="size-6" alt="icon">
                        Tracking Number
                    </p>
                    <p class="font-semibold text-lg leading-none">{{ transaction.tracking_number }} ({{
                        transaction.shipping }})</p>
                </div>
                <hr class="border-custom-stroke">
                <button type="button" data-modal="Confirmation-Modal"
                    class="h-14 w-full rounded-full flex items-center justify-center py-4 px-6 bg-custom-blue disabled:bg-custom-stroke transition-300"
                    v-if="user?.role === 'buyer'" @click="handleCompletedOrder">
                    <span class="font-semibold text-lg text-white">Mark This Transaction Completed</span>
                </button>
            </section>
            <section class="flex flex-col w-full rounded-[20px] p-5 gap-5 bg-white"
                v-if="transaction?.delivery_status === 'completed'">
                <p class="font-bold text-xl">Order Status</p>
                <div class="grid grid-cols-3 relative min-h-[90px] w-full">
                    <div id="Progress-Bar"
                        class="absolute w-full top-[26px] h-3 rounded-full bg-custom-stroke overflow-hidden">
                        <div class="w-full h-full bg-custom-lime-green"></div>
                    </div>
                    <div class="relative flex flex-col py-4 gap-[6px] items-center">
                        <div
                            class="flex size-8 shrink-0 rounded-full bg-custom-lime-green overflow-hidden items-center justify-center">
                            <span class="font-bold">2</span>
                        </div>
                        <p class="font-bold text-center">Processing</p>
                    </div>
                    <div class="relative flex flex-col py-4 gap-[6px] items-center">
                        <div
                            class="flex size-8 shrink-0 rounded-full bg-custom-lime-green overflow-hidden items-center justify-center">
                            <span class="font-bold">3</span>
                        </div>
                        <p class="font-bold text-center">Delivering</p>
                    </div>
                    <div class="relative flex flex-col py-4 gap-[6px] items-center">
                        <div
                            class="flex size-8 shrink-0 rounded-full bg-custom-lime-green overflow-hidden items-center justify-center">
                            <span class="font-bold">4</span>
                        </div>
                        <p class="font-bold text-center">Completed</p>
                    </div>
                </div>
                <div class="h-[260px] w-full rounded-2xl overflow-hidden bg-custom-background">
                    <img :src="transaction.delivery_proof || DeliveringPlaceholder" class="size-full object-cover" alt="thumbnail">
                </div>
                <div class="flex items-center justify-between">
                    <p class="flex items-center gap-1 font-medium text-custom-grey leading-none">
                        <img src="@/assets/images/icons/car-delivery-moves-grey.svg" class="size-6" alt="icon">
                        Delivery Status
                    </p>
                    <p
                        class="badge rounded-full py-3 px-[18px] flex shrink-0 font-bold uppercase bg-custom-green/10 text-custom-green">
                        completed
                    </p>
                </div>
                <div class="flex items-center justify-between">
                    <p class="flex items-center gap-1 font-medium text-custom-grey leading-none">
                        <img src="@/assets/images/icons/routing-grey.svg" class="size-6" alt="icon">
                        Tracking Number
                    </p>
                    <p class="font-semibold text-lg leading-none">{{ transaction?.tracking_number ?? '-' }}</p>
                </div>
            </section>
            <section class="flex flex-col w-full rounded-[20px] p-5 gap-5 bg-white">
                <p class="font-bold text-xl">Customer Reviews</p>
                <div class="flex flex-col gap-4" v-if="transaction.product_reviews && transaction.product_reviews.length > 0">
                    <div class="flex flex-col rounded-2xl border border-custom-stroke p-4 gap-4"
                         v-for="review in transaction.product_reviews" :key="review.id">
                        <div class="flex items-center justify-between">
                            <!-- Buyer Profile Info -->
                            <div class="flex items-center gap-3">
                                <div class="flex size-12 shrink-0 rounded-full bg-custom-background overflow-hidden border border-custom-stroke">
                                    <img :src="transaction.buyer?.user?.profile_picture" class="size-full object-cover" alt="avatar">
                                </div>
                                <div class="flex flex-col text-left">
                                    <p class="font-bold text-sm text-custom-black">{{ transaction.buyer?.user?.name }}</p>
                                    <p class="text-xs text-custom-grey">{{ formatToClientTimezone(review.created_at) || 'Pembeli' }}</p>
                                </div>
                            </div>
                            <!-- Rating -->
                            <div class="flex items-center gap-1.5">
                                <span class="font-bold text-lg text-custom-black">{{ review.rating }}.0</span>
                                <div class="flex">
                                    <img v-for="n in 5" :key="n"
                                         :src="n <= review.rating ? StarActive : StarOutline" 
                                         class="flex size-6 shrink-0 p-0.5"
                                         alt="star">
                                </div>
                            </div>
                        </div>
                        <hr class="border-custom-stroke">
                        <div class="flex flex-col gap-1 text-left">
                            <p class="font-semibold text-xs text-custom-blue uppercase tracking-wider">{{ review.product?.name }}</p>
                            <p class="font-medium text-lg text-custom-grey">“{{ review.review || 'Tidak ada ulasan tertulis.' }}”</p>
                            <div v-if="review.photo" class="mt-3 w-40 h-40 rounded-2xl overflow-hidden border border-custom-stroke bg-white">
                                <img :src="review.photo" class="size-full object-cover" alt="review photo">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col items-center justify-center p-5 text-center text-custom-grey" v-else>
                    <img src="@/assets/images/icons/note-remove-grey.svg" class="size-10 mb-2 opacity-50" alt="icon">
                    <p class="font-semibold text-sm">Belum ada ulasan dari pembeli</p>
                </div>
            </section>
        </div>
    </div>
</template>