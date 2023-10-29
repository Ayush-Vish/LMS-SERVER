import express from "express";

import payment  from '../controllers/payment.controller.js'
import jwtAuth from "../middleware/jwt.js";
import authorizedRole from '../middleware/authorization.middleware.js'
const router = express.Router()

router.route('/razorpay-key' , )
        .get(jwtAuth, 
            payment.getRazorpayKey
        )
router.route('/subscribe')
        .post(jwtAuth,
            payment.buySubscription
        )
router.route("/verify")
        .post(
            jwtAuth,
            payment.verifySubscription
        )
router.route('/unsubscribe')
        .post(
            jwtAuth,
            payment.cancelSubscription
        )
router.route('/')
        .get(
            jwtAuth,
            payment.allPayments
        )


export default router
