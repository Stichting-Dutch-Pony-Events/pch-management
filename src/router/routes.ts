import type { RouteRecordRaw } from "vue-router"
import App from "@/App.vue"

const Admin = () => import("@/pages/admin/AdminDashboard.vue").then((m) => m.default)
const Login = () => import("@/pages/LoginPage.vue").then((m) => m.default)
const Teams = () => import("@/pages/admin/teams/TeamsOverview.vue").then((m) => m.default)
const TeamForm = () => import("@/pages/admin/teams/TeamForm.vue").then((m) => m.default)

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
                        children: [
                            {
                                name: "TeamDetails",
                                path: ":teamId",
                                component: TeamForm,
                            },
                        ],
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
