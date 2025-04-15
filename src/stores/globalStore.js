import { defineStore } from "pinia"
import { ref } from "vue"

export const useGlobalStore = defineStore("global", () => {
	const toasts = ref([])

	function addToast(toast) {
		toasts.value.push({
			...toast,
			life: 3000,
			id: Date.now(),
		})
	}

	function deleteToast(id) {
		toasts.value = toasts.value.filter((t) => t.id !== id)
	}

	function addToastResponseError(toastSummary) {
		toasts.value.push({
			severity: "error",
			detail: toastSummary,
			life: 3000,
			id: Date.now(),
		})
	}

	return { toasts, addToast, deleteToast, addToastResponseError }
})
