<script setup>
import { authGet } from "@/api/auth"
import ContestSidebar from "@/components/ContestSidebar.vue"
import CreateTask from "@/components/CreateTask.vue"
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import { finishContest, markContestReady } from "@/api/contests.js"
import { useGlobalStore } from "@/stores/globalStore.js"
import CreateContest from "@/components/createContest.vue"

const route = useRoute()
const gstore = useGlobalStore()
const contestId = route.params.id
const contestData = ref(null)
const loading = ref(true)
const error = ref(null)

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

const showAddDialog = ref(false)

async function markContestReadyBtn() {
	try {
		const res = await markContestReady(contestId)
		if (res.status !== 204) gstore.addToastResponseError(res.response.data)
		else window.location.href = `/contests/${contestId}/settings`
	} catch (e) {
		if (e.status === 204) {
			return
		} else {
			gstore.addToastResponseError(e.response.data || e.message)
		}
	}
}

async function markContestFinishedBtn() {
	console.log(contestId)
	try {
		const res = await finishContest(contestId)
		if (res.status !== 204) gstore.addToastResponseError(res.response.data.detail)
		else window.location.href = `/contests/${contestId}/settings`
	} catch (e) {
		if (e.status === 204) {
			return
		} else {
			gstore.addToastResponseError(e.response.data.detail)
		}
	}
}

const editContestDialogVisible = ref(false)
</script>

<template>
	<div v-if="loading">{{ $t("common.loading") }}</div>
	<div v-else-if="error">{{ $t("common.errors.default") }}</div>
	<div
		v-else-if="contestData"
		style="display: flex"
		class="flex flex-col md:flex-row"
	>
		<ContestSidebar
			:contest-data="contestData"
			class="p-2"
		/>
		<div class="mt-2 ml-4 flex flex-col gap-4 sm:flex-row">
			<CreateContest
				v-model:visible="editContestDialogVisible"
				@emit-update-contest="loadContestData"
				:initial-data="contestData"
			/>
			<CreateTask v-model:show="showAddDialog" />
			<Button
				@click="editContestDialogVisible = true"
				class="h-fit w-50 sm:w-fit"
			>
				{{ $t("contest.changeData") }}
			</Button>
			<Button
				class="h-fit w-50 sm:w-fit"
				v-if="contestData.stage === 'preparing'"
				@click="markContestReadyBtn"
			>
				{{ $t("contest.markReady") }}
			</Button>
			<Button
				class="h-fit w-50 sm:w-fit"
				v-if="contestData.stage === 'checking'"
				@click="markContestFinishedBtn"
			>
				{{ $t("contest.markCheckedReady") }}
			</Button>
		</div>
	</div>
</template>

<style scoped></style>
