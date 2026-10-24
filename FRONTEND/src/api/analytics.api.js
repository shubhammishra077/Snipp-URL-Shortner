import axiosInstance from "../utils/axiosInstance"

export const getDashboardSummary = async () => {
    const { data } = await axiosInstance.get("/api/user/dashboard")
    return data
}

export const getLinkAnalytics = async (shortCode) => {
    const { data } = await axiosInstance.get(`/api/analytics/${shortCode}`)
    return data
}
