import Apperror from "../utility/error.util.js"

const authorizedRole = (...roles) => async(req ,res, next) => {

    const currentUserRoles = req.user.role
    

    if(!roles.includes(currentUserRoles) )  {
        return next(new Apperror("You Dont Have Permission to Access This Route " ,403))

    }else {
        next()
    }
}

export default authorizedRole