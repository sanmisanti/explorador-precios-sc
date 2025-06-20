const sql = require('mssql');

// Configuración de base de datos SQL Server
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

let pool;

// Función para obtener la conexión a la base de datos
async function getDatabase() {
    if (!pool) {
        try {
            pool = await sql.connect(config);
            console.log('✅ Conectado a SQL Server exitosamente');
        } catch (err) {
            console.error('❌ Error conectando a la base de datos:', err);
            throw err;
        }
    }
    return pool;
}

// Función para ejecutar consultas de precios
async function consultarPrecios(codigo) {
    const pool = await getDatabase();
    
    const query = `
        select
        top 10
	ii.Descripcion,
	plda.EspecificacionesTecnicas,
	plda.Observaciones,
	pl.PrecioUnitario as PrecioPliego,
	pl.NumeroLinea,
	p.NumeroPliego,
	dpa.PrecioUnitarioFinalDescuento as PrecioPreadjudicado,
	pl.PrecioUnitario-dpa.PrecioUnitarioFinalDescuento as PliegoAdj
from pli.PliegoLinea pl
left join pli.Pliego p
	on pl.IdPliego = p.IdPliego
left join ofe.LineaOferta lo
	on pl.IdPliegoLinea = lo.idLineaPliego
left join eva.DetPreAdjudicacion dpa
	on dpa.IdLineaOferta = lo.IdLineaOferta
left JOIN COMPRAS_SALTA.pli.PliegoSolicitudGasto psg
	ON psg.IdPliego = p.IdPliego
left join pli.PliegoLineaDetalleAgrupacion plda
	on plda.IdPliegoLinea = pl.IdPliegoLinea
left join rib.ItemInstanciado ii
	on pl.IdClasificacion = ii.IdItemInstanciado
where 1=1
and plda.EspecificacionesTecnicas <> ''
and plda.Observaciones <> ''
and upper(plda.Observaciones) not like '%ALIN%'
and upper(plda.EspecificacionesTecnicas) not like '%ALIN%'
            and pl.IdClasificacion = @codigo
    `;

    const request = pool.request();
    request.input('codigo', sql.Int, parseInt(codigo));
    
    const result = await request.query(query);
    return result.recordset;
}

// Función para cerrar la conexión (útil para cleanup)
async function closeDatabase() {
    if (pool) {
        await pool.close();
        pool = null;
        console.log('🔐 Conexión a la base de datos cerrada');
    }
}

// Exportaciones CommonJS (compatibilidad hacia atrás)
module.exports = {
    getDatabase,
    consultarPrecios,
    closeDatabase
};

// Exportaciones ES modules
export { getDatabase, consultarPrecios, closeDatabase }; 