import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    fullName: {
        type: 'String',
        required: [true, 'Name is reqiured'],
        minLength: [5, 'Name should atleast be 5 chars'],
        maxLength: [50, 'Name is too long'],
        lowercase: true,
        trim: true,
    },
    email: {
        type: 'String',
        required: [true, 'Name is reqiured'],
        lowercase: true,
        trim: true,
        unique: true,
        match:
            [/[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}/,
                'Please fill a valid email address']

    },
    password: {
        type: 'String',
        required: [true, 'Password is required'],
        minLength: [8, 'Too short'],
        select: false
    },
    avatar: {
        public_id: {
            type: 'String'
        },
        secure_url: {
            type: 'String'
        }
    },
    role: {
        type: 'String',
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    forgetPasswordToken: String,
    forgetPasswordExpiry: Date,
    subscription: {
        id: String,
        status: String
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})
userSchema.methods.comparePassword = async function (plainTextPassword) {
    return await bcrypt.compare(plainTextPassword, this.password);
};


userSchema.methods.generateJWTToken = async function () {
    return await jwt.sign(
        {
            id: this._id,
            email: this.email,
            subscription: this.subscription,
            role: this.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRY,
        }
    )
}

userSchema.methods.generatePasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.forgetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
    this.forgetPasswordExpiry = Date.now() + 15 * 60 * 1000; //15minutes
    return resetToken;


}



const User = model('User', userSchema);
export default User;