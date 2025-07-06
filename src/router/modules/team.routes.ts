import type { RouteRecordRaw } from "vue-router"

const Teams = () => import("@/pages/admin/teams/TeamsOverview.vue").then((m) => m.default)
const TeamForm = () => import("@/pages/admin/teams/TeamForm.vue").then((m) => m.default)

export const TeamRoutes: RouteRecordRaw[] = [
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
]
