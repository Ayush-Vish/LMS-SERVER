import mongoose from 'mongoose'
import bycrypt from 'bcrypt'
import JWT from 'jsonwebtoken'
import crypto from 'crypto'
const UserSchema = new mongoose.Schema({
    name:{
        type:String, 
        require:[true, "Name is Required"],
        trim:true,
        minLength:[5 , "Name must be greater than 5 characters"],
        lowercase:true
    },
    email:{
        type:String,
        require:[true,"Name is required for SignUp"],
        unique:[true, 'User already SignIn'], 
        lowercase:true,
        trim:true,
        match:[ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ,  "Please Enter a Valid Email "]

            
    },
    password:{
        type:String,
        require:[true,"Password is required for further Process"],
        select:false,
        minLength:[8, "Password must be greater than 8 characters"]
        
    },
    avatar :{
        public_id: {
            type:String, 
        },
        secure_url: {
            type:String
        }
    },
    role: {
        type:String,
        default:"USER"
    },
    confirmpassword: {
        type:String,
        require:[true,"Password is required for further Process"],
        select:false,

    },
    forgotpasswordtoken : {
        type:String
    },
    forgotpasswordexpirydate :{
        type:Date
    },
    subscription: {
        id:String ,
        status : {
            type : String ,
            lowercase : true 
        }
    }
},{
    timestamps:true
})


// Pre methods
UserSchema.pre('save' , async function (next) {
    if(!this.isModified('password')) {
        return next()
    }
    this.password = await bycrypt.hash(this.password , 10  )
    return next()
})
UserSchema.methods = {
    comparePassword(newPassword){
        newPassword = bycrypt.hash(newPassword ,10) 
        return this.password === newPassword     
    },
    generateJWTTokens(){
         return JWT.sign(
            {id:this._id,email:this.email,suscription: this.suscription , role: this.role },
            process.env.JWT_SECRET,
            {
                expiresIn:'24h'
            }
        )
    },
    generatePasswordResetToken() {
        const resetToken = crypto.randomBytes(20).toString('hex');
        // This generated token we will not Store in Databasee 
        // We should try to store it in hashed form 
        this.forgotpasswordtoken = crypto.createHash('sha256')
                                        .update(resetToken)
                                        .digest('hex')
        this.forgotpasswordexpirydate = Date.now() + 15*60*1000
        
        return resetToken
    }
}

export default mongoose.model("User" , UserSchema)
