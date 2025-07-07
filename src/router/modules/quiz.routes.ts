import type { RouteRecordRaw } from "vue-router"

const QuizOverview = () => import("@/pages/admin/quiz/QuizOverview.vue").then((m) => m.default)

export const QuizRoutes: RouteRecordRaw[] = [
    {
        name: "QuizOverview",
        path: "quiz",
        component: QuizOverview,
    },
]
