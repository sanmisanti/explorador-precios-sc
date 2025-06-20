# 🚀 Plan de Despliegue - Explorador de Precios

## 📋 Resumen del Proyecto
- **Aplicación:** Next.js con React
- **Base de datos actual:** SQL Server local
- **Funcionalidades:** Consulta de precios + Web scraping MercadoLibre
- **Objetivo:** Hacer la app accesible públicamente en internet

---

## 🎯 Opciones de Despliegue (Ordenadas por Facilidad)

### 🟢 OPCIÓN 1: Vercel + PlanetScale (RECOMENDADA - GRATIS)
**Tiempo estimado:** 2-3 horas  
**Costo:** $0/mes  
**Dificultad:** ⭐⭐☆☆☆

#### Frontend (Vercel):
- ✅ **Hosting gratuito** para Next.js
- ✅ **Deploy automático** desde GitHub
- ✅ **SSL incluido**
- ✅ **CDN global**
- ✅ **Serverless functions** para APIs

#### Base de Datos (PlanetScale):
- ✅ **MySQL compatible** (no SQL Server)
- ✅ **5GB gratis**
- ✅ **Branching** para desarrollo
- ✅ **Escalable**

---

### 🟡 OPCIÓN 2: Netlify + Supabase (ALTERNATIVA GRATIS)
**Tiempo estimado:** 3-4 horas  
**Costo:** $0/mes  
**Dificultad:** ⭐⭐⭐☆☆

#### Frontend (Netlify):
- ✅ **Hosting gratuito**
- ✅ **Functions serverless**
- ✅ **Forms y analytics**

#### Base de Datos (Supabase):
- ✅ **PostgreSQL gratis**
- ✅ **2GB storage**
- ✅ **API automática**
- ✅ **Real-time**

---

### 🟠 OPCIÓN 3: Railway (TODO EN UNO - SIMPLE)
**Tiempo estimado:** 1-2 horas  
**Costo:** $5/mes después de trial  
**Dificultad:** ⭐⭐☆☆☆

#### Características:
- ✅ **Deploy directo desde GitHub**
- ✅ **PostgreSQL incluido**
- ✅ **Variables de entorno fáciles**
- ✅ **Logs y monitoring**

---

### 🔴 OPCIÓN 4: DigitalOcean Droplet (MÁS CONTROL)
**Tiempo estimado:** 4-6 horas  
**Costo:** $6/mes  
**Dificultad:** ⭐⭐⭐⭐☆

#### Características:
- ✅ **Control total del servidor**
- ✅ **Puedes usar cualquier BD**
- ✅ **Docker opcional**
- ❌ **Más configuración manual**

---

## 🗂️ Preparación de Datos

### Paso 1: Exportar Datos de SQL Server
```sql
-- Exportar tabla de clasificaciones
SELECT pl.IdClasificacion, c.Descripcion, COUNT(c.Descripcion) as Cantidad 
FROM pli.PliegoLinea pl
INNER JOIN rib.ItemInstanciado ii ON pl.IdClasificacion = ii.IdItemInstanciado
INNER JOIN rib.Clasificacion c ON ii.IdClasificacion = c.IdClasificacion
GROUP BY c.Descripcion, pl.IdClasificacion
ORDER BY COUNT(c.Descripcion) DESC;

-- Exportar datos principales (muestra)
SELECT TOP 1000 
    ii.Descripcion,
    plda.EspecificacionesTecnicas,
    plda.Observaciones,
    pl.PrecioUnitario,
    pl.NumeroLinea,
    p.NumeroPliego
FROM pli.PliegoLinea pl
-- ... resto de la consulta
```

### Paso 2: Convertir a Formato Compatible
- **CSV:** Para importación fácil
- **JSON:** Para seed scripts
- **SQL Insert:** Para cualquier BD SQL

---

## 🛠️ IMPLEMENTACIÓN DETALLADA - OPCIÓN 1 (Vercel + PlanetScale)

### PARTE A: Preparar el Repositorio

#### 1. Crear Repositorio en GitHub
```bash
# Si no tienes git inicializado
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/explorador-precios.git
git push -u origin main
```

#### 2. Modificar Variables de Entorno
Crear archivo `.env.local`:
```env
# Base de datos
DATABASE_URL="mysql://usuario:password@host/database"

# Para producción
NEXT_PUBLIC_APP_URL="https://tu-app.vercel.app"
```

### PARTE B: Configurar PlanetScale

#### 1. Crear Cuenta y Base de Datos
- Ir a [planetscale.com](https://planetscale.com)
- Crear cuenta gratuita
- Crear nueva base de datos: `explorador-precios`
- Obtener connection string

#### 2. Migrar Esquema y Datos
```sql
-- Crear tablas equivalentes
CREATE TABLE clasificaciones (
    id INT PRIMARY KEY,
    descripcion VARCHAR(500),
    cantidad INT
);

CREATE TABLE pliego_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clasificacion_id INT,
    descripcion VARCHAR(1000),
    especificaciones TEXT,
    observaciones TEXT,
    precio_unitario DECIMAL(10,2),
    numero_linea INT,
    numero_pliego VARCHAR(100),
    FOREIGN KEY (clasificacion_id) REFERENCES clasificaciones(id)
);
```

#### 3. Actualizar Código para MySQL
Archivo `lib/database.js`:
```javascript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
});

export async function getDatabase() {
    return pool;
}

export async function consultarPrecios(codigo) {
    const connection = await pool;
    const [rows] = await connection.execute(`
        SELECT 
            pd.descripcion,
            pd.especificaciones as EspecificacionesTecnicas,
            pd.observaciones as Observaciones,
            pd.precio_unitario as PrecioUnitario,
            pd.numero_linea as NumeroLinea,
            pd.numero_pliego as NumeroPliego
        FROM pliego_data pd
        WHERE pd.clasificacion_id = ?
        LIMIT 10
    `, [codigo]);
    
    return rows;
}
```

### PARTE C: Deploy en Vercel

#### 1. Conectar GitHub a Vercel
- Ir a [vercel.com](https://vercel.com)
- Conectar con GitHub
- Importar repositorio `explorador-precios`

#### 2. Configurar Variables de Entorno en Vercel
En el dashboard de Vercel:
```
DB_HOST=tu-host.planetscale.app
DB_USER=tu-usuario
DB_PASSWORD=tu-password
DB_NAME=explorador-precios
```

#### 3. Deploy Automático
- Vercel detectará Next.js automáticamente
- Deploy se ejecutará en cada push a main
- URL disponible en minutos

---

## 📦 Scripts de Migración

### Script para Convertir Datos SQL Server → MySQL
```javascript
// scripts/migrate-data.js
const fs = require('fs');
const sql = require('mssql');
const mysql = require('mysql2/promise');

async function migrateData() {
    // Conectar a SQL Server
    const sqlPool = await sql.connect(configSQLServer);
    
    // Conectar a MySQL
    const mysqlConnection = await mysql.createConnection(configMySQL);
    
    // Migrar clasificaciones
    const clasificaciones = await sqlPool.request().query(`
        SELECT pl.IdClasificacion, c.Descripcion, COUNT(*) as Cantidad 
        FROM pli.PliegoLinea pl
        INNER JOIN rib.ItemInstanciado ii ON pl.IdClasificacion = ii.IdItemInstanciado
        INNER JOIN rib.Clasificacion c ON ii.IdClasificacion = c.IdClasificacion
        GROUP BY c.Descripcion, pl.IdClasificacion
    `);
    
    for (const row of clasificaciones.recordset) {
        await mysqlConnection.execute(
            'INSERT INTO clasificaciones (id, descripcion, cantidad) VALUES (?, ?, ?)',
            [row.IdClasificacion, row.Descripcion, row.Cantidad]
        );
    }
    
    console.log('✅ Migración completada');
}

migrateData();
```

---

## 🎨 Ajustes para Producción

### 1. Optimizaciones de Performance
```javascript
// next.config.js
module.exports = {
    experimental: {
        optimizeCss: true,
    },
    compress: true,
    poweredByHeader: false,
    generateEtags: false,
}
```

### 2. Variables de Entorno
```javascript
// lib/config.js
export const config = {
    isDev: process.env.NODE_ENV === 'development',
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    database: {
        url: process.env.DATABASE_URL
    }
}
```

### 3. Manejo de Errores Mejorado
```javascript
// lib/error-handler.js
export function handleAPIError(error, res) {
    console.error('API Error:', error);
    
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({ error: 'Error interno del servidor' });
    } else {
        res.status(500).json({ error: error.message });
    }
}
```

---

## 📊 Comparación de Costos

| Plataforma | Costo Inicial | Costo Mensual | Límites |
|------------|---------------|---------------|---------|
| **Vercel + PlanetScale** | $0 | $0 | 100GB bandwidth, 5GB DB |
| **Netlify + Supabase** | $0 | $0 | 100GB bandwidth, 2GB DB |
| **Railway** | $0 | $5 | 500GB bandwidth, 1GB RAM |
| **DigitalOcean** | $0 | $6 | 1GB RAM, 25GB SSD, 1TB transfer |

---

## ✅ Checklist de Deployment

### Pre-Deploy
- [ ] Exportar datos de SQL Server
- [ ] Crear repositorio en GitHub
- [ ] Configurar variables de entorno
- [ ] Actualizar código para nueva BD
- [ ] Probar localmente con nueva BD

### Deploy
- [ ] Crear cuenta en plataforma elegida
- [ ] Configurar base de datos
- [ ] Migrar datos
- [ ] Conectar repositorio
- [ ] Configurar variables de entorno
- [ ] Hacer primer deploy

### Post-Deploy
- [ ] Verificar funcionalidad completa
- [ ] Probar web scraping
- [ ] Configurar dominio personalizado (opcional)
- [ ] Configurar analytics (opcional)
- [ ] Documentar URL y credenciales

---

## 🔗 URLs y Recursos

### Plataformas de Hosting
- [Vercel](https://vercel.com) - Frontend + Serverless
- [Netlify](https://netlify.com) - Frontend + Functions
- [Railway](https://railway.app) - Full-stack
- [DigitalOcean](https://digitalocean.com) - VPS

### Bases de Datos
- [PlanetScale](https://planetscale.com) - MySQL
- [Supabase](https://supabase.com) - PostgreSQL
- [MongoDB Atlas](https://mongodb.com/atlas) - NoSQL

### Herramientas
- [GitHub](https://github.com) - Control de versiones
- [Postman](https://postman.com) - Testing APIs

---

## 🎯 Recomendación Final

**Para tu caso específico, recomiendo la OPCIÓN 1 (Vercel + PlanetScale) porque:**

✅ **Gratis:** Sin costos iniciales ni mensuales  
✅ **Fácil:** Deploy automático desde GitHub  
✅ **Escalable:** Puede crecer con tu proyecto  
✅ **Confiable:** Plataformas usadas por miles de apps  
✅ **Mantenimiento:** Casi cero mantenimiento requerido  

**Tiempo total estimado:** 2-3 horas para tener todo funcionando online.

¿Quieres que empecemos con alguna de estas opciones? 