import { type App, type Plugin } from "vue"
import { UserManager } from "oidc-client-ts"
import type { RouteLocation, Router } from "vue-router"

const userManager: UserManager = new UserManager({
    authority: import.meta.env.VITE_OIDC_AUTHORITY,
    client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI,
    scope: "openid profile email offline_access pch-app-roles",
})

export function createOidcClient(router: Router): Plugin & { userManager: UserManager } {
    const install = (app: App) => {
        router.beforeEach(async (to: RouteLocation) => {
            let user = await userManager.getUser()

            if (!to.meta.guestRoute) {
                // If the user is not authenticated, try to sign in silently
                if (user !== null && user.expired) {
                    try {
                        user = await userManager.signinSilent()
                    } catch (e) {
                        console.log("Silent sign-in failed, redirecting to login page:", e)
                    }
                }

                if (user === null || user.expired) {
                    return { name: "LoginPage" }
                }
            } else {
                if (user !== null && !user.expired) {
                    // If the user is authenticated, redirect to the admin dashboard
                    return { name: "AdminDashboard" }
                }
            }
        })

        app.provide("userManager", userManager)
    }

    return {
        install,
        userManager,
    }
}

export const useUserManager = (): UserManager => {
    return userManager
}
