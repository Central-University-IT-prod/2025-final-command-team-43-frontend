<script setup>
import { ref, watch } from "vue"
import CustomInput from "./UI/customInput.vue"
import { isDark } from "@/composables/useTheme.js"
import { VMarkdownEditor } from "vue3-markdown"
import {
	deleteOrgFile,
	deleteUserFile,
	updateTask,
	uploadOrgFiles,
	uploadUserFiles,
} from "@/api/contests.js"
import { useGlobalStore } from "@/stores/globalStore"
import { useI18n } from "vue-i18n"

const show = defineModel("show")
const props = defineProps(["initialData", "contestData"])
const { t } = useI18n()

const globalStore = useGlobalStore()

const optionsTaskType = ref([
	{ name: "Number", code: "number" },
	{ name: "Text", code: "text" },
	//{ name: "Choices", code: "choice" },
	{ name: "File", code: "file" },
])

const optionsNumberCheckerType = ref([
	{ name: "Exact", code: "match" },
	{ name: "Range", code: "range" },
])

const optionsTextCheckerType = ref([
	{ name: "Exact", code: "match" },
	{ name: "Regex", code: "regex" },
])

const errorText = ref("")

const taskName = ref("")
const taskDesc = ref("")
const taskOrgText = ref("")
const ans = ref("")
const ansFrom = ref(0)
const ansTo = ref(0)
const maxPoints = ref(100)

const isAutoCheck = ref(false)
const numberAutoCheckType = ref("match")
const textAutoCheckType = ref("match")
const maxAttempts = ref(1)

const userFormData = ref(null)
const orgFormData = ref(null)

const orgFiles = ref([])
const userFiles = ref([])


const taskType = ref("number")

const options = ref([])

const deleteOptions = function (id) {
	options.value = options.value.filter((elem) => {
		return elem.id != id
	})
}

const onUpdateTask = async function () {
	errorText.value = ""

	if (taskName.value == "") {
		errorText.value = "Введите название"
	} else if (taskDesc.value == "") {
		errorText.value = "Введите описание"
	} else if (maxPoints.value <= 0 || maxPoints.value == "") {
		errorText.value = "Укажите баллы за задачу"
	} else if (taskType.value == "num" && ans.value == "") {
		errorText.value = "Укажите ответ в задаче"
	} else if (taskType.value == "options") {
		let x = options.value.filter((elem) => {
			return elem.correct != 0
		})
		if (x.length == 0) {
			errorText.value = "Укажите правильный ответ"
			return
		}
		x = options.value.filter((elem) => {
			return elem.desc === ""
		})
		if (x.length != 0) {
			errorText.value = "Укажите все варианты ответа"
			return
		}
	} 
	if (errorText.value != "") {
		return
	}
	await sendUpdateRequest()
}

function onUserFileSelect(event) {
	let fd = userFormData.value === null ? new FormData() : userFormData.value
	for (let [index, file] of event.files.entries()) {
		fd.append(`file${index}`, file)
	}
	userFormData.value = fd
}

function onOrgFileSelect(event) {
	let fd = orgFormData.value === null ? new FormData() : orgFormData.value
	for (let [index, file] of event.files.entries()) {
		fd.append(`file${index}`, file)
	}
	orgFormData.value = fd
}

async function sendUpdateRequest() {
	let checker = null
	const correctChoices = taskType.value === "choice" ? [] : null
	const choices = taskType.value === "choice" ? {} : null
	if (choices !== null) {
		for (let option of options.value) {
			choices[option.id] = option.desc
			if (option.correct === 1) correctChoices.push(option.id)
		}
	}
	if (isAutoCheck.value) {
		if (taskType.value === "number" && numberAutoCheckType.value === "range") {
			checker = {
				type: "range",
				args: { from_number: ansFrom.value, to_number: ansTo.value },
			}
		} else if (taskType.value === "number" && numberAutoCheckType.value === "match") {
			checker = {
				type: "match",
				args: { pattern: ans.value },
			}
		} else if (taskType.value === "text" && textAutoCheckType.value === "regex") {
			checker = {
				type: "regex",
				args: { pattern: ans.value },
			}
		} else if (taskType.value === "text" && textAutoCheckType.value === "match") {
			checker = {
				type: "match",
				args: { pattern: ans.value },
			}
		} else if (taskType.value === "choice") {
			checker = {
				type: "choice",
				args: { correct_answers: correctChoices },
			}
		}
	}
	const data = {
		id: props.initialData.id,
		title: taskName.value,
		description: taskDesc.value,
		org_text: taskOrgText.value,
		answer_type: taskType.value,
		// supported_file_formats: taskType.value === "file" ? canFiles.value : null,
		max_attempts: maxAttempts.value,
		max_points: maxPoints.value,
		checker: checker,
		choices: choices,
	}
	try {
		const resp = await updateTask(props.contestData.id, data)
		if (userFormData.value !== null && userFormData.value.get("file0")) {
			await uploadUserFiles(props.contestData.id, resp.data.id, userFormData.value)
		}
		if (orgFormData.value !== null && orgFormData.value.get("file0")) {
			await uploadOrgFiles(props.contestData.id, resp.data.id, orgFormData.value)
		}
		window.location.href = `/contests/${props.contestData.id}/tasks/${props.initialData.id}`
	} catch (error) {
		errorText.value = error
		globalStore.addToastResponseError(error.response.data || error.message)
	}
}

watch(
	() => props.initialData,
	() => {
		if (!props.initialData) return
		taskName.value = props.initialData.title
		taskDesc.value = props.initialData.description
		taskOrgText.value = props.initialData.org_info
		maxPoints.value = props.initialData.max_points
		maxAttempts.value = props.initialData.max_attempts
		taskType.value = props.initialData.answer_type
		// canFiles.value = props.initialData.supported_file_formats || null
		userFiles.value = props.initialData.user_files
		orgFiles.value = props.initialData.org_files
	},
	{
		immediate: true,
	},
)

async function localDeleteUserFile(fileId) {
	try {
		const { data, status } = await deleteUserFile(fileId)

		userFiles.value = userFiles.value.filter((file) => {
			return file.id !== fileId
		})
	} catch (e) {
		console.log(e)
		globalStore.addToastResponseError(e.response.data || e.message)
	}
}

async function localDeleteOrgFile(fileId) {
	try {
		const { data, status } = await deleteOrgFile(fileId)

		orgFiles.value = orgFiles.value.filter((file) => {
			return file.id !== fileId
		})
	} catch (e) {
		console.log(e)
		globalStore.addToastResponseError(e.response.data || e.message)
	}
}
</script>

<template>
	<Dialog
		v-model:visible="show"
		modal
		:header="t('editTask.header')"
		maximizable
		dismissable-mask
	>
		<div class="flex flex-col gap-3">
			<div class="input-wrapper">
				<label for="name">{{ t("editTask.nameLabel") }}</label>
				<InputText
					v-model="taskName"
					:placeholder="t('editTask.namePlaceholder')"
					id="name"
				/>
			</div>
			<div class="input-wrapper">
				<label for="desc">{{ t("editTask.descriptionLabel") }}</label>
				<VMarkdownEditor
					class="!h-[300px]"
					v-model="taskDesc"
					locale="en"
					:mode="isDark ? 'dark' : 'light'"
				/>
			</div>
			<div class="input-wrapper">
				<label for="org">{{ t("editTask.orgInfoLabel") }}</label>
				<VMarkdownEditor
					class="!h-[300px]"
					v-model="taskOrgText"
					locale="en"
					:mode="isDark ? 'dark' : 'light'"
				/>
			</div>

			<div class="input-wrapper">
				<span>{{ t("editTask.maxPointsLabel") }}</span>
				<InputNumber
					placeholder="20"
					v-model="maxPoints"
				/>
			</div>

			<div class="input-wrapper">
				<span>{{ t("editTask.maxAttemptsLabel") }}</span>
				<InputNumber
					placeholder="20"
					v-model="maxAttempts"
				/>
			</div>
			<span>{{ t("editTask.userFiles") }}</span>
			<div
				v-for="file in userFiles"
				:key="file.id"
			>
				<a
					:href="file.file"
					download
				>
					{{ file.file.split("/").pop() }}
				</a>
				<Button
					severity="danger"
					@click="localDeleteUserFile(file.id)"
				>
					{{ t("editTask.deleteButton") }}
				</Button>
			</div>

			<FileUpload
				@select="onUserFileSelect"
				customUpload
				mode="basic"
				:multiple="true"
				:maxFileSize="128 * 1024 * 1024"
			/>
			<span>{{ t("editTask.orgFiles") }}</span>
			<div
				v-for="file in orgFiles"
				:key="file.id"
			>
				<a
					:href="file.file"
					download
				>
					{{ file.file.split("/").pop() }}
				</a>
				<Button
					severity="danger"
					@click="localDeleteOrgFile(file.id)"
				>
					{{ t("editTask.deleteButton") }}
				</Button>
			</div>

			<FileUpload
				@select="onOrgFileSelect"
				customUpload
				mode="basic"
				:multiple="true"
				:maxFileSize="128 * 1024 * 1024"
			/>

			<div class="flex flex-row items-center">
				<span>{{ t("editTask.answerType") }}</span>
				<Select
					v-model="taskType"
					:options="optionsTaskType"
					optionLabel="name"
					optionValue="code"
					:placeholder="t('editTask.selectType')"
					class="ml-2 w-full md:w-56"
				/>
			</div>
			<div
				class="flex flex-row items-center gap-2"
				v-if="taskType != 'file' && taskType != 'choice'"
			>
				<div class="flex items-center gap-2">
					<Checkbox
						v-model="isAutoCheck"
						binary
						inputId="autoCheck"
					/>
					<label for="autoCheck">{{ t("editTask.autoCheck") }}</label>
				</div>
				<Select
					v-if="isAutoCheck && taskType === 'number'"
					v-model="numberAutoCheckType"
					:options="optionsNumberCheckerType"
					optionLabel="name"
					optionValue="code"
					:placeholder="t('editTask.selectType')"
					class="ml-2 w-full md:w-56"
				/>
				<Select
					v-if="isAutoCheck && taskType === 'text'"
					v-model="textAutoCheckType"
					:options="optionsTextCheckerType"
					optionLabel="name"
					optionValue="code"
					:placeholder="t('editTask.selectType')"
					class="ml-2 w-full md:w-56"
				/>
			</div>
			<div
				class="input-wrapper"
				v-if="isAutoCheck && taskType == 'number' && numberAutoCheckType == 'match'"
			>
				<span>{{ t("editTask.targetAnswer") }}</span>
				<InputNumber v-model="ans" />
			</div>

			<div
				class="input-wrapper"
				v-if="isAutoCheck && taskType == 'number' && numberAutoCheckType == 'range'"
			>
				<span>{{ t("editTask.targetAnswer") }}</span>
				<InputNumber v-model="ansFrom" />
				<span>{{ t("editTask.to") }}</span>
				<InputNumber v-model="ansTo" />
			</div>

			<div
				class="input-wrapper"
				v-if="isAutoCheck && taskType == 'text'"
			>
				<span>{{ t("editTask.targetAnswer") }}</span>
				<InputText v-model="ans" />
			</div>

			<div v-if="taskType == 'choice'">
				<div class="flex flex-row items-center">
					<label for="addOptions">{{ t("editTask.options") }}</label>
					<button
						class="ml-2 flex h-5 w-5 items-end justify-center rounded-full bg-[var(--second-bg)] px-1 pt-2"
						id="addOptions"
						@click="
							options.push({
								id: options.length.toString() + new Date().getTime().toString(),
								desc: '',
								correct: 0,
							})
						"
					>
						+
					</button>
				</div>
				<div class="mt-2 flex flex-col gap-2">
					<div
						class="flex items-center gap-2"
						v-for="option in options"
						:key="option.id"
					>
						<input
							type="checkbox"
							name=""
							id=""
							v-model="option.correct"
						/>
						<CustomInput
							class="w-100"
							:placeholder="t('editTask.answerPlaceholder')"
							v-model="option.desc"
						/>

						<button
							class="h-4 w-4"
							@click="deleteOptions(option.id)"
						>
							<img
								src="../assets/crossRed.svg"
								class="w-3"
							/>
						</button>
					</div>
				</div>
			</div>
			<div class="text-red-400">{{ errorText }}</div>
			<div class="flex justify-center">
				<Button
					class="p-2 pr-4 pl-4"
					@click="onUpdateTask"
				>
					{{ t("editTask.saveButton") }}
				</Button>
			</div>
		</div>
	</Dialog>
</template>

<style scoped lang="scss">
.input-wrapper {
	display: flex;
	flex-direction: column;
}

select {
	background-color: var(--second-bg);
}

option {
	background: var(--primary-bg);
}

.task-describe,
.org-info-describe {
	resize: none;
	width: min(80vw, 28rem);
	height: 10rem;
	padding: 0.35rem 1rem;
	font-size: 1rem;
	border-radius: 0.5rem;
	border: 0.1rem solid var(--main-color);
	outline: 0;

	&:focus {
		border: 0.125rem solid var(--main-color);
	}
}

.org-info-describe {
	height: 6rem;
}
</style>
