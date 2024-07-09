import { Router } from "express";
import { getRazorpayApiKey, buySubscription, verfiySubcription, cancelSubscription, allPayment } from "../controllers/payment.controller.js";
import { authorizedRoles, isLoggedIn } from "../middleware/auth.middleware.js";
const router = Router();

router
    .route('/razorpay-key')
    .get(
        isLoggedIn,
        getRazorpayApiKey
    );

router
    .route('/subscription')
    .post(
        isLoggedIn,
        buySubscription)

router
    .route('/verify')
    .post(
        isLoggedIn,
        verfiySubcription
    )
router
    .route('/unSubscribe')
    .post(
        isLoggedIn,
        cancelSubscription
    )
router
    .route('/')
    .get(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        allPayment
    )

export default router;