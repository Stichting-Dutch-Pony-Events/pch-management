// eslint.config.mjs
import pluginVue from "eslint-plugin-vue"
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript"

export default defineConfigWithVueTs(
    { ignores: ["dist/**", "components.d.ts"] },
    pluginVue.configs["flat/essential"],
    vueTsConfigs.recommendedTypeChecked,
)
