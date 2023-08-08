
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title: {
        type:String,
        required:[true, "Title is required"],
        minLength: [10,"Min length Should be 10 characters"],
        maxLength:[30, "Title should be less than 30 chracters "]
    },
    description : {
        type:String,
        required: [true, "Description is required"],
        minLength:[8,"Description should be more than 8 characters"]
    },
    category : {
        type:String
    },
    thumbnail : {
        public_id : {
            type:String,
        },
        secure_url: {
            type:String
        }
    },
    lectures: [
        {
            title: {
                type:String,
                description:String,
                lectures: {
                    public_id : {
                        type:String
                    },
                    secure_url: {
                        type:String
                    }
                }
            }
        }
    ],
    numberOfLectures: {
        type:Number,
        default:0,
    },
    createdBy:  {
        type:String,
        required:true
    }
},
{
    timestamps:true 
}
)


export default mongoose.model("Course" ,courseSchema)

