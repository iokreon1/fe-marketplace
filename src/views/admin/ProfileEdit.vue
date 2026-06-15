<script setup>
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { ref, onMounted } from 'vue';
import Placeholder from '@/assets/images/icons/photo-profile-default.svg';
import { debounce } from 'lodash';

const authStore = useAuthStore()
const { user, loading, error, success } = storeToRefs(authStore)
const { updateProfile } = authStore

const profile = ref({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    // Buyer specific fields
    phone_number: '',
    profile_picture: null,
    profile_picture_url: Placeholder,
    address_id: '',
    city: '',
    address: '',
    postal_code: ''
})

const addressSearch = ref('');
const addressOptions = ref([]);
const showAddressOptions = ref(false);
const loadingAddress = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const loadProfileData = () => {
    if (user.value) {
        profile.value.name = user.value.name || ''
        profile.value.email = user.value.email || ''
        profile.value.profile_picture_url = user.value.profile_picture || Placeholder

        if (user.value.role === 'buyer' && user.value.buyer) {
            profile.value.phone_number = user.value.buyer.phone_number || ''
            profile.value.address_id = user.value.buyer.address_id || ''
            profile.value.city = user.value.buyer.city || ''
            profile.value.address = user.value.buyer.address || ''
            profile.value.postal_code = user.value.buyer.postal_code || ''
            addressSearch.value = user.value.buyer.address || ''
        }
    }
}

onMounted(loadProfileData)

const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
        profile.value.profile_picture = file
        profile.value.profile_picture_url = URL.createObjectURL(file)
    }
}

const handleAddressInput = debounce(async (search) => {
    if (!search || !search.trim()) {
        showAddressOptions.value = false;
        return;
    }
    loadingAddress.value = true;
    try {
        const response = await fetch(`/tariff/api/v1/destination/domestic-destination?search=${encodeURIComponent(search)}`, {
            headers: {
                'key': import.meta.env.VITE_KEY_RAJA_ONGKIR
            }
        });

        const data = await response.json();
        addressOptions.value = data.data;
        showAddressOptions.value = true;
    } catch (err) {
        console.error('Error fetching address:', err);
    } finally {
        loadingAddress.value = false;
    }
}, 500);

const handleAddressSelect = (selected) => {
    profile.value.address_id = selected.id;
    profile.value.city = selected.city_name;
    profile.value.address = selected.label;
    profile.value.postal_code = selected.zip_code;
    addressSearch.value = selected.label;
    showAddressOptions.value = false;
};

const handleSubmit = async () => {
    successMessage.value = ''
    errorMessage.value = ''

    const formData = new FormData()
    formData.append('name', profile.value.name)
    formData.append('email', profile.value.email)
    
    if (profile.value.password) {
        formData.append('password', profile.value.password)
        formData.append('password_confirmation', profile.value.password_confirmation)
    }

    if (user.value.role === 'buyer') {
        formData.append('phone_number', profile.value.phone_number)
        if (profile.value.profile_picture) {
            formData.append('profile_picture', profile.value.profile_picture)
        }
        if (profile.value.address_id) {
            formData.append('address_id', profile.value.address_id)
        }
        if (profile.value.city) {
            formData.append('city', profile.value.city)
        }
        if (profile.value.address) {
            formData.append('address', profile.value.address)
        }
        if (profile.value.postal_code) {
            formData.append('postal_code', profile.value.postal_code)
        }
    }

    try {
        await updateProfile(formData)
        successMessage.value = 'Profile successfully updated!'
        // Reset password fields
        profile.value.password = ''
        profile.value.password_confirmation = ''
        loadProfileData()
    } catch (err) {
        errorMessage.value = error.value?.message || 'Failed to update profile. Please check validation errors.'
    }
}
</script>

<template>
    <div class="flex flex-col gap-6 w-full max-w-[800px]">
        <!-- Alert Notifications -->
        <div v-if="successMessage" class="flex p-4 rounded-2xl bg-custom-lime-green/20 border border-custom-lime-green text-custom-black font-semibold">
            {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="flex p-4 rounded-2xl bg-red-100 border border-red-400 text-red-700 font-semibold">
            {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col w-full rounded-3xl p-6 gap-6 bg-white shadow-sm">
            <h2 class="font-bold text-xl capitalize">Edit Profile Settings</h2>
            <hr class="border-custom-border" />

            <!-- Profile Picture Section (Buyer Only) -->
            <div v-if="user?.role === 'buyer'" class="flex items-center justify-between py-2">
                <p class="font-semibold text-custom-grey">Profile Picture</p>
                <div class="flex items-center gap-6 w-1/2">
                    <div class="group relative flex size-[100px] rounded-full overflow-hidden items-center justify-center bg-custom-background border border-custom-border animate-fade">
                        <img id="Thumbnail" :src="profile.profile_picture_url" class="size-full object-cover" alt="avatar" />
                        <input type="file" id="File-Input" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" @change="handleImageChange" />
                    </div>
                    <label for="File-Input" class="flex items-center justify-center rounded-2xl py-3 px-5 bg-custom-black text-white font-semibold text-sm cursor-pointer hover:bg-neutral-800 transition-300">
                        Change Photo
                    </label>
                </div>
            </div>

            <!-- Full Name -->
            <div class="flex items-center justify-between">
                <p class="font-semibold text-custom-grey">Complete Name</p>
                <div class="group/errorState flex flex-col gap-2 w-1/2" :class="{ 'invalid': error?.name }">
                    <label class="group relative">
                        <div class="input-icon">
                            <img src="@/assets/images/icons/profile-circle-grey.svg" class="flex size-6 shrink-0" alt="icon">
                        </div>
                        <p class="input-placeholder">
                            Enter Your Full Name
                        </p>
                        <input type="text" class="custom-input" placeholder="" v-model="profile.name">
                    </label>
                    <span class="input-error" v-if="error?.name">{{ error?.name?.join(', ') }}</span>
                </div>
            </div>

            <!-- Email Address -->
            <div class="flex items-center justify-between">
                <p class="font-semibold text-custom-grey">Email Address</p>
                <div class="group/errorState flex flex-col gap-2 w-1/2" :class="{ 'invalid': error?.email }">
                    <label class="group relative">
                        <div class="input-icon">
                            <img src="@/assets/images/icons/sms-grey.svg" class="flex size-6 shrink-0" alt="icon">
                        </div>
                        <p class="input-placeholder">
                            Enter Email Address
                        </p>
                        <input type="email" class="custom-input" placeholder="" v-model="profile.email">
                    </label>
                    <span class="input-error" v-if="error?.email">{{ error?.email?.join(', ') }}</span>
                </div>
            </div>

            <!-- Phone Number (Buyer Only) -->
            <div v-if="user?.role === 'buyer'" class="flex items-center justify-between">
                <p class="font-semibold text-custom-grey">Phone Number</p>
                <div class="group/errorState flex flex-col gap-2 w-1/2" :class="{ 'invalid': error?.phone_number }">
                    <label class="group relative">
                        <div class="input-icon">
                            <img src="@/assets/images/icons/call-grey.svg" class="flex size-6 shrink-0" alt="icon">
                        </div>
                        <p class="input-placeholder">
                            Enter Phone Number
                        </p>
                        <input type="text" class="custom-input" placeholder="" v-model="profile.phone_number">
                    </label>
                    <span class="input-error" v-if="error?.phone_number">{{ error?.phone_number?.join(', ') }}</span>
                </div>
            </div>

            <!-- Address Location Search (Buyer Only) -->
            <div v-if="user?.role === 'buyer'" class="flex justify-between">
                <p class="font-semibold text-custom-grey mt-4">Address Search</p>
                <div class="group/errorState flex flex-col gap-2 w-1/2 relative" :class="{ 'invalid': error?.address_id }">
                    <label class="group relative">
                        <div class="input-icon">
                            <img src="@/assets/images/icons/global-search-grey.svg" class="flex size-6 shrink-0" alt="icon">
                        </div>
                        <p class="input-placeholder">
                            Search City/Subdistrict
                        </p>
                        <input type="text" class="custom-input" placeholder="" v-model="addressSearch" @input="handleAddressInput(addressSearch)">
                    </label>
                    <ul class="search-result absolute left-0 right-0 top-full mt-1 bg-white border border-custom-border rounded-2xl max-h-[200px] overflow-y-auto z-50 shadow-lg" v-if="showAddressOptions">
                        <li v-for="option in addressOptions" :key="option.id" class="p-3 hover:bg-custom-background cursor-pointer text-sm font-semibold border-b border-custom-border/50 last:border-none" @click="handleAddressSelect(option)">
                            {{ option.label }}
                        </li>
                    </ul>
                    <span class="text-xs text-custom-grey" v-if="loadingAddress">Searching locations...</span>
                    <span class="input-error" v-if="error?.address_id">{{ error?.address_id?.join(', ') }}</span>
                </div>
            </div>

            <!-- Street Address (Buyer Only) -->
            <div v-if="user?.role === 'buyer'" class="flex justify-between">
                <p class="font-semibold text-custom-grey mt-4">Detailed Address</p>
                <div class="group/errorState flex flex-col gap-2 w-1/2" :class="{ 'invalid': error?.address }">
                    <label
                        class="group flex py-4 px-6 rounded-3xl border-[2px] border-custom-border focus-within:border-custom-black transition-300 w-full group-[&.invalid]/errorState:border-custom-red">
                        <div class="flex h-full pr-4 pt-2 border-r-[1.5px] border-custom-border">
                            <img src="@/assets/images/icons/location-grey.svg" class="flex size-6 shrink-0" alt="icon">
                        </div>
                        <div class="flex flex-col gap-[6px] pl-4 w-full">
                            <p
                                class="placeholder font-semibold text-custom-grey text-sm group-has-[textarea:placeholder-shown]:text-base group-has-[textarea:placeholder-shown]:text-custom-black group-has-[textarea:placeholder-shown]:font-bold transition-300">
                                Enter Your Detailed Address
                            </p>
                            <textarea class="appearance-none outline-none w-full font-semibold leading-[160%] resize-none"
                                rows="3" placeholder=" " v-model="profile.address"></textarea>
                        </div>
                    </label>
                    <span class="input-error" v-if="error?.address">{{ error?.address?.join(', ') }}</span>
                </div>
            </div>

            <!-- City & Postal Code (Buyer Only - Readonly/Generated from search) -->
            <div v-if="user?.role === 'buyer' && profile.city" class="flex items-center justify-between">
                <p class="font-semibold text-custom-grey">Selected City & Zip</p>
                <div class="flex gap-4 w-1/2">
                    <input type="text" class="custom-input !pt-[25px] !pb-[25px] w-2/3 bg-custom-background cursor-not-allowed" readonly :value="profile.city">
                    <input type="text" class="custom-input !pt-[25px] !pb-[25px] w-1/3 bg-custom-background cursor-not-allowed" readonly :value="profile.postal_code">
                </div>
            </div>

            <hr class="border-custom-border" />
            <h3 class="font-bold text-lg capitalize">Change Password (Optional)</h3>

            <!-- Password -->
            <div class="flex items-center justify-between">
                <p class="font-semibold text-custom-grey">New Password</p>
                <div class="group/errorState flex flex-col gap-2 w-1/2" :class="{ 'invalid': error?.password }">
                    <label class="group relative">
                        <div class="input-icon">
                            <img src="@/assets/images/icons/key-grey.svg" class="flex size-6 shrink-0" alt="icon">
                        </div>
                        <p class="input-placeholder">
                            Enter New Password
                        </p>
                        <input type="password" class="custom-input" placeholder="" v-model="profile.password">
                    </label>
                    <span class="input-error" v-if="error?.password">{{ error?.password?.join(', ') }}</span>
                </div>
            </div>

            <!-- Password Confirmation -->
            <div class="flex items-center justify-between">
                <p class="font-semibold text-custom-grey">Confirm Password</p>
                <div class="group/errorState flex flex-col gap-2 w-1/2" :class="{ 'invalid': error?.password }">
                    <label class="group relative">
                        <div class="input-icon">
                            <img src="@/assets/images/icons/key-grey.svg" class="flex size-6 shrink-0" alt="icon">
                        </div>
                        <p class="input-placeholder">
                            Confirm New Password
                        </p>
                        <input type="password" class="custom-input" placeholder="" v-model="profile.password_confirmation">
                    </label>
                </div>
            </div>

            <hr class="border-custom-border" />

            <!-- Submit Button -->
            <div class="flex justify-end gap-4">
                <button type="submit" :disabled="loading" class="flex items-center justify-center rounded-2xl py-4 px-6 bg-custom-blue text-white font-semibold text-lg cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ loading ? 'Saving Changes...' : 'Save Settings' }}
                </button>
            </div>
        </form>
    </div>
</template>
