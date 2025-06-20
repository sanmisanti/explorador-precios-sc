export function handleAPIError(error, res) {
    console.error('API Error:', error);
    
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({ error: 'Error interno del servidor' });
    } else {
        res.status(500).json({ error: error.message });
    }
}