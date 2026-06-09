import { handleError } from "@/helpers/errorHelper";
import { axiosInstance } from "@/plugins/axios";
import router from "@/router";
import { defineStore } from "pinia";
import { useAuthStore } from "@/stores/auth";

export const useProductStore = defineStore("product", {
    state: () => ({
        products: [],
        meta: {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        loading: false,
        error: null,
        success: null,
    }),
    actions: {
        async fetchProducts(params) {
            this.loading = true

            try {
                const response = await axiosInstance.get(`product`, { params })

                this.products = response.data.data
            } catch (error) {
                this.error = handleError(error)
            } finally {
                this.loading = false
            }
        },

        async fetchProductsPaginated(params) {
            this.loading = true

            try {
                const response = await axiosInstance.get(`product/all/paginated`, { params })

                this.products = response.data.data.data
                this.meta = response.data.data.meta
            } catch (error) {
                this.error = handleError(error)
            } finally {
                this.loading = false
            }
        },

        async loadMoreProducts(params) {
            this.loading = true

            try {
                const response = await axiosInstance.get(`product/all/paginated`, { params })

                this.products = [...this.products, ...response.data.data.data]
                this.meta = response.data.data.meta
            } catch (error) {
                this.error = handleError(error)
            } finally {
                this.loading = false
            }
        },

        async fetchProductById(id) {
            this.loading = true

            try {
                const response = await axiosInstance.get(`product/${id}`)

                return response.data.data
            } catch (error) {
                this.error = handleError(error)
            } finally {
                this.loading = false
            }
        },

        async fetchProductBySlug(slug) {
            this.loading = true

            try {
                const response = await axiosInstance.get(`product/slug/${slug}`)

                return response.data.data
            } catch (error) {
                this.error = handleError(error)
            } finally {
                this.loading = false
            }
        },

        async createProduct(payload) {
            this.loading = true
            this.error = null

            try {
                const authStore = useAuthStore()
                const storeId = authStore.user?.store?.id

                const response = await axiosInstance.post('product', {
                    ...payload,
                    store_id: storeId
                })

                this.success = response.data.message

                router.push({ name: 'admin.product' })
            } catch (error) {
                this.error = handleError(error)
            } finally {
                this.loading = false
            }
        },

        async updateProduct(payload) {
            this.loading = true
            this.error = null

            try {
                const authStore = useAuthStore()
                const storeId = authStore.user?.store?.id

                const response = await axiosInstance.post(`product/${payload.id}`, {
                    ...payload,
                    store_id: storeId,
                    _method: 'PUT'
                })

                this.success = response.data.message

                router.push({ name: 'admin.product' })
            } catch (error) {
                this.error = handleError(error)
            } finally {
                this.loading = false
            }
        },

        async deleteProduct(id) {
            this.loading = true

            try {
                const response = await axiosInstance.delete(`product/${id}`)

                this.success = response.data.message
            } catch (error) {
                this.error = handleError(error)
            } finally {
                this.loading = false
            }
        }
    }
});