
// import multer from 'multer';
// import fs from 'fs';
// import path from 'path';
// import sharp from 'sharp';

// const storage = multer.memoryStorage();

// const fileStorage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     const urlPath = _req.originalUrl.split('/')[3];
//     const folder = path.join('public/images', urlPath);

//     if (!fs.existsSync(folder)) {
//       fs.mkdirSync(folder, { recursive: true });
//     }
//     cb(null, folder);
//   },
//   filename: (_req, _file, cb: any) => {
//     cb(null, `${Date.now()}`);
//   }
// });

// const fileFilter = (_req: any, file: any, cb: any) => {
//   if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// }

// export const upload = multer({ storage: fileStorage, fileFilter: fileFilter }).single('image');

import multer from 'multer';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: any, cb: any) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Membatasi ukuran file menjadi maksimal 1 MB
import { RequestHandler } from 'express';

export const upload: RequestHandler = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 } // 1 MB
}).single('image');

export const compressImage = async (req: any, _res: any, next: any) => {
  if (!req.file) {
    return next();
  }

  try {
    const urlPath = req.originalUrl.split('/')[3];
    const folder = path.join('public/images', urlPath);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const filename = `${Date.now()}${path.extname(req.file.originalname)}`;
    const outputPath = path.join(folder, filename);

    await sharp(req.file.buffer)
      .png({ quality: 80 })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    req.file.path = outputPath;

    next();
  } catch (error) {
    next(error);
  }
};
