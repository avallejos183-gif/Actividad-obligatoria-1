# Actividad Obligatoria 1 - Programación Web II

## Alumno
Axel Vallejos

## Repositorio
https://github.com/avallejos183-gif/Actividad-obligatoria-1

---

# Bloque A - Diagrama de flujo

Se incluye un diagrama de flujo que representa el funcionamiento del servidor, contemplando:

- Recepción de la request
- Análisis de URL y método HTTP
- Routing
- Lógica de cada ruta
- Manejo de archivos estáticos
- Uso de caché
- Manejo de errores

El diagrama se encuentra incluido en el repositorio como archivo `Diagrama AO1.png`.

---

# Bloque B - Módulos utilizados

### http
Se utiliza para crear el servidor web mediante `createServer()` y escuchar peticiones con `listen()`.

Se utiliza porque permite implementar un servidor HTTP sin frameworks externos.

---

### fs
Se utiliza para trabajar con archivos del sistema.

Funciones utilizadas:
- `readFile()` para leer noticias y archivos estáticos
- `appendFile()` para guardar noticias nuevas
- `stat()` para verificar si un archivo existe antes de leerlo

Se utiliza porque permite persistir datos sin utilizar una base de datos.

---

### url
Se utiliza para analizar URLs y obtener:

- `pathname`
- parámetros GET con `searchParams.get()`

Se utiliza porque permite identificar qué recurso solicita el cliente y obtener parámetros como el `id` en `/noticia`.

---

### mime
Se utiliza para detectar automáticamente el tipo MIME de los archivos estáticos según su extensión.

Se utiliza porque permite enviar correctamente el encabezado `Content-Type` al navegador.

---

# Bloque C - Funcionamiento del servidor

El servidor escucha en el puerto 8888 y utiliza un modelo asincrónico.

### Routing

El servidor analiza cada petición utilizando `req.url` y `req.method`:

- `GET /` → muestra el listado de noticias  
- `GET /noticia?id=...` → muestra una noticia específica  
- `POST /guardar` → guarda una nueva noticia  
- Otros casos → intenta servir archivos estáticos  

---

### Captura de datos POST

Los datos enviados desde el formulario llegan en fragmentos (*chunks*).

Se utiliza:

- `req.on('data')` para acumular datos  
- `req.on('end')` para procesarlos  

Luego se usa `URLSearchParams` para obtener los valores.

---

### Formulario de noticias

El formulario utiliza dos campos:

- `titulo`
- `contenido`

Estos datos se envían mediante método POST a `/guardar`.

Luego se almacenan en `noticias.txt` con el formato:

```text
Titulo|Contenido
```
---

# Bloque D - Implementación

## Listado de noticias
Lee el archivo `noticias.txt` y genera HTML dinámico.

## Visualización de noticia
Obtiene el ID desde la URL y muestra la noticia.  
Si no existe, devuelve error 404.

## Guardado de noticias
Recibe `titulo` y `contenido`, valida los datos y los guarda en el archivo.

## Archivos estáticos
Sirve archivos desde la carpeta `public`, utilizando `fs` y `mime`.

## Caché
Se implementa un objeto en memoria para evitar lecturas repetidas desde disco.

## Manejo de errores
- 200 → operación exitosa  
- 400 → datos inválidos  
- 404 → recurso no encontrado  
- 500 → error interno  

---

# Bloque E - Ejecución del proyecto

## Instalación

```bash
npm install

## Ejecución

node servidor.js

## Uso

Abrir en navegador:

http://localhost:8888