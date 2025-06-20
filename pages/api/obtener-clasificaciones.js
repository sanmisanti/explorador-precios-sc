import { getDatabase } from '../../lib/database';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const pool = await getDatabase();
        
        const query = `
            select pl.IdClasificacion, c.Descripcion, count(c.Descripcion) as Cantidad 
            from pli.PliegoLinea pl
            inner join rib.ItemInstanciado ii
                on pl.IdClasificacion = ii.IdItemInstanciado
            inner join rib.Clasificacion c
                on ii.IdClasificacion = c.IdClasificacion
            group by c.Descripcion, pl.IdClasificacion
            order by count(c.Descripcion) desc
        `;

        const result = await pool.request().query(query);
        
        return res.status(200).json({
            success: true,
            data: result.recordset
        });

    } catch (error) {
        console.error('Error al obtener clasificaciones:', error);
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener clasificaciones'
        });
    }
} 