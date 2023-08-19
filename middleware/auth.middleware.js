import Apperror from "../utility/error.util"
import  jwt  from "jsonwebtoken"
const isLoggedIn  = async (req ,res , next) => {
    const {token }  =req.cookies
    if(!token) {
        return next(new Apperror("Unauthenticated , Please Login  Again" , 401))
    }
    const userDetails = await jwt.verify(token ,process.env.JWT_SECRET )
    req.user = userDetails
    next()
        
}
export default isLoggedIn


/**
 * We can use this token or jwt.js Both are same .
 * BAsically we have taken token from cookie 
 *      
 */