# SIGED-ML 🏛️🤖
### Sistema Inteligente de Gestión Documental y Priorización de Trámites

**SIGED-ML** es una plataforma integral de software diseñada para modernizar y digitalizar la mesa de partes y el procesamiento de documentos administrativos en una entidad municipal, empleando técnicas de **Machine Learning (ML)** y **Procesamiento de Lenguaje Natural (NLP)**.

Este sistema implementa una arquitectura desacoplada de microservicios orientada a ejecución local con persistencia y alertas en la nube mediante **Supabase (PostgreSQL)**, brindando automatización, optimización de tiempos y trazabilidad de los trámites.

---

## 📋 1. Caso de Estudio y Propósito

El sistema resuelve las ineficiencias típicas del procesamiento documental tradicional en entidades públicas locales (tales como la saturación de canales presenciales, errores en la derivación manual de expedientes, falta de trazabilidad y ausencia de datos estructurados para evaluar la congestión).

### Funcionalidades Core:
*   **Derivación Inteligente (NLP)**: Clasificación de texto automática que mapea el asunto del trámite a la oficina competente.
*   **Priorización de Criticidad (IA)**: Clasificador predictivo que identifica la urgencia (Alta, Media, Baja) de la solicitud según el análisis de riesgos léxicos, priorizando los expedientes críticos en la cola de atención del funcionario.
*   **Alertas en Tiempo Real**: Notificación al ciudadano e historial de auditoría de cada cambio de estado del trámite en la nube.

---

## 🏗️ 2. Arquitectura de Microservicios

El monorepo se organiza de la siguiente manera:

```
/SIGED-ML
  ├── /frontend      --> Portal SPA en Next.js 15 (React, TypeScript, Tailwind CSS)
  ├── /backend       --> API Gateway & Middleware en Node.js (Express, Prisma ORM)
  └── /ml_service    --> Motor de Inteligencia Artificial en Python (FastAPI, Joblib)
```

---

## 🛡️ 3. Seguridad y Privacidad de Datos

El sistema maneja información de identidad ciudadana (DNI, nombres, correos electrónicos). La seguridad del flujo de datos se garantiza mediante:
1.  **Cifrado de Comunicaciones**: Conexiones de base de datos a Supabase transmitidas con cifrado SSL/TLS.
2.  **Exclusión de Secretos**: Los archivos de configuración local `.env` que contienen variables sensibles de base de datos están explícitamente ignorados mediante `.gitignore` para evitar su publicación en repositorios remotos.

---

## 🚀 4. Guía de Instalación y Despliegue Local

Siga los siguientes pasos para levantar los servicios locales en tres terminales independientes:

### 💻 TERMINAL 1: Servicio de IA (Python)

1. Ingrese a la carpeta del microservicio:
   ```bash
   cd ml_service
   ```
2. Configure el entorno virtual e instale dependencias:
   ```bash
   # Crear entorno virtual
   python -m venv venv
   
   # Activar en Windows PowerShell (¡OBLIGATORIO para reconocer comandos como uvicorn!)
   .\venv\Scripts\Activate.ps1
   
   # Instalar dependencias
   pip install -r requirements.txt
   ```
   *Nota: Si PowerShell te da error al activar el script por restricciones de políticas de ejecución de Windows, puedes omitir la activación y correr todo directamente indicando la ruta del entorno virtual como se detalla abajo.*

3. Genere el dataset municipal y entrene los clasificadores:
   ```bash
   # Generar dataset sintético (500 registros)
   .\venv\Scripts\python generate_mock_data.py
   
   # Entrenar y exportar modelos .pkl
   .\venv\Scripts\python train_models.py
   ```
4. Inicie la API de FastAPI:
   ```bash
   # Opción A (Si pudiste activar el venv en el paso 2):
   uvicorn main:app --reload --port 8000
   
   # Opción B (Comando directo - recomendado si no activaste el venv o sale error):
   .\venv\Scripts\python -m uvicorn main:app --reload --port 8000
   ```
   *Servidor de IA escuchando en `http://127.0.0.1:8000`.*

---

### 💻 TERMINAL 2: Servidor Backend Core (Node.js)

1. Ingrese a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instale dependencias:
   ```bash
   npm install
   ```
3. Sincronice el esquema Prisma con su base de datos de Supabase y pueble los datos iniciales (Seed):
   ```bash
   # Sincronizar esquemas
   npx prisma migrate dev --name init
   
   # Sembrar áreas iniciales
   npm run db:seed
   ```
4. Inicie el servidor Express en modo desarrollo:
   ```bash
   npm run dev
   ```
   *Servidor API escuchando en `http://localhost:4000`.*

---

### 💻 TERMINAL 3: Dashboard Web (Next.js)

1. Ingrese a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instale dependencias:
   ```bash
   npm install
   ```
3. Inicie el servidor de desarrollo de Next.js:
   ```bash
   npm run dev
   ```
   *Frontend disponible en `http://localhost:3000`.*

---

## 🎯 5. Guía de Pruebas Funcionales

Para verificar el flujo de extremo a extremo del sistema:

1.  Abra su navegador en `http://localhost:3000`.
2.  **Registro de Solicitud (Vista Mesa de Partes)**: Complete el formulario de solicitud ciudadana.
    - *Ejemplo de Trámite Crítico (Prioridad Alta):* `"Pared agrietada de casona antigua con riesgo inminente de colapso en el jirón Bolognesi"` (Mapea al área de *Defensa Civil* con prioridad *Alta*).
    - *Ejemplo de Trámite General (Prioridad Baja):* `"Solicito copia de mi estado de cuenta y requisitos para el fraccionamiento de mi predio"` (Mapea al área de *Rentas y Administración* con prioridad *Baja*).
3.  **Visualización en Modal**: Tras el envío, una alerta emergente detalla en vivo las predicciones de Área y Prioridad asignadas por la IA.
4.  **Bandeja de Gestión (Vista de Funcionario)**: Ingrese al panel administrativo para verificar los KPIs globales, el gráfico de demanda por áreas y la tabla ordenada por prioridad de urgencia. Pruebe a cambiar el estado del trámite a *"Procesar"* y *"Resolver"*, y verifique que se generen las notificaciones correspondientes en tiempo real en la barra lateral derecha.
