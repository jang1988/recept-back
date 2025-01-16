import express from 'express';
import multer from 'multer';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import { registerValidation, loginValidation, postCreateValidation } from './validations.js';
import { handleValidationErrors, checkAuth } from './utils/index.js';
import { UserController, PostController, CommentsController } from './controllers/index.js';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: 'dymoj2isc',
  api_key: '422438632426866',
  api_secret: 'uZICZvKjdVtLVi7-fSVx7Mk6jQQ',
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json());
app.use(cors());

// Authentication routes
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

// Image upload to Cloudinary
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'uploads' },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Upload to Cloudinary failed', error });
      }

      res.json({ url: result.secure_url });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

app.post('/upavatar', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'uploads' },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Upload to Cloudinary failed', error });
      }

      res.json({ url: result.secure_url });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

// Posts and tags routes
app.get('/tags', PostController.getAllTags);
app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);
// Получение всех комментариев для поста
app.get('/posts/:id/comments', CommentsController.getAllByPost);
// Создание комментария
app.post('/comments', checkAuth, CommentsController.create);

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log('Server OK');
});
