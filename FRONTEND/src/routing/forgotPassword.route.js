import { createRoute } from "@tanstack/react-router"
import { rootRoute } from "./routeTree"
import ForgotPasswordPage from "../pages/ForgotPasswordPage"

export const forgotPasswordRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/forgot-password',
    component: ForgotPasswordPage,
})
