import type { RouteRecordRaw } from "vue-router"

const QuizOverview = () => import("@/pages/admin/quiz/QuizOverview.vue").then((m) => m.default)
const QuizForm = () => import("@/pages/admin/quiz/QuizForm.vue").then((m) => m.default)

export const QuizRoutes: RouteRecordRaw[] = [
    {
        name: "QuizOverview",
        path: "quiz",
        component: QuizOverview,
        children: [
            {
                name: "QuizForm",
                path: ":quizId",
                component: QuizForm,
            },
        ],
    },
]
