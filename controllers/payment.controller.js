import User from "../model/user.model.js";
import AppError from "../utils/error.util.js";
import { razorpay } from "../server.js";
import crypto from 'crypto';
import Payment from "../model/payment.model.js";

const getRazorpayApiKey = async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'Razorpay API key',
        key: process.env.RAZORPAY_KEY_ID
    });
}

const buySubscription = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);

        if (!user) {
            return next(new AppError('Unauthorized, please login', 400))

        }

        if (user.role === 'ADMIN') {
            return next(new AppError('Admin cannot purchase a subscription', 400))
        }

        const subscription = razorpay.subscriptions.create({
            plan_id: process.env.RAZORPAY_PLAN_ID,
            customer_notify: 1
        })
        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Subscribed Successfully',
            subscription_id: subscription.id

        });
    }
    catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const verfiySubcription = async (req, res, next) => {

    try {
        const { id } = req.user;
        const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body;
        const user = await User.findById(id);

        if (!user) {
            return next(new AppError('Unauthorized, please login', 400))

        }

        const subscriptionId = user.subscription.id;
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${subscriptionId}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return next(new AppError('Payment not verified, please try again', 500))
        }

        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id
        })

        user.subscription.status = 'active';
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Payment verfied'
        })
    }
    catch (e) {
        return next(new AppError(e.message, 500))
    }
}

const cancelSubscription = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);

        if (!user) {
            return next(new AppError('Unauthorized, please login', 400))
        }

        if (user.role === 'ADMIN') {
            return next(new AppError('Admin cannot purchase a subscription', 400))
        }

        const subscriptionId = user.subscription.id;
        const subscription = razorpay.subscriptions.cancel(
            subscriptionId
        )

        user.subscription.status = subscription;

        await user.save();
        res.status(200).json({
            success: true,
            message: 'Successful'
        })
    } catch (e) {
        return next(new AppError(e.message, 500))

    }
}

const allPayment = async (req, res, next) => {
    try {
        const {count} = req.query;
        const subcriptions = await razorpay.subscriptions.all({
            count: count || 10,
        });
        // const payments = await Payment.find({}) 
        res.status(200).json({
            success: true,
            message: 'All payments',
            subscriptions
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

export { getRazorpayApiKey, buySubscription, cancelSubscription, allPayment, verfiySubcription };
