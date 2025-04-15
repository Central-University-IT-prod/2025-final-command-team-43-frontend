<script setup>
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { computed, ref } from "vue"
import { useUserStore } from "@/stores/userStore"
import CreateTask from "@/components/CreateTask.vue"
import { useWindowWidth } from "@/composables/useWindowWidth"
import { Menu, Menubar, ScrollPanel } from "primevue"
import { useContestMenuItemsList } from "@/composables/useContestMenuItemsList"

const props = defineProps(["contestData"])
const emit = defineEmits(["emitContestUpdate"])

const { t } = useI18n()
const route = useRoute()
const userStore = useUserStore()
const contestId = route.params.id
const showCreateDialog = defineModel("show")
// const isOrg = props.contestData?.organisers
// 	?.map((item) => item.id)
// 	?.includes(userStore.user.profile.id)
const isOrg = userStore.user.profile.role === "organiser"

const editContestDialogVisible = ref(false)

const { items, startItems } = useContestMenuItemsList(
	t,
	contestId,
	isOrg,
	() => (showCreateDialog.value = true),
	props.contestData,
	() => (editContestDialogVisible.value = true),
)

const { width } = useWindowWidth()

const scrollComponent = computed(() => {
	return width.value < 768 ? "div" : ScrollPanel
})

const menuComponent = computed(() => {
	return width.value < 768 ? Menubar : Menu
})

const scrollStyles = computed(() => {
	return width.value < 768 ? `width: 100%;` : `width: fit-content; height: 600px`
})
</script>

<template>
	<div
		class="card w-full md:w-[250px]"
		v-bind="$attrs"
	>
		<component
			:is="scrollComponent"
			:style="scrollStyles"
			class="flex"
		>
			<component
				:is="menuComponent"
				:model="items"
				class="h-fit w-full md:w-60"
				breakpoint="300px"
			>
				<template #start>
					<span
						class="inline-flex items-center gap-1 px-2 py-2"
						v-if="width >= 768"
					>
						<span class="text-xl font-semibold">{{ contestData?.title }}</span>
					</span>
					<div
						v-else
						class="start-items flex flex-row gap-4 border-r pr-2 md:flex-col md:border-none md:pr-0"
					>
						<template
							v-for="item in startItems"
							:key="item.label"
						>
							<router-link
								v-if="item.route"
								v-slot="{ href, navigate }"
								:to="item.route"
								custom
							>
								<a
									:href="href"
									v-bind="props.action"
									@click="navigate"
								>
									<span :class="item.icon" />
									<span class="ml-2 hidden md:inline">{{ item.label }}</span>
								</a>
							</router-link>
							<a
								v-else-if="item.onclick"
								@click="item.onclick"
								class="block h-full w-full"
							>
								<span :class="item.icon" />
								<span class="ml-2 hidden md:inline">{{ item.label }}</span>
							</a>
						</template>
					</div>
				</template>
				<template #submenulabel="{ item }">
					<span class="text-primary hidden font-bold md:inline">{{ item.label }}</span>
				</template>
				<template #item="{ item, props }">
					<router-link
						v-if="item.route"
						v-slot="{ href, navigate }"
						:to="item.route"
						custom
					>
						<a
							:href="href"
							v-bind="props.action"
							@click="navigate"
							class="p-menu-item-link"
						>
							<span :class="item.icon" />
							<span class="ml-2 hidden md:inline">{{ item.label }}</span>
						</a>
					</router-link>
					<a
						v-else-if="item.url"
						:href="item.url"
						:target="item.target"
						v-bind="props.action"
						class="p-menu-item-link"
					>
						<span :class="item.icon" />
						<span class="ml-2 hidden md:inline">{{ item.label }}</span>
					</a>
					<a
						v-else-if="item.onclick"
						@click="item.onclick"
						class="p-menu-item-link"
					>
						<span :class="item.icon" />
						<span class="ml-2 hidden md:inline">{{ item.label }}</span>
					</a>
					<a
						v-else
						v-bind="props.action"
						class="p-menu-item-link"
					>
						<span :class="item.icon" />
						<span class="hidden md:inline">{{ item.label }}</span>
					</a>
				</template>
			</component>
		</component>
	</div>
	<CreateTask
		v-model:show="showCreateDialog"
		:contest-data="contestData"
	/>
</template>

<style>
.p-scrollpanel-content {
	width: fit-content;
}

.p-scrollpanel-bar-y {
	inset-inline-end: 23px !important;
	translate: 0 9px !important;
}

.p-menubar-root-list {
	display: flex;
	flex-wrap: nowrap;
	overflow-x: auto;
}

.p-menubar-item-link {
	padding: 0.4rem;
}
</style>
