import { sequelize } from "./configDB.js";
import relaciones from "../models/relaciones.js";


export const connectDB = async () => {
    relaciones();
    try {
        await sequelize.sync({alter: true});
        console.log("Connected to the database");

    } catch (err) {
        console.log("Unable to connect to the database", err);
    }
};
