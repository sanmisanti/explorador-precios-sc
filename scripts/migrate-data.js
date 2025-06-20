const fs = require('fs');
const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Clave de servicio, no la anónima
);

async function migrateData() {
    // Conectar a SQL Server
    const sqlPool = await sql.connect(configSQLServer);
    
    // Migrar clasificaciones
    const clasificaciones = await sqlPool.request().query(`
        SELECT pl.IdClasificacion, c.Descripcion, COUNT(*) as Cantidad 
        FROM pli.PliegoLinea pl
        INNER JOIN rib.ItemInstanciado ii ON pl.IdClasificacion = ii.IdItemInstanciado
        INNER JOIN rib.Clasificacion c ON ii.IdClasificacion = c.IdClasificacion
        GROUP BY c.Descripcion, pl.IdClasificacion
    `);
    
    // Insertar en Supabase
    const { data, error } = await supabase
        .from('clasificaciones')
        .insert(
            clasificaciones.recordset.map(row => ({
                id: row.IdClasificacion,
                descripcion: row.Descripcion,
                cantidad: row.Cantidad
            }))
        );
    
    if (error) {
        console.error('❌ Error en migración:', error);
    } else {
        console.log('✅ Migración completada');
    }
}

migrateData();