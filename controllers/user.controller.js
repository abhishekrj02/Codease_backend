import User from "../model/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs";
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto';
const cookieOptions = {
    maxAge: 7 * 24 * 60 * 1000,
    httpOnly: true,
    secure: true
}

const register = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return next(new AppError('All fields are required', 400));
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return next(new AppError('Email already exists', 400));
        }

        let avatar = {
            public_id: '',
            secure_url: ''
        };

        // Attempt to upload the file if it exists
        if (req.file) {
            console.log(req.file)
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms',
                    width: 250,
                    height: 250,
                    gravity: 'faces',
                    crop: 'fill'
                });

                avatar.public_id = result.public_id;
                avatar.secure_url = result.secure_url;

                fs.rm(`uploads/${req.file.filename}`, (err) => {
                    if (err) {
                        console.error(`Error removing file: ${err}`);
                    } else {
                        console.log('File removed successfully');
                    }
                });
            } catch (error) {
                return next(new AppError(error.message || 'File not uploaded', 500));
            }
        }

        // Create the user after the file upload is successful
        const user = await User.create({
            fullName,
            email,
            password,
            avatar
        });

        if (!user) {
            return next(new AppError('Registration failed', 500));
        }

        await user.save();

        user.password = undefined;
        const token = await user.generateJWTToken();
        res.cookie('token', token, cookieOptions);

        res.status(201).json({
            success: true,
            message: 'User registered',
            user,
        });
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
        if (!user) {
            return next(new AppError("Email doesn't exists", 400));
        }

        if (!await user.comparePassword(password)) {
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

const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new AppError('Email is required', 400));
    }
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('Email is not registered', 400));
    }

    const resetToken = await user.generatePasswordResetToken();
    await user.save();
    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = 'RESET PASSWORD';
    const message = `
  <p>You reset your password by clicking on this: <a href="${resetPasswordURL}" target="_blank">RESET</a></p>
  <p>In case it doesn't work click here: <a href="${resetPasswordURL}" target="_blank">${resetPasswordURL}</a></p>
`;
    try {
        await sendEmail(email, subject, message);
        res.status(200).json({
            success: true,
            mmessage: `Reset Password token has been sent to ${email} successfully`
        })
    } catch (e) {
        user.forgetPasswordExpiry = undefined;
        user.forgetPasswordToken = undefined;
        await user.save();
        return next(new AppError(e.message, 500))
    }

}

const resetPassword = async (req, res, next) => {
    try {
        const { resetToken } = req.params;
        const { password } = req.body;
        const forgetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        const user = await User.findOne({
            forgetPasswordToken
        });
        if (!user) {
            return next(
                new AppError('Token invalid or expired', 400)
            )
        }
        user.password = password;
        user.forgetPasswordToken = undefined;
        user.forgetPasswordExpiry = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully..."
        })

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
}

export { register, login, logout, getProfile, forgotPassword, resetPassword };
