import MercadoLibreColumn from './MercadoLibreColumn';
import styles from '../styles/ResultsTable.module.css';

const ResultsTable = ({ data, count }) => {
    // Funciones auxiliares
    const truncateText = (text, maxLength) => {
        if (!text) return 'N/A';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const formatearPrecio = (precio) => {
        if (precio == null || precio === '') return 'N/A';
        
        const numero = parseFloat(precio);
        if (isNaN(numero)) return 'N/A';
        
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(numero);
    };

    const getDifferenceClass = (diferencia) => {
        if (diferencia == null || diferencia === '') return '';
        const numero = parseFloat(diferencia);
        if (isNaN(numero)) return '';
        
        if (numero > 0) return styles.positivo;
        if (numero < 0) return styles.negativo;
        return '';
    };

    if (!data || data.length === 0) {
        return (
            <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>📭</div>
                <h3>No se encontraron resultados</h3>
                <p>Intenta con un código diferente</p>
            </div>
        );
    }

    return (
        <div className={styles.results}>
            <div className={styles.resultsHeader}>
                <h2>📊 Resultados de la Consulta</h2>
                <span className={styles.recordCount}>
                    {count} registro{count !== 1 ? 's' : ''} encontrado{count !== 1 ? 's' : ''}
                </span>
            </div>
            
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Especificaciones Técnicas</th>
                            <th>Observaciones</th>
                            <th>Precio Pliego</th>
                            <th>Número Línea</th>
                            <th>Número Pliego</th>
                            <th>Precio Preadjudicado</th>
                            <th>Pliego - Adj</th>
                            <th>MercadoLibre</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index} className={styles.tableRow}>
                                <td 
                                    title={row.Descripcion || ''}
                                    className={styles.descripcion}
                                >
                                    {truncateText(row.Descripcion || 'N/A', 40)}
                                </td>
                                <td 
                                    title={row.EspecificacionesTecnicas || ''}
                                    className={styles.especificaciones}
                                >
                                    {truncateText(row.EspecificacionesTecnicas || 'N/A', 30)}
                                </td>
                                <td 
                                    title={row.Observaciones || ''}
                                    className={styles.observaciones}
                                >
                                    {truncateText(row.Observaciones || 'N/A', 30)}
                                </td>
                                <td className={`${styles.precio}`}>
                                    {formatearPrecio(row.PrecioPliego)}
                                </td>
                                <td className={styles.numero}>
                                    {row.NumeroLinea || 'N/A'}
                                </td>
                                <td className={styles.numero}>
                                    {row.NumeroPliego || 'N/A'}
                                </td>
                                <td className={`${styles.precio}`}>
                                    {formatearPrecio(row.PrecioPreadjudicado)}
                                </td>
                                <td className={`${styles.precio} ${getDifferenceClass(row.PliegoAdj)}`}>
                                    {formatearPrecio(row.PliegoAdj)}
                                </td>
                                <td className={styles.mercadoLibre}>
                                    <MercadoLibreColumn data={row.mercadoLibre} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResultsTable; 