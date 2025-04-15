<script setup>
import { ref } from "vue"
import { useUserStore } from "@/stores/userStore.js"

const props = defineProps(["contestIdToNavigate"])
const emit = defineEmits(["navigateToContest"])
const visible = defineModel("selectTeamVisible")

let userStore = useUserStore()
let teamId = ref(userStore.user.profile.individual_team.id)
let teamOptions = ref(
	userStore.user.profile.teams.concat([
		{ id: userStore.user.profile.individual_team.id, name: "Individual Team" },
	]),
)

function selectTeam() {
	localStorage.setItem(`selectedTeam-${props.contestIdToNavigate}`, teamId.value)
	emit("navigateToContest")
}
</script>

<template>
	<Dialog
		v-model:visible="visible"
		:header="$t('selectTeamDialog.header')"
		modal
		dismissable-mask
	>
		<div class="flex flex-col gap-3">
			<Select
				v-model="teamId"
				:options="teamOptions"
				optionLabel="name"
				optionValue="id"
				:placeholder="$t('selectTeamDialog.placeholder')"
				class="w-full md:w-56"
			/>
			<div class="flex justify-center">
				<Button
					class="p-2 pr-4 pl-4"
					@click="selectTeam"
				>
					{{ $t("selectTeamDialog.selectButton") }}
				</Button>
			</div>
		</div>
	</Dialog>
</template>

<style></style>
