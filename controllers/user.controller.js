import AppError from "../utils/error.util.js";

const register = (req, res,next) => {
    const {fullName, email, password} = req.body;

    if(!fullName || !email || !password){
        return next(new AppError('All fields are reqiured', 400));
    }
    




};
const login = (req, res) => {

}

const logout = (req, res) => {

}

const getProfile = (req, res) => {

}

export { register, login, logout, getProfile };