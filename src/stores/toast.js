import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
    state: () => ({
        message: '',
        show: false
    }),
    actions: {
        showToast(message) {
            this.message = message
            this.show = true
            
            // Auto hide after 3 seconds
            setTimeout(() => {
                this.show = false
            }, 3000)
        }
    }
})
