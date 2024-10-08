import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import morgan from "morgan";
import userRouter from "./routes/user.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
import courseRouter from "./routes/course.routes.js";
import paymentRouter from "./routes/payment.routes.js";

config();
export const app = express();
console.log(process.env.FRONTEND_URL)
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));

app.use(cookieParser());
app.use(morgan('dev'));


app.use('/api/v1/user', userRouter)
app.use('/api/v1/courses', courseRouter)
app.use('/api/v1/payment', paymentRouter)
app.use('/ping', function (req, res) {
    res.send("Pong");
});

app.use(errorMiddleware);
app.all('*', (req, res) => {
    res.status(404).send('Page not found');
})
