import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';

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
    forgetPasswordExpiry: Date
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.passsword, 10);
})

userSchema.methods = {
    generateJWTToken: async function () {
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
}

const User = model('User', userSchema);
export default User;