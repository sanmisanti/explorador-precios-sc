# 🔍 Explorador de Precios - Next.js

> **Versión 2.0** - Aplicación web moderna para consultar precios en SQL Server con integración automática de web scraping de MercadoLibre.

## ✨ Características

- 🎯 **Arquitectura moderna**: Next.js con componentes React modulares
- 🗄️ **Base de datos**: Conexión a SQL Server local
- 🛒 **Web Scraping**: Búsqueda automática en MercadoLibre
- 📊 **Ordenamiento**: Resultados ordenados por precio de menor a mayor
- 📱 **Responsive**: Interfaz adaptable a todos los dispositivos
- 🎨 **UI/UX moderna**: Diseño glassmorphism con animaciones suaves
- ⚡ **Performance**: Búsquedas paralelas y optimizaciones de Next.js

## 🏗️ Arquitectura del Proyecto

```
nextapp/
├── components/              # Componentes React reutilizables
│   ├── ErrorMessage.js     # Componente de mensajes de error
│   ├── LoadingSpinner.js   # Componente de carga
│   ├── MercadoLibreColumn.js # Columna de resultados ML
│   ├── ResultsTable.js     # Tabla de resultados principal
│   └── SearchForm.js       # Formulario de búsqueda
├── lib/                    # Lógica de negocio y utilidades
│   ├── database.js         # Conexión y consultas SQL Server
│   └── mercadoLibreScraper.js # Web scraping de MercadoLibre
├── pages/                  # Páginas y rutas de Next.js
│   ├── api/               # API Routes de Next.js
│   │   └── consultar-precios.js # Endpoint principal
│   └── index.js           # Página principal
├── styles/                # Estilos CSS modulares
│   ├── globals.css        # Estilos globales
│   ├── Home.module.css    # Estilos de la página principal
│   ├── SearchForm.module.css
│   ├── ResultsTable.module.css
│   ├── LoadingSpinner.module.css
│   ├── ErrorMessage.module.css
│   └── MercadoLibre.module.css
├── package.json           # Dependencias y scripts
├── next.config.js         # Configuración de Next.js
└── README.md             # Documentación
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ instalado
- SQL Server con la base de datos `COMPRAS_SALTA`
- Usuario SQL Server: `sa` / Contraseña: `sa`

### Pasos de Instalación

1. **Navegar al directorio del proyecto**
   ```bash
   cd nextapp
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Verificar configuración de base de datos**
   
   El archivo `lib/database.js` contiene la configuración:
   ```javascript
   const config = {
       server: 'localhost',
       database: 'COMPRAS_SALTA',
       user: 'sa',
       password: 'sa',
       port: 1433,
       options: {
           encrypt: false,
           trustServerCertificate: true,
           enableArithAbort: true
       }
   };
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye la aplicación para producción
npm run start        # Inicia servidor de producción

# Calidad de código
npm run lint         # Ejecuta ESLint
```

## 🛠️ Componentes Principales

### 🔍 SearchForm
- Formulario de búsqueda con validación
- Placeholder dinámico con ejemplos
- Estados de carga y validación
- Botones de envío y limpieza

### 📊 ResultsTable
- Tabla responsive con scroll horizontal
- Formateo automático de precios
- Indicadores visuales para diferencias
- Integración con componente MercadoLibre

### 🛒 MercadoLibreColumn
- Mostrar resultados de ML por fila
- Ordenamiento automático por precio
- Estados de carga, error y sin resultados
- Links directos a productos

### ⚡ LoadingSpinner
- Spinner animado con mensaje personalizable
- Diseño consistente con el tema

### ❌ ErrorMessage
- Mensajes de error estilizados
- Botón de cierre opcional
- Diseño accesible

## 🌐 API Routes

### POST `/api/consultar-precios`

**Request Body:**
```json
{
  "codigo": 864596
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "Descripcion": "Descripción del producto",
      "EspecificacionesTecnicas": "Especificaciones...",
      "Observaciones": "Observaciones...",
      "PrecioPliego": 1000.00,
      "NumeroLinea": 1,
      "NumeroPliego": "ABC123",
      "PrecioPreadjudicado": 950.00,
      "PliegoAdj": 50.00,
      "mercadoLibre": {
        "success": true,
        "textoBusqueda": "texto de búsqueda",
        "cantidadEncontrada": 3,
        "resultados": [
          {
            "titulo": "Producto en ML",
            "precio": "$800",
            "link": "https://mercadolibre.com.ar/...",
            "posicion": 1
          }
        ]
      }
    }
  ],
  "count": 1,
  "message": "Consulta exitosa para código 864596"
}
```

## 🎨 Estilos y Temas

### Paleta de Colores
- **Primario**: `#667eea` (Azul)
- **Secundario**: `#764ba2` (Púrpura)
- **Éxito**: `#38a169` (Verde)
- **Error**: `#e53e3e` (Rojo)
- **Texto**: `#2d3748` (Gris oscuro)

### Efectos Visuales
- **Glassmorphism**: Fondos translúcidos con blur
- **Gradientes**: Efectos de gradiente en botones y elementos
- **Animaciones**: Transiciones suaves y animaciones de entrada
- **Sombras**: Box-shadow para profundidad

## 📱 Responsive Design

- **Desktop**: > 1200px - Experiencia completa
- **Tablet**: 768px - 1200px - Adaptación de columnas
- **Mobile**: < 768px - Diseño móvil optimizado

## ⚡ Optimizaciones

### Performance
- **CSS Modules**: Estilos encapsulados y optimizados
- **Lazy Loading**: Carga diferida de componentes
- **Búsquedas Paralelas**: Múltiples requests de ML simultáneos
- **Minimización**: Código optimizado para producción

### SEO
- **Meta Tags**: Configuración completa de metadatos
- **Structured HTML**: Semántica correcta
- **Accessibility**: Atributos ARIA y navegación por teclado

## 🐛 Solución de Problemas

### Error de Conexión a Base de Datos
```bash
Error: Failed to connect to localhost:1433
```
**Solución**: Verificar que SQL Server esté ejecutándose y que las credenciales sean correctas.

### Error de Dependencias
```bash
Module not found: Can't resolve 'axios'
```
**Solución**: Ejecutar `npm install` para instalar todas las dependencias.

### Error de Puerto
```bash
Port 3000 is already in use
```
**Solución**: Usar otro puerto con `npm run dev -- -p 3001`

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 🔗 Enlaces Útiles

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [SQL Server Documentation](https://docs.microsoft.com/en-us/sql/sql-server/)
- [MercadoLibre API](https://developers.mercadolibre.com/)

---

**Desarrollado con ❤️ usando Next.js, React y SQL Server** 