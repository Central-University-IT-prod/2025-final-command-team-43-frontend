<script setup>
import CreateContest from "@/components/createContest.vue"
import { ref } from "vue"
import { onMounted } from "vue"
import { getContests } from "@/api/contests"
import { useI18n } from "vue-i18n"
import { computed } from "vue"
import { useUserStore } from "@/stores/userStore"
import SelectTeamDialog from "@/components/SelectTeamDialog.vue"
import { useRouter } from "vue-router"
import Checkbox from "primevue/checkbox"

const nowMenu = ref("education")
const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

const createContestVisible = ref(false)

const toptions = computed(() => {
	return [
		{ name: t("contests.educational"), code: "education" },
		{ name: t("contests.competitions"), code: "competitions" },
	]
})

const contestsList = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(loadContestsList)

async function loadContestsList() {
	loading.value = true

	try {
		const { data, status } = await getContests()

		contestsList.value = data
	} catch (e) {
		console.log(e)
		error.value = e.response.data || e.message
	} finally {
		loading.value = false
	}
}

const showOnlyManaged = ref(false)

const filteredContestsList = computed(() => {
	if (showOnlyManaged.value === true) {
		return contestsList.value.filter((contest) => {
			return contest.organisers !== undefined
		})
	} else {
		return contestsList.value
	}
})

const educationalContestsList = computed(() => {
	return filteredContestsList.value.filter((contest) => {
		return contest.end_datetime === null
	})
})

const competitionContestsList = computed(() => {
	return filteredContestsList.value.filter((contest) => {
		return contest.end_datetime !== null
	})
})

const selectTeamVisible = ref(false)
const contestIdToNavigate = ref(null)

const openDialog = (contestId) => {
	contestIdToNavigate.value = contestId

	if (localStorage.getItem(`selectedTeam-${contestId}`)) {
		navigateToContest()
		return
	}

	if (userStore.user.profile.role === "organiser") {
		localStorage.setItem(`selectedTeam-${contestId}`, userStore.user.profile.individual_team.id)
		navigateToContest()
		return
	}

	selectTeamVisible.value = true
}

const navigateToContest = () => {
	if (contestIdToNavigate.value) {
		router.push(`/contests/${contestIdToNavigate.value}`)
	}
}
</script>

<template>
	<main v-if="loading">{{ $t("common.loading") }}</main>
	<main v-else-if="error">{{ $t("common.errors.default") }}</main>
	<main
		v-else-if="contestsList"
		class="flex items-center justify-center"
	>
		<div class="w-4/5">
			<div class="header mx-2 flex justify-between lg:mx-8">
				<div class="flex items-center">
					<div class="flex items-start">
						<div class="card flex justify-center">
							<SelectButton
								v-model="nowMenu"
								:options="toptions"
								option-label="name"
								option-value="code"
								:allowEmpty="false"
							/>
						</div>
					</div>
					<template v-if="userStore.user.profile?.role === 'organiser'">
						<Checkbox
							class="ml-10"
							v-model="showOnlyManaged"
							title="check"
							binary
							input-id="showOnlyManaged"
						/>
						<label
							class="ml-2"
							for="showOnlyManaged"
						>
							{{ $t("contests.myContest") }}
						</label>
					</template>
				</div>
				<Button
					v-if="userStore.user.profile?.role === 'organiser'"
					class="mb-4 ml-2 border p-2 lg:ml-8"
					@click="createContestVisible = true"
				>
					{{ $t("contests.createContest") }}
				</Button>
			</div>
			<div
				class="menu lg:m-8"
				v-if="nowMenu == 'education'"
			>
				<div class="menu__list">
					<Card
						class="m-2"
						v-for="contest in educationalContestsList"
						:key="contest.id"
					>
						<template #title>{{ contest.title }}</template>
						<template #content>
							<p></p>
							<p class="m-0">
								{{ contest.description }}
							</p>
							<a
								@click.prevent="openDialog(contest.id)"
								class="mt-4 block h-full w-fit rounded-xl bg-[var(--second-bg)] px-12 py-2"
							>
								Enter
							</a>
						</template>
					</Card>
					<p v-if="educationalContestsList.length === 0">Обучающих контестов нет</p>
				</div>
			</div>
			<div
				class="menu lg:m-8"
				v-if="nowMenu == 'competitions'"
			>
				<div class="menu__list">
					<Card
						class="m-2"
						v-for="contest in competitionContestsList"
						:key="contest.id"
					>
						<template #title>{{ contest.title }}</template>
						<template #content>
							<p class="m-0">
								{{ contest.description }}
							</p>
							<a
								@click.prevent="openDialog(contest.id)"
								class="mt-4 block h-full w-fit rounded-xl bg-[var(--second-bg)] px-12 py-2"
							>
								Enter
							</a>
						</template>
					</Card>
					<p v-if="competitionContestsList.length === 0">Соревнований нет</p>
				</div>
			</div>
			<CreateContest
				v-model:visible="createContestVisible"
				@emit-create-contest="loadContestsList"
			/>
			<SelectTeamDialog
				v-model:visible="selectTeamVisible"
				:contest-id-to-navigate="contestIdToNavigate"
				@navigate-to-contest="navigateToContest"
			/>
		</div>
	</main>
</template>

<style>
.menu__list {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}
</style>
