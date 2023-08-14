import  JWT  from "jsonwebtoken";
// Basically we have to take cookie from request or in header
// And that is called as Token 
const jwtAuth  =(req,res,next) => {
    const token = (req.cookies && req.cookies.token) || null

    if(!token)  {
        return res.status(400).json({
          success:false, 
          message:"Not Authorized"
        })
    }
    try {
        const payload =JWT.verify(token , process.env.JWT_SECRET)
        req.user = {id:payload.id , email:payload.email, role:payload.role , suscription:payload.suscription}

    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
    next()
}

export default jwtAuth
