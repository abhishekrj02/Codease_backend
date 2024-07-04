import { app } from "./app.js";
import connectionToDB from "./config/dbConnection.js";

const PORT = process.env.PORT;

app.listen(PORT, async () => {
    await connectionToDB();
    console.log(`Server running at http://localhost:${PORT}`);
})