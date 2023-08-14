import userModel  from '../models/userModel.js'
import emailValidator from 'email-validator'
import bcrypt from 'bcrypt'
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import Apperror from '../utility/error.util.js'
import multer from 'multer'
import sendEmail from '../utility/sendemail.util.js' 
import crypto from 'crypto'
const cookieOptions = {
    maxAge:7*24*60*60*100,
    httpOnly:true,
    secure:true

}
const register = async (req,res,next) =>{
    try {
        const {name , email, password, confirmpassword ,role}  = req.body
        if(!name || !email || !password || !confirmpassword ) {
            return next(new Apperror ("All fields are required", 400));
        }
            
        if(password !== confirmpassword  ) 
        {
            return next(new Apperror("Please Fill Password Correctly" , 400))
        }
        const validEmail = emailValidator.validate(email) 
        if(!validEmail) {
            return next(new Apperror("Please Enter a Valid Email" , 400))
        }
        const UserExists  = await userModel.find({email})
        if(UserExists.length!==0) {
            return next(new Apperror ("User Already Exists Please Change Email" ,400))
        }
        // We Will create User in Two Steps 
        // Firstly we will make a 
        if(!role) {
            const user = await userModel.create({
                name,email,password,confirmpassword,
                avatar : {
                    public_id:email ,
                    secure_url : 'https://images.pexels.com/lib/avatars/grey.png?w=130&h=130&fit=crop&dpr=1'
                }
            })
        }
        else {
            const user = await userModel.create({
                name,email,password,confirmpassword,role:"ADMIN",
                avatar : {
                    public_id:email ,
                    secure_url : 'https://images.pexels.com/lib/avatars/grey.png?w=130&h=130&fit=crop&dpr=1'
                }
            })

        }
        if(!user) {
            return next(new Apperror("User Registration failed Please try Again  " , 400) )
        }
        // When we upload the file in cloudinary we will get a link 
        // And that link we will Store in Database


        // When we upload the image in registration Page it get Posted in 
        // the Form of FORM-DATA  


        // TODO: File Upload 


        if(req.file) {
   
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path , {
                    folder:'lms',
                    width:'250',
                    height:'250',
                    gravity:'face' ,
                    crop:'fill',


                }) 
                if(result) {
                    user.avatar.public_id = result.public_id
                    user.avatar.secure_url  = result.secure_url


                    // Also we should remove file from local System in the upload folder 
                    fs.rm(`uploads/${req.file.filename}`)
                }
            } catch (error) {
                return next(new Apperror(error || "File not uploaded Successfully") ,500)
            }
        }else {
            console.log("File Nahi h ")
        }


        await user.save();

        user.password  = undefined;
        

        const token  = await user.generateJWTTokens()
        res.cookie = ('token' , token , cookieOptions)
        res.status(200).json({
            success: true,
            message:"User created Successfully",
            user       
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message:error.message       
        })
        
    }
}
const login = async (req,res,next) =>{
    
    try {
        const {email , password}  = req.body
        const user = await userModel.
            findOne({
                email:email
            })
            .select('+password')

        if(!user ||!(await bcrypt.compare(password ,user.password))) {
            return res.status(400).json({
                success:false,
                message:'Invalid Credentials'
            })
        }
        const token  = user.generateJWTTokens();
        user.password = undefined;
        user.confirmpassword  =undefined
        
        res.cookie("token" ,token , cookieOptions)
        res.status(200).json({
            success:true,
            user
        })
        
    } catch (error) {
        console.log(error)
        res.status(400).json({
            success:false,
            message:error.message
        })   
    }

}
const logout = async (req,res,next) =>{
    try {
        res.cookie("token" , "token" , {
            expires:new Date(),
            httpOnly:true
        })
        return res.status (200).json({
            success:true,
            message:"You are Successfully Logged Out"
        })

    } catch (error) {
        return next(new Apperror (error.message , 400))
    }

}
const me = async (req,res,next) =>{
    const userId = req.user.id 
    console.log (userId)
    try {
        const userFind= await userModel.find({_id:userId})
        res.status(200).json({
            success:true, 
            message:userFind
        })
        
    } catch (error) {
        next(new Apperror("Unable to get User Details"))
    }
   


}
const forgotPassword = async (req,res,next) => {
    const {email } = req.body
    const user  =await userModel.findOne({email})
    if(!user) {
        return next(new Apperror("Email not registered") ,400)

    }


    const resetToken  =await user.generatePasswordResetToken()
    await user.save()
    // Now this generated url we have to send it to a particular email

    console.log("reset Password Token is " , resetToken)


    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    try {
        const subject = "Hello I am from Wakanda And I am Black Panther"
        const message = `<h1> Hello World, </h1> click on this  
                        <a href=${resetPasswordURL}> link </a>`
        await sendEmail(email, subject , message) ;
        console.log("Email send ho gya ")
        return res.status(200).json({
            success:true,
            message:`Reset Password token has been send to ${user.email} Successfully`
        })
    } catch (e) {

        user.forgotpasswordexpirydate = undefined
        user.forgotpasswordtoken =  undefined
        next(new Apperror ("Problem in sending mail , Please try Again" , 500))
    }
}
// Now  the data we will recieve in params 
// like api/v1/user/reset/:resettoken 
// Here resettoken is the param and we acan get this in like req.params 

const resetPassword = async(req ,res, next) => {
    const {resetToken}   = req.params
    const {password } = req.body

    // Now we will convet this token with the already existing token
    // But the token is stored in the hashed form 
    // so we will also do the same here also 
    const forgotpasswordtoken  = crypto
                                .createHash('sha256')
                                .update(resetToken)
                                .digest('hex')
    console.log(forgotpasswordtoken)
    const user = await userModel.findOne({
        forgotpasswordtoken
    })
    console.log(user)
    if(!user) {
        return next(new Apperror ( "Token is invalid or Expired Please try Again ")  ,400)
    }
    user.password = password;
    user.forgotpasswordtoken =  undefined
    user.forgotpasswordexpirydate= undefined
    user.save()
    res.status(200).json({
        success:true, 
        message:"Password Changed Successfully"

    })
}
const changePassword = async (req, res, next) =>  {
    try {
        const {oldPassword,  newPassword} =  req.body
        console.log("YAha Tak a gaya h ")
        const {id} = req.user


        console.log(id) 
        console.log(oldPassword  , newPassword)
        if(!oldPassword || !newPassword) {
            return next(new Apperror("All fields Are Mandatory" , 400))
        }

        const user = userModel.findById(id).select("+password")
        if(!user) {
            return next(new Apperror("You are not logged in", 400))
        }
        const isPasswordValid =await userModel
        if(!isPasswordValid ) {
            return next(new Apperror("Invalid Old Password" ,400))

        }
        user.password  = newPassword
        
        await user.save()
        user.password = undefined
        return res.status(200).json({
            success:true,
            message:"Password Changed Successfully"
    })
        
    } catch (error) {
        return next(new Apperror(error.message, 400))
        
    }

}
const updateUser =  async (req, res, next) => {
    const {name}  = req.body
    const {id }  = req.user.id
    const user= await userModel.findById(id)
    if(!user) {
        return next(new Apperror("User Does not Exists" , 400))
    }
    if(req.name ) {
        user.name = name ;

    }
    if(req.file) {
        await cloudinary.v2.destroy(user.avatar.public_id)
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path , {
                folder:'lms',
                width:'250',
                height:'250',
                gravity:'face' ,
                crop:'fill',


            }) 
            if(result) {
                user.avatar.public_id = result.public_id
                user.avatar.secure_url  = result.secure_url


                // Also we should remove file from local System in the upload folder 
                fs.rm(`uploads/${req.file.filename}`)
            }
        } catch (error) {
            return next(new Apperror(error || "File not uploaded Successfully") ,500)
        }
    }
    await user.save()
    return res.status(200).json({
        success:true,
        message:"Info Updated Successfully"
    })


}

export default {
    
    register,
    login,
    logout,
    me,
    forgotPassword,
    resetPassword,
    changePassword ,
    updateUser
}

