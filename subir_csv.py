import os
import subprocess
import datetime

# --- CONFIGURACIÓN ---
RUTA_CSV_ORIGEN = "/home/mdeoca/TEMPE/bme688/bme68x_log.csv" # **AJUSTA ESTO:** La ruta real de tu CSV en la red interna
RUTA_REPOSITORIO = os.path.dirname(os.path.abspath(__file__)) # Ruta donde está este script (y el repo clonado)
NOMBRE_CSV_EN_REPO = "datos.csv" # Nombre que tendrá el CSV en tu repositorio GitHub
MENSAJE_COMMIT = "Actualización de datos: "

# --- SCRIPT ---
def subir_csv_a_github():
    print(f"[{datetime.datetime.now()}] Iniciando subida del CSV...")

    # 1. Copiar el CSV original al repositorio local
    try:
        # Si el CSV original está fuera del repo clonado, lo copiamos dentro
        if not os.path.exists(RUTA_CSV_ORIGEN):
            print(f"ERROR: Archivo CSV origen no encontrado en {RUTA_CSV_ORIGEN}")
            return

        # Asegurarse de que el destino es la raíz del repositorio
        ruta_destino_csv = os.path.join(RUTA_REPOSITORIO, NOMBRE_CSV_EN_REPO)

        # Leer y escribir para asegurar que se sobreescribe correctamente
        with open(RUTA_CSV_ORIGEN, 'r', encoding='utf-8') as f_in:
            contenido = f_in.read()
        with open(ruta_destino_csv, 'w', encoding='utf-8') as f_out:
            f_out.write(contenido)
        print(f"CSV copiado a: {ruta_destino_csv}")

    except Exception as e:
        print(f"ERROR al copiar el CSV: {e}")
        return

    # 2. Navegar al directorio del repositorio
    os.chdir(RUTA_REPOSITORIO)

    # 3. Añadir el CSV al staging area
    try:
        subprocess.run(["git", "add", NOMBRE_CSV_EN_REPO], check=True)
        print(f"'{NOMBRE_CSV_EN_REPO}' añadido al staging.")
    except subprocess.CalledProcessError as e:
        print(f"ERROR al añadir archivo a Git: {e}")
        return

    # 4. Hacer commit
    try:
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        subprocess.run(["git", "commit", "-m", f"{MENSAJE_COMMIT}{timestamp}"], check=True)
        print("Commit realizado.")
    except subprocess.CalledProcessError as e:
        print(f"ERROR al hacer commit: {e}")
        # Esto puede ocurrir si no hay cambios. Se puede ignorar o manejar.
        if "nothing to commit" in str(e):
            print("No hay cambios para hacer commit. Saliendo.")
            return
        return

    # 5. Hacer push a GitHub
    try:
        # Nota: Necesitarás configurar credenciales en Git para la automatización.
        # Una forma es usar 'git config --global credential.helper store'
        # y hacer un push manual la primera vez para que guarde las credenciales,
        # o usar el PAT en la URL del repositorio (no recomendado por seguridad).
        # La mejor forma es configurar el credential.helper.

        # Si estás usando SSH (configuración más avanzada pero recomendada para servidores)
        # subprocess.run(["git", "push", "origin", "main"], check=True)

        # Si usas HTTPS y el credential.helper (lo más común para PCs)
        subprocess.run(["git", "push"], check=True)

        print("Push a GitHub exitoso.")
    except subprocess.CalledProcessError as e:
        print(f"ERROR al hacer push a GitHub: {e}")
        return
    except Exception as e:
        print(f"Otro error durante el push: {e}")

    print("Proceso de subida completado.")

if __name__ == "__main__":
    subir_csv_a_github()