<script setup>
import { useTransactionStore } from '@/stores/transaction';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { debounce } from 'lodash';
import { watch } from 'vue';
import Pagination from '@/components/admin/Pagination.vue';
import { formatRupiah, formatToClientTimezone } from '@/helpers/format';
import { exportTransactionToCSV } from '@/helpers/exportHelper';

const transactionStore = useTransactionStore()
const { transactions, meta, loading, error, success } = storeToRefs(transactionStore)
const { fetchTransactionsPaginated } = transactionStore

const serverOptions = ref({
    page: 1,
    row_per_page: 10
})

const filters = ref({
    search: '',
    status: ''
})

const fetchData = async (resetPage = false) => {
    if (resetPage) {
        serverOptions.value.page = 1
    }
    await fetchTransactionsPaginated({
        ...serverOptions.value,
        ...filters.value
    })
}

const debounceFetchData = debounce(() => fetchData(true), 500)

onMounted(() => fetchData(false))

watch(() => serverOptions.value.page, () => {
    fetchData(false)
})

watch(() => serverOptions.value.row_per_page, () => {
    fetchData(true)
})

watch(() => filters.value.search, () => {
    debounceFetchData()
})

watch(() => filters.value.status, () => {
    fetchData(true)
})

const resetFilters = () => {
    filters.value.status = ''
    filters.value.search = ''
}
</script>

<template>
    <div class="flex flex-col flex-1 rounded-[20px] p-5 gap-6 bg-white">
        <div class="header flex items-center justify-between">
            <div class="flex flex-col gap-2">
                <p class="font-bold text-xl">All Transactions</p>
                <div class="flex items-center gap-1">
                    <img src="@/assets/images/icons/stickynote-grey.svg" class="flex size-6 shrink-0" alt="icon">
                    <p class="font-semibold text-custom-grey">{{ meta?.total ?? 0 }} Total Transactions</p>
                </div>
            </div>
        </div>

        <!-- Transaction Status Filter Pills -->
        <div class="flex items-center gap-4 flex-wrap pb-2 border-b border-custom-stroke">
            <span class="font-bold text-custom-black">Status</span>
            <div class="flex items-center gap-2 flex-wrap">
                <button type="button" @click="filters.status = ''"
                    class="h-10 px-5 rounded-full font-semibold transition-300 text-sm flex items-center justify-center border"
                    :class="filters.status === '' ? 'bg-custom-blue/5 border-custom-blue text-custom-blue' : 'border-custom-stroke text-custom-grey hover:bg-custom-background'">
                    Semua
                </button>
                <button type="button" @click="filters.status = 'berlangsung'"
                    class="h-10 px-5 rounded-full font-semibold transition-300 text-sm flex items-center justify-center border"
                    :class="filters.status === 'berlangsung' ? 'bg-custom-blue/5 border-custom-blue text-custom-blue' : 'border-custom-stroke text-custom-grey hover:bg-custom-background'">
                    Berlangsung
                </button>
                <button type="button" @click="filters.status = 'berhasil'"
                    class="h-10 px-5 rounded-full font-semibold transition-300 text-sm flex items-center justify-center border"
                    :class="filters.status === 'berhasil' ? 'bg-custom-blue/5 border-custom-blue text-custom-blue' : 'border-custom-stroke text-custom-grey hover:bg-custom-background'">
                    Berhasil
                </button>
                <button type="button" @click="filters.status = 'gagal'"
                    class="h-10 px-5 rounded-full font-semibold transition-300 text-sm flex items-center justify-center border"
                    :class="filters.status === 'gagal' ? 'bg-custom-blue/5 border-custom-blue text-custom-blue' : 'border-custom-stroke text-custom-grey hover:bg-custom-background'">
                    Tidak Berhasil
                </button>
                <button type="button"
                    class="h-10 px-5 rounded-full font-semibold border border-custom-stroke text-custom-grey opacity-50 cursor-not-allowed text-sm flex items-center justify-center">
                    E-tiket & E-voucher Aktif
                </button>
            </div>
            <button type="button" @click="resetFilters" v-if="filters.status !== '' || filters.search !== ''"
                class="font-bold text-custom-blue hover:underline text-sm ml-2">
                Reset Filter
            </button>
        </div>

        <div id="Filter" class="flex items-center justify-between">
            <form action="#" @submit.prevent>
                <label
                    class="flex items-center w-[370px] h-14 rounded-2xl p-4 gap-2 bg-white border border-custom-stroke focus-within:border-custom-black transition-300">
                    <img src="@/assets/images/icons/receipt-search-grey.svg" class="flex size-6 shrink-0" alt="icon">
                    <input type="text" v-model="filters.search"
                        class="appearance-none w-full placeholder:text-custom-grey font-medium focus:outline-none"
                        placeholder="Search Transaction">
                </label>
            </form>
            <div class="flex items-center gap-4">
                <p class="font-medium text-custom-grey">Show</p>
                <label
                    class="flex items-center h-14 rounded-2xl border border-custom-stroke py-4 px-5 pl-3 bg-white focus-within:border-custom-black transition-300">
                    <select v-model="serverOptions.row_per_page" class="text-custom-black font-medium appearance-none focus:outline-none p-2 bg-transparent cursor-pointer">
                        <option :value="1" class="font-medium">1 Entries</option>
                        <option :value="2" class="font-medium">2 Entries</option>
                        <option :value="4" class="font-medium">4 Entries</option>
                        <option :value="10" class="font-medium">10 Entries</option>
                        <option :value="20" class="font-medium">20 Entries</option>
                        <option :value="40" class="font-medium">40 Entries</option>
                    </select>
                    <img src="@/assets/images/icons/arrow-down-black.svg" class="flex size-6 shrink-0 -ml-1" alt="icon">
                </label>
            </div>
        </div>
        <section id="List-Transactions" class="flex flex-col flex-1 gap-6 w-full" v-if="transactions && transactions.length > 0">
            <div class="list flex flex-col gap-5">
                <div class="card flex flex-col rounded-[20px] border border-custom-stroke py-[18px] px-5 gap-5 bg-white"
                    v-for="transaction in transactions" :key="transaction.id">
                    <div class="flex items-center justify-between">
                        <p class="flex items-center gap-2 font-semibold text-custom-grey leading-none">
                            <img src="@/assets/images/icons/calendar-2-grey.svg" class="size-6 flex shrink-0"
                                alt="icon">
                            {{ formatToClientTimezone(transaction.created_at) }}
                        </p>
                        <p
                            class="badge rounded-full py-3 px-[18px] flex shrink-0 font-bold uppercase bg-custom-yellow text-[#544607]">
                            {{ transaction.delivery_status }}
                        </p>
                    </div>
                    <hr class="border-custom-stroke">
                    <div class="flex items-center gap-5 justify-between pr-[30px]">
                        <div class="flex items-center gap-[14px] w-[320px]">
                            <div class="flex size-[84px] shrink-0 rounded-[20px] bg-custom-background overflow-hidden">
                                <img :src="transaction?.store?.logo" class="size-full object-cover" alt="photo">
                            </div>
                            <div class="flex flex-col gap-[6px] w-full overflow-hidden">
                                <p class="font-bold text-lg leading-tight w-full truncate">
                                    {{ transaction?.store?.name }}
                                </p>
                                <p class="flex items-center gap-1 font-semibold text-custom-grey leading-none">
                                    <img src="@/assets/images/icons/calendar-2-grey.svg" class="size-5" alt="icon">
                                    {{ formatToClientTimezone(transaction.created_at) }}
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-[10px] w-[260px]">
                            <div
                                class="flex size-14 shrink-0 rounded-full bg-custom-icon-background overflow-hidden items-center justify-center">
                                <img src="@/assets/images/icons/shopping-cart-black.svg" class="flex size-6 shrink-0"
                                    alt="icon">
                            </div>
                            <div class="flex flex-col gap-1">
                                <p class="font-bold text-lg leading-none">{{ transaction?.transaction_details?.length }}
                                </p>
                                <p class="font-semibold text-custom-grey">Total Products</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-[10px] w-[260px]">
                            <div
                                class="flex size-14 shrink-0 rounded-full bg-custom-icon-background overflow-hidden items-center justify-center">
                                <img src="@/assets/images/icons/box-black.svg" class="flex size-6 shrink-0" alt="icon">
                            </div>
                            <div class="flex flex-col gap-1">
                                <p class="font-bold text-lg leading-none">
                                    {{transaction?.transaction_details?.reduce((total, detail) => total + detail.qty,
                                        0)}}
                                </p>
                                <p class="font-semibold text-custom-grey">Total Quantity</p>
                            </div>
                        </div>
                    </div>
                    <hr class="border-custom-stroke">
                    <div class="flex items-center justify-between">
                        <div class="flex flex-col gap-[6px]">
                            <p class="font-bold text-xl text-custom-blue">Rp {{ formatRupiah(transaction.grand_total) }}
                            </p>
                            <p class="flex items-center gap-2 font-semibold text-custom-grey leading-none">
                                <img src="@/assets/images/icons/money-grey.svg" class="size-6 flex shrink-0" alt="icon">
                                Grand Total
                            </p>
                        </div>
                        <div class="flex items-center justify-end gap-[14px]">
                            <button @click="exportTransactionToCSV(transaction)"
                                class="flex items-center justify-center h-14 w-fit shrink-0 rounded-2xl p-4 gap-2 bg-custom-black">
                                <span class="font-semibold text-white">Export</span>
                                <img src="@/assets/images/icons/receive-square-white.svg" class="flex size-6 shrink-0"
                                    alt="icon">
                            </button>
                            <RouterLink :to="{ name: 'admin.transaction.detail', params: { id: transaction.id } }"
                                class="flex items-center justify-center h-14 w-[126px] shrink-0 rounded-2xl p-4 gap-2 bg-custom-blue">
                                <img src="@/assets/images/icons/eye-white.svg" class="flex size-6 shrink-0" alt="icon">
                                <span class="font-semibold text-white">Details</span>
                            </RouterLink>
                        </div>
                    </div>
                </div>
            </div>
            <Pagination v-if="meta && meta.last_page > 1" :meta="meta" :server-options="serverOptions" />
        </section>
        <div id="Empty-State" class="flex flex-col flex-1 items-center justify-center gap-4 py-10" v-else>
            <img src="@/assets/images/icons/note-remove-grey.svg" class="size-[52px]" alt="icon">
            <div class="flex flex-col gap-1 items-center text-center">
                <p class="font-semibold text-custom-grey">Oops, you don't have any data yet</p>
            </div>
        </div>
    </div>
</template>