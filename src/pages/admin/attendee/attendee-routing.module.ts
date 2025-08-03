import type { RouteRecordRaw } from "vue-router"

const AttendeeOverview = () => import("@/pages/admin/attendee/AttendeeOverview.vue")
const AttendeeDetails = () => import("@/pages/admin/attendee/AttendeeDetails.vue")

export const AttendeeRoutes: RouteRecordRaw[] = [
    {
        name: "attendee-overview",
        path: "attendee",
        component: AttendeeOverview,
    },
    {
        name: "attendee-details",
        path: "attendee/:attendeeId",
        component: AttendeeDetails,
    },
]
