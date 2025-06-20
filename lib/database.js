import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getDatabase() {
    return supabase;
}

export async function consultarPrecios(codigo) {
    const { data, error } = await supabase
        .from('pliego_data')
        .select(`
            descripcion,
            especificaciones,
            observaciones,
            precio_unitario,
            numero_linea,
            numero_pliego
        `)
        .eq('clasificacion_id', codigo)
        .limit(10);
    
    if (error) throw error;
    
    // Mapear para mantener compatibilidad con el código existente
    return data.map(row => ({
        Descripcion: row.descripcion,
        EspecificacionesTecnicas: row.especificaciones,
        Observaciones: row.observaciones,
        PrecioUnitario: row.precio_unitario,
        NumeroLinea: row.numero_linea,
        NumeroPliego: row.numero_pliego
         }));
}

// Función para obtener clasificaciones (actualizar también)
export async function obtenerClasificaciones() {
    const { data, error } = await supabase
        .from('clasificaciones')
        .select('id, descripcion, cantidad')
        .order('cantidad', { ascending: false });
    
    if (error) throw error;
    
    // Mapear para mantener compatibilidad
    return data.map(row => ({
        IdClasificacion: row.id,
        Descripcion: row.descripcion,
        Cantidad: row.cantidad
    }));
}