import mongoose from "mongoose";
const newsSchema = new mongoose.Schema(
    {
        tieude: {
            type: String,
        },
        noidung: {
            type: String,
        },
         image: Array,
        trang_thai: {
            type: String
        },
    },
    { timestamps: { currentTime: () => Date.now() + 7 * 60 * 60 * 1000 }, versionKey: false }
);

export default mongoose.model("news", newsSchema);
