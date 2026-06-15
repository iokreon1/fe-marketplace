import { defineStore } from 'pinia'


export const useWishlistStore = defineStore('wishlist', {
    state: () => ({
        items: [],
        currentUserId: null
    }),

    getters: {
        totalItems: (state) => state.items.length,
        isWishlisted: (state) => (productId) => {
            return state.items.some(item => item.id === productId)
        }
    },

    actions: {
        loadForUser(userId) {
            this.currentUserId = userId
            this.items = JSON.parse(localStorage.getItem(`wishlist_items_${userId}`)) || []
        },

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
            this.currentUserId = null
        },

        save() {
            const userId = this.currentUserId || 'guest'
            localStorage.setItem(`wishlist_items_${userId}`, JSON.stringify(this.items))
        }
    }
})
