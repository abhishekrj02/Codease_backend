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
const authorizedRoles = (...roles) => async (req, res, next) => {
    const currentUserRoles = req.user.role;
    if (!roles.includes(currentUserRoles)) {
        return next(new AppError('You dont have permission to access this route', 400))
    }
    next();
}

const authorizeSubscriber = async () => {
    const subscription = req.user.subscription;
    const currentUserRoles = req.user.role;
    if(currentUserRoles !== 'ADMIN' && subscription.status !=='active'){
        return next(new AppError('Please subscribe to access this route',400))
    }
 }
export { isLoggedIn, authorizedRoles, authorizeSubscriber };