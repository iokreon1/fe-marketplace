<script setup>
import { formatRupiah, formatToClientTimezone } from "@/helpers/format";
import { useDashboardStore } from "@/stores/dashboard";
import { useStoreStore } from "@/stores/store";
import { useTransactionStore } from "@/stores/transaction";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";

const dashboardStore = useDashboardStore();
const { dashboard } = storeToRefs(dashboardStore);
const { getDashboard } = dashboardStore;

const storeStore = useStoreStore();
const { stores } = storeToRefs(storeStore);
const { fetchStores } = storeStore;

const transactionStore = useTransactionStore();
const { transactions } = storeToRefs(transactionStore);
const { fetchTransactions } = transactionStore;

onMounted(async () => {
    await getDashboard();

    await fetchStores({
        limit: 5,
    });

    await fetchTransactions({
        limit: 5,
    });
});
</script>

<template>
    <div class="flex gap-5">
        <div class="flex flex-col w-[440px] shrink-0 rounded-[20px] p-5 gap-6 bg-white">
            <div class="flex flex-col gap-6">
                <div class="flex size-[56px] bg-custom-blue/10 items-center justify-center rounded-full">
                    <img src="@/assets/images/icons/wallet-2-blue-fill.svg" class="flex size-6 shrink-0" alt="icon">
                </div>
                <div class="flex flex-col gap-[6px]">
                    <p class="font-bold text-4xl">{{ formatRupiah(dashboard.total_revenue) }}</p>
                    <p class="font-medium text-lg text-custom-grey">
                        Total Revenue
                    </p>
                </div>
            </div>
        </div>
        <div class="flex flex-col w-full rounded-[20px] p-5 gap-6 bg-white">
            <div class="flex flex-col gap-6">
                <div class="flex size-[56px] bg-custom-blue/10 items-center justify-center rounded-full">
                    <img src="@/assets/images/icons/profile-tick-blue-fill.svg" class="flex size-6 shrink-0" alt="icon">
                </div>
                <div class="flex flex-col gap-[6px]">
                    <p class="font-bold text-4xl">{{ dashboard.total_stores }}</p>
                    <p class="font-medium text-lg text-custom-grey">
                        Total Sellers
                    </p>
                </div>
            </div>
        </div>
        <div class="flex flex-col w-full rounded-[20px] p-5 gap-6 bg-white">
            <div class="flex flex-col gap-6">
                <div class="flex size-[56px] bg-custom-blue/10 items-center justify-center rounded-full">
                    <img src="@/assets/images/icons/profile-2user-blue-fill.svg" class="flex size-6 shrink-0"
                        alt="icon">
                </div>
                <div class="flex flex-col gap-[6px]">
                    <p class="font-bold text-4xl">{{ dashboard.total_buyers }}</p>
                    <p class="font-medium text-lg text-custom-grey">
                        Total Buyers
                    </p>
                </div>
            </div>
        </div>
    </div>
    <div class="flex gap-5 flex-1">
        <div class="flex flex-col gap-5">
            <div class="flex flex-col w-[440px] shrink-0 rounded-[20px] p-5 gap-6 bg-white">
                <div class="flex flex-col gap-6">
                    <div class="flex size-[56px] bg-custom-blue/10 items-center justify-center rounded-full">
                        <img src="@/assets/images/icons/shopping-cart-blue-fill.svg" class="flex size-6 shrink-0"
                            alt="icon">
                    </div>
                    <div class="flex flex-col gap-[6px]">
                        <p class="font-bold text-4xl">{{ dashboard.total_products }}</p>
                        <p class="font-medium text-lg text-custom-grey">
                            Total Products
                        </p>
                    </div>
                </div>
            </div>
            <div class="flex flex-col flex-1 w-[440px] shrink-0 rounded-[20px] p-5 gap-6 bg-white">
                <div class="flex flex-col gap-6">
                    <div class="flex size-[56px] bg-custom-blue/10 items-center justify-center rounded-full">
                        <img src="@/assets/images/icons/shop-blue-fill.svg" class="flex size-6 shrink-0" alt="icon">
                    </div>
                    <div class="flex flex-col gap-[6px]">
                        <p class="font-bold text-4xl">{{ dashboard.total_stores }}</p>
                        <p class="font-medium text-lg text-custom-grey">
                            Total Stores
                        </p>
                    </div>
                </div>
                <hr class="border-custom-stroke">
                <div class="flex flex-col flex-1 gap-5">
                    <p class="font-bold text-xl">Latest Stores</p>
                    <div id="List-Stores" class="flex flex-col gap-5">
                        <div class="card flex flex-col rounded-[20px] border border-custom-stroke py-[18px] px-5 gap-5 bg-white"
                            v-for="store in stores" :key="store.id">
                            <div class="flex items-center gap-[14px]">
                                <div class="flex size-16 shrink-0 rounded-[20px] bg-custom-background overflow-hidden">
                                    <img :src="store.logo" class="size-full object-cover" alt="photo">
                                </div>
                                <div class="flex flex-col gap-[6px] w-full overflow-hidden">
                                    <p class="font-bold text-lg leading-tight w-full truncate">
                                        {{ store.name }}
                                    </p>
                                    <p class="flex items-center gap-1 font-semibold text-custom-grey leading-none">
                                        <img src="@/assets/images/icons/user-grey.svg" class="size-5" alt="icon">
                                        {{ store.user?.name }}
                                    </p>
                                </div>
                            </div>
                            <hr class="border-custom-stroke">
                            <div class="flex items-center justify-between">
                                <RouterLink :to="{ name: 'admin.store.detail', params: { id: store.id } }"
                                    class="font-semibold text-custom-blue hover:underline">
                                    View Details
                                </RouterLink>
                            </div>
                        </div>

                    </div>
                    <div id="Empty-State" class="hidden flex flex-col flex-1 items-center justify-center gap-4"
                        v-if="dashboard.total_stores === 0">
                        <img src="@/assets/images/icons/note-remove-grey.svg" class="size-[52px]" alt="icon">
                        <div class="flex flex-col gap-1 items-center text-center">
                            <p class="font-semibold text-custom-grey">Oops, you don't have any data yet</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-col w-full gap-5">
            <div class="flex flex-col flex-1 w-full shrink-0 rounded-[20px] p-5 gap-6 bg-white">
                <div class="flex flex-col gap-6">
                    <div class="flex size-[56px] bg-custom-blue/10 items-center justify-center rounded-full">
                        <img src="@/assets/images/icons/note-text-blue-fill.svg" class="flex size-6 shrink-0"
                            alt="icon">
                    </div>
                    <div class="flex flex-col gap-[6px]">
                        <p class="font-bold text-4xl">{{ dashboard.total_transactions }}</p>
                        <p class="font-medium text-lg text-custom-grey">
                            Total Transaction
                        </p>
                    </div>
                </div>
                <hr class="border-custom-stroke">
                <div class="flex flex-col flex-1 gap-5">
                    <p class="font-bold text-xl">Latest Transactions</p>
                    <div id="List-Transactions" class="flex flex-col gap-5">
                        <div class="card flex flex-col rounded-[20px] border border-custom-stroke py-[18px] px-5 gap-5 bg-white"
                            v-for="transaction in transactions" :key="transaction.id">
                            <div class="flex items-center gap-[14px] w-full overflow-hidden">
                                <div class="flex size-16 shrink-0 rounded-[20px] bg-custom-background overflow-hidden">
                                    <img :src="transaction.buyer?.user?.profile_picture" class="size-full object-cover"
                                        alt="photo">
                                </div>
                                <div class="flex flex-col gap-[6px] w-full flex-grow-0 overflow-hidden">
                                    <p class="font-bold text-lg leading-tight w-full">
                                        {{ transaction.buyer?.user?.name }}
                                    </p>
                                </div>
                                <div class="flex flex-col gap-2 items-end">
                                    <p class="font-bold text-lg leading-tight text-custom-blue text-nowrap">
                                        {{ formatRupiah(transaction.grand_total) }}
                                    </p>
                                    <p
                                        class="flex items-center gap-1 font-semibold text-custom-grey leading-none text-nowrap">
                                        Grand Total
                                    </p>
                                </div>
                            </div>
                            <hr class="border-custom-stroke">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-[10px]">
                                    <div
                                        class="flex size-14 shrink-0 rounded-full bg-custom-icon-background overflow-hidden items-center justify-center">
                                        <img src="@/assets/images/icons/shopping-cart-black.svg"
                                            class="flex size-6 shrink-0" alt="icon">
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <p class="font-bold text-lg leading-none">
                                            {{ transaction.transaction_details.length }}
                                        </p>
                                        <p class="font-semibold text-custom-grey">Total Products</p>
                                    </div>
                                </div>
                                <RouterLink :to="{ name: 'admin.transaction.detail', params: { id: transaction.id } }"
                                    class="flex w-[96px] h-[56px] shrink-0 rounded-2xl py-[18px] px-5 bg-custom-blue/10 gap-2 hover:ring-2 hover:ring-custom-blue transition-300">
                                    <span class="font-semibold text-custom-blue leading-none">
                                        Details
                                    </span>
                                </RouterLink>
                            </div>
                        </div>
                    </div>
                    <div id="Empty-State" class="hidden flex flex-col flex-1 items-center justify-center gap-4"
                        v-if="dashboard.total_transactions === 0">
                        <img src="@/assets/images/icons/note-remove-grey.svg" class="size-[52px]" alt="icon">
                        <div class="flex flex-col gap-1 items-center text-center">
                            <p class="font-semibold text-custom-grey">Oops, you don't have any data yet</p>
                        </div>
                    </div>
                </div>
            </div>
            <div id="Upgrade-To-Pro"
                class="relative flex items-center w-full rounded-[20px] p-5 gap-3 blue-gradient overflow-hidden">
                <img src="@/assets/images/backgrounds/wave-lines.svg" class="size-full object-cover absolute"
                    alt="backgrounds">
                <div class="relative w-fit">
                    <div
                        class="flex size-14 rounded-full bg-custom-lime-green items-center justify-center overflow-hidden">
                        <img src="@/assets/images/icons/crown-black-fill.svg" class="size-6" alt="icon">
                    </div>
                    <p
                        class="absolute transform -translate-x-1/2 left-1/2 -bottom-2 rounded-[20px] py-1 px-2 bg-custom-black text-white w-fit font-extrabold text-[8px]">
                        PRO</p>
                </div>
                <div class="relative flex flex-col gap-1 w-full">
                    <p class="font-semibold text-sm text-custom-lime-green-char">Access Pro Featured</p>
                    <div class="flex items-center justify-between w-full">
                        <p class="font-bold text-[22px] text-white leading-none">Upgrade To Pro</p>
                        <a href="#" class="flex items-center gap-1">
                            <span class="font-semibold text-sm text-white hover:underline">Upgrade
                                Now</span>
                            <img src="@/assets/images/icons/arrow-right-circle-white-thick.svg"
                                class="flex size-5 shrink-0" alt="icon">
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>