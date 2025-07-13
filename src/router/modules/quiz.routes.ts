import type { RouteRecordRaw } from "vue-router"

const QuizOverview = () => import("@/pages/admin/quiz/QuizOverview.vue")

export const QuizRoutes: RouteRecordRaw[] = [
    {
        name: "QuizOverview",
        path: "quiz/:quizQuestionId?/:quizAnswerId?",
        component: QuizOverview,
    },
]
