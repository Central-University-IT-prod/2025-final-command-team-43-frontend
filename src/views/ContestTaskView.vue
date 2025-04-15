<script setup>
import { VMarkdownView } from "vue3-markdown"
import "vue3-markdown/dist/style.css"
import ContestSidebar from "@/components/ContestSidebar.vue"
import { useRoute } from "vue-router"
import { computed, ref, watch } from "vue"
import { deleteTask, getContest, getOpenSolutions, getTask } from "@/api/contests.js"
import { onMounted } from "vue"
import { useUserStore } from "@/stores/userStore"
import { isDark } from "@/composables/useTheme"
import { getMyTeamSolutions, openSolution, sendSolution } from "@/api/solutions.js"
import { useGlobalStore } from "@/stores/globalStore.js"
import { renderChoices } from "@/utils/optionresolver.js"
import CreateTask from "@/components/CreateTask.vue"
import EditTask from "@/components/EditTask.vue"

const route = useRoute()
const userStore = useUserStore()
const gstore = useGlobalStore()

const loading = ref(true)
const error = ref(null)
const contestData = ref(null)
const taskData = ref(null)
const isOrg = ref(false)
const openSolutions = ref([])
const mySolutions = ref([])

const fileFormData = ref(null)

const loadData = async () => {
	loading.value = true
	error.value = null

	try {
		const contestId = route.params.id
		const taskId = route.params.tid

		const [contest, task] = await Promise.all([getContest(contestId), getTask(contestId, taskId)])

		contestData.value = contest.data
		taskData.value = task.data

		// isOrg.value = contest.data?.organisers
		// 	?.map((item) => item.id)
		// 	?.includes(userStore.user.profile.id)
		isOrg.value = userStore.user.profile.role === "organiser"

		openSolutions.value = (await getOpenSolutions(contestId)).data.filter(
			(item) => item.task === task.data.id,
		)
		if (!contestData.value.organisers) {
			mySolutions.value = (
				await getMyTeamSolutions(
					contestData.value.id,
					localStorage.getItem(`selectedTeam-${contestData.value.id}`),
				)
			)?.data.filter((item) => item.task === task.data.id)
		}
	} catch (e) {
		console.error("Ошибка загрузки данных:", e)
		error.value = e.response.data || e.message
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	loadData()
})
//watch([() => route.params.tid], loadData)
const reloadTask = async (n, o) => {
	taskData.value = contestData.value.tasks.find((t) => t.id === route.params.tid)
	mySolutions.value = (
		await getMyTeamSolutions(
			contestData.value.id,
			localStorage.getItem(`selectedTeam-${contestData.value.id}`),
		)
	)?.data.filter((item) => item.task === taskData.value.id)
	openSolutions.value = (await getOpenSolutions(contestData.value.id))?.data.filter(
		(item) => item.task === taskData.value.id,
	)
	selectedAnswers.value = null
	answerNumber.value = 0
	answerText.value = ""
}
watch(() => route.params.tid, reloadTask)

const answerNumber = ref(0)
const answerText = ref("")
const selectedAnswers = ref()
const selectedTeamId = ref(null)

function onFileSelect(event) {
	let formData = new FormData()
	formData.append("answer", event.files[0])
	fileFormData.value = formData
}
async function onSubmit(event) {
	if (!localStorage.getItem(`selectedTeam-${contestData.value.id}`)) {
		gstore.addToastResponseError("Team is not selected")
		return
	}
	let teamId = localStorage.getItem(`selectedTeam-${contestData.value.id}`)
	let resp = null
	if (taskData.value.answer_type !== "file") {
		let answer = answerText.value

		if (taskData.value.answer_type === "number") answer = answerNumber.value
		if (taskData.value.answer_type === "choice") answer = selectedAnswers.value.join(";")
		resp = await sendSolution(contestData.value.id, taskData.value.id, teamId, answer)
	} else {
		resp = await sendSolution(
			contestData.value.id,
			taskData.value.id,
			teamId,
			null,
			fileFormData.value,
		)
	}
	if (resp.status !== 204) {
		alert(resp.message)
		return
	}
	//window.location.reload();
	reloadTask(null, null)
}

const showEditTaskDialog = ref(false)

async function localDeleteTask() {
	try {
		const { data } = await deleteTask(contestData.value.id, taskData.value.id)
		window.location.href = `/contests/${contestData.value.id}`
	} catch (e) {
		console.error("Ошибка загрузки данных:", e)
		error.value = e.response.data || e.message
	}
}
</script>

<template>
	<div v-if="loading">{{ $t("common.loading") }}</div>
	<div v-else-if="error">{{ $t("common.errors.default") }}</div>
	<div
		v-else-if="taskData"
		class="flex flex-col sm:flex-row"
	>
		<ContestSidebar
			class="p-0 sm:p-2"
			:contest-data="contestData"
		/>
		<Panel
			:header="taskData.title"
			style="flex-grow: 1; height: 100%"
			class="mt-2 w-full sm:m-3 sm:mt-2"
		>
			<Tabs value="0">
				<TabList>
					<Tab value="0">{{ $t("task.statement") }}</Tab>
					<Tab value="1">{{ $t("task.solutions") }}</Tab>
					<Tab
						v-if="isOrg"
						value="2"
					>
						{{ $t("task.criteria") }}
					</Tab>
				</TabList>
				<TabPanels>
					<TabPanel value="0">
						<VMarkdownView
							:content="taskData.description"
							:mode="isDark ? 'dark' : 'light'"
						></VMarkdownView>
						<br />
						<Card
							v-for="file in taskData.user_files"
							:key="file"
						>
							<template #title>{{ $t("task.attachment") }}</template>
							<template #content>
								<a :href="file.file">
									{{ $t("files.download") }}
									<i class="pi pi-download ml-1"></i>
								</a>
							</template>
						</Card>
						<Button
							v-if="isOrg"
							severity="warn mr-4"
							@click="showEditTaskDialog = true"
						>
							Изменить задание
						</Button>
						<Button
							v-if="isOrg"
							severity="danger"
							@click="localDeleteTask"
						>
							Удалить задание
						</Button>
					</TabPanel>
					<TabPanel value="1">
						<Accordion value="0">
							<AccordionPanel
								v-if="!isOrg && contestData.stage === 'in_progress'"
								value="0"
							>
								<AccordionHeader>{{ $t("task.submitSolution") }}</AccordionHeader>
								<AccordionContent>
									<InputNumber
										v-if="taskData.answer_type === 'number'"
										v-model="answerNumber"
										fluid
									/>
									<InputText
										v-if="taskData.answer_type === 'text'"
										v-model="answerText"
										fluid
									/>
									<div class="flex flex-col items-center gap-2">
										<FileUpload
											v-if="taskData.answer_type === 'file'"
											mode="basic"
											@select="onFileSelect"
											customUpload
											auto
											severity="secondary"
											class="p-button-outlined"
										/>
										{{ fileFormData?.get("answer")?.name }}
									</div>

<!--									<div v-if="taskData.answer_type === 'choice'">-->
<!--										<div-->
<!--											v-for="(value, name, index) in taskData.choices"-->
<!--											:key="value"-->
<!--											class="flex items-center gap-2"-->
<!--										>-->
<!--											<Checkbox-->
<!--												v-model="selectedAnswers"-->
<!--												:inputId="name"-->
<!--												name="answer"-->
<!--												:value="name"-->
<!--											/>-->
<!--											<label :for="name">{{ value }}</label>-->
<!--										</div>-->
<!--									</div>-->
									<br />
									<Button
										class="mt-4 mb-2"
										:label="$t('task.submit')"
										@click="onSubmit"
										:disabled="taskData.max_attempts <= mySolutions.length"
									/>
									<br />
									<small>{{ mySolutions.length }}/{{ taskData.max_attempts }} attempts</small>
								</AccordionContent>
							</AccordionPanel>
							<AccordionPanel
								value="1"
								v-if="!isOrg"
							>
								<AccordionHeader>{{ $t("task.mySolutions") }}</AccordionHeader>
								<AccordionContent>
									<Card
										v-for="solution in mySolutions"
										:key="solution.id"
									>
										<template #title>#{{ solution.id }}</template>
										<template #content>
											<Chip v-if="solution.is_checked">
												<i class="pi pi-check-circle"></i>
												Checked
											</Chip>
											<Chip v-if="!solution.is_checked">
												<i class="pi pi-check-circle"></i>
												Not checked
											</Chip>
											&nbsp;&nbsp;
											<Chip>{{ solution.points }} / {{ taskData.max_points }}</Chip>
											<p v-if="solution.content && taskData.answer_type === 'choice'">
												Answer: {{ renderChoices(taskData.choices, solution.content) }}
											</p>
											<p v-else-if="solution.content">Answer: {{ solution.content }}</p>
											<a
												v-if="solution.file"
												:href="solution.file"
											>
												{{ $t("files.download") }}
												<i class="pi pi-download ml-1"></i>
											</a>
											<!--											<Button-->
											<!--												v-if="contestData.stage === 'finished' && !solution.is_public"-->
											<!--												@click="-->
											<!--													() =>-->
											<!--														openSolution(-->
											<!--															localStorage.getItem(`selectedTeam-${contestData.id}`),-->
											<!--															solution.id,-->
											<!--														)-->
											<!--												"-->
											<!--											>-->
											<!--												Publish solution-->
											<!--											</Button>-->
										</template>
									</Card>
								</AccordionContent>
							</AccordionPanel>
							<!--							<AccordionPanel value="2">-->
							<!--								<AccordionHeader>{{ $t("task.openSolutions") }}</AccordionHeader>-->
							<!--								<AccordionContent>-->
							<!--									<Card-->
							<!--										v-for="solution in openSolutions"-->
							<!--										:key="solution.id"-->
							<!--									>-->
							<!--										<template #title>#{{ solution.id }}</template>-->
							<!--										<template #content>-->
							<!--                      <p v-if="solution.content && taskData.answer_type === 'choice'">-->
							<!--                        Answer: {{ renderChoices(taskData.choices,-->
							<!--                        solution.content) }}</p>-->
							<!--                      <p v-else-if="solution.content">-->
							<!--                        Answer: {{ solution.content }}</p>-->
							<!--											<a-->
							<!--												v-if="solution.file"-->
							<!--												:href="solution.file"-->
							<!--											>-->
							<!--												{{ $t("files.download") }}-->
							<!--												<i class="pi pi-download ml-1"></i>-->
							<!--											</a>-->
							<!--										</template>-->
							<!--									</Card>-->
							<!--								</AccordionContent>-->
							<!--							</AccordionPanel>-->
						</Accordion>
					</TabPanel>
					<TabPanel
						v-if="isOrg"
						value="2"
					>
						<VMarkdownView
							:content="taskData.org_text"
							:mode="isDark ? 'dark' : 'light'"
						></VMarkdownView>
						<Card
							v-for="file in taskData.org_files"
							:key="file"
						>
							<template #title>{{ $t("task.attachment") }}</template>
							<template #content>
								<a :href="file.file">
									{{ $t("files.download") }}
									<i class="pi pi-download ml-1"></i>
								</a>
							</template>
						</Card>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Panel>
		<EditTask
			v-model:show="showEditTaskDialog"
			:contest-data="contestData"
			:initial-data="taskData"
		/>
	</div>
</template>

<style scoped></style>
