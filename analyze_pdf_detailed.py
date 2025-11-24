import pdfplumber
from PIL import Image, ImageDraw
import io
import os

pdf_path = r"C:\Users\varga\EAGLEINVEST\Si.pdf"
output_dir = r"C:\Users\varga\EAGLEINVEST\pdf_content"

os.makedirs(output_dir, exist_ok=True)

# Análisis detallado de cada página
with pdfplumber.open(pdf_path) as pdf:
    for page_num, page in enumerate(pdf.pages, 1):
        print(f"\n{'='*80}")
        print(f"PÁGINA {page_num}")
        print('='*80)
        
        # Dimensiones
        print(f"\nDimensiones: {page.width:.0f}x{page.height:.0f} pts")
        
        # Texto extraído
        text = page.extract_text()
        print(f"\nCONTENIDO DE TEXTO:")
        print(text[:500] if text else "No hay texto")
        if text and len(text) > 500:
            print(f"... ({len(text)} caracteres totales)")
        
        # Analizar objetos para colores
        print(f"\nOBJETOS Y ELEMENTOS:")
        print(f"  - Imágenes: {len(page.images)}")
        print(f"  - Rectángulos: {len(page.rects)}")
        print(f"  - Líneas: {len(page.lines)}")
        print(f"  - Curvas: {len(page.curves)}")
        print(f"  - Caracteres: {len(page.chars)}")
        
        # Analizar colores en rectángulos
        if page.rects:
            print(f"\n  Colores en rectángulos:")
            colors_found = set()
            for rect in page.rects[:5]:
                if rect.get('non_stroking_color'):
                    colors_found.add(rect.get('non_stroking_color'))
                if rect.get('stroking_color'):
                    colors_found.add(rect.get('stroking_color'))
            for color in colors_found:
                print(f"    - Color: {color}")
        
        # Información de caracteres (tipografía)
        if page.chars:
            print(f"\n  Tipografía:")
            fonts = {}
            for char in page.chars[:20]:
                font_name = char.get('fontname', 'Unknown')
                if font_name not in fonts:
                    fonts[font_name] = char.get('size', 0)
            for font, size in fonts.items():
                print(f"    - {font}: {size}pt")
        
        # Información de imágenes
        if page.images:
            print(f"\n  Imágenes encontradas: {len(page.images)}")
            for i, img in enumerate(page.images[:3]):
                print(f"    - Imagen {i+1}:")
                print(f"      Posición: ({img.get('x0'):.0f}, {img.get('y0'):.0f})")
                print(f"      Tamaño: {img.get('width'):.0f}x{img.get('height'):.0f}")

print(f"\n{'='*80}")
print("Análisis completado")
