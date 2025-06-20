import { useState, useEffect } from 'react';
import styles from '../styles/SearchForm.module.css';

const SearchForm = ({ onSearch, isLoading }) => {
    const [codigo, setCodigo] = useState('');
    const [clasificaciones, setClasificaciones] = useState([]);
    const [loadingClasificaciones, setLoadingClasificaciones] = useState(true);

    // Cargar clasificaciones al montar el componente
    useEffect(() => {
        const cargarClasificaciones = async () => {
            try {
                const response = await fetch('/api/obtener-clasificaciones');
                const data = await response.json();
                
                if (data.success) {
                    setClasificaciones(data.data);
                } else {
                    console.error('Error al cargar clasificaciones:', data.error);
                }
            } catch (error) {
                console.error('Error al cargar clasificaciones:', error);
            } finally {
                setLoadingClasificaciones(false);
            }
        };

        cargarClasificaciones();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!codigo) {
            alert('Por favor, seleccione una clasificación');
            return;
        }
        
        onSearch(parseInt(codigo));
    };

    const handleClear = () => {
        setCodigo('');
        // Focus en el select después de limpiar
        document.getElementById('codigo-select')?.focus();
    };

    return (
        <div className={styles.searchSection}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label htmlFor="codigo-select" className={styles.label}>
                        Clasificación:
                    </label>
                    <div className={styles.inputContainer}>
                        <select
                            id="codigo-select"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            className={styles.input}
                            disabled={isLoading || loadingClasificaciones}
                            autoFocus
                            required
                        >
                            <option value="">
                                {loadingClasificaciones ? 'Cargando clasificaciones...' : 'Seleccione una clasificación'}
                            </option>
                            {clasificaciones.map((clasificacion) => (
                                <option 
                                    key={clasificacion.IdClasificacion} 
                                    value={clasificacion.IdClasificacion}
                                >
                                    {clasificacion.Descripcion} ({clasificacion.Cantidad} items)
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className={`${styles.button} ${styles.searchButton}`}
                            disabled={isLoading || !codigo}
                        >
                            {isLoading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Consultando...
                                </>
                            ) : (
                                <>
                                    🔍 Consultar
                                </>
                            )}
                        </button>
                        {codigo && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className={`${styles.button} ${styles.clearButton}`}
                                disabled={isLoading}
                            >
                                ✕ Limpiar
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SearchForm; 