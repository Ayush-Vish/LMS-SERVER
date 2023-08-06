const errorMiddleware = (err,req,res,next) =>{
    err.status = err.status || 500
    console.log("Error middleware me hu ")
    console.log(err.message)
    err.message  = err.message || "Something went Wrong"
    res.status(err.status).json({
        success:false,
        message:err.message,
        stack:err.stack
        
    })
}
export default errorMiddleware