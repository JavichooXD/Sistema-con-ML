import os
import csv
import random

# Define templates for each area to generate realistic text
templates = {
    "Desarrollo Urbano": [
        ("Bache enorme y peligroso en la pista de la Av. Larco cuadra {num}", "Alta", 15),
        ("Hueco en la calzada de la calle {street} que daña los vehículos", "Media", 30),
        ("Solicitud de certificado catastral e información sobre zonificación de mi predio en {street}", "Baja", 45),
        ("Licencia de habilitación urbana y subdivisión de lote multifamiliar", "Baja", 45),
        ("Construcción clandestina vecinal que invade retiro municipal en {street}", "Alta", 15),
        ("Solicitud de alineamiento de predio y planos de zonificación", "Baja", 60),
        ("Derrumbe parcial de vereda pública frente a la casa {num} de la calle {street}", "Alta", 15),
        ("Repavimentación y parchado de pista rota en el pasaje {street}", "Media", 30)
    ],
    "Licencias y Fiscalización": [
        ("Queja por ruidos molestos excesivos de la discoteca local en la Av. {street}", "Alta", 15),
        ("Local comercial opera sin licencia de funcionamiento ni medidas básicas", "Media", 30),
        ("Discoteca y bar clandestino abierto hasta altas horas de la madrugada en {street}", "Alta", 15),
        ("Solicitud de licencia de funcionamiento comercial para tienda de abarrotes", "Baja", 45),
        ("Fiscalización de restaurante por condiciones insalubres y olores fuertes en {street}", "Alta", 15),
        ("Instalación de letrero publicitario comercial sin autorización municipal", "Baja", 60),
        ("Bodega excede el aforo permitido y vende licor en la vía pública", "Media", 30),
        ("Comercio informal y ambulantes obstruyendo la entrada en calle {street}", "Media", 30)
    ],
    "Medio Ambiente": [
        ("Poda urgente de árbol cuyas ramas están enredadas en cables de alta tensión", "Alta", 15),
        ("Acumulación de basura y residuos sólidos en la esquina del parque de la calle {street}", "Alta", 15),
        ("Solicitud de regado y mantenimiento de áreas verdes del parque principal", "Baja", 45),
        ("Limpieza de desmonte y tierra acumulada en la berma central de la Av. {street}", "Media", 30),
        ("Árbol seco y carcomido a punto de caer sobre la vereda frente al número {num}", "Alta", 15),
        ("Plaga de roedores en los jardines públicos cercanos a la calle {street}", "Alta", 15),
        ("Solicitud de donación de plantones de árboles para campaña de arborización", "Baja", 60),
        ("Vecino arroja agua sucia y desperdicios al jardín público de la Av. {street}", "Media", 30)
    ],
    "Rentas y Administración": [
        ("Solicitud de estado de cuenta de arbitrios e impuesto predial", "Baja", 45),
        ("Fraccionamiento de deuda tributaria de años anteriores de predio en {street}", "Baja", 45),
        ("Reclamo por cobro excesivo o duplicado de arbitrios de limpieza pública", "Media", 30),
        ("Emisión de constancia de no adeudo tributario para transferencia de inmueble", "Baja", 60),
        ("Pago de impuesto de alcabala por compra de departamento en calle {street}", "Baja", 45),
        ("Actualización de datos de contribuyente y cambio de domicilio fiscal", "Baja", 60),
        ("Consulta sobre descuentos y beneficios para el pronto pago de arbitrios", "Baja", 60),
        ("Error en el registro del autovalúo del predio ubicado en {street} número {num}", "Media", 30)
    ],
    "Defensa Civil": [
        ("Pared agrietada de casona antigua con grave riesgo de colapso en el jirón {street}", "Alta", 15),
        ("Cables eléctricos pelados y expuestos al aire libre frente a parque público", "Alta", 15),
        ("Inspección técnica de seguridad en edificaciones ITSE de local comercial", "Baja", 45),
        ("Estructura metálica de cartel publicitario debilitada por el viento con riesgo de caída", "Alta", 15),
        ("Establecimiento educativo no cuenta con extintores ni señalización de evacuación", "Alta", 15),
        ("Solicitud de evaluación de riesgos por filtración de agua que debilita bases de vivienda", "Media", 30),
        ("Obstrucción de pasadizos de evacuación en galería comercial del jirón {street}", "Alta", 15),
        ("Simulacro municipal y capacitación de brigadas de Defensa Civil en {street}", "Baja", 60)
    ]
}

streets = [
    "Arequipa", "Grau", "Bolognesi", "28 de Julio", "Tarapacá", 
    "Tacna", "Lima", "Huancavelica", "Cuzco", "Puno", "Junín",
    "San Martín", "La Unión", "Huallaga", "Carabaya", "Lampa"
]

def generate_dataset(filename="data/municipal_tickets.csv", num_records=500):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    headers = ["subject", "area_real", "dias_legales", "urgencia"]
    
    with open(filename, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        
        for _ in range(num_records):
            # Choose random area
            area = random.choice(list(templates.keys()))
            template_text, priority, base_days = random.choice(templates[area])
            
            num = random.randint(101, 999)
            street = random.choice(streets)
            subject = template_text.format(num=num, street=street)
            
            # Add slight variation in priority or days legally allowed
            if any(w in subject.lower() for w in ["urgente", "peligro", "colapso", "caer", "caída", "cables", "clandestino", "clandestina"]):
                priority = "Alta"
                days = random.randint(5, 15)
            elif any(w in subject.lower() for w in ["consulta", "solicitud de plano", "información", "descuentos"]):
                priority = "Baja"
                days = random.randint(30, 60)
            else:
                days = base_days + random.choice([-5, 0, 5])
                
            writer.writerow([subject, area, days, priority])

if __name__ == "__main__":
    filepath = "data/municipal_tickets.csv"
    generate_dataset(filepath, 500)
    print(f"Dataset generated successfully with 500 records in {filepath}")
