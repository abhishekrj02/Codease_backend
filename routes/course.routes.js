import { Router } from "express";
import { getAllCourses, getLecturesByCourseId, createCourse, updateCourse, removeCourse, addLectureToCourseById, removeLectureFromCourse } from "../controllers/course.controller.js";
import { isLoggedIn, authorizedRoles, authorizeSubscriber } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
const router = Router();
router.route('/')
    .get(getAllCourses)
    .post(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        upload.single('thumbnail'),
        createCourse
    )
    .delete(isLoggedIn, authorizedRoles('ADMIN'), removeLectureFromCourse);


router.route('/:id')
    .get(isLoggedIn,authorizeSubscriber, getLecturesByCourseId)
    .put(isLoggedIn, authorizedRoles('ADMIN'), updateCourse)
    .delete(isLoggedIn, authorizedRoles('ADMIN'), removeCourse)
    .post(isLoggedIn, authorizedRoles('ADMIN'), upload.single('lecture'), addLectureToCourseById)

//thest is test
export default router;