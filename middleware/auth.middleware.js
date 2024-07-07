import AppError from "../utils/error.util.js";
import jwt from "jsonwebtoken";
const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new AppError('Authentication failed', 401));
    }

    const userDetails = jwt.verify(token, process.env.JWT_SECRET);
    req.user = userDetails;

    next();
}

export {isLoggedIn};