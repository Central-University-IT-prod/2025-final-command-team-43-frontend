<script setup>
import { RouterView } from "vue-router"
import { storeToRefs } from "pinia"
import { useToast } from "primevue"
import { nextTick, watch } from "vue"
import { useGlobalStore } from "./stores/globalStore"
import AppHeader from "./components/AppHeader.vue"
import { useTheme } from "@/composables/useTheme"

const globalStore = useGlobalStore()
const { toasts } = storeToRefs(globalStore)
const toast = useToast()

useTheme()

watch(
	toasts,
	(newToasts) => {
		newToasts.forEach((toastMessage) => {
			toast.add(toastMessage)
			globalStore.deleteToast(toastMessage.id)
		})
	},
	{ deep: true },
)
</script>

<template>
	<div class="min-h-screen">
		<Toast />
		<AppHeader />
		<main class="mx-auto px-4 py-6">
			<RouterView />
		</main>
	</div>
</template>

<style scoped>
header {
	line-height: 1.5;
	max-height: 100vh;
}

.logo {
	display: block;
	margin: 0 auto 2rem;
}

nav {
	width: 100%;
	font-size: 12px;
	text-align: center;
	margin-top: 2rem;
}

nav a.router-link-exact-active {
	color: var(--color-text);
}

nav a.router-link-exact-active:hover {
	background-color: transparent;
}

nav a {
	display: inline-block;
	padding: 0 1rem;
	border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
	border: 0;
}

@media (min-width: 1024px) {
	header {
		display: flex;
		place-items: center;
		padding-right: calc(var(--section-gap) / 2);
	}

	.logo {
		margin: 0 2rem 0 0;
	}

	header .wrapper {
		display: flex;
		place-items: flex-start;
		flex-wrap: wrap;
	}

	nav {
		text-align: left;
		font-size: 1rem;

		padding: 1rem 0;
		margin-top: 1rem;
	}
}

/* Добавляем плавные переходы для смены темы */
* {
	transition:
		background-color 0.2s ease-in-out,
		border-color 0.2s ease-in-out;
}
</style>
