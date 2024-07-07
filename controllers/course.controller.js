import Course from "../model/course.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs/promises"
const getAllCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({}).select('-lectures');
        res.status(200).json({
            success: true,
            message: 'Courses fetched',
            courses,
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

const getLecturesByCourseId = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(id);
        const course = await Course.findById(id);
        if (!course) {
            return next(new AppError('No courses available', 500))
        }
        res.status(200).json({
            success: true,
            message: 'Course Lectures fetched successfully',
            lectures: course.lectures
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const createCourse = async (req, res, next) => {
    try {
        const { title, description, category, createdBy } = req.body;
        if (!title || !description || !category || !createdBy) {
            return next(new AppError('All fields are neccessary', 400))
        }

        const course = await Course.create({
            title,
            description,
            category,
            createdBy,
            thumbnail: {
                public_id: 'Dummy',
                secure_url: 'Dummy'
            }
        })

        if (!course) {
            return next(new AppError('Course cant be created.. try again', 400))
        }

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms'
            });
            if (result) {
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
            }
            fs.rm(`uploads/${req.file.filename}`);
        }
        await course.save();
        res.status(200).json({
            success: true,
            message: 'Course created successfully',
            course
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}
const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log('Incoming request body:', req.body);
        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set: req.body
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!course) {
            return next(new AppError('Course dosnt exists', 500))
        }

        res.status(200).json({
            success: true,
            message: 'Updated successfully',
            course
        })


    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}
const removeCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if (!course) {
            return next(new AppError('Course doesnt exists', 500))
        }

        await course.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Deleted successfully'

        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

export { getAllCourses, getLecturesByCourseId, createCourse, updateCourse, removeCourse };