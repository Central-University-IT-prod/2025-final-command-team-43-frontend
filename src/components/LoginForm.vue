<script setup>
import { ref, computed } from "vue"
import { useI18n } from "vue-i18n"
import BaseAccountsList from "./BaseAccountsList.vue"
import { BASE_API_URL } from "@/api/constants"
import { useGlobalStore } from "@/stores/globalStore"
import axios from "axios"
import { loginFunc } from "@/api/auth"
import { useRouter } from "vue-router"
import { useUserStore } from "@/stores/userStore"

const { t } = useI18n()
const globalStore = useGlobalStore()
const router = useRouter()
const userStore = useUserStore()

const loginVisible = ref(false)
const registerVisible = ref(false)

const username = ref("")
const email = ref("")
const password = ref("")
const passwordRepeat = ref("")

const isEmailValid = computed(() => {
	if (!email.value) return true
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

	return emailRegex.test(email.value)
})

const isPasswordMatch = computed(() => {
	if (!passwordRepeat.value) return true
	return password.value === passwordRepeat.value
})

const loginLoading = ref(false)

async function login() {
	loginLoading.value = true
	loginVisible.value = false
	try {
		const { success, message, e } = await loginFunc(username.value, password.value)

		if (success) {
			if (username.value !== userStore.user.profile.username) {
				localStorage.clear()
			}
			router.push({ name: "contestsList" })
		} else {
			globalStore.addToast({ severity: "error", summary: e.response.data || e.message })
		}
	} catch (e) {
		console.log(e)
		globalStore.addToastResponseError(e.response.data || e.message)
	} finally {
		loginLoading.value = false
	}
}

const registerLoading = ref(false)

const registerFunc = async () => {
	registerLoading.value = true
	if (!isEmailValid.value) {
		globalStore.addToast({
			severity: "error",
			summary: t("auth.validation.invalidEmail"),
		})
		return
	}

	if (!isPasswordMatch.value) {
		globalStore.addToast({
			severity: "error",
			summary: t("auth.validation.passwordMismatch"),
		})
		return
	}

	try {
		const { status } = await axios.post(
			`${BASE_API_URL}/register`,
			{
				username: username.value,
				email: email.value,
				password: password.value,
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
			},
		)

		if (status === 201) {
			globalStore.addToast({
				severity: "success",
				summary: t("auth.messages.userCreated"),
			})

			login()
		}
	} catch (e) {
		console.error(e)
		globalStore.addToastResponseError(e.response.data || e.message)
	} finally {
		registerVisible.value = false
		registerLoading.value = false
	}
}

function clearForm() {
	username.value = ""
	email.value = ""
	password.value = ""
	passwordRepeat.value = ""
}
</script>

<template>
	<div
		class="absolute top-0 left-0 flex h-[100vh] w-[100vw] items-center justify-center bg-[var(--primary-bg)]"
		v-if="loginLoading || registerLoading"
	>
		<ProgressSpinner />
	</div>
	<div class="mx-auto mt-4 flex w-fit flex-col items-center gap-2">
		<div class="menu-all block">
			<BaseAccountsList />
		</div>
		<div class="menu block">
			<button
				class="btn mt-3 block w-40 cursor-pointer rounded bg-[var(--second-bg)] px-4 py-2 transition-colors hover:bg-[var(--main-hover-color)]"
				@click="loginVisible = true"
			>
				{{ t("auth.login.button") }}
			</button>

			<Dialog
				v-model:visible="loginVisible"
				modal
				dismissable-mask
				@hide="clearForm"
			>
				<form
					@submit.prevent="login"
					class="form-dialog flex flex-col"
				>
					<div class="mb-4 text-xl font-bold">{{ t("auth.login.title") }}</div>
					<div class="mb-3">
						<span class="mb-1 block">{{ t("auth.login.username") }}</span>
						<input
							name="username"
							type="text"
							v-model="username"
							:placeholder="t('auth.login.username')"
							class="w-full rounded border p-2"
							required
						/>
					</div>
					<div class="mb-4">
						<span class="mb-1 block">{{ t("auth.login.password") }}</span>
						<input
							name="password"
							type="password"
							v-model="password"
							:placeholder="t('auth.login.password')"
							class="w-full rounded border p-2"
							required
						/>
					</div>
					<button
						type="submit"
						class="mx-auto w-fit rounded bg-[var(--main-color)] px-8 py-2 text-white transition-colors hover:bg-[var(--main-color)] disabled:bg-[var(--main-disabled-color)]"
						:disabled="loginLoading"
					>
						{{ t("auth.login.submit") }}
					</button>
				</form>
			</Dialog>

			<button
				class="mt-3 block w-40 cursor-pointer rounded bg-[var(--second-bg)] px-4 py-2 transition-colors hover:bg-[var(--main-hover-color)]"
				@click="registerVisible = true"
			>
				{{ t("auth.register.button") }}
			</button>

			<Dialog
				v-model:visible="registerVisible"
				modal
				dismissable-mask
				@hide="clearForm"
			>
				<form
					@submit.prevent="registerFunc"
					class="form-dialog-reg flex flex-col"
				>
					<div class="mb-2 text-xl font-bold">{{ t("auth.register.title") }}</div>
					<div class="mb-4 text-sm">{{ t("auth.register.subtitle") }}</div>

					<div class="mb-3">
						<span class="mb-1 block">{{ t("auth.register.username") }}</span>
						<input
							name="username"
							v-model="username"
							type="text"
							class="w-full rounded border p-2"
							:placeholder="t('auth.register.username')"
							required
						/>
					</div>

					<div class="mb-3 flex flex-col gap-1">
						<span class="mb-1 block">{{ t("auth.register.email") }}</span>
						<input
							name="email"
							v-model="email"
							type="email"
							class="w-full rounded border p-2"
							:placeholder="t('auth.register.email')"
							required
						/>
						<span
							v-if="!isEmailValid"
							class="text-sm text-red-500"
						>
							{{ t("auth.validation.invalidEmail") }}
						</span>
					</div>

					<div class="mb-3">
						<span class="mb-1 block">{{ t("auth.register.password") }}</span>
						<input
							name="password"
							v-model="password"
							type="password"
							class="w-full rounded border p-2"
							:placeholder="t('auth.register.password')"
							required
						/>
					</div>

					<div class="mb-4 flex flex-col gap-1">
						<span class="mb-1 block">{{ t("auth.register.repeatPassword") }}</span>
						<input
							name="repeatPassword"
							v-model="passwordRepeat"
							type="password"
							class="w-full rounded border p-2"
							:placeholder="t('auth.register.repeatPassword')"
							required
						/>
						<span
							v-if="!isPasswordMatch"
							class="text-sm text-red-500"
						>
							{{ t("auth.validation.passwordMismatch") }}
						</span>
					</div>

					<button
						type="submit"
						class="mx-auto w-fit rounded bg-[var(--main-color)] px-4 py-2 text-white transition-colors hover:bg-[var(--main-color)] disabled:bg-[var(--main-disabled-color)]"
						:disabled="registerLoading"
					>
						{{ t("auth.register.submit") }}
					</button>
				</form>
			</Dialog>
		</div>
	</div>
</template>

<style scoped>
.form-dialog,
.form-dialog-reg {
	min-width: 300px;
}
</style>
