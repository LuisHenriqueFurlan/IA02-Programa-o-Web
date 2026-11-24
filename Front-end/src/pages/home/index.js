//Home/Index.js
import { useState, useEffect } from "react";
import useProduto from "../../hooks/useProduto";
import useCarrinho from "../../hooks/useCarrinho";
import useVenda from "../../hooks/useVenda";
import { imagemUrl, erroMensagem } from "../../util/api";

const CHAVE_CARRINHO = "carrinhoId";
const moeda = (v) => `R$ ${Number(v).toFixed(2).replace(".", ",")}`;

const Home = () => {
    const [produtos, setProdutos] = useState([]);
    const [carrinho, setCarrinho] = useState(null);
    const [checkoutAberto, setCheckoutAberto] = useState(false);
    const [dadosVenda, setDadosVenda] = useState({ cliente: "", formaPagamento: "Pix" });
    const [vendaConcluida, setVendaConcluida] = useState(null);

    const produtoApi = useProduto();
    const carrinhoApi = useCarrinho();
    const vendaApi = useVenda();

    // Cria um carrinho novo e guarda o id no navegador
    async function novoCarrinho() {
        const c = await carrinhoApi.create();
        localStorage.setItem(CHAVE_CARRINHO, c.id);
        setCarrinho(c);
        return c;
    }

    // Recupera o carrinho salvo; se não existir/estiver finalizado, cria outro
    async function iniciarCarrinho() {
        const id = localStorage.getItem(CHAVE_CARRINHO);
        if (id) {
            try {
                const c = await carrinhoApi.getById(id);
                if (c.status === "aberto") {
                    setCarrinho(c);
                    return;
                }
            } catch (err) { /* carrinho inexistente: cria outro abaixo */ }
        }
        await novoCarrinho();
    }

    useEffect(() => {
        async function iniciar() {
            try {
                setProdutos(await produtoApi.getAll());
                await iniciarCarrinho();
            } catch (err) {
                alert(erroMensagem(err));
            }
        }
        iniciar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function executar(acao) {
        try {
            setCarrinho(await acao());
        } catch (err) {
            alert(erroMensagem(err));
        }
    }

    const adicionar = (p) => executar(() => carrinhoApi.addItem(carrinho.id, p.id, 1));
    const alterarQuantidade = (item, qtd) => {
        if (qtd < 1) return;
        executar(() => carrinhoApi.updateItem(carrinho.id, item.id, qtd));
    };
    const remover = (item) => executar(() => carrinhoApi.removeItem(carrinho.id, item.id));
    const limpar = () => executar(() => carrinhoApi.clear(carrinho.id));

    async function finalizar(e) {
        e.preventDefault();
        if (!dadosVenda.cliente.trim()) {
            alert("Informe o nome do cliente!");
            return;
        }
        try {
            const resp = await vendaApi.checkout({
                carrinhoId: carrinho.id,
                cliente: dadosVenda.cliente,
                formaPagamento: dadosVenda.formaPagamento,
            });
            setVendaConcluida(resp.venda);
            setCheckoutAberto(false);
            setDadosVenda({ cliente: "", formaPagamento: "Pix" });
            await novoCarrinho();
        } catch (err) {
            alert(erroMensagem(err));
        }
    }

    const itens = carrinho ? carrinho.itens : [];
    const qtdTotal = itens.reduce((s, i) => s + i.quantidade, 0);

    return(
        <div className="container">
            <h1 className="text-center fs-4 mt-3">Loja</h1>

            {vendaConcluida && (
                <div className="alert alert-success alert-dismissible">
                    <strong>Compra #{vendaConcluida.id} finalizada!</strong> Obrigado, {vendaConcluida.cliente}.
                    Total: {moeda(vendaConcluida.total)} ({vendaConcluida.formaPagamento}).
                    <button type="button" className="btn-close" onClick={() => setVendaConcluida(null)}></button>
                </div>
            )}

            <div className="row">
                <div className="col-lg-8">
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                        {produtos.length === 0 && (
                            <p className="text-center text-muted">Nenhum produto disponível.</p>
                        )}
                        {produtos.map((p) => (
                            <div className="col" key={p.id}>
                                <div className="card h-100">
                                    {imagemUrl(p)
                                        ? <img src={imagemUrl(p)} className="card-img-top" alt={p.nome}
                                            style={{ height: 180, objectFit: "cover" }} />
                                        : <div className="bg-light text-muted d-flex align-items-center justify-content-center"
                                            style={{ height: 180 }}>Sem imagem</div>}
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title fs-6">{p.nome}</h5>
                                        <p className="card-text fw-bold">{moeda(p.preco)}</p>
                                        <button className="btn btn-primary mt-auto" onClick={() => adicionar(p)}
                                            disabled={!carrinho}>
                                            Adicionar ao carrinho
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-lg-4 mt-4 mt-lg-0">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between">
                            <strong>Carrinho</strong>
                            <span className="badge bg-secondary">{qtdTotal} item(ns)</span>
                        </div>
                        <ul className="list-group list-group-flush">
                            {itens.length === 0 && (
                                <li className="list-group-item text-center text-muted">Carrinho vazio</li>
                            )}
                            {itens.map((item) => (
                                <li className="list-group-item" key={item.id}>
                                    <div className="d-flex justify-content-between">
                                        <span>{item.produto.nome}</span>
                                        <span>{moeda(Number(item.produto.preco) * item.quantidade)}</span>
                                    </div>
                                    <div className="d-flex align-items-center mt-1">
                                        <button className="btn btn-sm btn-outline-secondary"
                                            onClick={() => alterarQuantidade(item, item.quantidade - 1)}
                                            disabled={item.quantidade <= 1}>-</button>
                                        <span className="mx-2">{item.quantidade}</span>
                                        <button className="btn btn-sm btn-outline-secondary"
                                            onClick={() => alterarQuantidade(item, item.quantidade + 1)}>+</button>
                                        <button className="btn btn-sm btn-outline-danger ms-auto"
                                            onClick={() => remover(item)}>Remover</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="card-footer">
                            <div className="d-flex justify-content-between fw-bold mb-2">
                                <span>Total</span>
                                <span>{moeda(carrinho ? carrinho.total : 0)}</span>
                            </div>
                            {!checkoutAberto ? (
                                <div className="d-flex gap-2">
                                    <button className="btn btn-success flex-grow-1"
                                        disabled={itens.length === 0}
                                        onClick={() => setCheckoutAberto(true)}>
                                        Finalizar compra
                                    </button>
                                    <button className="btn btn-outline-secondary"
                                        disabled={itens.length === 0} onClick={limpar}>
                                        Limpar
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={finalizar}>
                                    <input className="form-control mb-2" placeholder="Nome do cliente"
                                        value={dadosVenda.cliente}
                                        onChange={(e) => setDadosVenda({ ...dadosVenda, cliente: e.target.value })} />
                                    <select className="form-select mb-2" value={dadosVenda.formaPagamento}
                                        onChange={(e) => setDadosVenda({ ...dadosVenda, formaPagamento: e.target.value })}>
                                        <option>Pix</option>
                                        <option>Cartão de crédito</option>
                                        <option>Cartão de débito</option>
                                        <option>Boleto</option>
                                    </select>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-success flex-grow-1" type="submit">Confirmar venda</button>
                                        <button className="btn btn-outline-secondary" type="button"
                                            onClick={() => setCheckoutAberto(false)}>Voltar</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;
