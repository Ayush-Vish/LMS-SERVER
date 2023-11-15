import express, { urlencoded } from 'express' 
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectToDB from './config/db.js'
import dotenv from 'dotenv'
import morgan from 'morgan'
import errorMiddleware from './middleware/error.middleware.js'
const app = express()
dotenv.config()

app.use(morgan('dev'))
app.use(express.json())
// The encoded url we get it helps us to get the Query params or to parse the encoded  url 

app.use(urlencoded({
    extended:true
}))

app.use(cors({
    origin:process.env.FRONTEND_URL ,
    credentials:true,
}))
app.use(cookieParser())
connectToDB()
app.use('/ping', (req, res) => {
    res.send('/pong')
}) 
// Routes of three modules
import userRoutes from './routes/userRoutes.js'
app.use('/api/v1/user', userRoutes);

import courseRoutes from './routes/course.routes.js'
app.use('/api/v1/courses' , courseRoutes)

// For making payments Route 
import paymentRoutes from './routes/payment.routes.js'
app.use('/api/v1/payment' ,paymentRoutes)
 

// Making error middleware 
// We are making this Middleware if any error is there Erroe Middleware will capture this 
// This middleware is for All errors 
// If there is Some Problem in the userRoutes section  then we have come to this errorMiddleware 


app.use(errorMiddleware)
app.all('*' , (req,res) =>{
    res.status(404).send("OOPS !! 404 Page Not Found");
})
export default app