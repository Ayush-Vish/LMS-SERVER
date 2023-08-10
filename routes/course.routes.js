import express from "express";
const router = express.Router()
import jwtAuth from "../middleware/jwt.js";
import {getAllCourses , getLecturesByCourseId,createCourse ,updateCourse,removeCourse , addlectures} from '../controllers/course.controller.js' 
import upload from "../middleware/multer.middleware.js";
import authorizedRole from '../middleware/authorization.middleware.js'
router.use(express.json())
router.route('/')
        .get(getAllCourses)
        .post( jwtAuth ,authorizedRole("ADMIN") ,  upload.single("thumbnail"),createCourse)
                
router.route('/:id')
        .get(jwtAuth ,getLecturesByCourseId)
        .put(jwtAuth ,authorizedRole("ADMIN") , updateCourse)
        .post(jwtAuth ,  authorizedRole('ADMIN') , upload.single("lecture") , addlectures)
        .delete( jwtAuth, authorizedRole("ADMIN"),  removeCourse)

export default router