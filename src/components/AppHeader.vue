<script setup>
import { useUserStore } from "@/stores/userStore"
import AppNav from "./AppNav.vue"
import { useRouter } from "vue-router"
import { useTheme } from "@/composables/useTheme"
import { computed, ref, watch } from "vue"
import { currentLocale, setLocale } from "@/i18n"
import { useI18n } from "vue-i18n"

const userStore = useUserStore()
const router = useRouter()
const { toggleTheme, isDark } = useTheme()
const { locale } = useI18n()

const logout = () => {
	userStore.user = {
		accessToken: null,
		profile: null,
	}

	router.push({ name: "login" })
}

function changeLocale() {
	setLocale(locale.value === "en" ? "ru" : "en")
}

const localeIcon = computed(() => {
	return locale.value === "en" ? "/en-flag.svg" : "/ru-flag.svg"
})

const logoutBtnVisible = ref(false)

watch(
	userStore,
	() => {
		if (!userStore.user.accessToken) {
			logoutBtnVisible.value = false
		} else {
			logoutBtnVisible.value = true
		}
	},
	{ immediate: true },
)

const profileVisible = ref(false)
watch(
	userStore,
	() => {
		if (!userStore.user.profile) {
			profileVisible.value = false
			return
		}

		if (userStore.user.profile.role === "participant") {
			profileVisible.value = true
		} else {
			profileVisible.value = false
		}
	},
	{ immediate: true },
)
</script>

<template>
	<header
		class="flex flex-row items-center justify-center gap-4 bg-[var(--second-bg)] py-2 sm:flex-row w-[100vw]"
	>
		<div class="flex w-1/2 flex-row items-center justify-between">
			<AppNav />
			<div class="ml-auto flex gap-2">
				<button
					@click="changeLocale"
					class="cursor-pointer !px-2 !py-0"
				>
					<img
						:src="localeIcon"
						alt="Language icon"
						class="aspect-square h-[2rem]"
					/>
				</button>
				<button
					@click="toggleTheme"
					class="cursor-pointer rounded-md px-2 py-1"
				>
					<i
						class="pi pi-sun"
						v-if="isDark"
					></i>
					<i
						class="pi pi-moon"
						v-else
					></i>
				</button>
				<RouterLink
					v-if="profileVisible"
					:to="{ name: 'profile' }"
					class="flex cursor-pointer items-center justify-between gap-2 rounded-md px-5 py-1"
				>
					<span>
						{{ userStore.user.profile.username }}
					</span>
					<img
						v-if="userStore.user.profile.profile_pic"
						:src="userStore.user.profile.profile_pic"
						:alt="$t('profile.imageAlt')"
						class="block aspect-square h-8 w-8 rounded-full bg-[var(--second-bg)]"
					/>
					<span
						class="noForPhone"
						v-else
					>
						<i class="pi pi-user px-1"></i>
					</span>
				</RouterLink>
				<div
					class="flex"
					v-if="logoutBtnVisible"
				>
					<button
						@click="logout"
						class="cursor-pointer rounded-md px-2 py-1"
					>
						<span class="noForPhone">
							<i class="pi pi-sign-out"></i>
						</span>
					</button>
				</div>
			</div>
		</div>
	</header>
</template>

<style scoped lang="scss">
.burger {
	position: relative;
	height: 1rem;
	width: 2rem;
	margin-top: 1.5rem;
	background: none;
	border: none;
	display: flex;
	flex-direction: column;
	justify-content: center;
	.line {
		width: 2rem;
		position: absolute;
		height: 0.25rem;
		background-color: var(--text-color);
		transition: 0.3s all ease;
	}
	.first {
		top: -0.25rem;
	}
	.third {
		bottom: -0.25rem;
	}
	&.active {
		.first {
			top: 0.375rem;
			rotate: 45deg;
		}
		.second {
			opacity: 0;
		}
		.third {
			bottom: 0.375rem;
			rotate: -45deg;
		}
	}
}
.menu {
	position: absolute;
	top: 4rem;
	width: 100vw;
	background-color: var(--primary-bg);
	height: 100vh;
	z-index: 99;
	padding-left: 2rem;
	display: flex;
	flex-direction: column;
	top: -100vh;
	transition: 0.3s all ease;
	&.active {
		top: 8vh;
	}
	button {
		width: fit-content;
		height: fit-content;
	}
}
.noForPhone {
	display: none;
}
@media (min-width: 780px) {
	.noForPhone {
		display: inline;
	}
}
@media (max-width:400px){
	header{
		justify-content: start;
		padding-left: 2rem;
	}
}
</style>
