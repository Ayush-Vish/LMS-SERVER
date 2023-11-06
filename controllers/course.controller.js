import courseModel from '../models/course.model.js'
import Course from '../models/course.model.js'
import Apperror from '../utility/error.util.js'
import AppError from '../utility/error.util.js'
import cloudinary from 'cloudinary'
import fs from 'fs/promises'

const getAllCourses = async(req ,res, next ) => {
    try {
        const courses  = await Course.find({}).select("-lectures")
        res.status(200).json({
            success:true,
            message:"Showing All Courses",
            courses
        })
    } catch (error) {
        return next(new AppError ("Unable to find Courses" ,400))
    }
}
const getLecturesByCourseId = async(req ,res, next ) => {
    try {
        const {id} = req.params
        const course = await Course.findById(id);
        if(!course) {
            return next(new Apperror("Invalid Course id " , 400))
        }
        return res.status(200).json({
            success:true ,
            message:"Course lectures fetched Successfully",
            lectures : course.lectures
        })
    } catch (error) {
        return next(new AppError("Unable to fetch lectures Successfully"))
    }
}
const createCourse = async (req, res ,next) => {
    try {

        const { title, description  ,category , createdBy}  = req.body
        if(!createdBy || !category || !title || !description)  {
            return next(new Apperror("All field are required" ,400))
        }
        const course  =await Course.create( {
            title,
            description,
            category,
            createdBy
        })
        if(!course) {
            return next(new Apperror("Courses Not created " , 400))
        }

        if(req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path ,  {
                folder:'lms'
            })
            if(result) {
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url; 
            }
        }
        await course.save()

        return res.status(200).json({
            success:true,
            message: "Course created Successfully"
        })    
    } catch (error) {
        return next(new Apperror(error.message ,400))
    }
}
const updateCourse = async (req ,res ,next) => {
    try {
        const {id} = req.params
        // basically first find id 
        // then set all the info which is in req.body 
        console.log(id)
        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set:req.body
            },
            {
                runValidators :true 
            }
        )
        await course.save()
        console.log(course)
        if(!course) {
            return next(new Apperror("Course Not Updated Successfully" ,400))
        }
        return res.status(200).json({
            success:true, 
            message : "Course Updated Successfully",
            course
        })
    } catch (error) {
        return next(new Apperror(""))
    }

}
const removeCourse = async (req ,res, next) => {

    try {
        const {id} = req.params 
        const course = Course.findById(
            id
        )
        if(!course) {
            return next(new AppError("No Such Course Exists" ,400))
        }
        await Course.findByIdAndDelete(id)

        return res.status(200).json({
            success:true ,
            message : "Course Deleted Successfully"
        })
        
    } catch (error) {
        return next(new Apperror(error.message , 400))
        
    }


    
}
const addlectures =async (req , res, next) => { 

    try {
        console.log("fjbskjfbsjkfbsdkfbsdkl")
        const {title , description } = req.body 
        const {id} = req.params;
        const course  =await Course.findById(id)
        if(!course ) {
            return next(new AppError("Course Does Not Exists ") ,500)
        }
        const lectureData =   {
            title,description, 
            lecture:{}
        }
        console.log("fjbskjfbsjkfbsdkfbsdkl")
        console.log(req.file)
        if(req.file) {
            try {
                const result =  await cloudinary.v2.uploader.upload(req.file.path, {
                    resource_type: "video", 
                })
                console.log(result);
                console.log(req.file);

                if(result) {
                    
                    lectureData.lecture.public_id = result.public_id
                    lectureData.lecture.secure_url = result.secure_url
                }
                
            } catch (error) {
                console.log(error);

                return next( new Apperror (error.message , 400))
                
            }
        }
        course.lectures.push(lectureData)
        course.numberOfLectures = course.lectures.length
        await course.save()
    
        return res.status(200).json({
            success:true, 
            message: "Lectures Added Successfully",
            course
        })
        
    } catch (error) {
        return next(new Apperror(error.message , 400) )
    }


 } 



const deleteLecture = async  (req ,res, next ) => { 
    try {
        const { lid , cid}  = req.params;
        const course=  await courseModel.findById(cid) ;
        if(!course) { 
            return next(new Apperror("Course does not exists" ,400 )) ;
        }  
        console.log(course.lectures.length)
        course.lectures = course.lectures.filter((e)=>  {  
            return e._id !=lid;
        }) 
        await course.save() ;
        return res.status(200).json({
            success: true, 
            message :"Course deleted Successfully"
        })
        

    } catch (error) {
        return next(new AppError ( error.message ,400 ))
    }
}
export {
    getAllCourses,
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addlectures, 
    deleteLecture
}