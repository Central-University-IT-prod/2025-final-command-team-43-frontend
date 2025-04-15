<script setup>
import { ref, watch, watchEffect } from "vue"
import { VMarkdownEditor } from "vue3-markdown"
import { isDark } from "@/composables/useTheme"
import { createContest, updateContest } from "@/api/contests"
import { convertToCustomFormat } from "@/utils/datetime"
import { useGlobalStore } from "@/stores/globalStore"

const props = defineProps(["initialData"])
const visible = defineModel("visible")
const emit = defineEmits(["emitCreateContest", "emitUpdateContest"])

const globalStore = useGlobalStore()

let timeLimitOn = ref(false)
let contestName = ref("")
let contestDesc = ref("")
const contestOrgCount = ref(1)

let startDate = ref("")
let endDate = ref("")

watch(
	() => props.initialData,
	() => {
		if (!props.initialData) return
		timeLimitOn.value = !!props.initialData.end_datetime
		contestName.value = props.initialData.title
		contestDesc.value = props.initialData.description
		contestOrgCount.value = props.initialData.cross_check_org_count

		startDate.value = convertToCustomFormat(
			props.initialData.start_datetime || new Date().toISOString(),
		)
		endDate.value = convertToCustomFormat(
			props.initialData.end_datetime || new Date().toISOString(),
		)
	},
	{
		immediate: true,
	},
)

let today = new Date()
let year = today.getFullYear().toString()
let month = (today.getMonth() + 1).toString()
month = month.length == 1 ? "0" + month : month
let day = today.getDate().toString()
day = day.length == 1 ? "0" + day : day
today = ref(year + "-" + month + "-" + day)

let errorText = ref("")

const localCreateContest = async () => {
	if (contestName.value === "") {
		errorText.value = "Введите название"
		return
	}
	if (contestDesc.value === "") {
		errorText.value = "Введите описание"
		return
	}
	if (timeLimitOn.value && (!startDate.value || !endDate.value)) {
		errorText.value = "Укажите время"
		return
	}
	if (timeLimitOn.value && startDate.value >= endDate.value) {
		errorText.value = "Дата начала должна быть раньше даты конца"
		return
	}

	errorText.value = ""

	try {
		const formattedStartDate =
			timeLimitOn.value && startDate.value ? new Date(startDate.value).toISOString() : null
		const formattedEndDate =
			timeLimitOn.value && startDate.value ? new Date(endDate.value).toISOString() : null
		const { data, status } = props.initialData
			? await updateContest(
					props.initialData.id,
					contestName.value,
					contestDesc.value,
					formattedStartDate,
					formattedEndDate,
					contestOrgCount.value,
				)
			: await createContest(
					contestName.value,
					contestDesc.value,
					formattedStartDate,
					formattedEndDate,
					contestOrgCount.value,
				)

		visible.value = false
		if (props.initialData) {
			emit("emitUpdateContest")
		} else {
			emit("emitCreateContest")
		}

		timeLimitOn.value = false
		contestName.value = ""
		contestDesc.value = ""
		contestOrgCount.value = 1

		startDate.value = ""
		endDate.value = ""
		window.location.href = "/contests-list"
	} catch (e) {
		console.log(e)
		globalStore.addToastResponseError(e.response.data || e.message)
	}
}

function clearDialogFields() {
	timeLimitOn.value = false
	contestName.value = ""
	contestDesc.value = ""
	contestOrgCount.value = 1
	startDate.value = ""
	endDate.value = ""
}
</script>

<template>
	<Dialog
		v-model:visible="visible"
		:header="initialData ? $t('contest.updateTitle') : $t('contest.createTitle')"
		modal
		dismissable-mask
		@hide="clearDialogFields"
	>
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-2">
				<label for="name">{{ $t("contest.name") }}:</label>
				<InputText
					v-model="contestName"
					:placeholder="$t('contest.namePlaceholder')"
					id="name"
				/>
			</div>
			<div class="flex flex-col gap-2">
				<label for="desc">{{ $t("contest.description") }}:</label>
				<VMarkdownEditor
					class="!h-[300px]"
					v-model="contestDesc"
					locale="en"
					:mode="isDark ? 'dark' : 'light'"
				/>
			</div>
			<div class="flex flex-col gap-2">
				<label for="orgCount">{{ $t("contest.orgCount") }}:</label>
				<InputNumber
					v-model="contestOrgCount"
					:placeholder="$t('contest.orgCountPlaceholder')"
					id="orgCount"
					:max="1000000"
					:min="1"
					input-id="integeronly"
				/>
			</div>
			<div class="flex flex-col">
				<div class="flex items-center">
					<label
						class="mr-2"
						for="time limit"
					>
						{{ $t("contest.time") }}:
					</label>
					<Checkbox
						id="time limit"
						v-model="timeLimitOn"
						class="mt-1"
						binary
					/>
				</div>
				<div
					class="mt-2 flex flex-row items-center gap-3"
					v-if="timeLimitOn"
				>
					<div>
						{{ $t("contest.from") }}
						<DatePicker
							id="datepicker-24h"
							v-model="startDate"
							showTime
							hourFormat="24"
							fluid
						/>
						{{ $t("contest.to") }}
						<DatePicker
							id="datepicker-24h"
							v-model="endDate"
							showTime
							hourFormat="24"
							fluid
						/>
					</div>
				</div>
			</div>
			<div class="text-[var(--error-text)]">{{ errorText }}</div>
			<div class="flex justify-center">
				<Button
					class="rounded-sm border bg-[var(--second-bg)] p-2 pr-4 pl-4"
					@click="localCreateContest"
				>
					{{ initialData ? $t("contest.save") : $t("contest.create") }}
				</Button>
			</div>
		</div>
	</Dialog>
</template>

<style>
.vmd-toolbar,
.vmd-tooltip {
	background-color: var(--primary-bg) !important;
}

.vmd-svg-icon:hover {
	background-color: var(--second-bg);
}
</style>
