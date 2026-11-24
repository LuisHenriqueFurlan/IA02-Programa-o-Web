// Produtos/index.js
import { useState, useEffect, useRef } from "react";
import InputGroup from "../../components/inputGroup";
import useProduto from "../../hooks/useProduto";
import { imagemUrl, erroMensagem } from "../../util/api";

const TIPOS_IMAGEM = ["image/jpeg", "image/png"];

const Produtos = () => {
    const [produto, setProduto] = useState({ nome: "", preco: "" });
    const [imagem, setImagem] = useState(null);
    const [editandoId, setEditandoId] = useState(null);
    const [lstProdutos, setLstProdutos] = useState([]);
    const arquivoRef = useRef(null);
    const { getAll, create, update, remove } = useProduto();

    async function carregar() {
        try {
            setLstProdutos(await getAll());
        } catch (err) {
            alert(erroMensagem(err));
        }
    }

    useEffect(() => {
        carregar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function validateProduto() {
        if (!produto.nome || !produto.nome.trim()) {
            alert("O nome é obrigatório!");
            return false;
        }
        if (produto.preco === "" || produto.preco === undefined) {
            alert("O preço é obrigatório!");
            return false;
        }
        if (Number(produto.preco) < 0) {
            alert("O preço não pode ser negativo!");
            return false;
        }
        return true;
    }

    function handleChange(e) {
        setProduto({ ...produto, [e.target.name]: e.target.value });
    }

    function handleImagem(e) {
        const arquivo = e.target.files[0];
        if (!arquivo) {
            setImagem(null);
            return;
        }
        const ext = arquivo.name.toLowerCase();
        const extValida = ext.endsWith(".jpeg") || ext.endsWith(".jpg") || ext.endsWith(".png");
        if (!TIPOS_IMAGEM.includes(arquivo.type) || !extValida) {
            alert("A imagem deve ser .jpeg ou .png!");
            e.target.value = "";
            setImagem(null);
            return;
        }
        setImagem(arquivo);
    }

    function limparForm() {
        setProduto({ nome: "", preco: "" });
        setImagem(null);
        setEditandoId(null);
        if (arquivoRef.current) arquivoRef.current.value = "";
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validateProduto()) return;

        const dados = new FormData();
        dados.append("nome", produto.nome.trim());
        dados.append("preco", produto.preco);
        if (imagem) dados.append("imagem", imagem);

        try {
            if (editandoId) {
                await update(editandoId, dados);
            } else {
                await create(dados);
            }
            limparForm();
            carregar();
        } catch (err) {
            alert(erroMensagem(err));
        }
    }

    function handleEditar(p) {
        setEditandoId(p.id);
        setProduto({ nome: p.nome, preco: p.preco });
        setImagem(null);
        if (arquivoRef.current) arquivoRef.current.value = "";
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleExcluir(p) {
        if (!window.confirm(`Excluir o produto "${p.nome}"?`)) return;
        try {
            await remove(p.id);
            if (editandoId === p.id) limparForm();
            carregar();
        } catch (err) {
            alert(erroMensagem(err));
        }
    }

    return(
        <div className="container">
            <h1 className="text-center fs-4 mt-3">Produtos</h1>
            <div>
                <form onSubmit={handleSubmit}>
                    <InputGroup
                        label="Nome"
                        onChange={handleChange}
                        type="text"
                        placeholder="Nome do Produto"
                        name="nome"
                        value={produto.nome}/>
                    <InputGroup
                        label="Preço"
                        onChange={handleChange}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Preço do Produto"
                        name="preco"
                        value={produto.preco}/>
                    <InputGroup
                        label="Imagem"
                        onChange={handleImagem}
                        type="file"
                        accept=".jpeg,.jpg,.png,image/jpeg,image/png"
                        name="imagem"
                        inputRef={arquivoRef}/>
                    {editandoId && (
                        <p className="text-muted small">
                            Editando produto #{editandoId}. Deixe a imagem em branco para manter a atual.
                        </p>
                    )}

                    <button className="btn btn-primary" type="submit">
                        {editandoId ? "Atualizar" : "Salvar"}
                    </button>
                    {editandoId && (
                        <button className="btn btn-secondary ms-2" type="button" onClick={limparForm}>
                            Cancelar
                        </button>
                    )}
                </form>
            </div>

            <table className="table table-striped mt-3 align-middle">
                <thead>
                    <tr>
                        <th>Imagem</th>
                        <th>Nome</th>
                        <th>Preço</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {lstProdutos.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center">Nenhum produto cadastrado</td>
                        </tr>)
                        :(
                            lstProdutos.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        {imagemUrl(p)
                                            ? <img src={imagemUrl(p)} alt={p.nome} style={{ width: 60, height: 60, objectFit: "cover" }} />
                                            : <span className="text-muted small">Sem imagem</span>}
                                    </td>
                                    <td>{p.nome}</td>
                                    <td>R$ {Number(p.preco).toFixed(2)}</td>
                                    <td>
                                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditar(p)}>Editar</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleExcluir(p)}>Excluir</button>
                                    </td>
                                </tr>
                            ))
                        )
                    }
                </tbody>
            </table>
        </div>
    )
}

export default Produtos;
