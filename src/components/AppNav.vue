<script setup>
import { useUserStore } from "@/stores/userStore"
import { computed, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter, useRoute } from "vue-router"
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const userStore = useUserStore()

const routes = ref([
	{
		id: 2,
		name: "contestsList",
		title: computed(() => t("nav.contestsList")),
		icon: "pi-home",
	},
])
const loading = ref(false)
const startLoading = () => {
	if (route.path != "/contests-list") {
		loading.value = true
	}
}
router.afterEach(() => {
	loading.value = false
})
</script>

<template>
	<div
		class="absolute top-0 left-0 z-999 flex h-[100vh] w-[100vw] items-center justify-center bg-[var(--primary-bg)]"
		v-if="loading"
	>
		<ProgressSpinner />
	</div>
	<nav
		class="flex items-center justify-center gap-4"
		v-show="userStore.user.profile"
	>
		<Button
			v-for="route in routes"
			:key="route.id"
			class="cursor-pointer rounded-md bg-[var(--main-color)] !p-0"
			@click="startLoading"
		>
			<RouterLink
				:to="{ name: route.name }"
				class="block h-full w-full px-3 py-2"
			>
				<span class="noForPhone mr-3">{{ route.title }}</span>

				<i
					class="pi"
					:class="route.icon"
				></i>
			</RouterLink>
		</Button>
	</nav>
</template>

<style scoped>
.noForPhone {
	display: none;
}
@media (min-width: 780px) {
	.noForPhone {
		display: inline;
	}
}
</style>
