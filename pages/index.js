import { useState } from 'react';
import Head from 'next/head';
import SearchForm from '../components/SearchForm';
import ResultsTable from '../components/ResultsTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import styles from '../styles/Home.module.css';

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);

    const handleSearch = async (codigo) => {
        setIsLoading(true);
        setError(null);
        setResults(null);

        try {
            const response = await fetch('/api/consultar-precios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ codigo }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la consulta');
            }

            if (data.success) {
                setResults(data);
            } else {
                throw new Error('Error en la respuesta del servidor');
            }

        } catch (err) {
            console.error('Error al consultar:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseError = () => {
        setError(null);
    };

    return (
        <>
            <Head>
                <title>Explorador de Precios - Next.js</title>
                <meta name="description" content="Consulta información de precios en la base de datos con integración a MercadoLibre" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link 
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
                    rel="stylesheet" 
                />
                <link 
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
                    rel="stylesheet" 
                />
            </Head>

            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>
                            <i className="fas fa-search"></i>
                            Explorador de Precios
                        </h1>
                        <p className={styles.subtitle}>
                            Consulta información de precios en la base de datos con comparación automática en MercadoLibre
                        </p>
                        <div className={styles.features}>
                            <a
                                href="https://saltacompra.gob.ar/BuscarAvanzado.aspx"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${styles.feature} ${styles.featureLink}`}
                            >
                                <i className="fas fa-external-link-alt"></i>
                                SaltaCompra
                            </a>
                        </div>
                    </div>
                </header>

                <main className={styles.main}>
                    <SearchForm 
                        onSearch={handleSearch} 
                        isLoading={isLoading} 
                    />

                    {isLoading && (
                        <LoadingSpinner 
                            message="Consultando clasificación seleccionada y buscando en MercadoLibre..." 
                        />
                    )}

                    {error && (
                        <ErrorMessage 
                            message={error} 
                            onClose={handleCloseError} 
                        />
                    )}

                    {results && !isLoading && !error && (
                        <ResultsTable 
                            data={results.data} 
                            count={results.count} 
                        />
                    )}
                </main>

                <footer className={styles.footer}>
                    <div className={styles.footerContent}>
                        <p>
                            <i className="fas fa-code"></i>
                            Desarrollado con Next.js - Explorador de Precios v2.0
                        </p>
                        <div className={styles.footerLinks}>
                            <span className={styles.footerLink}>
                                <i className="fas fa-server"></i>
                                Backend: Next.js API Routes
                            </span>
                            <span className={styles.footerLink}>
                                <i className="fas fa-react"></i>
                                Frontend: React Components
                            </span>
                            <span className={styles.footerLink}>
                                <i className="fas fa-spider"></i>
                                Web Scraping: Cheerio + Axios
                            </span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
} 