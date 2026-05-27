import { Request, Response } from 'express';
import prisma from '../db';
import { MLService } from '../services/ml.service';

// Helper to map priority to numeric weight for sorting
const priorityWeight: Record<string, number> = {
  'Alta': 1,
  'Media': 2,
  'Baja': 3
};

export class DocumentController {
  
  // POST /documents
  static async createDocument(req: Request, res: Response) {
    try {
      const { subject, citizenId, citizenName, citizenEmail } = req.body;

      if (!subject || !citizenId || !citizenName || !citizenEmail) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios (subject, citizenId, citizenName, citizenEmail)' });
      }

      // 1. Obtener predicción de IA (Area y Prioridad)
      const mlPrediction = await MLService.predictAreaAndPriority(subject);

      // 2. Buscar o crear la Área según la respuesta de la IA
      let targetArea = await prisma.area.findFirst({
        where: {
          name: {
            equals: mlPrediction.suggested_area,
            mode: 'insensitive' // Búsqueda insensible a mayúsculas/minúsculas
          }
        }
      });

      // Si no existe el área (ej. fallback o nueva categoría), la creamos
      if (!targetArea) {
        targetArea = await prisma.area.create({
          data: {
            name: mlPrediction.suggested_area,
            description: `Área autogenerada para clasificaciones de: ${mlPrediction.suggested_area}`
          }
        });
      }

      // 3. Registrar el documento con los datos del ciudadano y clasificación de IA
      const document = await prisma.document.create({
        data: {
          subject,
          citizenId,
          citizenName,
          citizenEmail,
          status: 'PENDIENTE',
          mlPriority: mlPrediction.priority,
          areaId: targetArea.id
        },
        include: {
          area: true
        }
      });

      // 4. Generar alerta/notificación inicial
      const notificationMessage = `Nuevo trámite #${document.id.substring(0, 8)} registrado. La IA clasificó este documento en el área de '${targetArea.name}' con prioridad '${document.mlPriority}'.`;
      await prisma.notification.create({
        data: {
          documentId: document.id,
          message: notificationMessage
        }
      });

      return res.status(201).json({
        message: 'Trámite registrado y clasificado exitosamente',
        document
      });

    } catch (error: any) {
      console.error('Error al registrar documento:', error);
      return res.status(500).json({ error: 'Error interno del servidor al procesar el trámite' });
    }
  }

  // GET /documents
  static async getDocuments(req: Request, res: Response) {
    try {
      const documents = await prisma.document.findMany({
        include: {
          area: true
        }
      });

      // Ordenar por prioridad (Alta -> Media -> Baja) y luego por fecha (más reciente primero)
      const sortedDocuments = documents.sort((a, b) => {
        const weightA = priorityWeight[a.mlPriority] || 99;
        const weightB = priorityWeight[b.mlPriority] || 99;
        
        if (weightA !== weightB) {
          return weightA - weightB;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return res.status(200).json(sortedDocuments);
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // PUT /documents/:id/status
  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'RECHAZADO'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Estado no válido. Debe ser uno de: ' + validStatuses.join(', ') });
      }

      // Verificar si el documento existe
      const existingDoc = await prisma.document.findUnique({
        where: { id }
      });

      if (!existingDoc) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }

      // Actualizar el estado
      const updatedDoc = await prisma.document.update({
        where: { id },
        data: { status },
        include: { area: true }
      });

      // Crear alerta de cambio de estado
      let emoji = 'ℹ️';
      if (status === 'EN_PROCESO') emoji = '⚙️';
      if (status === 'RESUELTO') emoji = '✅';
      if (status === 'RECHAZADO') emoji = '❌';

      const alertMessage = `${emoji} El trámite #${id.substring(0, 8)} ("${existingDoc.subject.substring(0, 30)}...") ha cambiado su estado de '${existingDoc.status}' a '${status}'.`;
      
      await prisma.notification.create({
        data: {
          documentId: id,
          message: alertMessage
        }
      });

      return res.status(200).json({
        message: 'Estado del documento actualizado',
        document: updatedDoc
      });

    } catch (error) {
      console.error('Error al actualizar estado de documento:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // GET /notifications
  static async getNotifications(req: Request, res: Response) {
    try {
      const notifications = await prisma.notification.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          document: true
        },
        take: 30 // Últimas 30 alertas
      });

      return res.status(200).json(notifications);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // POST /notifications/read
  static async markAllAsRead(req: Request, res: Response) {
    try {
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true }
      });
      return res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
      console.error('Error al marcar notificaciones:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // GET /stats
  static async getStats(req: Request, res: Response) {
    try {
      const total = await prisma.document.count();
      const pending = await prisma.document.count({ where: { status: 'PENDIENTE' } });
      const inProcess = await prisma.document.count({ where: { status: 'EN_PROCESO' } });
      const resolved = await prisma.document.count({ where: { status: 'RESUELTO' } });
      const rejected = await prisma.document.count({ where: { status: 'RECHAZADO' } });

      const highPriority = await prisma.document.count({ where: { mlPriority: 'Alta' } });
      const mediumPriority = await prisma.document.count({ where: { mlPriority: 'Media' } });
      const lowPriority = await prisma.document.count({ where: { mlPriority: 'Baja' } });

      // Agrupación por Área
      const areasWithDocCounts = await prisma.area.findMany({
        include: {
          _count: {
            select: { documents: true }
          }
        }
      });

      const areaStats = areasWithDocCounts.map(area => ({
        areaName: area.name,
        count: area._count.documents
      }));

      return res.status(200).json({
        total,
        statusCounts: {
          PENDIENTE: pending,
          EN_PROCESO: inProcess,
          RESUELTO: resolved,
          RECHAZADO: rejected
        },
        priorityCounts: {
          Alta: highPriority,
          Media: mediumPriority,
          Baja: lowPriority
        },
        areaStats
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}
