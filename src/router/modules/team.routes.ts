import type { RouteRecordRaw } from "vue-router"

const Teams = () => import("@/pages/admin/teams/TeamsOverview.vue")
const TeamForm = () => import("@/pages/admin/teams/TeamForm.vue")

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
