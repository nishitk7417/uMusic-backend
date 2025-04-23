import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");  // Temporary storage folder
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);  // Use the original name of the file
    }
});

export const upload = multer({ storage });
