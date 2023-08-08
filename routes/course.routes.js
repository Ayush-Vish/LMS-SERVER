import express from "express";
const router = express.Router()
import jwtAuth from "../middleware/jwt.js";
import {getAllCourses , getLecturesByCourseId,createCourse ,updateCourse,removeCourse} from '../controllers/course.controller.js' 
import upload from "../middleware/multer.middleware.js";

router.use(express.json())
router.route('/')
        .get(getAllCourses)
        .post(upload.single("thumbnail"),createCourse)
                
router.route('/:id')
        .get(jwtAuth, getLecturesByCourseId)
        .put(updateCourse)
        .delete(removeCourse)

export default router