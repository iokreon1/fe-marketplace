import { handleError } from "@/helpers/errorHelper";
import { axiosInstance } from "@/plugins/axios";
import Cookies from "js-cookie";
import { defineStore } from "pinia";
import router from "@/router";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        token: Cookies.get('token') || null,
        user: null,
        loading: false,
        error: null,
        success: null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.user,
    },
    actions: {
        async login(credentials) {
            this.loading = true
            this.error = null

            try {
                const response = await axiosInstance.post('/login', credentials)

                const token = response.data.data.token

                Cookies.set('token', token)

                this.token = token
                this.user = response.data.data
                this.success = response.data.message

                return response.data.data
            } catch (error) {
                this.error = handleError(error)
            } finally {
                this.loading = false
            }
        },

        async register(payload) {
            this.loading = true
            this.error = null

            try {
                const response = await axiosInstance.post('/register', payload)

                const token = response.data.data.token

                Cookies.set('token', token)

                this.token = token
                this.success = response.data.message
            } catch (error) {
                this.error = handleError(error)
            } finally {
                this.loading = false
            }
        },

        async checkAuth() {
            this.loading = true;
            try {
                const response = await axiosInstance.get('/me');
                this.user = response.data.data;
                return this.user;
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    Cookies.remove('token');
                    this.token = null;
                    throw new Error("Unauthorized");
                }
                this.error = handleError(error);
            } finally {
                this.loading = false;
            }
        },

        async updateProfile(payload) {
            this.loading = true
            this.error = null
            this.success = null

            try {
                const response = await axiosInstance.post('/profile/update', payload, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                this.user = response.data.data
                this.success = response.data.message
                return response.data.data
            } catch (error) {
                this.error = handleError(error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async logout() {
            this.loading = true

            try {
                await axiosInstance.post('/logout')
            } catch (error) {
                // ignore and proceed with local logout
            } finally {
                Cookies.remove('token')
                this.token = null

                this.user = null
                this.error = null
                this.loading = false

                router.push({ name: 'auth.login' })
            }
        }
    }
})