import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
# Importar las clases de modelos personalizados para que joblib resuelva el namespace
from custom_models import SimplePipeline, SimplePriorityClassifier, SimpleTfidfVectorizer, SimpleCentroidClassifier

app = FastAPI(
    title="SIGED-ML AI Service",
    description="Microservicio de Machine Learning y NLP para Clasificación Temática y de Prioridad de Trámites",
    version="1.0.0"
)

# Enable CORS for local cross-origin communications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request schemas
class PredictRequest(BaseModel):
    subject: str

class PredictResponse(BaseModel):
    suggested_area: str
    priority: str

# Global variables for models
area_pipeline = None
priority_pipeline = None

# Paths to models
AREA_MODEL_PATH = "models/area_pipeline.pkl"
PRIORITY_MODEL_PATH = "models/priority_pipeline.pkl"

@app.on_event("startup")
def load_models():
    global area_pipeline, priority_pipeline
    
    if not os.path.exists(AREA_MODEL_PATH) or not os.path.exists(PRIORITY_MODEL_PATH):
        print("WARNING: Model files not found. Please train models first using train_models.py.")
        return
        
    try:
        area_pipeline = joblib.load(AREA_MODEL_PATH)
        priority_pipeline = joblib.load(PRIORITY_MODEL_PATH)
        print("Models loaded successfully.")
    except Exception as e:
        print(f"Error loading models: {e}")

@app.post("/api/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    global area_pipeline, priority_pipeline
    
    # Check if models are loaded
    if area_pipeline is None or priority_pipeline is None:
        # If models are not loaded, try to load them on the fly
        load_models()
        if area_pipeline is None or priority_pipeline is None:
            raise HTTPException(
                status_code=503, 
                detail="Modelos no entrenados o no disponibles. Ejecute train_models.py primero."
            )
            
    if not request.subject.strip():
        raise HTTPException(status_code=400, detail="El asunto del trámite no puede estar vacío.")

    try:
        # Make predictions
        predicted_area = area_pipeline.predict([request.subject])[0]
        predicted_priority = priority_pipeline.predict([request.subject])[0]
        
        return PredictResponse(
            suggested_area=str(predicted_area),
            priority=str(predicted_priority)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la predicción del modelo: {str(e)}")

@app.get("/health")
def health_check():
    status = "healthy"
    models_ready = area_pipeline is not None and priority_pipeline is not None
    return {
        "status": status,
        "models_loaded": models_ready
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
