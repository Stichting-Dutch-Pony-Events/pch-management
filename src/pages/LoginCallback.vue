<template>
    <v-container class="fill-height">
        <v-responsive class="align-center fill-height mx-auto" max-width="500">
            <v-card>
                <v-card-item>
                    <v-card-title>Logging you in...</v-card-title>
                </v-card-item>
                <v-card-text class="d-flex justify-center align-center" style="height: 200px">
                    <v-progress-circular indeterminate color="primary" size="128"></v-progress-circular>
                </v-card-text>
            </v-card>
        </v-responsive>
    </v-container>
</template>

<script setup lang="ts">
import { useUserManager } from "@/plugins/oidc-client"
import { useMessageStore } from "@/plugins/pinia/message-store"
import { useRouter } from "vue-router"

const router = useRouter()
const userManager = useUserManager()
const messageStore = useMessageStore()

void executeSigninCallback()

async function executeSigninCallback() {
    try {
        const user = await userManager.signinCallback()
        if (user) {
            void router.push({ name: "AdminDashboard" })
        } else {
            // No user found, redirect to login page
            void router.push({ name: "LoginPage" })
        }
    } catch (error) {
        console.error("Error during signin callback:", error)
        messageStore.addMessage({
            text: "An error occurred while logging in. Please try again.",
            color: "error",
            timeout: 5000,
        })
        void router.push({ name: "LoginPage" })
    }
}
</script>

<style scoped></style>
