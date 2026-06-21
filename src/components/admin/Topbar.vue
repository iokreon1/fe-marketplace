<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { storeToRefs } from 'pinia';
import PhotoProfileDefault from '@/assets/images/icons/photo-profile-default.svg'
import { ref, onMounted, onUnmounted } from 'vue';

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const { user, token } = storeToRefs(authStore)
const { logout } = authStore

const notificationStore = useNotificationStore()
const showNotificationsDropdown = ref(false)

const toggleNotificationsDropdown = async () => {
    showNotificationsDropdown.value = !showNotificationsDropdown.value
    if (showNotificationsDropdown.value && token.value) {
        await notificationStore.fetchNotifications({ limit: 5 })
    }
}

const markAllAsRead = async () => {
    await notificationStore.markAllAsRead()
}

const handleNotificationClick = async (notif) => {
    await notificationStore.markAsRead(notif.id)
    showNotificationsDropdown.value = false
    if (notif.type === 'transaction') {
        router.push({ name: 'admin.my-transaction' })
    } else if (notif.type === 'withdrawal') {
        router.push({ name: 'admin.store-balance' })
    }
}

const formatTimeAgo = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffHours < 24) return `${diffHours} jam lalu`
    if (diffDays < 7) return `${diffDays} hari lalu`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const closeDropdowns = (e) => {
    if (!e.target.closest('#Notifications-Button') && !e.target.closest('#Notifications-Dropdown')) {
        showNotificationsDropdown.value = false
    }
}

let notificationInterval = null

onMounted(() => {
    window.addEventListener('click', closeDropdowns)
    if (token.value) {
        notificationStore.fetchUnreadCount()
        notificationInterval = setInterval(() => {
            notificationStore.fetchUnreadCount()
        }, 30000)
    }
})

onUnmounted(() => {
    window.removeEventListener('click', closeDropdowns)
    if (notificationInterval) clearInterval(notificationInterval)
})
</script>

<template>
    <div id="Top-Bar" class="flex items-center w-full gap-6 mt-[30px] mb-6">
        <div class="flex items-center gap-6 h-[102px] bg-white w-full rounded-3xl p-[18px]">
            <div class="flex flex-col gap-2 w-full">
                <h1 class="font-bold text-2xl capitalize">{{ route.meta.title }}</h1>
                <p class="flex items-center gap-1 font-semibold text-custom-grey leading-none">
                    View Your Dashboard
                </p>
            </div>
            <div class="flex items-center flex-nowrap gap-3">
                <a href="#">
                    <div
                        class="flex size-14 rounded-full bg-custom-icon-background items-center justify-center overflow-hidden">
                        <img src="@/assets/images/icons/search-normal-black.svg" class="size-6" alt="icon">
                    </div>
                </a>
                
                <!-- Notifications -->
                <div class="relative" v-if="token">
                    <button type="button" id="Notifications-Button" @click="toggleNotificationsDropdown"
                        class="flex size-14 rounded-full bg-custom-icon-background items-center justify-center overflow-hidden cursor-pointer focus:outline-none">
                        <img src="@/assets/images/icons/notification-black.svg" class="size-6" alt="icon">
                    </button>
                    <span v-if="notificationStore.unreadCount > 0" 
                          style="position: absolute; top: -4px; right: -4px; background-color: #ef4444; color: white; font-size: 10px; font-weight: 700; border-radius: 9999px; min-width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: 2px solid white; padding: 0 4px; pointer-events: none;">
                        {{ notificationStore.unreadCount }}
                    </span>

                    <!-- Dropdown Menu -->
                    <div id="Notifications-Dropdown" v-if="showNotificationsDropdown" 
                         class="absolute right-0 mt-3 w-[360px] bg-white rounded-2xl border border-custom-stroke shadow-[0px_6px_30px_0px_#00000017] z-50 p-4 flex flex-col gap-3">
                        <div class="flex items-center justify-between border-b border-custom-stroke pb-2">
                            <h4 class="font-bold text-base text-custom-black">Notifikasi</h4>
                            <button type="button" @click="markAllAsRead" 
                                    class="text-xs font-bold text-custom-blue hover:underline"
                                    v-if="notificationStore.unreadCount > 0">
                                Tandai semua dibaca
                            </button>
                        </div>
                        <div class="flex flex-col gap-2 max-h-[280px] overflow-y-auto hide-scrollbar">
                            <div v-if="notificationStore.notifications.length === 0" 
                                 class="text-center py-8 text-custom-grey text-sm font-semibold">
                                Tidak ada notifikasi baru
                            </div>
                            <div v-else v-for="notif in notificationStore.notifications" :key="notif.id"
                                 @click="handleNotificationClick(notif)"
                                 class="flex flex-col gap-1 p-3 rounded-xl border border-custom-stroke hover:bg-custom-background cursor-pointer transition-300 relative"
                                 :class="{ 'bg-custom-blue/5 border-custom-blue/15': !notif.is_read }">
                                <div class="flex items-center justify-between gap-2">
                                    <p class="font-bold text-sm text-custom-black leading-tight">{{ notif.title }}</p>
                                    <span class="size-2 rounded-full bg-custom-blue shrink-0" v-if="!notif.is_read"></span>
                                </div>
                                <p class="text-xs text-custom-grey font-semibold leading-relaxed">{{ notif.message }}</p>
                                <span class="text-[9px] text-custom-grey font-semibold text-right mt-1">
                                    {{ formatTimeAgo(notif.created_at) }}
                                </span>
                            </div>
                        </div>
                        <hr class="border-custom-stroke">
                        <RouterLink :to="{ name: 'app.notification-list' }" @click="showNotificationsDropdown = false"
                                    class="text-center font-bold text-sm text-custom-blue hover:underline py-1">
                            Lihat Semua Notifikasi
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex items-center gap-3 h-[102px] bg-white w-fit rounded-3xl p-[18px]">
            <RouterLink :to="{ name: 'admin.profile' }" class="flex items-center gap-3 hover:opacity-80 transition-300">
                <div class="flex rounded-full overflow-hidden size-14 shrink-0">
                    <img :src="user?.profile_picture || PhotoProfileDefault" class="size-full object-cover" alt="photo">
                </div>
                <div class="flex flex-col gap-[6px] min-w-[155px] w-fit">
                    <p class="font-semibold text-lg leading-tight">{{ user?.name }}</p>
                    <p class="flex items-center gap-1 font-semibold text-custom-grey text-lg leading-none">
                        <img src="@/assets/images/icons/user-grey.svg" class="size-[18px]" alt="icon">
                        {{ user?.role }}
                    </p>
                </div>
            </RouterLink>
            <a @click="logout" class="flex w-6 cursor-pointer">
                <img src="@/assets/images/icons/logout.svg" class="flex size-6 shrink-0" alt="icon">
            </a>
        </div>
    </div>
</template>