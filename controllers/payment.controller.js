import User from '../models/userModel.js'
import { razorpay } from '../server.js'
import Apperror from '../utility/error.util.js'
 import crypto from 'crypto'
const getRazorpayKey = async (req, res ,next) =>  {
    return res.status(200).json({
        success:true, 
        message : "Razorpay API Key ",
        key:process.env.RAZORPAY_KEY_ID 

    })
}
// This controllers will generate a subscription url  to redirect to the subscription page 

const buySubscription = async (req, res ,next) =>  {
    const {id} =req.user
    const user = await User.findById(id)
    if(!user) {
        return next(new Apperror("Unauthorized , Please Login" , 400))
    }
    if(user.role === "ADMIN") {
        return next(new Apperror("Admin cannot suscribe" , 400))
    }
    const subscription = await razorpay.subscriptions.create({
        plan_id:process.env.RAZORPAY_PLAN_ID,
        customer_notify :1 
    })
    user.subscription.id = subscription.id
    user.subscription.status = subscription.status
    await user.save()
    return res.status(200).json({
        success :true, 
        message : "Suscribed Successfully ",
        subscription_id  :subscription.id
    })

}
const verifySubscription = async (req, res ,next) =>  {
    try {
        const {id}  =req.user
        const {razorpay_payment_id , razorpay_signature ,razorpay_subscription_id} = req.body
        const user =  await User.findById(id) 
        if(!user){
            return next(new Apperror ("User Does not Exists " , 400))
        }
        const subscriptionId=  user.subscription.id
        // If th e Signature we have generated is 
        const generatedSignature =  crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${subscriptionId}`)
            .digest('hex')

            // If the signature we have generated via razorpay is not equal to that of we 
            // Have got in req.body 
            // Then it must be an Error 
            if(generatedSignature !== razorpay_signature ) {
                 return next("Payment not verified, please try again , 500")

            }
            await Payment.create({
                razorpay_payment_id ,
                razorpay_signature ,
                razorpay_subscription_id 
            })
            user.subscription.status  ="active" 
            await user.save() 
            return res.status(200).json({
                success:true, 
                message : "Payment  Verified Successfully    "
            })
    } catch (error) {
        return next(new Apperror(error.message , 400))
    }
}
const cancelSubscription = async (req, res ,next) =>  {

}
const allPayments = async (req, res ,next) =>  {

}
export default { 
    getRazorpayKey,
    buySubscription ,
    verifySubscription,
    cancelSubscription, 
    allPayments
}