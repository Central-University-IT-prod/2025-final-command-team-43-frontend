import { createI18n } from "vue-i18n"
import en from "./locales/en"
import ru from "./locales/ru"
import { ref } from "vue"

export const currentLocale = ref(localStorage.getItem("locale") || "ru")

export const i18nOptions = {
	legacy: false,
	locale: localStorage.getItem("locale") || "ru",
	fallbackLocale: "en",
	messages: {
		en,
		ru,
	},
	globalInjection: true,
	useScope: "global",
}

export const i18n = createI18n(i18nOptions)

export function setLocale(locale) {
	i18n.global.locale.value = locale
	localStorage.setItem("locale", locale)
	document.querySelector("html").setAttribute("lang", locale)
}
