#!/usr/bin/env python3
import os
import subprocess
import datetime
import hashlib
import time

# --- CONFIGURACIÓN ---
CONFIG = {
    'csv_origen': "/home/mdeoca/TEMPE/bme688/bme68x_log.csv",
    'repo_path': "/home/mdeoca/TEMPE/bme688/Meteo",
    'csv_destino': "datos.csv",
    'log_file': "/home/mdeoca/TEMPE/bme688/Meteo/upload_log.txt"
}

def log(message):
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    with open(CONFIG['log_file'], 'a') as f:
        f.write(f"[{timestamp}] {message}\n")
    print(f"[{timestamp}] {message}")

def file_hash(filepath):
    """Calcula hash SHA256 de un archivo"""
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def main():
    log("=== Inicio del proceso ===")
    
    try:
        # 1. Verificar existencia de archivos
        if not os.path.exists(CONFIG['csv_origen']):
            raise FileNotFoundError(f"Archivo origen no existe: {CONFIG['csv_origen']}")

        destino = os.path.join(CONFIG['repo_path'], CONFIG['csv_destino'])
        
        # 2. Comparar hashes
        hash_origen = file_hash(CONFIG['csv_origen'])
        hash_destino = file_hash(destino) if os.path.exists(destino) else ""
        
        if hash_origen == hash_destino:
            log("El archivo no tiene cambios reales. Saliendo.")
            return

        # 3. Copiar archivo (modo binario para evitar problemas de codificación)
        with open(CONFIG['csv_origen'], 'rb') as f_in, open(destino, 'wb') as f_out:
            f_out.write(f_in.read())
        log(f"Archivo copiado: {CONFIG['csv_origen']} -> {destino}")

        # 4. Operaciones Git
        os.chdir(CONFIG['repo_path'])
        
        # Forzar el reconocimiento del cambio
        subprocess.run(["git", "add", "--force", CONFIG['csv_destino']], check=True)
        
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        subprocess.run(["git", "commit", "-m", f"Actualización: {timestamp}"], check=True)
        
        # Sincronización segura
        subprocess.run(["git", "pull", "--rebase"], check=True)
        subprocess.run(["git", "push"], check=True)
        
        log("=== Actualización completada con éxito ===")

    except Exception as e:
        log(f"ERROR: {str(e)}")

if __name__ == "__main__":
    main()
