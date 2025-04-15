import { useUserStore } from "@/stores/userStore"
import { authGet, sendAuthRequest } from "./auth"
import { sendRequest } from "./common"

export function getContests() {
	return sendAuthRequest("GET", "contests", null)
}

export async function getContest(contestId) {
	try {
		const contest = await authGet(`/contests/${contestId}`)

		return contest || null
	} catch (e) {
		console.error("Ошибка при получении задачи:", e)
		throw e
	}
}

export async function getTask(contestId, taskId) {
	try {
		return await authGet(`/contests/${contestId}/tasks/${taskId}`)
	} catch (e) {
		console.error("Ошибка при получении задачи:", e)
		throw e
	}
}

export async function getOpenSolutions(contestId) {
	try {
		const solutions = await authGet(`/contests/${contestId}/open-solutions`)

		return solutions || []
	} catch (e) {
		console.error("Ошибка при получении открытых задач:", e)
		throw e
	}
}

export function modifyContest(contestId, contestData) {
	return sendAuthRequest("PATCH", `contests/${contestId}`, contestData)
}

export function modifyTask(contestId, taskId, taskData) {
	return sendAuthRequest("PATCH", `contests/${contestId}/tasks/${taskId}`, taskData)
}

function uploadFiles(url, formData) {
	const userStore = useUserStore()

	return sendRequest("POST", url, formData, {
		Authorization: `Bearer ${userStore.user.accessToken}`,
		"Content-Type": "multipart/form-data",
	})
}

export function uploadUserFiles(contestId, taskId, formData) {
	const userStore = useUserStore()

	return uploadFiles(`contests/${contestId}/tasks/${taskId}/upload-user-files`, formData)
}

export function uploadOrgFiles(contestId, taskId, formData) {
	const userStore = useUserStore()

	return uploadFiles(`contests/${contestId}/tasks/${taskId}/upload-org-files`, formData)
}

export function uploadSolutionFile(contestId, taskId, formData) {
	const userStore = useUserStore()

	return uploadFiles(`contests/${contestId}/tasks/${taskId}/upload-org-files`, formData)
}

export function deleteTask(contestId, taskId) {
	return sendAuthRequest("DELETE", `contests/${contestId}/tasks/${taskId}`, null)
}

export function markContestReady(contestId) {
	return sendAuthRequest("POST", `contests/${contestId}/ready`, null)
}

export function finishContest(contestId) {
	return sendAuthRequest("POST", `contests/${contestId}/finish`, null)
}

export function createContest(title, description, startDatetime, endDatetime, crossCheckOrgCount) {
	return sendAuthRequest("POST", "contests/create", {
		title,
		description,
		start_datetime: startDatetime,
		end_datetime: endDatetime,
		cross_check_org_count: crossCheckOrgCount,
	})
}

export function createTask(contestId, taskData) {
	return sendAuthRequest("POST", `contests/${contestId}/tasks`, taskData)
}

export function updateTask(contestId, taskData) {
	return sendAuthRequest("PATCH", `contests/${contestId}/tasks/${taskData.id}`, taskData)
}

export function updateContest(
	id,
	title,
	description,
	startDatetime,
	endDatetime,
	crossCheckOrgCount,
) {
	return sendAuthRequest("PATCH", `contests/${id}`, {
		title,
		description,
		start_datetime: startDatetime,
		end_datetime: endDatetime,
		cross_check_org_count: crossCheckOrgCount,
	})
}

export function deleteUserFile(fileId) {
	return sendAuthRequest("DELETE", `files/user/${fileId}/delete`, null)
}

export function deleteOrgFile(fileId) {
	return sendAuthRequest("DELETE", `files/org/${fileId}/delete`, null)
}
