<script setup>
import { RouterView } from 'vue-router'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
</script>

<template>
  <!-- Global Success Toast Notification -->
  <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform -translate-y-4 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform -translate-y-4 opacity-0 scale-95"
  >
      <div v-if="toastStore.show" 
           style="position: fixed; top: 120px; right: 40px; z-index: 9999; background-color: #10b981; border: 1px solid #34d399; color: white; display: flex; align-items: center; gap: 12px; border-radius: 16px; padding: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); max-width: 400px;">
          <div style="display: flex; width: 32px; height: 32px; border-radius: 9999px; background-color: rgba(255, 255, 255, 0.2); align-items: center; justify-content: center; flex-shrink: 0;">
              <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; color: white;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
          </div>
          <div style="display: flex; flex-direction: column; text-align: left;">
              <p style="font-weight: 700; margin: 0; line-height: 1.25;">Berhasil!</p>
              <p style="font-size: 14px; opacity: 0.95; margin: 4px 0 0 0; line-height: 1.375;">{{ toastStore.message }}</p>
          </div>
      </div>
  </Transition>

  <RouterView />
</template>

