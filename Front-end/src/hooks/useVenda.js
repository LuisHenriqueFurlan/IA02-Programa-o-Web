import api from '../util/api';

function useVenda(){
    async function checkout(dados) {
        const response = await api.post('/Venda/checkout', dados);
        return response.data;
    }
    async function getAll() {
        const response = await api.get('/Venda/getAll');
        return response.data;
    }
    async function getById(id) {
        const response = await api.get(`/Venda/getById/${id}`);
        return response.data;
    }

    return {checkout, getAll, getById, };
}

export default useVenda;
