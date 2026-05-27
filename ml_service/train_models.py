import os
import csv
import joblib
from custom_models import SimpleTfidfVectorizer, SimpleCentroidClassifier, SimplePriorityClassifier, SimplePipeline

def train():
    csv_path = "data/municipal_tickets.csv"
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset no encontrado en {csv_path}. Ejecute generate_mock_data.py primero.")
        
    subjects = []
    areas = []
    urgencies = []
    
    # Leer el dataset simulado
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            subjects.append(row["subject"])
            areas.append(row["area_real"])
            urgencies.append(row["urgencia"])
            
    print(f"Cargados {len(subjects)} registros para el entrenamiento local.")
    
    os.makedirs("models", exist_ok=True)
    
    # 1. Entrenar Clasificador de Áreas (NLP)
    print("\n--- Entrenando Modelo de Clasificación de Áreas (NLP) ---")
    vectorizer = SimpleTfidfVectorizer()
    vectorizer.fit(subjects)
    
    X_tfidf = vectorizer.transform(subjects)
    
    classifier = SimpleCentroidClassifier()
    classifier.fit(X_tfidf, areas)
    
    area_pipeline = SimplePipeline(vectorizer, classifier)
    joblib.dump(area_pipeline, "models/area_pipeline.pkl")
    print("Modelo de Áreas guardado en: models/area_pipeline.pkl")
    
    # 2. Entrenar Clasificador de Prioridades (Heurístico / Trigger basado)
    print("\n--- Entrenando Modelo de Clasificación de Prioridad (Heurístico) ---")
    priority_classifier = SimplePriorityClassifier()
    priority_classifier.fit(subjects, urgencies)
    
    joblib.dump(priority_classifier, "models/priority_pipeline.pkl")
    print("Modelo de Prioridades guardado en: models/priority_pipeline.pkl")
    
    # 3. Validación de precisión del entrenamiento
    pred_areas = area_pipeline.predict(subjects)
    pred_priorities = priority_classifier.predict(subjects)
    
    correct_areas = sum(1 for p, a in zip(pred_areas, areas) if p == a)
    correct_priorities = sum(1 for p, u in zip(pred_priorities, urgencies) if p == u)
    
    print(f"\n========================================================")
    print(f"Evaluacion de Modelos (Entrenamiento Local):")
    print(f"Area (NLP) - Precision: {correct_areas / len(subjects) * 100:.2f}% ({correct_areas}/{len(subjects)})")
    print(f"Prioridad - Precision: {correct_priorities / len(subjects) * 100:.2f}% ({correct_priorities}/{len(subjects)})")
    print(f"========================================================")

if __name__ == "__main__":
    train()
