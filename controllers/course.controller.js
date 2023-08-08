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
const createCourse = async (res, req ,next) => {
    try {
        console.log("sdjfgkjsdgfjkd")
        const { title, description  ,category , createdBy}  = req.from
        console.log("gdfghdj nnvkjcv f fsdf k")
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
            fs.rm(`uploads/${req.file.filename}`)
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

}
const removeCourse = (req ,res, next) => {

}
export {
    getAllCourses,
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    removeCourse
}