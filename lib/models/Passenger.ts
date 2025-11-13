import mongoose from "mongoose";

// ✅ Ensure Department model is loaded BEFORE Passenger model
import { Department } from "./Department";

const passengerSchema = new mongoose.Schema(
    {
        empid: { type: String, required: true, unique: true, trim: true },
        mobile: { type: String, required: true, trim: true },
        name: { type: String, required: true, trim: true },
        endlocation: { type: String, required: true, trim: true },
        duration: { type: String, required: true, trim: true },
        fee: { type: Number, required: true, trim: true },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department", // ✅ Must match Department model name
            required: false,
        },
    },
    {
        timestamps: true,
        strictPopulate: false,
    }
);

export const Passenger =
    mongoose.models.Passenger || mongoose.model("Passenger", passengerSchema);
