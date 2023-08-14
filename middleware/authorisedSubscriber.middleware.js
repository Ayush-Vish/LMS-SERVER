import Apperror from "../utility/error.util"

const authorizeSubscriber  = async (req ,res, next) => {
    const subscription =  req.user.subscription
    const currentUserRole = req.user.role 
    if(currentUserRole !== "ADMIN"  && subscription.status !=="ACTIVE") {
        return next(new Apperror("Please Subscribe TO Access This Route " ,403))
    }
    next( )
} 