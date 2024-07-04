import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import morgan from "morgan";
import userRouter from "./routes/user.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";


config();
export const app = express();

app.use(express.json());
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/ping', function (req, res) {
    res.send("/pong");
});

app.use('/api/v1/user', userRouter)




app.all('*', (req, res) => {
    res.status(404).send('Page not found');
})

app.use(errorMiddleware);