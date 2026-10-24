import { createRoute } from "@tanstack/react-router"
import { rootRoute } from "./routeTree"
import VerifyEmailPage from "../pages/VerifyEmailPage"

export const verifyEmailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/verify-email',
    component: VerifyEmailPage,
    validateSearch: (search) => ({ token: search.token }),
})
