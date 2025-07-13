import type { RouteRecordRaw } from "vue-router"
import App from "@/App.vue"
import { TeamRoutes } from "@/router/modules/team.routes"
import { QuizRoutes } from "@/router/modules/quiz.routes"
import { TimetableRoutes } from "@/pages/admin/timetable/timetable-routing.module"

const Admin = () => import("@/pages/admin/AdminDashboard.vue")
const Login = () => import("@/pages/LoginOidc.vue")
const LoginCallback = () => import("@/pages/LoginCallback.vue")

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
                children: [...TeamRoutes, ...QuizRoutes, ...TimetableRoutes],
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
