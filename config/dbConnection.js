import mongoose, { connect } from "mongoose";

mongoose.set('strictQuery', false);

const connectionToDB = async () => {
    try {
        const connection = await mongoose.connect(
            process.env.MONGO_URI || 'mongodb://localhost:27017/'
        );
        if (connection) {
            console.log(`Connected to database: ${mongoose.connection.host}`)
        }
    }catch(e){
        console.log(e);
        process.exit(1);
    }
}

export default connectionToDB;