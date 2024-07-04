import User from "../model/user.model.js";
import AppError from "../utils/error.util.js";

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 1000,
    httpOnly: true,
    secure: true
}

const register = async (req, res, next) => {
    try {
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

        if (!user) {
            return next(new AppError('Registration failed', 500));

        }

        // TODO FILE UPLOAD
        await user.save();

        user.password = undefined;
        const token = await user.generateJWTToken();
        res.cookie('token', token, cookieOptions);

        res.status(201).json({
            success: true,
            message: 'User registered',
            user,
        })
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError('All fields required', 400));
        }
        const user = await User.findOne({
            email
        }).select('+password');


        if (!user || !user.comparePassword(password)) {
            return next(new AppError('Email and Password doesnt match', 400));
        }

        const token = await user.generateJWTToken();
        user.password = undefined;
        res.cookie('token', token, cookieOptions);
        res.status(200).json({
            success: true,
            message: "Logged in...",
            user
        })
    } catch (e) {
        return next(new AppError(e.message, 500));
    }


}

const logout = (req, res, next) => {
    res.cookie('token', null, {
        secure: true,
        maxAge: 0,
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    });
}

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        res.status(200).json({
            success: true,
            message: 'User details',
            user
        });

    } catch (e) {
        return next(new AppError('Failed to fetch', 400))

    }


}

export { register, login, logout, getProfile };
