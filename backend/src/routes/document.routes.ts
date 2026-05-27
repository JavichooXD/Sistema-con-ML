import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';

const router = Router();

// Rutas de trámites (Documentos)
router.post('/documents', DocumentController.createDocument);
router.get('/documents', DocumentController.getDocuments);
router.put('/documents/:id/status', DocumentController.updateStatus);

// Rutas de notificaciones/alertas
router.get('/notifications', DocumentController.getNotifications);
router.post('/notifications/read', DocumentController.markAllAsRead);

// Rutas de estadísticas
router.get('/stats', DocumentController.getStats);

export default router;
