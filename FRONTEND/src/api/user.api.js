import axiosInstance from "../utils/axiosInstance"

export const loginUser = async (password,email) =>{
    const {data} = await axiosInstance.post("/api/auth/login",{email,password})
    return data
}

export const registerUser = async (name,password,email,captchaToken) =>{
    const {data} = await axiosInstance.post("/api/auth/register",{name,email,password,captchaToken})
    return data
}

export const googleAuth = async (credential) =>{
    const {data} = await axiosInstance.post("/api/auth/google",{credential})
    return data
}

export const facebookAuth = async (accessToken) =>{
    const {data} = await axiosInstance.post("/api/auth/facebook",{accessToken})
    return data
}

export const logoutUser = async () =>{
    const {data} = await axiosInstance.post("/api/auth/logout")
    return data
}

export const getCurrentUser = async () =>{
    const {data} = await axiosInstance.get("/api/auth/me")
    return data.user
}

export const getAllUserUrls = async (page = 1, limit = 20) =>{
    const {data} = await axiosInstance.get("/api/user/urls", { params: { page, limit } })
    return data
}

export const updateProfile = async (updates) => {
    const { data } = await axiosInstance.put("/api/user/profile", updates)
    return data.user
}

export const verifyEmail = async (token) => {
    const { data } = await axiosInstance.get("/api/auth/verify-email", { params: { token } })
    return data
}

export const resendVerification = async () => {
    const { data } = await axiosInstance.post("/api/auth/resend-verification")
    return data
}

export const forgotPassword = async (email) => {
    const { data } = await axiosInstance.post("/api/auth/forgot-password", { email })
    return data
}

export const resetPassword = async (token, password) => {
    const { data } = await axiosInstance.post("/api/auth/reset-password", { token, password })
    return data
}
