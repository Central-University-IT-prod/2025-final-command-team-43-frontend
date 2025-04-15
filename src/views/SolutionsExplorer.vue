<script setup>
import ContestSidebar from "@/components/ContestSidebar.vue"
import { useRoute } from "vue-router"
import { ref, onMounted } from "vue"
import { useTheme } from "@/composables/useTheme.js"
import { getAllSolutions, getUncheckedSolutions, sendVerdict } from "@/api/solutions.js"
import PaginatedSolutionsComponent from "@/components/PaginatedSolutionsComponent.vue"
import { VMarkdownView } from "vue3-markdown"
import { getContest } from "@/api/contests"
import { useGlobalStore } from "@/stores/globalStore.js"
import { renderChoices } from "../utils/optionresolver.js"

const route = useRoute()
const theme = useTheme()

const loading = ref(true)
const error = ref(null)
const contestData = ref(null)
const solutions = ref([])
const uncheckedSolutions = ref([])
const taskLabels = ref([])
const selectedTask = ref(null)
const checkDialogVisible = ref(false)
const selectedSolution = ref(null)
const verdictPoints = ref(null)
const gstore = useGlobalStore()
const solutionViewOnly = ref(false)

const loadData = async () => {
	loading.value = true
	error.value = null

	try {
		const contestId = route.params.id
		const { data: contest } = await getContest(contestId)
		const { data: allSolutions } = await getAllSolutions(contestId)
		const { data: unchecked } = await getUncheckedSolutions(contestId)

		contestData.value = contest
		solutions.value = allSolutions
		uncheckedSolutions.value = unchecked
		taskLabels.value = contest.tasks.map((task) => ({
			label: task.title,
			value: task.id,
		}))

		solutions.value.forEach((solution) => {
			solution.task_obj = contest.tasks.find((t) => t.id === solution.task)
		})

		uncheckedSolutions.value.forEach((solution) => {
			if (solution.id === "7cc175c2-5af0-4320-91a9-821572465148") {
				console.log(solution, contest.tasks)
			}
			solution.task_obj = contest.tasks.find((t) => t.id === solution.task)
		})
	} catch (e) {
		console.error("Error loading data:", e)
		error.value = e.response.data || e.message
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	loadData()
})

const onDialogOpen = (solutionId, isViewOnly) => {
	const sol = solutions.value.find((s) => s.id === solutionId)
	selectedSolution.value = sol
	checkDialogVisible.value = true
	verdictPoints.value = isViewOnly ? sol.points : sol.task_obj.max_points
	solutionViewOnly.value = isViewOnly
}

async function rejectSolution() {
	const resp = await sendVerdict(selectedSolution.value.id, 0)

	checkDialogVisible.value = false
	window.location.href = `/contests/${contestData.value.id}/solution-explorer`
}
async function acceptSolution() {
	const resp = await sendVerdict(selectedSolution.value.id, verdictPoints.value)

	checkDialogVisible.value = false
	window.location.href = `/contests/${contestData.value.id}/solution-explorer`
}
</script>

<template>
	<div v-if="loading">Loading...</div>
	<div v-else-if="error">{{ error }}</div>
	<div
		v-else
		class="flex flex-col md:flex-row"
	>
		<ContestSidebar
			:contest-data="contestData"
			class="p-2"
		/>
		<Panel
			header="Solution explorer"
			class="m-2"
			style="flex-grow: 1; height: 100%"
		>
			<Select
				v-model="selectedTask"
				:options="taskLabels"
				option-label="label"
				option-value="value"
				placeholder="Select a task"
				class="w-full md:w-56"
			/>
			<br />
			<Tabs value="0">
				<TabList>
					<Tab value="0">Unchecked</Tab>
					<Tab value="1">All</Tab>
				</TabList>
				<TabPanels>
					<TabPanel value="0">
						<PaginatedSolutionsComponent
							:solutions="
								selectedTask
									? uncheckedSolutions.filter((s) => s.task === selectedTask)
									: uncheckedSolutions
							"
							@open-check-dialog="onDialogOpen"
						/>
					</TabPanel>
					<TabPanel value="1">
						<PaginatedSolutionsComponent
							:viewonly="true"
							:solutions="
								selectedTask ? solutions.filter((s) => s.task === selectedTask) : solutions
							"
							@open-check-dialog="onDialogOpen"
						/>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Panel>
	</div>
	<Dialog
		v-model:visible="checkDialogVisible"
		modal
		maximizable
		header="Check solution"
		:style="{ width: '25rem' }"
	>
		<Accordion value="0">
			<AccordionPanel value="0">
				<AccordionHeader>Statement</AccordionHeader>
				<AccordionContent>
					<VMarkdownView
						:content="selectedSolution.task_obj.description"
						:mode="theme.isDark ? 'dark' : 'light'"
					></VMarkdownView>
					<br />
					<VMarkdownView
						:content="selectedSolution.task_obj.org_text"
						:mode="theme.isDark ? 'dark' : 'light'"
					></VMarkdownView>
					<br />
					<Card
						v-for="file in selectedSolution.task_obj.user_files"
						:key="file"
					>
						<template #title>Attachment</template>
						<template #content>
							<a :href="file">{{ file }}</a>
						</template>
					</Card>
					<br />
					<Card
						v-for="file in selectedSolution.task_obj.org_files"
						:key="file"
					>
						<template #title>Attachment</template>
						<template #content>
							<a :href="file">{{ file }}</a>
						</template>
					</Card>
				</AccordionContent>
			</AccordionPanel>
			<AccordionPanel value="1">
				<AccordionHeader>Solution</AccordionHeader>
				<AccordionContent>
					<p v-if="selectedSolution.task.answer_type === 'choice'">
						Answer: {{ renderChoices(selectedSolution.task.choices, selectedSolution.content) }}
					</p>
					<p v-else>Answer: {{ selectedSolution.content }}</p>
					<Card v-if="selectedSolution.file">
						<template #title>Attachment</template>
						<template #content>
							<a :href="selectedSolution.file">{{ selectedSolution.file }}</a>
						</template>
					</Card>
				</AccordionContent>
			</AccordionPanel>
		</Accordion>
		<div class="m-4 flex items-center gap-4">
			<label
				for="points"
				class="w-24 font-semibold"
			>
				Score
			</label>
			<InputNumber
				v-model="verdictPoints"
				inputId="integeronly"
				fluid
				:disabled="viewonly"
			/>
		</div>
		<div class="flex justify-between gap-2">
			<Button
				v-if="!solutionViewOnly"
				type="button"
				label="Reject"
				class="bg-[var(--delete-color)]"
				@click="rejectSolution"
			></Button>
			<Button
				v-if="!solutionViewOnly"
				type="button"
				label="Approve"
				@click="acceptSolution"
			></Button>
		</div>
	</Dialog>
</template>

<style scoped></style>
