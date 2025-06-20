import { consultarPrecios } from '../../lib/database';
import MercadoLibreScraper from '../../lib/mercadoLibreScraper';

const scraper = new MercadoLibreScraper();

export default async function handler(req, res) {
    // Solo permitir método POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Método no permitido. Use POST.' 
        });
    }

    try {
        const { codigo } = req.body;
        
        // Validación de entrada
        if (!codigo) {
            return res.status(400).json({ 
                error: 'Se requiere un código para realizar la consulta' 
            });
        }

        if (isNaN(codigo) || parseInt(codigo) <= 0) {
            return res.status(400).json({ 
                error: 'El código debe ser un número entero positivo' 
            });
        }

        console.log(`🔍 Consultando código: ${codigo}`);

        // Consulta a la base de datos
        const resultadosSQL = await consultarPrecios(codigo);

        if (!resultadosSQL || resultadosSQL.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron resultados para el código ingresado',
                data: [],
                count: 0
            });
        }

        // Agregar búsqueda en MercadoLibre para cada resultado
        const resultadosConML = await Promise.allSettled(
            resultadosSQL.map(async (row) => {
                try {
                    const busquedaML = await scraper.buscarProducto(
                        row.EspecificacionesTecnicas,
                        row.Observaciones
                    );
                    
                    return {
                        ...row,
                        mercadoLibre: busquedaML
                    };
                } catch (error) {
                    console.error('Error buscando en MercadoLibre:', error);
                    return {
                        ...row,
                        mercadoLibre: {
                            success: false,
                            error: 'Error en búsqueda',
                            resultados: []
                        }
                    };
                }
            })
        );

        // Extraer solo los valores exitosos
        const resultadosFinales = resultadosConML.map(result => 
            result.status === 'fulfilled' ? result.value : result.reason
        );

        res.status(200).json({
            success: true,
            data: resultadosFinales,
            count: resultadosFinales.length,
            message: `Consulta exitosa para código ${codigo}`
        });

    } catch (error) {
        console.error('Error en consulta:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Error de base de datos'
        });
    }
} 