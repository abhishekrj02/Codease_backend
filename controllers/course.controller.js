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

const addLectureToCourseById = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const { id } = req.params;
        if (!title || !description) {
            return next(new AppError('All fields are neccessary', 400))
        }

        const course = await Course.findById(id);
        if (!course) {
            return next(new AppError('Course doesnt exists', 400))
        }

        const lectureData = {
            title,
            description,
            lecture: {}
        };
        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                chunk_size: 50000000, // 50 mb size
                resource_type: 'video',
            });
            if (result) {
                lectureData.lecture.public_id = result.public_id;
                lectureData.lecture.secure_url = result.secure_url;
            }
            fs.rm(`uploads/${req.file.filename}`);
        }

        course.lectures.push(lectureData);
        course.numberOfLectures = course.lectures.length;
        await course.save();
        res.status(200).json({
            success: true,
            message: 'Lecture added successfully',
            course
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }

}

const removeLectureFromCourse = async (req, res, next) => {
    try {
        const { courseId, lectureId } = req.query;
        
        if (!courseId) {
            return next(new AppError('Course ID is required', 400));
        }

        if (!lectureId) {
            return next(new AppError('Lecture ID is required', 400));
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return next(new AppError('Invalid ID or Course does not exist.', 404));
        }
        const lectureIndex = course.lectures.findIndex(
            (lecture) => lecture._id.toString() === lectureId.toString()
        );
        if (lectureIndex === -1) {
            return next(new AppError('Lecture does not exist.', 404));
        }
        await cloudinary.v2.uploader.destroy(
            course.lectures[lectureIndex].lecture.public_id,
            {
                resource_type: 'video',
            }
        );
        course.lectures.splice(lectureIndex, 1);
        course.numberOfLectures = course.lectures.length;
        await course.save();
        res.status(200).json({
            success: true,
            message: 'Course lecture removed successfully',
        });
    } catch (e) {
        return next(new AppError(e.message, 500))
    }

}
export { getAllCourses, getLecturesByCourseId, createCourse, updateCourse, removeCourse, addLectureToCourseById, removeLectureFromCourse };