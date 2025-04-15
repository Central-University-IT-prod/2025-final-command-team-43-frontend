<script setup>
import { VMarkdownView } from "vue3-markdown"
import "vue3-markdown/dist/style.css"
import ContestSidebar from "@/components/ContestSidebar.vue"
import { useRoute } from "vue-router"
import { computed, ref } from "vue"
import { authGet } from "@/api/auth"
import { onMounted } from "vue"
import { isDark } from "@/composables/useTheme"
import { useI18n } from "vue-i18n"
import { useUserStore } from "@/stores/userStore"

const route = useRoute()
const contestId = route.params.id
const contestData = ref(null)
const loading = ref(true)
const error = ref(null)
const userStore = useUserStore()

const { t } = useI18n()

onMounted(loadContestData)

async function loadContestData() {
	try {
		const { data, status } = await authGet(`/contests/${contestId}`)

		contestData.value = data
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

const getLocalizedStage = (stage) => {
	switch (stage) {
		case "preparing":
			return t("contest.stages.preparing")
		case "in_progress":
			return t("contest.stages.inProgress")
		case "checking":
			return t("contest.stages.checking")
		case "finished":
			return t("contest.stages.finished")
		default:
			return stage
	}
}

const getStageSeverity = (stage) => {
	switch (stage) {
		case "preparing":
			return "secondary"
		case "in_progress":
			return "info"
		case "checking":
			return "info"
		case "finished":
			return "success"
	}
}
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
			@emit-contest-update="loadContestData"
		/>
		<Panel
			:header="contestData.title"
			class="my-2 w-full md:my-0"
			style="height: 100%"
		>
			<Tag
				:value="getLocalizedStage(contestData.stage)"
				:severity="getStageSeverity(contestData.stage)"
				class="my-1"
			/>
			<p v-if="userStore.user.profile.role === 'organiser' && contestData.stage">
				Контест не опубликован. Чтобы его опубликовать, перейдите в настройки
			</p>
			<vue3-flip-countdown
				v-if="contestData.end_datetime"
				:deadlineISO="contestData.end_datetime"
				:mainColor="mainColor"
				:main-flip-background-color="mainFlipBg"
				:second-flip-background-color="secondFlipBg"
				:showLabels="false"
			/>
			<br />
			<VMarkdownView
				:content="contestData.description"
				:mode="isDark ? 'dark' : 'light'"
			></VMarkdownView>
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
