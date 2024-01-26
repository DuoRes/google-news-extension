import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import { Duplex, TransformCallback } from "stream";

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: "us-west-1",
});

const s3 = new aws.S3();

export const uploadImages = multer({
  storage: multerS3({
    s3: s3 as any,
    bucket: "duo-research-storage",
    key: function (req, file, cb) {
      cb(null, `screenshots/${Date.now().toString()}-${file.originalname}`); // use the unique user id instead
    },
  }),
});
