import {defineStore} from 'pinia'
import {ref} from 'vue'


export const useUserStore = defineStore('user', () => {
	const user = ref({
		accessToken: null,
		profile: null
	})

	return {user}
}, {
	persist: true
})
