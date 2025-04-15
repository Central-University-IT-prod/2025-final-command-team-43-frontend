import { sendAuthRequest } from "./auth"

export function getSolution(solutionId) {
	return sendAuthRequest("GET", `solutions/${solutionId}`, null)
}

export function sendSolution(contestId, taskId, teamId, answer, formData = false) {
	let query = ""
	let data = {}
	if (formData) {
		data = formData
		query = `?team_id=${teamId}`
	} else {
		data = {
			team_id: teamId,
			answer: answer,
		}
	}
	return sendAuthRequest("POST", `contests/${contestId}/tasks/${taskId}/solution${query}`, data)
}

export function getUncheckedSolutions(contestId) {
	return sendAuthRequest("GET", `contests/${contestId}/solutions/unchecked`, null)
}

export function getAllSolutions(contestId) {
	return sendAuthRequest("GET", `contests/${contestId}/solutions/all`, null)
}

export function getMyTeamSolutions(contestId, teamId) {
	return sendAuthRequest("GET", `teams/${teamId}/solutions/contest/${contestId}`, null)
}

export function openSolution(teamId, solutionId) {
	return sendAuthRequest("PUT", `teams/${teamId}/solutions/${solutionId}/open`, null)
}

export function sendVerdict(solutionId, points) {
	return sendAuthRequest("POST", `solutions/${solutionId}/verdict`, { points: points })
}
