import express from "express";
const router = express.Router()
import {Course} from '../controllers/course.controller.js' 
router.get('/',Course.getAllCourses )
router.get('/:id' ,Course.getLecturesByCourseId)
export default router