import bcrypt from "bcryptjs";

const comparePassword = async function (plainTextPassword, password) {
    return await bcrypt.compare(plainTextPassword, password);
};

console.log(await comparePassword("123456789","$2a$10$fH0eHaItT.KsaOinQa59Be4Vh7dFzW0/Yzq4QMTnw1X1c8VgEz9q."))