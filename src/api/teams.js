import { sendAuthRequest } from "./auth"

export function createTeam(teamData) {
  return sendAuthRequest(
    "POST", `teams`,
    teamData,
  )
}

export function getTeam(teamId) {
  return sendAuthRequest(
    "GET", `teams/${teamId}`,
    null,
  )
}

export function modifyTeam(teamId, teamData) {
  return sendAuthRequest(
    "POST", `teams/${teamId}`,
    teamData,
  )
}

export function deleteTeam(teamId) {
  return sendAuthRequest(
    "DELETE", `teams/${teamId}`,
    null,
  )
}

export function addTeamMembers(teamId, memberIdList) {
  return sendAuthRequest(
    "POST", `teams/${teamId}/add-members`,
    memberIdList,
  )
}

export function removeTeamMembers(teamId, memberIdList) {
  return sendAuthRequest(
    "POST", `teams/${teamId}/remove-members`,
    memberIdList,
  )
}

export function getAllUsers() {
  return sendAuthRequest(
    "GET", `users`,
    null,
  )
}
