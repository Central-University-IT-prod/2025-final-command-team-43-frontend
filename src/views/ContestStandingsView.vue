<script setup>
import { VMarkdownView } from "vue3-markdown"
import "vue3-markdown/dist/style.css"
import ContestSidebar from "@/components/ContestSidebar.vue"
import { useRoute } from "vue-router"
import { computed, ref } from "vue"
import { authGet } from "@/api/auth"
import { onMounted } from "vue"
import { isDark } from "@/composables/useTheme"

const route = useRoute()
const contestId = route.params.id
const contestData = ref(null)
const standingsData = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(loadContestData)

async function loadContestData() {
	try {
		const { data: teamData, status: teamStatus } = await authGet(`/teams`)
		if (teamStatus !== 200) return
		const { data: cdata, status: cStatus } = await authGet(`/contests/${contestId}`)
		if (cStatus !== 200) return
		const { data, status } = await authGet(`/contests/${contestId}/standings`)
		if (status !== 200) return
		standingsData.value = Object.entries(data)
			.map(([k, v]) => {
				return { points: v, team: teamData.find((t) => t.id === k) }
			})
			.sort((a, b) => {
				return a.points < b.points ? 1 : a.points > b.points ? -1 : 0
			})
			.map((v, i) => {
				return { place: i + 1, team: v.team.name, points: v.points }
			})
		contestData.value = cdata
	} catch (e) {
		console.log(e)
		error.value = e.response.data || e.message
	} finally {
		loading.value = false
	}
}

const mainColor = computed(() => {
	return isDark.value ? "#578e7e" : "#76ABAE"
})

const mainFlipBg = computed(() => {
	return isDark.value ? "#222831" : "#fffaec"
})

const secondFlipBg = computed(() => {
	return isDark.value ? "#31363F" : "#f5ecd5"
})
</script>

<template>
	<div v-if="loading">
		{{ $t("common.loading") }}
	</div>
	<div v-else-if="error">
		{{ $t("common.errors.default") }}
	</div>
	<div
		v-else-if="contestData"
		class="flex flex-col md:flex-row"
	>
		<ContestSidebar
			:contest-data="contestData"
			class=""
			@emit-contest-update="loadContestData"
		/>
		<Panel
			:header="contestData.title + ' Standings'"
			class="my-2 w-full md:my-0"
			style="height: 100%"
		>
			<vue3-flip-countdown
				v-if="contestData.end_datetime"
				:deadlineISO="contestData.end_datetime"
				:mainColor="mainColor"
				:main-flip-background-color="mainFlipBg"
				:second-flip-background-color="secondFlipBg"
				:showLabels="false"
			/>
			<br />
			<DataTable :value="standingsData">
				<Column
					field="place"
					header="Place"
				></Column>
				<Column
					field="team"
					header="Team name"
				></Column>
				<Column
					field="points"
					header="Points"
				></Column>
			</DataTable>
		</Panel>
	</div>
</template>

<style>
.flip-card,
.flip-card__bottom,
.flip-card__back,
.flip-card__back-bottom {
	border-color: var(--second-bg) !important;
}
</style>
