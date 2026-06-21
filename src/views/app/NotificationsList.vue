<script setup>
import { useNotificationStore } from '@/stores/notification';
import { storeToRefs } from 'pinia';
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Pagination from '@/components/admin/Pagination.vue';
import Alert from '@/components/admin/Alert.vue';

// Icons
import bagBlueFill from '@/assets/images/icons/bag-blue-fill.svg';
import walletBlueFill from '@/assets/images/icons/wallet-2-blue-fill.svg';
import notificationIcon from '@/assets/images/icons/notification-black.svg';
import trashRedIcon from '@/assets/images/icons/trash-red.svg';
import eyeBlueIcon from '@/assets/images/icons/eye-blue.svg';

const notificationStore = useNotificationStore();
const { notifications, meta, loading, error, success } = storeToRefs(notificationStore);

const router = useRouter();

const activeTab = ref('all'); // all, transaction, withdrawal, system

const serverOptions = ref({
    page: 1,
    row_per_page: 10
});

const fetchData = async () => {
    await notificationStore.fetchNotifications({
        page: serverOptions.value.page,
        limit: serverOptions.value.row_per_page,
        type: activeTab.value === 'all' ? null : activeTab.value
    });
};

const changeTab = (tab) => {
    activeTab.value = tab;
    serverOptions.value.page = 1; // Reset to page 1
    fetchData();
};

const handleMarkAsRead = async (id) => {
    await notificationStore.markAsRead(id);
};

const handleDelete = async (id) => {
    await notificationStore.deleteNotification(id);
    if (notifications.value.length === 0 && serverOptions.value.page > 1) {
        serverOptions.value.page--;
    } else {
        fetchData();
    }
};

const handleMarkAllAsRead = async () => {
    await notificationStore.markAllAsRead();
    fetchData();
};

const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
        await notificationStore.markAsRead(notif.id);
    }
    
    if (notif.type === 'transaction') {
        router.push({ name: 'admin.my-transaction' });
    } else if (notif.type === 'withdrawal') {
        router.push({ name: 'admin.store-balance' });
    }
};

const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

onMounted(() => {
    fetchData();
    notificationStore.fetchUnreadCount();
});

watch(() => serverOptions.value.page, () => {
    fetchData();
});
</script>

<template>
    <div class="flex flex-col gap-6 w-full max-w-[1280px] px-[52px] mx-auto min-h-[500px] mb-12">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex flex-col gap-2 text-left">
                <h1 class="font-bold text-[32px] text-custom-black leading-tight">Notifikasi</h1>
                <p class="font-semibold text-custom-grey">
                    Kamu memiliki {{ notificationStore.unreadCount }} notifikasi belum dibaca
                </p>
            </div>
            <button 
                type="button" 
                @click="handleMarkAllAsRead"
                v-if="notificationStore.unreadCount > 0"
                class="flex items-center justify-center h-12 rounded-xl px-5 gap-2 border border-custom-blue text-custom-blue font-bold hover:bg-custom-blue/5 transition-300 w-fit"
            >
                Tandai semua dibaca
            </button>
        </div>

        <!-- Alert messages -->
        <Alert 
            :success="success" 
            :error="error" 
            @closeAlert="() => { notificationStore.success = null; notificationStore.error = null; }" 
        />

        <!-- Category Tabs -->
        <div class="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar w-full border-b border-custom-stroke">
            <button 
                type="button" 
                @click="changeTab('all')"
                :class="[
                    activeTab === 'all' 
                        ? 'bg-custom-blue text-white shadow-md shadow-custom-blue/15' 
                        : 'bg-custom-icon-background text-custom-grey hover:bg-custom-stroke hover:text-custom-black'
                ]"
                class="flex shrink-0 font-bold text-sm px-5 py-3 rounded-full transition-all duration-300"
            >
                Semua
            </button>
            <button 
                type="button" 
                @click="changeTab('transaction')"
                :class="[
                    activeTab === 'transaction' 
                        ? 'bg-custom-blue text-white shadow-md shadow-custom-blue/15' 
                        : 'bg-custom-icon-background text-custom-grey hover:bg-custom-stroke hover:text-custom-black'
                ]"
                class="flex shrink-0 font-bold text-sm px-5 py-3 rounded-full transition-all duration-300"
            >
                Transaksi
            </button>
            <button 
                type="button" 
                @click="changeTab('withdrawal')"
                :class="[
                    activeTab === 'withdrawal' 
                        ? 'bg-custom-blue text-white shadow-md shadow-custom-blue/15' 
                        : 'bg-custom-icon-background text-custom-grey hover:bg-custom-stroke hover:text-custom-black'
                ]"
                class="flex shrink-0 font-bold text-sm px-5 py-3 rounded-full transition-all duration-300"
            >
                Keuangan
            </button>
            <button 
                type="button" 
                @click="changeTab('system')"
                :class="[
                    activeTab === 'system' 
                        ? 'bg-custom-blue text-white shadow-md shadow-custom-blue/15' 
                        : 'bg-custom-icon-background text-custom-grey hover:bg-custom-stroke hover:text-custom-black'
                ]"
                class="flex shrink-0 font-bold text-sm px-5 py-3 rounded-full transition-all duration-300"
            >
                Sistem
            </button>
        </div>

        <!-- Notification List -->
        <div class="flex flex-col gap-4">
            <!-- Loading Skeleton -->
            <div v-if="loading && notifications.length === 0" class="flex flex-col gap-4">
                <div v-for="i in 3" :key="i" class="flex items-center gap-4 p-5 rounded-[20px] bg-white border border-custom-stroke animate-pulse">
                    <div class="size-12 rounded-full bg-neutral-200 shrink-0"></div>
                    <div class="flex flex-col flex-1 gap-2">
                        <div class="h-4 bg-neutral-200 rounded w-1/4"></div>
                        <div class="h-3 bg-neutral-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div 
                v-else-if="notifications.length === 0"
                class="flex flex-col flex-1 items-center justify-center rounded-[20px] bg-white gap-8 py-20 border border-custom-stroke"
            >
                <div class="flex size-20 rounded-full bg-custom-icon-background items-center justify-center">
                    <img :src="notificationIcon" class="size-10 opacity-30" alt="icon">
                </div>
                <div class="text-center">
                    <p class="font-bold text-2xl">Tidak ada notifikasi</p>
                    <p class="font-semibold text-custom-grey mt-2">Semua pemberitahuan baru akan muncul di halaman ini.</p>
                </div>
                <RouterLink :to="{ name: 'app.home' }"
                    class="flex items-center justify-center h-14 w-fit rounded-2xl p-4 px-6 gap-2 bg-custom-blue hover:bg-custom-blue/90 transition-300">
                    <span class="font-bold text-white">Kembali ke Beranda</span>
                </RouterLink>
            </div>

            <!-- Data List -->
            <div v-else class="flex flex-col gap-4">
                <div 
                    v-for="notif in notifications" 
                    :key="notif.id"
                    class="group flex items-start sm:items-center gap-4 p-5 bg-white border border-custom-stroke rounded-[20px] transition-all duration-300 hover:shadow-[0px_4px_20px_0px_#00000008] hover:border-custom-blue/20 cursor-pointer relative"
                    :class="{ 'bg-custom-blue/5 border-custom-blue/15': !notif.is_read }"
                    @click="handleNotificationClick(notif)"
                >
                    <!-- Type Icon Indicator -->
                    <div 
                        :class="[
                            notif.type === 'transaction' ? 'bg-custom-blue/10 text-custom-blue' :
                            notif.type === 'withdrawal' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-neutral-100 text-custom-black'
                        ]"
                        class="flex size-12 shrink-0 rounded-full items-center justify-center overflow-hidden"
                    >
                        <img 
                            :src="
                                notif.type === 'transaction' ? bagBlueFill :
                                notif.type === 'withdrawal' ? walletBlueFill :
                                notificationIcon
                            " 
                            class="size-6 object-contain" 
                            alt="type-icon"
                        >
                    </div>

                    <!-- Notification Contents -->
                    <div class="flex flex-col flex-1 gap-1 text-left min-w-0 pr-8">
                        <div class="flex items-center gap-2 flex-wrap">
                            <h3 class="font-bold text-lg text-custom-black leading-tight">{{ notif.title }}</h3>
                            <span v-if="!notif.is_read" class="size-2 rounded-full bg-custom-blue shrink-0"></span>
                        </div>
                        <p class="text-sm text-custom-grey font-semibold leading-relaxed">{{ notif.message }}</p>
                        <span class="text-xs text-custom-grey/80 font-semibold mt-1">
                            {{ formatTimeAgo(notif.created_at) }}
                        </span>
                    </div>

                    <!-- Hover Actions -->
                    <div class="flex items-center gap-2 sm:static absolute top-4 right-4" @click.stop>
                        <!-- Mark as Read Button -->
                        <button 
                            type="button" 
                            v-if="!notif.is_read"
                            @click="handleMarkAsRead(notif.id)"
                            title="Tandai sudah dibaca"
                            class="flex items-center justify-center size-10 rounded-xl bg-custom-blue/10 hover:bg-custom-blue/20 text-custom-blue transition-300"
                        >
                            <img :src="eyeBlueIcon" class="size-5 shrink-0" alt="read">
                        </button>
                        <!-- Delete Button -->
                        <button 
                            type="button" 
                            @click="handleDelete(notif.id)"
                            title="Hapus notifikasi"
                            class="flex items-center justify-center size-10 rounded-xl bg-custom-red/10 hover:bg-custom-red/20 text-custom-red transition-300"
                        >
                            <img :src="trashRedIcon" class="size-5 shrink-0" alt="delete">
                        </button>
                    </div>
                </div>

                <!-- Pagination Component -->
                <div class="flex justify-end mt-4">
                    <Pagination :meta="meta" :server-options="serverOptions" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Scrollbar removal styling */
.hide-scrollbar::-webkit-scrollbar {
    display: none;
}
.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
