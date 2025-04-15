import { computed, ref, watch, watchEffect } from "vue"
import { useWindowWidth } from "./useWindowWidth"
import { currentLocale } from "@/i18n"

export function useContestMenuItemsList(t, contestId, isOrg, showCreateDialog, contestData) {
	const { width } = useWindowWidth()
	const itemsList = ref([])

	const utilityItemsCount = ref(1)

	const updateItemsList = () => {
		const newItemsList = []
		utilityItemsCount.value = 1

		newItemsList.push({
			label: t("contest.overview"),
			icon: "pi pi-info-circle",
			route: `/contests/${contestId}`,
		})

		if (isOrg) {
			newItemsList.push({
				label: t("contest.newTask"),
				onclick: showCreateDialog,
				icon: "pi pi-plus",
			})
			utilityItemsCount.value++
		}

		if (isOrg) {
			newItemsList.push({
				label: t("contest.standings"),
				icon: "pi pi-chart-bar",
				route: `/contests/${contestId}/standings`,
			})
			newItemsList.push({
				label: t("contest.solutions"),
				icon: "pi pi-inbox",
				route: `/contests/${contestId}/solution-explorer`,
			})
			newItemsList.push({
				label: t("contest.settings"),
				icon: "pi pi-cog",
				route: `/contests/${contestId}/settings`,
			})
			utilityItemsCount.value += 3
		} else if (contestData?.stage === "finished") {
			newItemsList.push({
				label: t("contest.standings"),
				icon: "pi pi-chart-bar",
				route: `/contests/${contestId}/standings`,
			})
			utilityItemsCount.value++
		}

		newItemsList.push({
			separator: true,
		})
		utilityItemsCount.value++

		if (contestData?.tasks) {
			contestData.tasks.forEach((item) => {
				newItemsList.push({
					label: item.title,
					icon: "pi pi-book",
					route: `/contests/${contestId}/tasks/${item.id}`,
				})
			})
		}

		itemsList.value = newItemsList
	}

	updateItemsList()

	watchEffect(updateItemsList)

	const startItems = computed(() => {
		return itemsList.value.slice(0, utilityItemsCount.value)
	})

	const scrollableItems = computed(() => {
		return itemsList.value.slice(utilityItemsCount.value + 1)
	})

	const items = computed(() => {
		return width.value < 768 ? scrollableItems.value : itemsList.value
	})

	return { items, startItems }
}
