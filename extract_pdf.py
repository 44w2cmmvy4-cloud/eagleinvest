import pdfplumber
import json
from pathlib import Path

pdf_path = r"C:\Users\varga\EAGLEINVEST\Si.pdf"

try:
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total de páginas: {len(pdf.pages)}")
        print("\n" + "="*80)
        
        for page_num, page in enumerate(pdf.pages, 1):
            print(f"\n### PÁGINA {page_num} ###\n")
            
            # Extraer texto
            text = page.extract_text()
            if text:
                print("TEXTO:")
                print(text)
                print("\n")
            
            # Extraer tablas
            tables = page.extract_tables()
            if tables:
                print("TABLAS ENCONTRADAS:")
                for i, table in enumerate(tables):
                    print(f"Tabla {i+1}:")
                    for row in table:
                        print(row)
                print("\n")
            
            # Extraer información de objetos gráficos
            if page.objects:
                print("OBJETOS EN LA PÁGINA:")
                for obj_type, objs in page.objects.items():
                    if obj_type in ['rect', 'curve', 'line']:
                        for obj in objs[:3]:
                            print(f"  {obj_type}: {obj}")
                    else:
                        print(f"  {obj_type}: {len(objs)} elemento(s)")
                print("\n")
            
            # Información de dimensiones
            print(f"Dimensiones página: {page.width} x {page.height}")
            print("="*80)
            
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
