import type { RouteRecordRaw } from "vue-router"
import App from "@/App.vue"

const Admin = () => import("@/components/admin/AdminDashboard.vue").then((m) => m.default)
const Login = () => import("@/components/LoginPage.vue").then((m) => m.default)
const Teams = () => import("@/components/admin/teams/TeamsOverview.vue").then((m) => m.default)

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
                children: [
                    {
                        name: "TeamsOverview",
                        path: "teams",
                        component: Teams,
                    },
                ],
            },
            {
                name: "LoginPage",
                path: "login",
                component: Login,
                meta: {
                    guestRoute: true,
                },
            },
        ],
    },
]
