import User from "../model/user.model.js";
import AppError from "../utils/error.util.js";


const register = async (req, res, next) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return next(new AppError('All fields are reqiured', 400));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new AppError('Email already exists', 400));

    }

    const user = await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url: 'www.google.jpg'
        }
    });

    if(!user) {
        return next(new AppError('Registration failed', 500));

    }

    // TODO FILE UPLOAD
    await user.save();

    user.password = undefined;
    const token = await user.generateJWTToken();

    res.status(201).json({
        success: true,
        message: 'User registered',
        user,
    })






};
const login = (req, res) => {

}

const logout = (req, res) => {

}

const getProfile = (req, res) => {

}

export { register, login, logout, getProfile };