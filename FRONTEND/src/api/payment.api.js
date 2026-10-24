import axiosInstance from "../utils/axiosInstance"

export const getPlans = async () => {
    const { data } = await axiosInstance.get("/api/payment/plans")
    return data.plans
}

export const createOrder = async (plan) => {
    const { data } = await axiosInstance.post("/api/payment/create-order", { plan })
    return data.order
}

export const verifyPayment = async (payload) => {
    const { data } = await axiosInstance.post("/api/payment/verify", payload)
    return data
}

export const getPaymentHistory = async (page = 1, limit = 20) => {
    const { data } = await axiosInstance.get("/api/payment/history", { params: { page, limit } })
    return data
}
