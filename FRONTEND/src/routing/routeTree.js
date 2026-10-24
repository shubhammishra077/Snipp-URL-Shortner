import { createRootRoute } from "@tanstack/react-router"
import { homePageRoute } from "./homepage"
import { authRoute } from "./auth.route"
import { dasboardRoute } from "./dashboard"
import { analyticsRoute } from "./analytics.route"
import { verifyEmailRoute } from "./verifyEmail.route"
import { forgotPasswordRoute } from "./forgotPassword.route"
import { resetPasswordRoute } from "./resetPassword.route"
import { pricingRoute } from "./pricing.route"
import RootLayout from "../RootLayout"

export const rootRoute = createRootRoute({
    component: RootLayout
})

export const routeTree = rootRoute.addChildren([
    homePageRoute,
    authRoute,
    dasboardRoute,
    analyticsRoute,
    verifyEmailRoute,
    forgotPasswordRoute,
    resetPasswordRoute,
    pricingRoute,
])
