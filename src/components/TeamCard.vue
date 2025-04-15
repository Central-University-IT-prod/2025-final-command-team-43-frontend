<script setup>
defineProps(["team"])
</script>

<template>
	<Panel :header="team.name">
		<ul class="flex gap-4">
			<li
				v-for="member in team.members"
				:key="member.id"
				class="flex items-center justify-center gap-2 not-last:border-r not-last:pr-2"
			>
				<div class="h-8 w-8 rounded-full bg-[var(--primary-bg)]">
					<img
						v-if="member.profile_pic_url"
						:src="member.profile_pic_url"
						:alt="$t('team.memberImageAlt')"
						class="aspect-square w-8 rounded-md"
					/>
				</div>
				<p>
					<span class="ml-3">{{ member.username }}</span>
				</p>
			</li>
		</ul>
	</Panel>
</template>

<style scoped></style>
