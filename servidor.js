const http = require('http');
const fs = require('fs');
const { URL } = require('url');
const mime = require('mime');

const PORT = 8888;

// Caché en memoria
const cache = {};

const servidor = http.createServer((req, res) => { const url = new URL(`http://localhost:${PORT}${req.url}`);
  const pathname = url.pathname;

  console.log(`Petición recibida: ${pathname}`);

  // Routing con validación de método
  if (pathname === '/' && req.method === 'GET') {
    mostrarNoticias(res);
  }
  else if (pathname === '/noticia' && req.method === 'GET') {
    verNoticia(url, res);
  }
  else if (pathname === '/guardar' && req.method === 'POST') {
    guardarNoticia(req, res);
  }
  else {
    servirEstaticos(pathname, res);
  }
});

servidor.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

// =======================================
// Mostrar listado de noticias
// =======================================
function mostrarNoticias(res) {

  fs.readFile('./public/noticias.txt', 'utf8', (err, data) => {

    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>Error al leer el archivo de noticias</h1>');
      return;
    }

    const noticias = data.split('\n').filter(n => n.trim() !== '');

    let html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Noticias</title>
      <link rel="stylesheet" href="/estilos.css">
    </head>
    <body>

      <div class="container">
        <h1>📰 Noticias</h1>

        <div class="lista-noticias">
    `;

    noticias.forEach((noticia, i) => {
      const [titulo] = noticia.split('|');

      html += `
        <div class="card">
          <a href="/noticia?id=${i}" class="titulo">${titulo}</a>
        </div>
      `;
    });

    html += `
        </div>

        <a href="/formulario.html" class="btn-agregar">+ Agregar noticia</a>
      </div>

    </body>
    </html>
    `;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });
}

// =======================================
// Ver detalle de una noticia
// =======================================
function verNoticia(url, res) {

  const id = url.searchParams.get('id');

  fs.readFile('./public/noticias.txt', 'utf8', (err, data) => {

    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>Error al leer las noticias</h1>');
      return;
    }

    const noticias = data.split('\n').filter(n => n.trim() !== '');

    const noticia = noticias[id];

    if (!noticia) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Noticia no encontrada</h1>');
      return;
    }

    const [titulo, contenido] = noticia.split('|');

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Detalle de noticia</title>
        <link rel="stylesheet" href="/estilos.css">
      </head>
      <body>
        <h1>${titulo}</h1>
        <p>${contenido}</p>
        <a href="/">Volver al inicio</a>
      </body>
      </html>
    `;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });
}

// =======================================
// Guardar noticia con POST
// =======================================
function guardarNoticia(req, res) {

  let body = '';

  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {

    const datos = new URLSearchParams(body);
    const titulo = datos.get('titulo');
    const contenido = datos.get('contenido');

    if (!titulo || !contenido || titulo.trim() === '' || contenido.trim() === '') {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h1>Debe completar todos los campos</h1>');
      return;
    }

    const nuevaNoticia = `${titulo}|${contenido}\n`;

    fs.appendFile('./public/noticias.txt', nuevaNoticia, err => {

      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>Error al guardar la noticia</h1>');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Guardado</title>
          <link rel="stylesheet" href="/estilos.css">
        </head>
        <body>
          <h1>Noticia guardada correctamente</h1>
          <a href="/">Volver al inicio</a>
        </body>
        </html>
      `);
    });
  });
}

// =======================================
// Servir archivos estáticos con caché
// =======================================
function servirEstaticos(pathname, res) {

  const path = './public' + pathname;

  fs.stat(path, (err) => {

    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Archivo no encontrado</h1>');
      return;
    }

    if (cache[path]) {
      console.log('Cache HIT');

      res.writeHead(200, {
        'Content-Type': cache[path].tipo
      });

      res.end(cache[path].contenido);
      return;
    }

    fs.readFile(path, (err, data) => {

      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>Error interno</h1>');
        return;
      }

      const tipo = mime.getType(path) || 'text/plain';

      cache[path] = {
        contenido: data,
        tipo: tipo
      };

      console.log('Cache MISS');

      res.writeHead(200, { 'Content-Type': tipo });
      res.end(data);
    });
  });
}
