from PIL import Image
import os

def convert_to_webp(input_path, output_path, quality=80):
    try:
        img = Image.open(input_path)
        img.save(output_path, 'webp', quality=quality)
        
        original_size = os.path.getsize(input_path) / 1024
        new_size = os.path.getsize(output_path) / 1024
        
        print(f"Berhasil dikonversi!")
        print(f"Disimpan di: {output_path}")
        print(f"Ukuran awal: {original_size:.2f} KB")
        print(f"Ukuran WebP: {new_size:.2f} KB")
        print(f"Penurunan ukuran: {((original_size - new_size) / original_size) * 100:.1f}%")

    except Exception as e:
        print(f"Terjadi kesalahan: {e}")

input_file = r"h:\product-launch\ruang.kelasinovatif.com\public\images\logo2.png"
output_file = r"h:\product-launch\ruang.kelasinovatif.com\public\images\logo2.webp"

convert_to_webp(input_file, output_file, quality=80)
