import pdfplumber
from pdf2image import convert_from_path
import os

pdf_path = r"C:\Users\varga\EAGLEINVEST\Si.pdf"
output_dir = r"C:\Users\varga\EAGLEINVEST\pdf_images"

# Crear directorio si no existe
os.makedirs(output_dir, exist_ok=True)

# Convertir PDF a imágenes
print("Convirtiendo PDF a imágenes...")
images = convert_from_path(pdf_path, dpi=150)

for i, image in enumerate(images, 1):
    image_path = os.path.join(output_dir, f"page_{i}.png")
    image.save(image_path)
    print(f"Página {i} guardada: {image_path}")

print(f"\nTotal de imágenes extraídas: {len(images)}")
print(f"Directorio de salida: {output_dir}")
