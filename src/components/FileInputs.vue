<script setup>
import { defineModel, ref } from "vue"
const model = defineModel()

const addFile = function (t) {
	model.value.push([new Date().getTime(), t.target.files[0]])
}
const editFile = function (id, t) {
	const editMem = ref(model.value)
	for (let i = 0; i < model.value.length; i++) {
		if (editMem.value[i][0] == id) {
			editMem.value[i] = [id, t.target.files[0]]
		}
	}
	model.value = editMem.value
}

const deleteFile = function (id) {
	model.value = model.value.filter((elem) => {
		return elem[0] != id
	})
}
</script>

<template>
	<div
		v-for="file in model"
		:key="file[0]"
		class="flex items-center"
	>
		<label for="member1">
			{{ file[1].name }}
		</label>
		<button
			class="mt-1 ml-1 flex h-5 w-5 items-center justify-center p-0"
			@click="deleteFile(file[0])"
		>
			<img
				src="../assets/crossRed.svg"
				class="w-3"
			/>
		</button>
		<input
			type="file"
			class="file"
			:id="'member' + file[0]"
			@change="editFile(file[0], $event)"
		/>
	</div>
	<label
		for="member0"
		class="mt-1 block w-fit rounded-xl bg-[var(--second-bg)] px-4 py-2"
	>
		Добавить файл
	</label>
	<input
		type="file"
		class="file"
		id="member0"
		@change="addFile($event)"
	/>
</template>

<style scoped lang="scss">
.file {
	display: none;
}
</style>
