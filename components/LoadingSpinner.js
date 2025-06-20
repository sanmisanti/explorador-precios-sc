import styles from '../styles/LoadingSpinner.module.css';

const LoadingSpinner = ({ message = "Cargando..." }) => {
    return (
        <div className={styles.loading}>
            <div className={styles.spinner}>
                <div className={styles.spinnerIcon}></div>
            </div>
            <span className={styles.message}>{message}</span>
        </div>
    );
};

export default LoadingSpinner; 