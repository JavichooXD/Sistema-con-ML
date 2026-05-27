import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/document.routes';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors({
  origin: '*', // Permitir todas las conexiones para la demostración local
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Montar rutas
app.use('/api', apiRouter);

// Ruta de diagnóstico simple
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'SIGED-ML Backend Core' });
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Servidor Backend Core iniciado exitosamente.`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`=================================================`);
});
