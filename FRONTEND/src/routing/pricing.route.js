import { createRoute } from "@tanstack/react-router"
import { rootRoute } from "./routeTree"
import PricingPage from "../pages/PricingPage"

export const pricingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/pricing',
    component: PricingPage,
  })
