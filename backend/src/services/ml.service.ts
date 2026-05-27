import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

interface MLPrediction {
  suggested_area: string;
  priority: string;
}

export class MLService {
  /**
   * Envía el asunto del trámite al microservicio de Python para obtener la prioridad y el área recomendada.
   * @param subject El asunto del trámite
   * @returns Un objeto con la prioridad y el área sugerida, o valores por defecto en caso de error.
   */
  static async predictAreaAndPriority(subject: string): Promise<MLPrediction> {
    try {
      console.log(`[MLService] Solicitando predicción para el asunto: "${subject.substring(0, 50)}..."`);
      const response = await axios.post<MLPrediction>(`${ML_SERVICE_URL}/api/predict`, {
        subject: subject
      }, {
        timeout: 4000 // 4 segundos de timeout
      });

      console.log('[MLService] Respuesta recibida:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[MLService] Error conectando con el microservicio de IA/ML:', error.message);
      
      // Fallback seguro en caso de que el microservicio esté offline
      console.log('[MLService] Utilizando clasificación de respaldo (Fallback)...');
      
      // Lógica heurística de fallback simple
      let area = 'Mesa de Partes';
      let priority = 'Media';
      const text = subject.toLowerCase();

      if (text.includes('bache') || text.includes('pista') || text.includes('vereda') || text.includes('obra')) {
        area = 'Desarrollo Urbano';
      } else if (text.includes('ruido') || text.includes('discoteca') || text.includes('licencia de funcionamiento') || text.includes('comercial')) {
        area = 'Licencias y Fiscalización';
      } else if (text.includes('arbol') || text.includes('poda') || text.includes('basura') || text.includes('jardín')) {
        area = 'Medio Ambiente';
      } else if (text.includes('arbitrio') || text.includes('impuesto') || text.includes('tributaria') || text.includes('deuda')) {
        area = 'Rentas y Administración';
      } else if (text.includes('peligro') || text.includes('colapso') || text.includes('extintor') || text.includes('riesgo')) {
        area = 'Defensa Civil';
        priority = 'Alta';
      }

      if (text.includes('urgente') || text.includes('emergencia') || text.includes('peligro') || text.includes('colapso')) {
        priority = 'Alta';
      } else if (text.includes('consulta') || text.includes('información') || text.includes('estado de cuenta')) {
        priority = 'Baja';
      }

      return {
        suggested_area: area,
        priority: priority
      };
    }
  }
}
