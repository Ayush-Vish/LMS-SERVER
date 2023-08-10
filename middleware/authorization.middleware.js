import Apperror from "../utility/error.util.js"

const authorizedRole = (...roles) => async(req ,res, next) => {
    console.log(roles)
    console.log(req.user)
    const currentUserRoles = req.user.role
    console.log(req.user.role)
    console.log(currentUserRoles)
    console.log()

    if(!roles.includes(currentUserRoles) )  {
        return next(new Apperror("You Dont Have Permission to Access This Route " ,403))

    }else {
        next()
    }
}

export default authorizedRole