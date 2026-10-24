import { cookieOptions } from "../config/config.js"
import { loginUser, registerUser, verifyEmailToken, resendVerificationEmail, requestPasswordReset, resetPasswordWithToken, googleAuth, facebookAuth } from "../services/auth.service.js"
import wrapAsync from "../utils/tryCatchWrapper.js"
import { BadRequestError } from "../utils/errorHandler.js"


export const register_user = wrapAsync( async (req, res) => {
    const {name, email, password} = req.body
    if (!name || !email || !password) throw new BadRequestError("Name, email, and password are required")
    const {token,user} = await registerUser(name, email, password)
    req.user = user
    res.cookie("accessToken", token, cookieOptions)
    res.status(200).json({user:user,message:"register success"})
})

export const login_user = wrapAsync( async (req, res) => {
    const {email, password} = req.body
    if (!email || !password) throw new BadRequestError("Email and password are required")
    const {token,user} = await loginUser(email, password)
    req.user = user
    res.cookie("accessToken", token, cookieOptions)
    res.status(200).json({user:user,message:"login success"})
})

export const google_login = wrapAsync( async (req, res) => {
    const { credential } = req.body
    if (!credential) throw new BadRequestError("Google credential is required")
    const {token,user} = await googleAuth(credential)
    req.user = user
    res.cookie("accessToken", token, cookieOptions)
    res.status(200).json({user:user,message:"google login success"})
})

export const facebook_login = wrapAsync( async (req, res) => {
    const { accessToken } = req.body
    if (!accessToken) throw new BadRequestError("Facebook access token is required")
    const {token,user} = await facebookAuth(accessToken)
    req.user = user
    res.cookie("accessToken", token, cookieOptions)
    res.status(200).json({user:user,message:"facebook login success"})
})

export const logout_user = wrapAsync( async (req, res) => {
    res.clearCookie("accessToken", cookieOptions)
    res.status(200).json({message:"logout success"})
})

export const get_current_user = wrapAsync( async (req, res) => {
    res.status(200).json({user:req.user})
})

export const verify_email = wrapAsync(async (req, res) => {
    const { token } = req.query
    await verifyEmailToken(token)
    res.status(200).json({ message: "Email verified successfully" })
})

export const resend_verification = wrapAsync(async (req, res) => {
    await resendVerificationEmail(req.user._id)
    res.status(200).json({ message: "Verification email sent" })
})

export const forgot_password = wrapAsync(async (req, res) => {
    const { email } = req.body
    if (!email) throw new BadRequestError("Email is required")
    await requestPasswordReset(email)
    // Same response regardless of whether the account exists (see service).
    res.status(200).json({ message: "If that email is registered, a reset link has been sent" })
})

export const reset_password = wrapAsync(async (req, res) => {
    const { token, password } = req.body
    await resetPasswordWithToken(token, password)
    res.status(200).json({ message: "Password reset successfully" })
})
