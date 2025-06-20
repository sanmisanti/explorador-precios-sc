import styles from '../styles/ErrorMessage.module.css';

const ErrorMessage = ({ message, onClose }) => {
    return (
        <div className={styles.error}>
            <div className={styles.content}>
                <span className={styles.icon}>⚠️</span>
                <span className={styles.message}>{message}</span>
                {onClose && (
                    <button 
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Cerrar mensaje de error"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorMessage; 