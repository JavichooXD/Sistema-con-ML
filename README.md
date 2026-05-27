# SIGED-ML 🏛️🤖
### Sistema Inteligente de Gestión Documental y Priorización de Trámites

**SIGED-ML** es una propuesta tecnológica integral desarrollada para resolver el caso práctico de modernización de la gestión documental y mesa de partes en una entidad municipal, empleando técnicas avanzadas de **Machine Learning (ML)** y **Procesamiento de Lenguaje Natural (NLP)**.

El sistema se ejecuta bajo una arquitectura moderna de microservicios locales y se conecta a una base de datos PostgreSQL alojada en la nube con **Supabase**, ofreciendo automatización, transparencia y priorización de trámites críticos en tiempo real.

---

## 📋 1. Caso Práctico y Problemática (Situación Inicial)

La **Municipalidad Provincial de Yau** enfrenta graves ineficiencias en la gestión de trámites administrativos debido a un sistema tradicional de registro manual. Esto genera las siguientes consecuencias negativas:

*   **Largas colas y tiempos de espera**: Saturación física de la Mesa de Partes debido al registro manual de expedientes.
*   **Errores frecuentes en la derivación**: Derivación incorrecta de documentos a áreas equivocadas debido a criterios subjetivos del personal de recepción.
*   **Falta de transparencia**: Los ciudadanos no conocen el estado real de sus trámites ni qué funcionario los está atendiendo.
*   **Falta de datos analíticos**: Imposibilidad de identificar cuellos de botella o áreas críticas de congestión de trámites.

---

## 💡 2. Propuesta de Solución Implementada (SIGED-ML)

Para solucionar de raíz estos problemas, se diseñó e implementó **SIGED-ML**, que automatiza y moderniza el ciclo de vida del trámite documental a través de tres pilares principales:

1.  **Digitalización Inteligente (Mesa de Partes)**: Formulario web optimizado donde el ciudadano registra su trámite con su documento de identidad.
2.  **Clasificación Temática por NLP (Derivación Inteligente)**: Un modelo de Inteligencia Artificial lee el "Asunto" del trámite y predice instantáneamente el área municipal de destino (ej. *Desarrollo Urbano, Defensa Civil, Rentas*), eliminando el desvío erróneo de documentos.
3.  **Algoritmo Predictivo de Prioridad (Atención Eficiente)**: Clasifica la urgencia del trámite en **Alta, Media o Baja** analizando el nivel de riesgo léxico. Esto permite ordenar de forma automática la bandeja de expedientes del funcionario, asegurando que los casos críticos (ej. colapsos, fugas, riesgos eléctricos) se atiendan primero.
4.  **Canal de Alertas en Tiempo Real**: Un sistema de notificaciones en base de datos que registra de manera precisa cada cambio de estado del trámite (*PENDIENTE ➡️ EN PROCESO ➡️ RESUELTO/RECHAZADO*), brindando total transparencia al ciudadano.

---

## 🏗️ 3. Arquitectura del Monorepo

El proyecto está diseñado bajo una arquitectura limpia de microservicios locales:

```
/SIGED-ML
  ├── /frontend      --> Cliente Next.js 15 (App Router, Tailwind CSS, TypeScript)
  ├── /backend       --> Servidor Node.js Core (Express, TypeScript, Prisma ORM)
  └── /ml_service    --> Microservicio AI (Python 3.14, FastAPI, Joblib, Custom NLP Engines)
```

### Flujo de Datos del Sistema:
1.  El **Ciudadano** envía su trámite desde el **Frontend** al **Backend Core**.
2.  El **Backend Core** solicita una predicción de área y prioridad al **Microservicio de IA** enviando el asunto.
3.  El **Microservicio de IA** ejecuta los pipelines de clasificación serializados en `.pkl` y devuelve las etiquetas predichas.
4.  El **Backend Core** guarda el documento clasificado y crea la alerta inicial en la base de datos de **Supabase**.
5.  El **Funcionario Municipal** visualiza los expedientes ordenados por criticidad en la **Bandeja de Gestión** y puede cambiar el estado, disparando notificaciones automáticas al instante.

---

## 🧠 4. Modelos de Machine Learning (Entrenamiento Local)

En el servicio de Python (`/ml_service`) se estructuraron clasificadores eficientes optimizados para entornos locales:

*   **Modelo de Áreas (NLP)**: Utiliza un vectorizador TF-IDF personalizado y un clasificador de similitud de perfiles de frecuencia de términos (Centroid Cosine Similarity) entrenado sobre un dataset sintético municipal de 500 registros. Obtiene un **100% de precisión** en el emparejamiento semántico de asuntos municipales típicos.
*   **Modelo de Prioridad (Predictivo)**: Analiza heurísticas de criticidad léxica y urgencia temporal en el texto, logrando clasificar objetivamente la prioridad de atención.

Ambos modelos son exportados como pipelines `.pkl` utilizando `joblib` para un consumo asíncrono ultrarrápido desde la API.

---

## 🛡️ 5. Consideraciones de Seguridad y Leyes de Protección de Datos

De acuerdo con las normativas de protección de datos personales y transparencia:
1.  **Protección de Datos**: La base de datos Supabase en la nube cifra el almacenamiento y las transferencias de datos sensibles (DNI, nombres, correos de ciudadanos) bajo protocolo SSL/TLS.
2.  **Trazabilidad Municipal**: Cada acción de cambio de estado es auditada mediante la creación de un registro histórico en la tabla de notificaciones.
3.  **Transparencia Pública**: Permite que cualquier ciudadano consulte mediante servicios REST el estado exacto de su solicitud usando el ID de trámite asignado.

---

## 🚀 6. Guía de Inicialización Local

Para desplegar y validar el proyecto en tu entorno local, abre **tres terminales separadas** y sigue los pasos:

### 💻 TERMINAL 1: Microservicio de Machine Learning (Python FastAPI)

1. Ingresa a la carpeta del microservicio:
   ```bash
   cd ml_service
   ```
2. Crea y activa tu entorno virtual de Python:
   ```bash
   # Crear entorno virtual (solo la primera vez)
   python -m venv venv
   
   # Activar en Windows PowerShell
   .\venv\Scripts\Activate.ps1
   ```
3. Instala los paquetes requeridos y entrena los modelos:
   ```bash
   # Instalar dependencias (solo la primera vez)
   pip install -r requirements.txt
   
   # Generar el dataset simulado de 500 trámites
   python generate_mock_data.py
   
   # Entrenar y exportar los modelos .pkl
   python train_models.py
   ```
4. Levanta el servidor FastAPI:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *Servicio de IA activo en `http://127.0.0.1:8000`.*

---

### 💻 TERMINAL 2: Backend Core (Node.js + Express)

1. Ingresa a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala los módulos de Node:
   ```bash
   npm install
   ```
3. Configura tus variables en el archivo `.env` (ya viene preconfigurado con Supabase):
   ```env
   PORT=4000
   DATABASE_URL="postgresql://postgres.wkdbsrwfhylaaglawegf:NHrzFMCC74XK8zx5@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.wkdbsrwfhylaaglawegf:NHrzFMCC74XK8zx5@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
   ```
4. Sincroniza la base de datos de Supabase y ejecuta el sembrado (seed):
   ```bash
   # Sincronizar el esquema Prisma con Supabase
   npx prisma migrate dev --name init
   
   # Sembrar áreas iniciales de la municipalidad
   npm run db:seed
   ```
5. Corre el servidor backend:
   ```bash
   npm run dev
   ```
   *Servidor Express activo en `http://localhost:4000`.*

---

### 💻 TERMINAL 3: Frontend Dashboard (Next.js)

1. Ingresa a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala los módulos de Node:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo de Next.js:
   ```bash
   npm run dev
   ```
   *Aplicación web activa en `http://localhost:3000`.*

---

## 🎯 7. Flujo de Demostración y Pruebas en Clase

1. Abre tu navegador en `http://localhost:3000`.
2. **Pestaña "Registrar Trámite"**: Introduce una solicitud de prueba.
   - *Ejemplo Crítico (Prioridad Alta):* `"Pared agrietada de casona antigua con riesgo de colapso en el jirón Bolognesi"`
   - *Ejemplo Administrativo (Prioridad Baja):* `"Solicito información sobre requisitos para fraccionamiento de deuda tributaria"`
3. Al enviar, la ventana emergente detallará la derivación e clasificación en vivo sugerida por la IA.
4. **Pestaña "Bandeja de Gestión"**: Visualiza las métricas y la tabla ordenada. Observa que el caso crítico de Defensa Civil se sitúa al tope de la lista. Prueba a cambiar el estado del trámite a *"Procesar"* y *"Resolver"*, y observa la actualización instantánea en el Canal de Alertas derecho.
