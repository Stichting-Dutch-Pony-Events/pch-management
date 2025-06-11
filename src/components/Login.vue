<template>
    <v-container class="fill-height">
        <v-responsive class="align-centerfill-height mx-auto" max-width="500">
            <v-card>
                <v-form v-model="formValid">
                    <v-card-item>
                        <v-card-title> Login </v-card-title>
                    </v-card-item>

                    <v-card-text>
                        <v-text-field v-model="loginRequest.username" label="Username" required :rules="rules" />
                        <v-text-field v-model="loginRequest.password" label="Password" type="password" :rules="rules" required />
                        <v-btn @click="login" color="primary" class="mt-4" block> Login </v-btn>
                    </v-card-text>
                </v-form>
            </v-card>
        </v-responsive>
    </v-container>
</template>

<script setup lang="ts">
import type { HttpClient } from "@/plugins/api/HttpClient"
import { inject, reactive, type Ref, ref } from "vue"
import type { LoginCheckRequest } from "@/plugins/api/types/requests/login-check.request"
import { useRouter } from "vue-router"

const api: HttpClient = inject<HttpClient>("api")
const router = useRouter()

const rules = [
    (v: string) => !!v || "This field is required",
    (v: string) => v.length >= 3 || "Minimum 3 characters",
    (v: string) => v.length <= 20 || "Maximum 20 characters"
]

const formValid: Ref<boolean> = ref(false);

const loginRequest: LoginCheckRequest = reactive({
    username: "",
    password: ""
})

async function login() {
    if(formValid) {
        try {
            await api.login(loginRequest)
            void router.push('/');
        } catch (error) {
            console.error("Login failed:", error)
            // Handle login failure, e.g., show an error message
        }
    }
}
</script>
