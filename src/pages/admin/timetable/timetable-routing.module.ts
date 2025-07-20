import type { RouteRecordRaw } from "vue-router"

const TimetableOverview = () => import("@/pages/admin/timetable/TimetableOverview.vue")
const TimetableSettings = () => import("@/pages/admin/timetable/TimetableSettings.vue")
const PublicTimetable = () => import("@/pages/admin/timetable/PublicTimetable.vue")
const VolunteerTimetable = () => import("@/pages/admin/timetable/VolunteerTimetable.vue")

export const TimetableRoutes: RouteRecordRaw[] = [
    {
        name: "timetable",
        path: "timetable",
        redirect: {
            name: "publicTimetable",
        },
        component: TimetableOverview,
        children: [
            {
                name: "publicTimetable",
                path: "public/:timetableDay?",
                component: PublicTimetable,
            },
            {
                name: "volunteerTimetable",
                path: "volunteer/:timetableDay?",
                component: VolunteerTimetable,
            },
            {
                name: "timetableSettings",
                path: "settings",
                component: TimetableSettings,
            },
        ],
    },
]
