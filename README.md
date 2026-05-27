# SIGED-ML 🏛️🤖
### Sistema Inteligente de Gestión Documental y Priorización de Trámites

SIGED-ML es un sistema moderno e innovador de gestión documental municipal que automatiza el registro de mesa de partes. Utiliza técnicas avanzadas de **Machine Learning** y **Procesamiento de Lenguaje Natural (NLP)** en local para:
1. **Derivación de Área automática**: Predice el área de destino del trámite basándose en el asunto (NLP).
2. **Priorización de Urgencia automática**: Clasifica el trámite en prioridad Alta, Media o Baja.
3. **Alertas en tiempo real**: Canal de notificaciones para los ciudadanos sobre el estado de sus trámites en la base de datos Supabase en la nube.

---

## 🏗️ Arquitectura del Proyecto

El sistema está estructurado como un monorepo local dividido en tres carpetas:

```
/SIGED-ML
  ├── /ml_service    --> Microservicio Python (FastAPI + NLP + pkl models)
  ├── /backend       --> Backend Core (Node.js + Express + Prisma ORM)
  └── /frontend      --> Frontend Dashboard (Next.js 15 + Tailwind CSS)
```

---

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend Core:** Node.js, Express, TypeScript, Prisma ORM.
- **Base de Datos:** PostgreSQL en la nube (alojado en **Supabase**).
- **Servicio AI/ML:** Python 3.14, FastAPI, Joblib.

---

## 🚀 Guía de Inicialización Local (Paso a Paso)

Para presentar la demostración de tu trabajo en clase, debes levantar los tres servicios en **tres terminales separadas**.

### 💻 TERMINAL 1: Servicio de Machine Learning (Python FastAPI)

1. Abre una terminal en la carpeta `/ml_service`:
   ```bash
   cd ml_service
   ```
2. Crea e ingresa a tu entorno virtual de Python:
   ```bash
   # Crear entorno virtual (ejecutar solo la primera vez)
   python -m venv venv
   
   # Activar en Windows PowerShell
   .\venv\Scripts\Activate.ps1
   ```
3. Instala las dependencias y corre los scripts de entrenamiento:
   ```bash
   # Instalar paquetes requeridos (ejecutar la primera vez)
   pip install -r requirements.txt
   
   # 1. Generar los datos sintéticos (500 registros del caso municipal)
   python generate_mock_data.py
   
   # 2. Entrenar y guardar los modelos (.pkl)
   python train_models.py
   ```
4. Inicia el servidor de FastAPI:
   ```bash
   # Iniciar el servidor local de IA
   uvicorn main:app --reload --port 8000
   ```
   *El servicio de IA estará corriendo en `http://127.0.0.1:8000`.*

---

### 💻 TERMINAL 2: Backend Core (Node.js + Express)

1. Abre una segunda terminal en la carpeta `/backend`:
   ```bash
   cd backend
   ```
2. Instala los paquetes de Node:
   ```bash
   npm install
   ```
3. *(Opcional)* El archivo `.env` ya viene configurado con las credenciales de Supabase del proyecto creado:
   ```env
   PORT=4000
   DATABASE_URL="postgresql://postgres.wkdbsrwfhylaaglawegf:NHrzFMCC74XK8zx5@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.wkdbsrwfhylaaglawegf:NHrzFMCC74XK8zx5@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
   ```
4. Sincroniza la base de datos de Supabase e inicia el servidor Express:
   ```bash
   # Aplicar migraciones de base de datos a Supabase (solo la primera vez si se requiere sincronizar)
   npx prisma migrate dev --name init
   
   # Poblar áreas por defecto e inicializar (solo la primera vez)
   npm run db:seed
   
   # Iniciar el servidor Backend en modo desarrollo
   npm run dev
   ```
   *El backend estará escuchando en `http://localhost:4000`.*

---

### 💻 TERMINAL 3: Frontend Dashboard (Next.js)

1. Abre una tercera terminal en la carpeta `/frontend`:
   ```bash
   cd frontend
   ```
2. Instala las dependencias del frontend:
   ```bash
   npm install
   ```
3. Levanta el servidor local de desarrollo de Next.js:
   ```bash
   npm run dev
   ```
   *La aplicación web estará disponible en `http://localhost:3000`.*

---

## 🎯 Instrucciones de Demostración en Clase

1. Abre tu navegador en `http://localhost:3000`.
2. En la pestaña **Mesa de Partes**, simula ser un ciudadano e ingresa una solicitud:
   - *Ejemplo 1 (Prioridad Alta):* `"Pared agrietada en casona antigua con grave riesgo de colapso en el jirón Grau"`
   - *Ejemplo 2 (Prioridad Baja):* `"Consulta sobre los requisitos y descuentos por pago de impuesto predial"`
3. Al hacer clic en **Registrar Trámite**, verás una ventana emergente que muestra de manera visual el resultado de la clasificación en vivo de la IA:
   - La IA asignará el **Área** correspondiente (ej. *Defensa Civil* o *Rentas y Administración*) y la **Prioridad** sugerida.
4. Dirígete a la pestaña **Panel de Control** (vista del funcionario municipal):
   - Visualiza los **KPIs** y gráficos interactivos actualizados.
   - Observa el nuevo trámite en la lista ordenada por prioridad.
   - Interactúa actualizando los estados del trámite (ej. de *Pendiente* a *En Proceso* o *Resuelto*).
   - Observa las alertas generadas automáticamente en tiempo real en la barra lateral derecha.
