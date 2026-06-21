import { handleError } from "@/helpers/errorHelper";
import { axiosInstance } from "@/plugins/axios";
import { defineStore } from "pinia";

export const useNotificationStore = defineStore("notification", {
    state: () => ({
        notifications: [],
        unreadCount: 0,
        meta: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 0,
        },
        loading: false,
        error: null,
        success: null,
    }),
    actions: {
        async fetchNotifications(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axiosInstance.get("notification", { params });
                this.notifications = response.data.data.data;
                this.meta = {
                    current_page: response.data.data.current_page,
                    last_page: response.data.data.last_page,
                    per_page: response.data.data.per_page,
                    total: response.data.data.total,
                };
            } catch (error) {
                this.error = handleError(error);
            } finally {
                this.loading = false;
            }
        },

        async fetchUnreadCount() {
            this.error = null;
            try {
                const response = await axiosInstance.get("notification/unread-count");
                this.unreadCount = response.data.data.unread_count;
            } catch (error) {
                this.error = handleError(error);
            }
        },

        async markAsRead(id) {
            this.error = null;
            try {
                const response = await axiosInstance.post(`notification/${id}/read`);
                const notification = this.notifications.find(n => n.id === id);
                if (notification && !notification.is_read) {
                    notification.is_read = true;
                    if (this.unreadCount > 0) this.unreadCount--;
                }
                this.success = response.data.message;
            } catch (error) {
                this.error = handleError(error);
            }
        },

        async markAllAsRead() {
            this.error = null;
            try {
                const response = await axiosInstance.post("notification/read-all");
                this.notifications.forEach(n => {
                    n.is_read = true;
                });
                this.unreadCount = 0;
                this.success = response.data.message;
            } catch (error) {
                this.error = handleError(error);
            }
        },

        async deleteNotification(id) {
            this.error = null;
            try {
                const response = await axiosInstance.delete(`notification/${id}`);
                const notification = this.notifications.find(n => n.id === id);
                if (notification && !notification.is_read) {
                    if (this.unreadCount > 0) this.unreadCount--;
                }
                this.notifications = this.notifications.filter(n => n.id !== id);
                this.success = response.data.message;
            } catch (error) {
                this.error = handleError(error);
            }
        }
    }
});
