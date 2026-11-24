import axios from 'axios';

export const API_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
});

// URL completa da imagem de um produto (ou null se não tiver)
export function imagemUrl(produto) {
    return produto && produto.imagem ? `${API_URL}/uploads/${produto.imagem}` : null;
}

// Extrai a mensagem de erro retornada pela API
export function erroMensagem(err) {
    return (err.response && err.response.data && err.response.data.message)
        || 'Não foi possível conectar com a API.';
}

export default api;
