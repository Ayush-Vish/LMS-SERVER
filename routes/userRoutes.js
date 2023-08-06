import express from "express";
import jwtAuth from '../middleware/jwt.js'
const router = express.Router()
import user  from '../controllers/userController.js'
import upload from '../middleware/multer.middleware.js'

router.post('/register' ,upload.single("avatar"), user.register)
router.post('/login' ,   user.login)
router.get('/logout' , user.logout)
router.get('/me' , jwtAuth,user.me)
router.post("/reset", user.forgotPassword)
router.post("/reset/:resettoken",  user.resetPassword)

export default router