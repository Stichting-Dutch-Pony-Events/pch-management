<template>
    <v-container class="fill-height">
        <v-responsive class="align-center fill-height mx-auto" max-width="500">
            <v-card>
                <v-form v-model="formValid">
                    <v-card-item>
                        <v-card-title> Login </v-card-title>
                    </v-card-item>

                    <v-card-text>
                        <v-text-field v-model="loginRequest.username" label="Username" required :rules="rules" />
                        <v-text-field v-model="loginRequest.password" label="Password" type="password" :rules="rules" required />
                        <v-btn type="submit" @click="login" color="primary" class="mt-4" block> Login </v-btn>
                    </v-card-text>
                </v-form>
            </v-card>
        </v-responsive>
    </v-container>
</template>

<script setup lang="ts">
import { HttpClient, useHttpClient } from "@/plugins/api/HttpClient"
import { reactive, type Ref, ref } from "vue"
import type { LoginCheckRequest } from "@/types"
import { useRouter } from "vue-router"

const api: HttpClient = useHttpClient()
const router = useRouter()

const rules = [(v: string) => !!v || "This field is required", (v: string) => v.length >= 3 || "Minimum 3 characters", (v: string) => v.length <= 20 || "Maximum 20 characters"]

const formValid: Ref<boolean> = ref(false)

const loginRequest: LoginCheckRequest = reactive({
    username: "",
    password: "",
})

async function login() {
    if (api === undefined) {
        console.error("API client is not available")
        return
    }

    if (formValid.value) {
        try {
            await api.login(loginRequest)
            void router.push("/")
        } catch (error) {
            console.error("LoginPage failed:", error)
            // Handle login failure, e.g., show an error message
        }
    }
}
</script>
