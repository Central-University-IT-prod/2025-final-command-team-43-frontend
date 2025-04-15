import { useUserStore } from "@/stores/userStore"
import axios from "axios"
import { BASE_API_URL } from "./constants"
import { sendRequest } from "./common"

export async function authPost(url, body) {
	const userStore = useUserStore()

	const { data, status } = await axios.post(`${BASE_API_URL}${url}`, body, {
		headers: {
			Authorization: `Bearer ${userStore.user.accessToken}`,
			"Content-Type": "application/json",
		},
	})

	return { data, status }
}

export function authGet(url) {
	const userStore = useUserStore()

	return axios.get(`${BASE_API_URL}${url}`, {
		headers: {
			Authorization: `Bearer ${userStore.user.accessToken}`,
		},
	})
}

export function sendAuthRequest(method, endpoint, data, formData = null) {
	const userStore = useUserStore()
	return sendRequest(
		method,
		endpoint,
		data,
		{ Authorization: `Bearer ${userStore.user.accessToken}` },
		formData,
	)
}

export async function loginFunc(username, password) {
	const userStore = useUserStore()

	try {
		const { data, status } = await axios.post(
			`${BASE_API_URL}/token`,
			{
				username: username,
				password: password,
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
			},
		)

		const items = { ...localStorage }

		for (let key in items) {
			if (key.startsWith("selectedTeam")) {
				localStorage.removeItem(key)
			}
		}

		console.log(localStorage)

		if (status === 200) {
			userStore.user.accessToken = data.access
			userStore.user.refreshToken = data.refresh

			const { data: profile, status } = await authGet(`/profile`)
			if (status === 200) {
				userStore.user.profile = profile
				return { success: true, message: "auth.messages.loginSuccess" }
			}

			return { success: false, message: "auth.messages.loginError" }
		}
	} catch (e) {
		console.error(e)

		if (e.response.status === 401) {
			return { success: false, message: "auth.messages.loginError", e }
		} else {
			return { success: false, message: "common.errors.network", e }
		}
	}
}

export function getCurrentUser() {
	return JSON.parse(localStorage.getItem("user")).user.profile
}
