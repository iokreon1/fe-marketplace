<script setup>
import { formatRupiah } from "@/helpers/format";
import { useDashboardStore } from "@/stores/dashboard";
import { useTransactionStore } from "@/stores/transaction";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";

const dashboardStore = useDashboardStore();
const { dashboard } = storeToRefs(dashboardStore);
const { getDashboard } = dashboardStore;


const transactionStore = useTransactionStore();
const { transactions } = storeToRefs(transactionStore);
const { fetchTransactions } = transactionStore;

onMounted(async () => {
    await getDashboard();

    await fetchTransactions({
        limit: 5,
    });
});
</script>

<template>
    <div class="flex gap-5">
        <div class="flex flex-col w-full rounded-[20px] p-5 gap-6 bg-white">
            <div class="flex flex-col gap-6">
                <div class="flex size-[56px] bg-custom-blue/10 items-center justify-center rounded-full">
                    <img src="@/assets/images/icons/wallet-2-blue-fill.svg" class="flex size-6 shrink-0" alt="icon">
                </div>
                <div class="flex flex-col gap-[6px]">
                    <p class="font-bold text-4xl">{{ formatRupiah(dashboard.total_expenses) }}</p>
                    <p class="font-medium text-lg text-custom-grey">
                        Total Expense
                    </p>
                </div>
            </div>
        </div>
        <div class="flex flex-col w-full rounded-[20px] p-5 gap-6 bg-white">
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
    </div>
    <div class="flex flex-col flex-1 w-full rounded-[20px] p-5 gap-6 bg-white">
        <div class="flex flex-col gap-6">
            <div class="flex size-[56px] bg-custom-blue/10 items-center justify-center rounded-full">
                <img src="@/assets/images/icons/stickynote-blue-fill.svg" class="flex size-6 shrink-0" alt="icon">
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
                    <div class="flex items-center gap-5 justify-between pr-[30px]">
                        <div class="flex items-center gap-[14px] w-[320px]">
                            <div class="flex size-[84px] shrink-0 rounded-[20px] bg-custom-background overflow-hidden">
                                <img src="@/assets/images/thumbnails/th-1.svg" class="size-full object-cover"
                                    alt="photo">
                            </div>
                            <div class="flex flex-col gap-[6px] w-full overflow-hidden">
                                <p class="font-bold text-lg leading-tight w-full truncate">
                                    {{ transaction.store?.name }}
                                </p>
                                <p class="flex items-center gap-1 font-semibold text-custom-grey leading-none">
                                    <img src="@/assets/images/icons/user-grey.svg" class="size-5" alt="icon">
                                    {{ transaction.buyer?.user?.name }}
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
                                <p class="font-bold text-lg leading-none">
                                    {{ transaction.transaction_details.length }}
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
                                    {{transaction.transaction_details.reduce((acc, detail) => acc + detail.qty, 0)
                                    }}
                                </p>
                                <p class="font-semibold text-custom-grey">Total Quantity</p>
                            </div>
                        </div>
                    </div>
                    <hr class="border-custom-stroke">
                    <div class="flex items-center justify-between">
                        <div class="flex flex-col gap-[6px]">
                            <p class="font-bold text-xl text-custom-blue">
                                {{ formatRupiah(transaction.grand_total) }}
                            </p>
                            <p class="flex items-center gap-2 font-semibold text-custom-grey leading-none">
                                <img src="@/assets/images/icons/money-grey.svg" class="size-6 flex shrink-0" alt="icon">
                                Grand Total
                            </p>
                        </div>
                        <div class="flex items-center justify-end gap-[14px]">
                            <button
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
            <div id="Empty-State" class="hidden flex flex-col flex-1 items-center justify-center gap-4">
                <img src="@/assets/images/icons/note-remove-grey.svg" class="size-[52px]" alt="icon">
                <div class="flex flex-col gap-1 items-center text-center">
                    <p class="font-semibold text-custom-grey">Oops, you don't have any data yet</p>
                </div>
            </div>
        </div>
    </div>
</template>