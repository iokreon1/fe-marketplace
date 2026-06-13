import { defineStore } from 'pinia'

const STORAGE_KEY = 'wishlist_items'

export const useWishlistStore = defineStore('wishlist', {
    state: () => ({
        items: JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    }),

    getters: {
        totalItems: (state) => state.items.length,
        isWishlisted: (state) => (productId) => {
            return state.items.some(item => item.id === productId)
        }
    },

    actions: {
        toggleWishlist(product) {
            const index = this.items.findIndex(item => item.id === product.id)
            let added = false

            if (index === -1) {
                // deep clone product to avoid reference issues
                const clonedProduct = JSON.parse(JSON.stringify(product))
                this.items.push(clonedProduct)
                added = true
            } else {
                this.items.splice(index, 1)
            }

            this.save()
            return added
        },

        removeFromWishlist(productId) {
            this.items = this.items.filter(item => item.id !== productId)
            this.save()
        },

        clearWishlist() {
            this.items = []
            this.save()
        },

        save() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
        }
    }
})
