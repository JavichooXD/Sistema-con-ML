import re
import math

class SimpleTfidfVectorizer:
    def __init__(self):
        self.vocabulary_ = {}
        self.idf_ = {}
        
    def _tokenize(self, text):
        # Limpieza básica y tokenización
        text = text.lower()
        return re.findall(r'\b\w+\b', text)
        
    def fit(self, raw_documents):
        doc_tokens = [self._tokenize(doc) for doc in raw_documents]
        num_docs = len(raw_documents)
        
        vocab = set()
        for tokens in doc_tokens:
            vocab.update(tokens)
            
        self.vocabulary_ = {word: idx for idx, word in enumerate(sorted(list(vocab)))}
        
        # Calcular Document Frequency
        df = {word: 0 for word in vocab}
        for tokens in doc_tokens:
            unique_tokens = set(tokens)
            for token in unique_tokens:
                df[token] += 1
                
        # Calcular Inverse Document Frequency (IDF)
        for word, count in df.items():
            self.idf_[word] = math.log((1 + num_docs) / (1 + count)) + 1
            
    def transform(self, raw_documents):
        results = []
        for doc in raw_documents:
            tokens = self._tokenize(doc)
            tf = {}
            for token in tokens:
                if token in self.vocabulary_:
                    tf[token] = tf.get(token, 0) + 1
                    
            # Vector TF-IDF
            vector = [0.0] * len(self.vocabulary_)
            for token, count in tf.items():
                idx = self.vocabulary_[token]
                vector[idx] = count * self.idf_[token]
            
            # Normalización L2 para facilitar el cálculo de Similitud Coseno
            sq_sum = sum(v * v for v in vector)
            if sq_sum > 0:
                norm = math.sqrt(sq_sum)
                vector = [v / norm for v in vector]
            results.append(vector)
        return results


class SimpleCentroidClassifier:
    def __init__(self):
        self.centroids_ = {}
        
    def fit(self, X, y):
        # X es una lista de vectores TF-IDF de tamaño fijo, y es una lista de etiquetas
        classes = set(y)
        class_vectors = {c: [] for c in classes}
        for vector, label in zip(X, y):
            class_vectors[label].append(vector)
            
        # Calcular el vector centroide (promedio) para cada clase
        for label, vectors in class_vectors.items():
            num_vectors = len(vectors)
            dim = len(vectors[0])
            centroid = [0.0] * dim
            for v in vectors:
                for idx in range(dim):
                    centroid[idx] += v[idx]
            centroid = [val / num_vectors for val in centroid]
            self.centroids_[label] = centroid
            
    def predict(self, X):
        predictions = []
        for vector in X:
            best_class = None
            best_sim = -1.0
            for label, centroid in self.centroids_.items():
                # Similitud Coseno (dado que ambos vectores están normalizados L2, es solo el producto punto)
                sim = sum(a * b for a, b in zip(vector, centroid))
                if sim > best_sim:
                    best_sim = sim
                    best_class = label
            predictions.append(best_class)
        return predictions


class SimplePriorityClassifier:
    def __init__(self):
        self.high_keywords = [
            "urgente", "peligro", "colapso", "caer", "caída", "cables", 
            "clandestino", "clandestina", "riesgo", "grave", "agrietada", 
            "enorme", "inundación", "emergencia", "electrocución"
        ]
        self.low_keywords = [
            "consulta", "solicitud de plano", "información", "descuentos", 
            "estado de cuenta", "beneficios", "copia", "requisitos", "donación"
        ]
        
    def fit(self, X, y):
        pass # Modelo heurístico pre-entrenado
        
    def predict_single(self, text):
        text_lower = text.lower()
        if any(w in text_lower for w in self.high_keywords):
            return "Alta"
        elif any(w in text_lower for w in self.low_keywords):
            return "Baja"
        else:
            return "Media"
            
    def predict(self, X):
        return [self.predict_single(text) for text in X]


class SimplePipeline:
    def __init__(self, vectorizer, classifier):
        self.vectorizer = vectorizer
        self.classifier = classifier
        
    def predict(self, X_texts):
        X_vec = self.vectorizer.transform(X_texts)
        return self.classifier.predict(X_vec)
