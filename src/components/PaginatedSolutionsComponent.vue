<script setup>
defineEmits(["openCheckDialog"])
defineProps(["solutions", "viewonly"])
</script>

<template>
	<DataView :value="solutions">
		<template #list="slotProps">
			<div class="flex flex-col">
				<div
					v-for="(item, index) in slotProps.items"
					:key="index"
				>
					<div
						class="flex flex-col gap-4 p-6 sm:flex-row sm:items-center"
						:class="{ 'border-surface-200 dark:border-surface-700 border-t': index !== 0 }"
					>
						<div class="flex flex-1 flex-col justify-between gap-6 md:flex-row md:items-center">
							<div class="flex flex-row items-start justify-between gap-2 md:flex-col">
								<div>
									<span class="text-surface-500 dark:text-surface-400 text-sm font-medium">
										{{ $t("solutions.task") }}: {{ item.task_obj?.title }}
									</span>
									<div class="mt-2 text-lg font-medium">#{{ item.id }}</div>
								</div>
							</div>
							<div class="flex flex-col gap-8 md:items-end">
								<div class="flex flex-row-reverse gap-2 md:flex-row">
									<Button
										:label="viewonly ? $t('solutions.view') : $t('solutions.check')"
										class="flex-auto whitespace-nowrap md:flex-initial"
										@click="$emit('openCheckDialog', item.id, viewonly)"
									></Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</DataView>
</template>

<style scoped></style>
