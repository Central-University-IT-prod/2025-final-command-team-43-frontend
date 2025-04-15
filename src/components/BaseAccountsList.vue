<script setup>
import { loginFunc } from "@/api/auth"
import { useGlobalStore } from "@/stores/globalStore"
import { ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

const router = useRouter()
const globalStore = useGlobalStore()
const { t } = useI18n()

const loginLoading = ref(false)

const localLogin = async (username, password) => {
	loginLoading.value = true
	const { success, message, e } = await loginFunc(username, password)

	if (success) {
		router.push({ name: "contestsList" })
	} else {
		globalStore.addToast({ severity: "error", summary: e.response.data || e.message })
	}
}

const baseAccounts = [
	{
		role: "Организатор 1",
		login: () => {
			localLogin("danozord", "olesyamaystrenko")
		},
	},
	{
		role: "Организатор 2",
		login: () => {
			localLogin("org", "olesya31")
		},
	},
	{
		role: "Организатор 3",
		login: () => {
			localLogin("cofya", "testPass123")
		},
	},
	{
		role: "Организатор 4",
		login: () => {
			localLogin("org42", "olesya42")
		},
	},
	{
		role: "Участник 1",
		login: () => {
			localLogin("user5", "user5")
		},
	},
	{
		role: "Участник 2",
		login: () => {
			localLogin("user6", "user6")
		},
	},
	{
		role: "Участник 3",
		login: () => {
			localLogin("user7", "user7")
		},
	},
	{
		role: "Участник 4",
		login: () => {
			localLogin("user8", "user8")
		},
	},
	{
		role: "Участник 5",
		login: () => {
			localLogin("user9", "user9")
		},
	},
	{
		role: "Участник 6",
		login: () => {
			localLogin("user10", "user10")
		},
	},
]
</script>

<template>
	<div
		class="absolute top-0 left-0 flex h-[100vh] w-[100vw] items-center justify-center bg-[var(--primary-bg)]"
		v-if="loginLoading"
	>
		<ProgressSpinner />
	</div>
	<div class="flex w-70 flex-col gap-4 rounded-xl bg-[var(--second-bg)] px-8 py-4">
		<div class="title text-center text-xl">Войти как:</div>
		<ul class="inline-flex flex-col gap-4">
			<button
				class="block cursor-pointer rounded-xl bg-[var(--main-color)] p-4 disabled:bg-[var(--main-disabled-color)]"
				v-for="account in baseAccounts"
				:key="account.role"
				@click="account.login"
				:disabled="loginLoading"
			>
				{{ account.role }}
			</button>
		</ul>
	</div>
</template>

<style scoped></style>
