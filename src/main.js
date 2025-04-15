import "./assets/main.css"
import "./assets/katex.css"

import Countdown from "vue3-flip-countdown"
import { createApp } from "vue"
import { createPinia } from "pinia"
import PrimeVue from "primevue/config"
import Aura from "@primeuix/themes/aura"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import ToastService from "primevue/toastservice"
import { i18n, setLocale } from "./i18n"
import VueCalendarHeatmap from "vue3-calendar-heatmap"
import App from "./App.vue"
import router from "./router"

if (!localStorage.getItem("locale")) {
	setLocale(navigator.language || navigator.userLanguage)
}

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(router)
app.use(VueCalendarHeatmap)
app.use(PrimeVue, {
	theme: {
		preset: Aura,
		options: {
			darkModeSelector: ".dark",
			cssLayer: {
				name: "primevue",
				order: "tailwind, primevue",
			},
		},
	},
})
app.use(ToastService)

app.use(i18n)

app.use(Countdown)

app.mount("#app")
