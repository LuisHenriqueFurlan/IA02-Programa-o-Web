import api from '../util/api';

function useCarrinho(){
    async function create() {
        const response = await api.post('/Carrinho/create');
        return response.data;
    }
    async function getById(id) {
        const response = await api.get(`/Carrinho/getById/${id}`);
        return response.data;
    }
    async function addItem(id, produtoId, quantidade = 1) {
        const response = await api.post(`/Carrinho/addItem/${id}`, { produtoId, quantidade });
        return response.data;
    }
    async function updateItem(id, itemId, quantidade) {
        const response = await api.patch(`/Carrinho/updateItem/${id}/${itemId}`, { quantidade });
        return response.data;
    }
    async function removeItem(id, itemId) {
        const response = await api.delete(`/Carrinho/removeItem/${id}/${itemId}`);
        return response.data;
    }
    async function clear(id) {
        const response = await api.delete(`/Carrinho/clear/${id}`);
        return response.data;
    }

    return {create, getById, addItem, updateItem, removeItem, clear, };
}

export default useCarrinho;
