// models/Passenger.ts
import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema(
    {
        empid: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        mobile: {
            type: String,
            required: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        endlocation: {
            type: String,
            required: true,
            trim: true,
        },
        duration: {
            type: String,
            required: true,
            trim: true,
        },
        fee: {
            type: Number,
            required: true,
            trim: true,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "department",
            required: false,
        },
    },
    {
        timestamps: true,
        strictPopulate: false // ✅ Add this option
    }
);

// ✅ Properly handle model caching in Next.js
export const Passenger =
    mongoose.models.Passenger || mongoose.model("Passenger", passengerSchema);