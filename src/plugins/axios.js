// axios.js
import axios from 'axios'

const axiosIns = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // '/api'
})

export default axiosIns
