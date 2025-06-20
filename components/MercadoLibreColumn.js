import styles from '../styles/MercadoLibre.module.css';

const MercadoLibreColumn = ({ data }) => {
    // Funciones auxiliares
    const truncateText = (text, maxLength) => {
        if (!text) return 'N/A';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Si no hay datos de ML
    if (!data) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <span>Buscando...</span>
                </div>
            </div>
        );
    }

    // Si hay error en la búsqueda
    if (!data.success) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    ⚠️ {data.error || 'Error de búsqueda'}
                </div>
            </div>
        );
    }

    // Si no hay resultados
    if (!data.resultados || data.resultados.length === 0) {
        return (
            <div className={styles.container}>
                {data.textoBusqueda && (
                    <div className={styles.searchTerm}>
                        🔍 "{truncateText(data.textoBusqueda, 25)}"
                    </div>
                )}
                <div className={styles.noResults}>
                    Sin resultados en ML
                </div>
            </div>
        );
    }

    // Resultados exitosos
    return (
        <div className={styles.container}>
            {data.textoBusqueda && (
                <div className={styles.searchTerm}>
                    🔍 "{truncateText(data.textoBusqueda, 25)}"
                </div>
            )}
            
            {data.resultados.length > 1 && (
                <div className={styles.sortIndicator}>
                    📊 Ordenado por precio ⬆️
                </div>
            )}

            <div className={styles.results}>
                {data.resultados.map((producto, index) => {
                    const iconoPosicion = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                    
                    return (
                        <div key={index} className={styles.product}>
                            <div 
                                className={styles.productTitle}
                                title={producto.titulo}
                            >
                                {truncateText(producto.titulo, 50)}
                            </div>
                            <div className={styles.productPrice}>
                                <span className={styles.positionIcon}>{iconoPosicion}</span>
                                {producto.precio}
                            </div>
                            <a 
                                href={producto.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.productLink}
                            >
                                🔗 Ver en ML
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MercadoLibreColumn; 