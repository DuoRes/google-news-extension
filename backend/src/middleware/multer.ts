import aws from "aws-sdk";
import multer from "multer";
import path from "path";

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: "us-west-1",
});

const s3 = new aws.S3();

// Temporary local storage for multer
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./temp/uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Multer configuration for temporary local storage
export const uploadImages = multer({ storage: tempStorage });
