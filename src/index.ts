// import express from 'express';
// import cors from 'cors';
// import TagRoute from './routes/TagRoute';
// import ProjectCategoryRoute from './routes/ProjectCategoryRoute';
// import SertificateRoute from './routes/CertificateRoute';
// import ProjectRoute from './routes/ProjectRoute';
// import ArticleRoute from './routes/ArticleRoute';
// import AuthenticatedSessionRoute from './routes/AuthenticatedSessionRoute';
// import NotFound from './middleware/404';
// import HandleError from './middleware/500';
// import path from 'path';

// const app = express();

// app.use(cors());
// app.use('/images', express.static(path.join(__dirname, '../public/images')));
// app.use(express.json());

// app.use('/api/v1', [
//   TagRoute,
//   ProjectCategoryRoute,
//   SertificateRoute,
//   ProjectRoute,
//   ArticleRoute,
//   AuthenticatedSessionRoute
// ]);

// app.use(NotFound);
// app.use(HandleError);

// app.listen(process.env.APP_PORT || 8080, () => {
//   console.log(`Server is running on port ${process.env.APP_PORT || 8080}`);
// });


import express from 'express';
import cors from 'cors';
import TagRoute from './routes/TagRoute';
import ProjectCategoryRoute from './routes/ProjectCategoryRoute';
import SertificateRoute from './routes/CertificateRoute';
import ProjectRoute from './routes/ProjectRoute';
import ArticleRoute from './routes/ArticleRoute';
import AuthenticatedSessionRoute from './routes/AuthenticatedSessionRoute';
import NotFound from './middleware/404';
import HandleError from './middleware/500';
import path from 'path';

const app = express();

// Daftar origin yang diizinkan
const allowedOrigins = ['http://localhost:3000', 'https://pradnyakuswara.vercel.app'];

// Konfigurasi CORS dengan origin dinamis
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow this origin
    } else {
      callback(new Error('Not allowed by CORS')); // Block other origins
    }
  }
};

// Gunakan CORS dengan konfigurasi ini
app.use(cors(corsOptions));

// Static files dan routes
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use(express.json());

app.use('/api/v1', [
  TagRoute,
  ProjectCategoryRoute,
  SertificateRoute,
  ProjectRoute,
  ArticleRoute,
  AuthenticatedSessionRoute
]);

app.use(NotFound);
app.use(HandleError);

// Menjalankan server
app.listen(process.env.APP_PORT || 8080, () => {
  console.log(`Server is running on port ${process.env.APP_PORT || 8080}`);
});
