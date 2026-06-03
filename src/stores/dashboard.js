import { handleError } from "@/helpers/errorHelper";
import { axiosInstance } from "@/plugins/axios";
import { defineStore } from "pinia";

export const useDashboardStore = defineStore("dashboard", {
    state: () => ({
        dashboard: {},
    }),
    actions: {
        async getDashboard() {
            try {
                const response = await axiosInstance.get("/dashboard");

                this.dashboard = response.data;
            } catch (error) {
                handleError(error);
            }
        }
    }
});