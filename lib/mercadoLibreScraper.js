const axios = require('axios');
const cheerio = require('cheerio');
const UserAgent = require('user-agents');

class MercadoLibreScraper {
    constructor() {
        this.baseURL = 'https://listado.mercadolibre.com.ar';
        this.userAgent = new UserAgent();
        this.delay = 1000; // Delay entre requests para ser respetuosos
    }

    // Función para limpiar y preparar el texto de búsqueda
    prepararTextoBusqueda(especificaciones, observaciones) {
        let texto = '';
        
        if (especificaciones && especificaciones.trim()) {
            texto += especificaciones.trim();
        }
        
        if (observaciones && observaciones.trim()) {
            if (texto) texto += ' ';
            texto += observaciones.trim();
        }

        if (!texto) {
            return null;
        }

        // Limpiar el texto: remover caracteres especiales, HTML, etc.
        texto = texto
            .replace(/<[^>]*>/g, '') // Remover HTML tags
            .replace(/[^\w\s\-\.]/g, ' ') // Remover caracteres especiales excepto guiones y puntos
            .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
            .trim();

        // Tomar solo las primeras palabras más relevantes (máximo 10 palabras)
        const palabras = texto.split(' ').slice(0, 10);
        return palabras.join(' ');
    }

    // Función para hacer la búsqueda en MercadoLibre
    async buscarProducto(especificaciones, observaciones) {
        const textoBusqueda = this.prepararTextoBusqueda(especificaciones, observaciones);
        
        if (!textoBusqueda) {
            return {
                success: false,
                error: 'No hay texto suficiente para buscar',
                resultados: []
            };
        }

        try {
            const searchURL = `${this.baseURL}/${encodeURIComponent(textoBusqueda)}`;
            console.log(`🔍 Buscando en MercadoLibre: "${textoBusqueda}"`);

            const response = await axios.get(searchURL, {
                headers: {
                    'User-Agent': this.userAgent.toString(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                },
                timeout: 10000
            });

            return this.extraerResultados(response.data, textoBusqueda);

        } catch (error) {
            console.error('Error en búsqueda de MercadoLibre:', error.message);
            return {
                success: false,
                error: error.message,
                resultados: []
            };
        }
    }

    // Función para extraer los resultados del HTML
    extraerResultados(html, textoBusqueda) {
        try {
            const $ = cheerio.load(html);
            const resultados = [];

            // Selectores para los productos (actualizados según estructura actual de ML)
            const selectoresProducto = [
                'li.ui-search-layout__item:not([picreplacementreplaced])',  // Selector principal actual
                'li.ui-search-layout__item',                               // Fallback sin filtro
                '.ui-search-results .ui-search-result__wrapper',           // Legacy
                '.ui-search-results .ui-search-result',                    // Legacy
                '.results-item',                                           // Legacy
                '.item'                                                    // Legacy
            ];

            let productosEncontrados = false;
            
            for (const selector of selectoresProducto) {
                const productos = $(selector);
                if (productos.length > 0) {
                    productosEncontrados = true;
                    
                    productos.each((index, elemento) => {
                        if (resultados.length >= 3) return false; // Solo los primeros 3

                        const $elemento = $(elemento);
                        
                        // Extraer información del producto
                        const titulo = this.extraerTitulo($elemento);
                        const precio = this.extraerPrecio($elemento);
                        const link = this.extraerLink($elemento);
                        const imagen = this.extraerImagen($elemento);

                        if (titulo && precio && link) {
                            resultados.push({
                                titulo: titulo.trim(),
                                precio: precio.trim(),
                                link: link,
                                imagen: imagen,
                                posicion: resultados.length + 1
                            });
                        }
                    });
                    break;
                }
            }

            if (!productosEncontrados) {
                console.log('No se encontraron productos con los selectores conocidos');
            }

            // Ordenar resultados por precio de menor a mayor
            const resultadosOrdenados = this.ordenarPorPrecio(resultados);

            return {
                success: true,
                textoBusqueda: textoBusqueda,
                cantidadEncontrada: resultadosOrdenados.length,
                resultados: resultadosOrdenados
            };

        } catch (error) {
            console.error('Error extrayendo resultados:', error.message);
            return {
                success: false,
                error: error.message,
                resultados: []
            };
        }
    }

    extraerTitulo($elemento) {
        const selectoresTitulo = [
            'a.poly-component__title',                    // Selector principal actual
            '.ui-search-item__title',                     // Legacy
            '.item__title',                               // Legacy
            'h2 a',                                       // Legacy
            '.item-title a',                              // Legacy
            'a[title]'                                    // Legacy
        ];

        for (const selector of selectoresTitulo) {
            const titulo = $elemento.find(selector).first().text() || $elemento.find(selector).first().attr('title');
            if (titulo && titulo.trim()) {
                return titulo.trim();
            }
        }
        return null;
    }

    extraerPrecio($elemento) {
        const selectoresPrecio = [
            '.andes-money-amount__fraction',                                                    // Selector principal actual
            '.ui-search-price__second-line .price-tag-amount .andes-money-amount__fraction',  // Legacy
            '.price .price-tag .price-tag-amount .andes-money-amount__fraction',              // Legacy
            '.ui-search-price .andes-money-amount__fraction',                                 // Legacy
            '.price-tag-amount .andes-money-amount__fraction',                                // Legacy
            '.price .price-tag-fraction',                                                     // Legacy
            '.item-price',                                                                    // Legacy
            '.price'                                                                          // Legacy
        ];

        for (const selector of selectoresPrecio) {
            const precio = $elemento.find(selector).first().text();
            if (precio && precio.trim()) {
                return `$${precio.trim()}`;
            }
        }
        return 'Precio no disponible';
    }

    extraerLink($elemento) {
        const selectoresLink = [
            'a.poly-component__title',                    // Selector principal actual
            '.ui-search-item__group__element a',          // Legacy
            '.ui-search-item__title-label',               // Legacy
            '.item__title a',                             // Legacy
            'h2 a',                                       // Legacy
            'a'                                           // Legacy
        ];

        for (const selector of selectoresLink) {
            const $link = $elemento.find(selector).first();
            let href = $link.attr('href');
            
            if (href) {
                // Limpiar parámetros innecesarios de la URL de ML
                if (href.includes('#')) {
                    href = href.split('#')[0];
                }
                if (href.includes('&amp;')) {
                    href = href.split('&amp;')[0];
                }
                
                // Asegurar que sea una URL completa
                if (href.startsWith('/')) {
                    href = 'https://www.mercadolibre.com.ar' + href;
                } else if (!href.startsWith('http')) {
                    href = 'https://www.mercadolibre.com.ar/' + href;
                }
                return href;
            }
        }
        return null;
    }

    extraerImagen($elemento) {
        const selectoresImagen = [
            '.ui-search-result-image img',
            '.item-image img',
            'img'
        ];

        for (const selector of selectoresImagen) {
            const src = $elemento.find(selector).first().attr('src') || $elemento.find(selector).first().attr('data-src');
            if (src && src.includes('http')) {
                return src;
            }
        }
        return null;
    }

    // Función para ordenar productos por precio de menor a mayor
    ordenarPorPrecio(productos) {
        const productosOrdenados = productos.sort((a, b) => {
            const precioA = this.extraerNumeroDelPrecio(a.precio);
            const precioB = this.extraerNumeroDelPrecio(b.precio);
            
            // Si no se puede extraer el precio, poner al final
            if (precioA === null && precioB === null) return 0;
            if (precioA === null) return 1;
            if (precioB === null) return -1;
            
            return precioA - precioB; // Orden ascendente (menor a mayor)
        });

        // Actualizar la posición después del ordenamiento
        productosOrdenados.forEach((producto, index) => {
            producto.posicion = index + 1;
        });

        return productosOrdenados;
    }

    // Función para extraer el número del precio (ej: "$603.899" -> 603899)
    extraerNumeroDelPrecio(precioString) {
        if (!precioString || precioString === 'Precio no disponible') {
            return null;
        }
        
        // Remover símbolo de peso, espacios y puntos de miles
        const numeroLimpio = precioString
            .replace(/[$\s]/g, '')           // Remover $ y espacios
            .replace(/\./g, '')              // Remover puntos de miles (ej: 603.899 -> 603899)
            .replace(/,/g, '.');             // Convertir comas decimales a puntos (ej: 1,50 -> 1.50)
        
        const numero = parseFloat(numeroLimpio);
        return isNaN(numero) ? null : numero;
    }

    // Función para agregar delay entre requests
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = MercadoLibreScraper; 