import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "./s3.js";

const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.AWS_BUCKET_NAME,
        key: (req, file, cb) => {
            cb(null, `uploads/${Date.now()}-${file.originalname}`);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE
    })
});

export default upload;
