import axiosInstance from "../utils/axiosInstance"

export const createShortUrl = async ({ url, slug, password, title }) => {
    const { data } = await axiosInstance.post("/api/create", { url, slug, password, title })
    return data.shortUrl
}

export const createBulkShortUrls = async (urls) => {
    const { data } = await axiosInstance.post("/api/create/bulk", { urls })
    return data.results
}

export const getQrCode = async (shortCode, color) => {
    const { data } = await axiosInstance.get(`/api/create/${shortCode}/qrcode`, {
        params: color ? { color } : undefined,
    })
    return data.qrCode
}

export const deleteShortUrl = async (shortCode) => {
    const { data } = await axiosInstance.delete(`/api/create/${shortCode}`)
    return data
}
