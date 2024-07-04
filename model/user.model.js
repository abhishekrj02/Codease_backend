import { Schema, model } from "mongoose";

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
        minLength: [8,'Too short'],
        select: false
    },
    avatar:{
        public_id:{
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
},{
    timestamps: true
}

    

);

const User = model('User', userSchema);

export default User;