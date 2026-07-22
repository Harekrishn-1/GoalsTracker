import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    withCredentials: true,          // httpOnly cookie har request ke saath jaayegi
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosClient;
