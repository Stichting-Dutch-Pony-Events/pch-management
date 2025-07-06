<template>
    <v-container class="fill-height">
        <v-responsive class="align-center fill-height mx-auto" max-width="500">
            <v-card>
                <v-card-item>
                    <v-card-title>Login with your PCH ID</v-card-title>
                </v-card-item>
                <v-card-actions>
                    <v-btn @click="login" color="primary" class="mt-4" block> Login </v-btn>
                </v-card-actions>
            </v-card>
        </v-responsive>
    </v-container>
</template>

<script setup lang="ts">
import { useUserManager } from "@/plugins/oidc-client"

const userManager = useUserManager()

userManager
    .getUser()
    .then((user) => {
        if (user) {
            // User is already logged in, redirect to home or dashboard
            void userManager.signinCallback().then(() => {
                void userManager.signinSilent()
            })

            console.log(user.access_token)
        }
    })
    .catch((error) => {
        console.error("Error checking user login status:", error)
    })

function login(): void {
    void userManager.signinRedirect()
}
</script>

<style scoped></style>
