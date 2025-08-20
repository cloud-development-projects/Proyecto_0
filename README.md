# Proyecto de Nivelación

## Integrantes

Nombre | Correo |
---|---|
Jheisson Orlando Cabezas Vera | j.cabezasv@uniandes.edu.co        |
Jaime Josue Ramos Rossetes    | jj.ramosr1@uniandes.edu.co        |
Diego Alberto Rodríguez Cruz  | da.rodrihguezc123@uniandes.edu.co |
Marilyn Stephany Joven Fonseca| m.joven@uniandes.edu.co           |

## Estructura del proyecto

```
.
├── backend/
│   └── cmd/
│   |   └── api/
│   |       └── main.go
│   ├── internal/
│   ├── Dockerfile
│   ├── README.md
│   ├── env.example
│   ├── go.mod
│   └── go.sum
├── db/
│   ├── 000_create_tables.sql
│   └── 001_data_dummy.sql
├── docs/
│   ├── Ejercicio de nivelación.postman_collection.json
│   └── P0_Desarrollo_Soluciones_Cloud.pdf
├── frontend/
│   └── public/
|   |   └── img/
|   |       └── default/
|   |           └── README.md
|   ├── favicon.ico
|   ├── index.html
|   ├── logo192.png
|   ├── logo512.png
|   ├── manifest.json
|   ├── robots.txt
|   ├── src/
|   |   ├── App.js
|   |   ├── index.css
|   |   └── index.js
|   ├── Dockerfile
|   ├── README.md
|   ├── package-lock.json
|   └── package.json
├── Makefile
├── README.md
├── docker-compose.local.yml
└── test-setup.sh

```
- La carpeta `backend` contiene el código correspondiente a GO, con su respectivo `README.md`
- La carpeta `db` contiene el código SQL para la creación de objetos en la base de datos
- La carpeta `docs` contiene manual y archivo JSON con la prueba de servicios
- La carpeta `frontend` contiene el código correspondiente a la interfaz gráfica desarrollada en React, con su respectivo `README.md`


## Ejecución del proyecto

En una ventana de comandos/terminal:

1. Clonar el repositorio: Primero, asegúrese de tener git instalado en su máquina. Luego, clone el repositorio en su entorno local:
```bash
git clone https://github.com/cloud-development-projects/Proyecto_0.git
```

2. Ingrese a la carpeta donde clono el respositorio
```bash
cd Proyecto_0
```

3. Ejecutar el docker compose para el despligue de la aplicación web
```bash
docker compose -f docker-compose.local.yml up -d
```

4. Una vez iniciado y culminado el despliegue, se presentara una salida similar a la siguiente:
```bash
[+] Running 8/8
 ✔ proyecto_0-frontend                         Built            0.0s 
 ✔ proyecto_0-api                              Built            0.0s 
 ✔ Network proyecto_0_proyecto0-local-network  Created          0.2s 
 ✔ Volume "proyecto_0_frontend_local_modules"  Created          0.0s 
 ✔ Volume "proyecto_0_postgres_local_data"     Created          0.0s 
 ✔ Container proyecto0-postgres-local          Healthy         47.4s 
 ✔ Container proyecto0-api-local               Started         48.2s 
 ✔ Container proyecto0-frontend-local          Started         48.7s
```

5. Con los servicios iniciados, proceda a ingresar a la aplicación web mediante la URL: http://localhost:3000/

## Uso de apliación

- En la carpeta `docs/` puede encontrar:
  - Manuales de uso de la aplicación en el archivo denominado P0_Desarrollo_Soluciones_Cloud.pdf
  - Archivo JSON denominado Ejercicio de nivelación.postman_collection.json con los endpoints de Postman para pruebas

- Vídeo de la aplicación: [Click aquí](https://www.loom.com/share/2332f923c548481e88acbd736757d6d0?sid=6baeb42e-8aa3-4ac8-b3c8-0afe3c87da53)


