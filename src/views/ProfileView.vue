<script setup>
import { authGet, authPost } from "@/api/auth"
import TeamCard from "@/components/TeamCard.vue"
import { useGlobalStore } from "@/stores/globalStore"
import { useUserStore } from "@/stores/userStore"
import { onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { CalendarHeatmap } from "vue3-calendar-heatmap"
import { isDark } from "@/composables/useTheme"
import { sendRequest } from "@/api/common"

const router = useRouter()
const userStore = useUserStore()
const globalStore = useGlobalStore()
const profile = ref(null)
const achievements = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
	await loadProfile()
	await loadStats()
})

async function loadProfile() {
	loading.value = true
	error.value = null

	try {
		const { data: loadedProfile, status } = await authGet(`/profile`)

		if (status === 200) {
			profile.value = loadedProfile
			userStore.user.profile = profile.value
		}
	} catch (e) {
		console.error("Ошибка загрузки профиля:", e)

		if (e.response?.status === 401) {
			router.push("/login")
			return
		}
		error.value = e.response.data || e.message
	} finally {
		loading.value = false
	}
}

async function loadStats() {
	try {
		const { data, status } = await authGet(`/stats/user/${profile.value.id}`)
		if (status === 200) {
			let graph = []
			for (let key in data.activity) {
				let count = data.activity[key]
				graph.push({ date: key, count: count })
			}
			data.graph = graph
			profile.value.stats = data
			loadAchievements()
		}
	} catch (e) {
		console.log(e)
		globalStore.addToastResponseError(e.response.data || e.message)
	}
}
async function loadAchievements() {
	try {
		const { data, status } = await authGet(`/stats/user/${profile.value.id}/achievements`)
		if (status === 200) {
			achievements.value = data
		}
	} catch (e) {
		console.log(e)
		globalStore.addToastResponseError(e.response.data || e.message)
	}
}
const show = ref(false)

const usersList = ref([])
const usersSuggestions = ref([])
const addedUsers = ref([])
const teamName = ref("")
const errorText = ref("")

async function searchUsers(e) {
	if (usersList.value.length === 0) {
		await loadUsers()
	}

	console.log(usersList.value)

	usersSuggestions.value =
		e.query.length === 0
			? usersList.value
			: usersList.value.filter((user) => {
					const a = user.username.toLowerCase().includes(e.query.toLowerCase())
					const b = user.id !== userStore.user.profile.id
					return a && b
				})
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

const handleSelectionChange = (newValue) => {
	if (newValue.length > 5) {
		addedUsers.value = newValue.slice(0, 5)
	} else {
		addedUsers.value = newValue
	}
}

async function createTeam() {
	let id = null
	if (teamName.value.trim().length === 0) {
		globalStore.addToast({ severity: "warn", life: 3000, summary: "Введите название" })
		return
	}
	try {
		const { data, status } = await authPost("/teams", {
			name: teamName.value,
		})
		id = data.id
	} catch (e) {
		console.log(e)
		globalStore.addToastResponseError(e.response.data || e.message)
	}

	if (id === null || addedUsers.value.length === 0) {
		show.value = false
		await loadProfile()
		return
	}

	try {
		const { data, status } = await authPost(
			`/teams/${id}/add-members`,
			addedUsers.value.map((user) => user.id),
		)
		show.value = false
		await loadProfile()
	} catch (e) {
		console.log(e)
		globalStore.addToastResponseError(e.response.data || e.message)
	}
}

async function addAvatar(event) {
	let fileReader = new FileReader()

	fileReader.onload = async () => {
		profile.value.profile_pic = fileReader.result
		let chota = new FormData()
		chota.append("file", event.target.files[0])
		const userStore = useUserStore()
		try {
			const response = await sendRequest("POST", `profile/upload-profile-pic`, chota, {
				"Content-Type": "multipart/form-data",
				Authorization: `Bearer ${userStore.user.accessToken}`,
			})
		} catch (e) {
			console.log(e)
			globalStore.addToastResponseError(e.response.data || e.message)
		}
	}
	fileReader.readAsDataURL(event.target.files[0])
}

const calendarEl = ref(null)
const monthLabelsListEl = ref(null)
const weekWrappersListEl = ref(null)

// vch__wrapper
// vch__months__labels__wrapper
// vch__year__wrapper
onMounted(() => {
	const observer = new MutationObserver(() => {
		const element = document.querySelector(".vch__wrapper")
		if (element) {
			calendarEl.value = element
			monthLabelsListEl.value = document.querySelector(".vch__months__labels__wrapper")
			weekWrappersListEl.value = document.querySelector(".vch__year__wrapper")
			observer.disconnect()
		}
	})

	observer.observe(document.body, { childList: true, subtree: true })
})

watch([calendarEl, monthLabelsListEl, weekWrappersListEl], () => {
	let i = 0

	while (i < 6) {
		monthLabelsListEl.value.removeChild(monthLabelsListEl.value.children[0])
		i++
	}

	const childrenLength = weekWrappersListEl.value.children.length

	const numberToKeep = Math.ceil(childrenLength / 2)

	let k = 0
	while (k < numberToKeep) {
		weekWrappersListEl.value.removeChild(weekWrappersListEl.value.children[0])
		k++
	}

	const viewBox = calendarEl.value.getAttribute("viewBox")
	const coords = viewBox.split(" ")
	coords[3] = coords[3] - 12 * numberToKeep
	calendarEl.value.setAttribute("viewBox", coords.join(" "))
	calendarEl.value.style.width = "100%"

	for (let i = 0; i < 6; i++) {
		const currentElem = monthLabelsListEl.value.children[i]
		const translateX = currentElem.getAttribute("x")
		const newTranslate = translateX - 12 * numberToKeep
		currentElem.setAttribute("x", `${newTranslate}`)
	}

	const childrenLength2 = weekWrappersListEl.value.children.length

	for (let i = 0; i < childrenLength2; i++) {
		const currentElem = weekWrappersListEl.value.children[i]
		const translateX = currentElem
			.getAttribute("transform")
			.slice(10, currentElem.getAttribute("transform").indexOf(","))
		const newTranslate = translateX - 12 * numberToKeep
		currentElem.setAttribute("transform", `translate(${newTranslate}, 0)`)
	}
})
</script>

<template>
	<div class="mx-auto sm:mx-10 lg:mx-20">
		<div v-if="error">
			{{ $t("common.errors.default") }}
		</div>
		<div v-else-if="loading">{{ $t("common.loading") }}</div>
		<div
			v-else-if="profile"
			class="flex flex-col gap-4 sm:gap-4 md:flex-row md:gap-20"
		>
			<div class="flex flex-col items-center">
				<div class="relative flex h-50 w-50 items-end justify-center rounded-full">
					<img
						v-if="profile.profile_pic"
						:src="profile.profile_pic"
						:alt="$t('profile.imageAlt')"
						class="aspect-square w-50 rounded-full bg-[var(--second-bg)]"
					/>
					<label
						for="avatar"
						class=""
					>
						<i class="pi pi-pencil"></i>
					</label>
					<input
						type="file"
						id="avatar"
						accept="image/png,image/jpeg"
						class="file"
						@change="addAvatar($event)"
					/>
				</div>
				<p class="mt-3 text-center text-xl">
					<b>{{ profile.username }}</b>
				</p>
			</div>
			<div class="">
				<Panel
					:header="$t('profile.statistics')"
					class="flex flex-col gap-4"
				>
					<p>
						<span class="text-lg">{{ $t("profile.solved") }}</span>
						:
						{{ profile.stats?.successful || $t("profile.noData") }}
					</p>
					<p>
						<span class="text-lg">{{ $t("profile.attempts") }}</span>
						:
						{{ profile.stats?.total || $t("profile.noData") }}
					</p>
					<p class="text-lg">{{ $t("profile.solutions") }}:</p>
					<div class="calendar">
						<CalendarHeatmap
							:values="profile?.stats?.graph || []"
							:end-date="new Date()"
							:dark-mode="isDark"
							:style="{ fill: isDark ? 'white' : '' }"
						/>
					</div>
				</Panel>
				<Panel
					:header="$t('profile.rewards')"
					class="mt-3"
				>
					<div v-if="achievements == null || achievements.length == 0">
						{{ $t("profile.noRewards") }}
					</div>
					<div v-else>
						<div
							v-for="achievement in achievements"
							class="flex flex-col rounded-xl bg-[var(--second-color)] px-4 py-4"
							:key="achievement.name"
						>
							<div class="text-xl">{{ achievement.contest.name }}</div>
							<div>{{ achievement.place }} {{ $t("profile.place") }}!</div>
						</div>
					</div>
				</Panel>
				<Panel
					:header="$t('profile.teams')"
					class="mt-3"
				>
					<Button
						@click="show = true"
						class="h-10 w-10 cursor-pointer rounded-xl bg-[var(--main-color)] text-xl hover:bg-[var(--main-hover-color)]"
					>
						<i class="pi pi-plus"></i>
					</Button>
					<br />
					<ul class="mt-2 flex flex-row flex-wrap gap-x-8">
						<li
							v-for="team in profile.teams"
							:key="team.id"
						>
							<RouterLink :to="{ name: 'team', params: { id: team.id } }">
								<TeamCard :team="team" />
							</RouterLink>
						</li>
					</ul>
				</Panel>
			</div>
		</div>
		<Dialog
			v-model:visible="show"
			modal
			dismissable-mask
			class="min-w-[320px]"
		>
			<div class="flex flex-col gap-3">
				<div class="dialog__name mb-6 text-2xl">{{ $t("profile.createTeam") }}</div>
				<div class="input-wrapper flex flex-col">
					<label for="name">{{ $t("profile.teamName") }}:</label>
					<CustomInput
						v-model="teamName"
						:placeholder="$t('profile.teamNamePlaceholder')"
						id="name"
					/>
				</div>
				<Autocomplete
					:placeholder="$t('profile.memberPlaceholder')"
					:suggestions="usersSuggestions"
					@complete="searchUsers"
					option-label="username"
					multiple
					v-model="addedUsers"
					@update:model-value="handleSelectionChange"
				/>
				<div class="text-red-400">{{ errorText }}</div>
				<div class="flex justify-center">
					<button
						class="rounded-sm bg-[var(--second-bg)] p-2 pr-4 pl-4"
						@click="createTeam"
					>
						{{ $t("profile.create") }}
					</button>
				</div>
			</div>
		</Dialog>
	</div>
</template>

<style>
.file {
	display: none;
}

.vch__day__label {
	display: none;
}
.vch__legend {
	margin-left: 1.5rem;
}
.vch__month__label {
	font-size: 0.5rem;
}

.vch__wrapper {
	/* width: 50rem; */
}

@media (min-width: 768px) {
	.vch__wrapper {
		width: 50vw !important;
	}
}
/* .vch__wrapper{
	display: flex;
	justify-content: start;
	width: 100rem !important;
	max-width: 30vw !important;
	height: 70rem;
} */

/* .vch__year__wrapper{
	display: flex;
	width: 100rem !important;
	max-width: 70vw !important;
	height: 70rem;
	overflow-x: scroll;
}
.vch__day__square{
	width: 1rem;
	height: 1rem;
}
.vch__month__wrapper{
	height: 70rem;
	width: 100vw;
} */
</style>
