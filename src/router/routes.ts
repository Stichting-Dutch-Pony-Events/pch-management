import type { RouteRecordRaw } from "vue-router"
import App from "@/App.vue"
import { TeamRoutes } from "@/router/modules/team.routes"
import { QuizRoutes } from "@/router/modules/quiz.routes"

const Admin = () => import("@/pages/admin/AdminDashboard.vue").then((m) => m.default)
const Login = () => import("@/pages/LoginOidc.vue").then((m) => m.default)
const LoginCallback = () => import("@/pages/LoginCallback.vue").then((m) => m.default)

export const routes: RouteRecordRaw[] = [
    {
        path: "/",
        component: App,
        redirect: {
            name: "AdminDashboard",
        },
        children: [
            {
                name: "AdminDashboard",
                path: "admin",
                component: Admin,
                children: [...TeamRoutes, ...QuizRoutes],
            },
            {
                name: "LoginPage",
                path: "login",
                component: Login,
                meta: {
                    guestRoute: true,
                },
            },
            {
                name: "LoginCallback",
                path: "login-callback",
                component: LoginCallback,
                meta: {
                    guestRoute: true,
                },
            },
        ],
    },
]
