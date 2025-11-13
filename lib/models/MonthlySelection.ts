import mongoose from "mongoose"

const monthlySelectionSchema = new mongoose.Schema(
    {
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
        },
        year: {
            type: Number,
            required: true,
        },
        passengerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Passenger",
            required: true,
        },
        selected: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
)

// Create compound index for month, year, and passengerId
monthlySelectionSchema.index({ month: 1, year: 1, passengerId: 1 }, { unique: true })

export const MonthlySelection =
    mongoose.models.MonthlySelection || mongoose.model("MonthlySelection", monthlySelectionSchema)
