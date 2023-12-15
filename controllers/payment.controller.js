import User from '../models/userModel.js'
import Payment from '../models/payment.model.js'
import { razorpay } from '../index.js'
import Apperror from '../utility/error.util.js'
 import crypto from 'crypto'
import userModel from '../models/userModel.js'
const getRazorpayKey = async (req, res ,next) =>  {     

    return res.status(200).json({
        success:true, 
        message : "Razorpay API Key ",
        key:process.env.RAZORPAY_KEY_ID 

    })
}
// This controllers will generate a subscription url  to redirect to the subscription page 

const buySubscription = async (req, res ,next) =>  {
    try {
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
            customer_notify :1 ,
            total_count :12 // 12 means it will charge every month for oner year subscription

        })
        user.subscription.id = subscription.id
        user.subscription.status = subscription.status 

        await user.save() 

        return res.status(200).json({
            success :true, 
            message : "Suscribed Successfully ",
            subscription_id  :subscription.id
        })
    
    } catch (e) {
        return next(new Apperror(e.message , 400))
    }


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
                return next ( new Apperror("Payment not verified, please try again " ,500))
                
            }
            await   Payment.create({
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
    try {
        const {id} = req.user 
        const user = await User.findById(id) 
        if(!user ) { 
            return next(new Apperror("User Does Not Exists ", 400)) 
    
        }
        if(user.role === "ADMIN" ) {
            return next(new Apperror("Admin is not allowed to cancel Subscription" ,400)) 
            
        }
        const subscriptionid = user.subscription.id
        // To cancel Subscription we have to Inactive the subscription 
        // By using inbuilt function 
    
        const subscription = await razorpay.subscriptions.cancel(
            subscriptionid
        )
        user.subscription.status = subscription.staus 
        await user.save()  
        return res.status(200).json ( {
            success: true, 
            message : "Subscription cancelled Successfully"
        })
    } catch (error) {
        return next(new Apperror(error.message  ,400) ) 

    }




}
const allPayments = async (req, res ,next) =>  {
    const {count}  =req.query
    const subscriptions = await razorpay.subscriptions.all({
        count : count || 10
    })
    const total = subscriptions.count


    function extractMonthlySales(records) {
        const monthlySales = Array(12).fill(0);
    
        records.forEach(record => {
            const createdAtTimestamp = record.created_at;
            const createdAtDate = new Date(createdAtTimestamp * 1000);
            const month = createdAtDate.getMonth();
    
            monthlySales[month] += record.total_count;
        });
    
        return monthlySales;
    }
    const monthlySalesData = extractMonthlySales(subscriptions.items)

    console.log("dfnbsdkjfbsjkdbfk")
    return res.status(200).json({
        success:true, 
        message : "Successfully retieved Payments", 
        monthlySalesData,
        total 
        
    })

}

const getUserRecords = async (req ,res , next )=> {
    try {
        const noOfUser = await userModel.find().countDocuments()
        const noOfActiveSubsCription = await razorpay.subscriptions.all({});
        const noOfActiveSubsCriptionCount = noOfActiveSubsCription.count
        return res.status(200).json({
            success:true, 
            message : "Successfully retieved Payments", 
            noOfUser,
            noOfActiveSubsCriptionCount
        })
    } catch (error) {
        return next(new Apperror(error.message , 400))
    }
}
export default { 
    getRazorpayKey,
    buySubscription ,
    verifySubscription,
    cancelSubscription, 
    allPayments, 
    getUserRecords
}

