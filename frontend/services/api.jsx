import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const getSurveys = async () => {
    const response = await axios.get(`${API_URL}/surveys/`);
    return response.data;
}

export { getSurveys };
