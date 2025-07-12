/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css"
import "vuetify/styles"

// Composables
import { createVuetify } from "vuetify"
import { VCalendar } from "vuetify/labs/VCalendar"

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
    components: {
        VCalendar,
    },
    theme: {
        defaultTheme: "dark",
        themes: {
            dark: {
                dark: true,
                colors: {
                    background: "#121212",
                    surface: "#1E1E1E",
                    primary: "#973E00",
                    secondary: "#005897",
                },
            },
            light: {
                dark: false,
                colors: {
                    background: "#FFFFFF",
                    surface: "#F5F5F5",
                    primary: "#FF9E5A",
                    secondary: "#5ABBFF",
                },
            },
        },
    },
})
