<script setup>
import { authGet, authPost } from "@/api/auth"
import { useGlobalStore } from "@/stores/globalStore"
import { useUserStore } from "@/stores/userStore"
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const team = ref(null)
const achievements = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(loadTeam)

async function loadTeam() {
	loading.value = true
	error.value = null

	try {
		const { data: loadedTeam, status } = await authGet(`/teams/${route.params.id}`)

		if (status === 200) {
			team.value = loadedTeam
			loadStats()
		}
	} catch (e) {
		console.error("Ошибка загрузки профиля:", e)
		error.value = e.response.data || e.message
	} finally {
		loading.value = false
	}
}
async function loadStats() {
	try {
		const { data, status } = await authGet(`/stats/team/${team.value.id}`)
		if (status === 200) {
			team.value.stats = data
			loadAchievements()
		}
	} catch (e) {
		console.log(e)
		error.value = e.response.data || e.message
	}
}

async function loadAchievements() {
	try {
		const { data, status } = await authGet(`/stats/team/${team.value.id}/achievements`)

		if (status === 200) {
			achievements.value = data
		}
	} catch (e) {
		console.log(e)
		error.value = e.response.data || e.message
	}
}

const usersList = ref([])
const show = ref(false)
const addedUser = ref(null)
const errorText = ref("")
const usersSuggestions = ref([])

const userStore = useUserStore()

const globalStore = useGlobalStore()

async function searchUsers(e) {
	if (usersList.value.length === 0) {
		await loadUsers()
	}

	usersSuggestions.value =
		e.query.length === 0
			? usersList.value
			: usersList.value.filter(
					(user) =>
						user.username.toLowerCase().includes(e.query.toLowerCase()) &&
						user.id !== userStore.user.profile.id,
				)
}

async function loadUsers() {
	try {
		const { data, status } = await authGet("/users")

		if (status === 200) {
			usersList.value = data
		}
	} catch (e) {
		console.log(e)
		globalStore.addToastResponseError(e.response.data || e.message)
	}
}

async function addUser() {
	try {
		const { data, status } = authPost(`/teams/${team.value.id}/add-members`, [addedUser.value.id])

		await loadTeam()
		show.value = false
	} catch (e) {
		console.log(e)
		globalStore.addToastResponseError(e.response.data || e.message)
	}
}

async function removeUser(userId) {
	try {
		const { data, status } = authPost(`/teams/${team.value.id}/remove-members`, [userId])
		team.value.members = team.value.members.filter((elem) => {
			elem.id != userId
		})
		setTimeout(loadTeam, 200)
	} catch (e) {
		console.log(e)
		globalStore.addToastResponseError(e.response.data)
	}
}
</script>

<template>
	<div class="mx-auto w-fit">
		<div v-if="error">
			{{ $t("common.errors.default") }}
		</div>
		<div v-else-if="loading">{{ $t("common.loading") }}</div>
		<div
			v-else-if="team"
			class="flex flex-col gap-20 md:flex-row"
		>
			<div class="flex flex-col gap-4">
				<p class="text-center text-xl">{{ team.name }}</p>
				<p>{{ $t("team.solved") }}: {{ team.stats?.successful || $t("team.noData") }}</p>
				<p>{{ $t("team.attempts") }}: {{ team.stats?.total || $t("team.noData") }}</p>
				<p>{{ $t("team.rewards") }}:</p>
				<ul></ul>
				<p>{{ $t("team.members") }}:</p>
				<button
					@click="show = true"
					class="h-10 w-10 cursor-pointer rounded-xl bg-[var(--main-color)] text-xl hover:bg-[var(--main-hover-color)]"
					v-if="team.value?.members == undefined || team.value?.members.length < 4"
				>
					+
				</button>
				<ul class="flex flex-col gap-4">
					<li
						v-for="member in team.members"
						:key="member.id"
						class="flex items-center gap-4"
					>
						<img
							v-if="member.profile_pic_url"
							:src="member.profile_pic_url"
							:alt="$t('team.memberImageAlt')"
							class="aspect-square w-16 rounded-md"
						/>
						<p>{{ member.username }}</p>
						<button
							@click="removeUser(member.id)"
							class="white rounded-xl bg-red-400 px-4 py-2"
						>
							{{ $t("team.remove") }}
						</button>
					</li>
				</ul>
			</div>
		</div>
	</div>
	<Dialog
		v-model:visible="show"
		modal
		dismissable-mask
	>
		<div class="flex flex-col gap-3">
			<div class="dialog__name mb-6 text-2xl">{{ $t("team.addMember") }}</div>
			<Autocomplete
				:suggestions="usersSuggestions"
				@complete="searchUsers"
				option-label="username"
				v-model="addedUser"
			/>
			<div class="text-red-400">{{ errorText }}</div>
			<div class="flex justify-center">
				<button
					class="rounded-sm bg-[var(--second-bg)] p-2 pr-4 pl-4"
					@click="addUser"
				>
					{{ $t("team.create") }}
				</button>
			</div>
		</div>
	</Dialog>
</template>

<style scoped>
.white {
	color: white !important;
}
</style>
