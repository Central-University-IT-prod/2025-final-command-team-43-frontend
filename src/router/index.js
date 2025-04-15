import { authGet } from "@/api/auth"
import { useUserStore } from "@/stores/userStore"
import ContestsListView from "@/views/ContestsListView.vue"
import LoginView from "@/views/LoginView.vue"
import ProfileView from "@/views/ProfileView.vue"
import { createRouter, createWebHistory } from "vue-router"
import ContestOverviewView from "@/views/ContestOverviewView.vue"
import ContestTaskView from "@/views/ContestTaskView.vue"
import View404 from "@/views/View404.vue"
import TeamView from "@/views/TeamView.vue"
import SolutionsExplorer from "@/views/SolutionsExplorer.vue"
import ContestSettingsView from "@/views/ContestSettingsView.vue"
import ContestStandingsView from "@/views/ContestStandingsView.vue"

const routes = [
	{
		path: "/",
		redirect: "/login",
	},
	{
		path: "/login",
		name: "login",
		component: LoginView,
	},
	{
		path: "/profile",
		name: "profile",
		component: ProfileView,
	},
	{
		path: "/contests-list",
		name: "contestsList",
		component: ContestsListView,
	},
	{
		path: "/contests/:id",
		name: "contest",
		component: ContestOverviewView,
	},
	{
		path: "/contests/:id/settings",
		name: "contest-settings",
		component: ContestSettingsView,
	},
	{
		path: "/contests/:id/tasks/:tid",
		name: "contestTask",
		component: ContestTaskView,
	},
	{
		path: "/teams/:id",
		name: "team",
		component: TeamView,
	},
	{
		path: "/contests/:id/solution-explorer",
		name: "contestSolutionExplorer",
		component: SolutionsExplorer,
	},
	{
		path: "/contests/:id/standings",
		name: "contestStandings",
		component: ContestStandingsView,
	},
	{
		path: "/404",
		name: "404",
		component: View404,
	},
	{
		path: "/:pathMatch(.*)*",
		redirect: "/404",
	},
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
})

router.beforeEach(async (to) => {
	const userStore = useUserStore()

	if (to.name !== "login" && !userStore.user.accessToken) {
		return { name: "login" }
	}

	if (to.name !== "login") {
		try {
			const { status } = await authGet("/profile")
		} catch (e) {
			userStore.user.accessToken = null
			userStore.user.profile = null
			return { name: "login" }
		}
	}
})

export default router
