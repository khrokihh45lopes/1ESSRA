// js/app.js
// ---------------------------------------------------------------------------
// REGRA DE NEGÓCIO DO EVENTO (Rock in Rio)
// Camada que conhece o formulário: mapeia o DOM, escuta os eventos, valida o
// preenchimento e monta o comprovante. Toda função genérica (validação de CPF,
// máscaras e exportação de arquivo) vive em js/utils.js.
// ---------------------------------------------------------------------------

// 1. Mapeamento dos Elementos do DOM
const campoNome = document.getElementById('campoNome');
const campoCpf = document.getElementById('campoCpf');
const campoEmail = document.getElementById('campoEmail');
const campoCelular = document.getElementById('campoCelular');
const campoArtista = document.getElementById('campoArtista');
const listaArtistas = document.getElementById('listaArtistas');
const btnCadastrar = document.getElementById('btnCadastrar');
const divResultado = document.getElementById('painelResultado');

// 2. Rótulo exibido na busca: [Origem] Nome (Estilo) - Dia do Show
function formatarRotuloArtista(artista) {
    return `[${artista.origem}] ${artista.nome} (${artista.estilo}) - ${artista.dia}`;
}

// 3. FUNÇÃO: Popular o Datalist (Busca Pesquisável de Artistas)
function popularDatalistArtistas(lista) {
    listaArtistas.innerHTML = '';
    lista.forEach((artista) => {
        const option = document.createElement('option');
        option.value = formatarRotuloArtista(artista);
        listaArtistas.appendChild(option);
    });
}

// 4. Recupera o objeto completo da atração a partir do texto digitado.
//    Retorna null quando o usuário digitou algo fora da lista oficial.
function buscarArtistaPeloRotulo(rotulo) {
    const alvo = rotulo.trim().toLowerCase();
    const encontrado = artistasData.find(
        (artista) => formatarRotuloArtista(artista).toLowerCase() === alvo
    );
    return encontrado || null;
}

// 5. Máscaras Dinâmicas (CPF e Celular) - a formatação vem de utils.js
campoCpf.addEventListener('input', function () {
    campoCpf.value = formatarCPF(campoCpf.value);
});

campoCelular.addEventListener('input', function () {
    campoCelular.value = formatarCelular(campoCelular.value);
});

// 6. Gera um número de protocolo único para a intenção de compra.
function gerarProtocolo(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const sufixo = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `RIR-${ano}${mes}${dia}-${sufixo}`;
}

// 7. Monta o texto do comprovante digital (.txt) da intenção de compra.
function gerarComprovanteTXT(dados) {
    const agora = new Date();
    const linha = '='.repeat(52);
    const divisoria = '-'.repeat(52);

    const linhas = [
        linha,
        '         ROCK IN RIO - COMPROVANTE DIGITAL',
        '           INTENÇÃO DE COMPRA DE INGRESSO',
        linha,
        '',
        `PROTOCOLO : ${gerarProtocolo(agora)}`,
        `EMITIDO EM: ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR')}`,
        '',
        divisoria,
        'DADOS DO PARTICIPANTE',
        divisoria,
        `Nome Completo : ${dados.nome}`,
        `CPF           : ${dados.cpf}`,
        `E-mail        : ${dados.email}`,
        `Celular       : ${dados.celular || 'Não informado'}`,
        '',
        divisoria,
        'ATRAÇÃO SELECIONADA',
        divisoria
    ];

    if (dados.atracao) {
        linhas.push(
            `Artista/Banda : ${dados.atracao.nome}`,
            `Estilo        : ${dados.atracao.estilo}`,
            `Origem        : ${dados.atracao.origem}`,
            `Dia do Show   : ${dados.atracao.dia}`
        );
    } else {
        linhas.push(`Atração       : ${dados.artista}`);
    }

    linhas.push(
        '',
        divisoria,
        'Este documento comprova apenas a INTENÇÃO DE COMPRA',
        'e não garante o ingresso. Guarde o número do',
        'protocolo para acompanhar sua reserva.',
        linha
    );

    return linhas.join('\n');
}

// 8. Processamento do Formulário ao Clicar no Botão
btnCadastrar.addEventListener('click', function () {
    // Array com os campos estritamente OBRIGATÓRIOS (Celular mantido fora)
    const camposObrigatorios = [campoNome, campoCpf, campoEmail, campoArtista];
    let temCampoVazio = false;

    // Validação de Preenchimento Obrigatório
    camposObrigatorios.forEach(campo => {
        if (campo.value.trim() === '') {
            campo.classList.add('campo-erro');
            temCampoVazio = true;
        } else {
            campo.classList.remove('campo-erro');
        }
    });

    if (temCampoVazio) {
        divResultado.className = 'msg-erro';
        divResultado.innerText = 'Atenção: Preencha todos os campos obrigatórios em destaque!';
        return;
    }

    // Validação Matemática do CPF (função genérica de utils.js)
    if (!validarCPF(campoCpf.value)) {
        campoCpf.classList.add('campo-erro');
        divResultado.className = 'msg-erro';
        divResultado.innerText = 'Atenção: O CPF digitado é inválido!';
        return;
    }

    // Objeto com os dados da reserva
    const dadosReserva = {
        nome: campoNome.value.trim(),
        cpf: campoCpf.value.trim(),
        email: campoEmail.value.trim(),
        celular: campoCelular.value.trim(), // OPCIONAL
        artista: campoArtista.value.trim(),
        atracao: buscarArtistaPeloRotulo(campoArtista.value)
    };

    // FEATURE: gera o comprovante e dispara o download automático do .txt
    const nomeArquivo = `ingresso_${normalizarParaNomeArquivo(dadosReserva.nome)}.txt`;
    exportarTXT(nomeArquivo, gerarComprovanteTXT(dadosReserva));

    // Mensagem de Sucesso na Tela
    divResultado.className = 'msg-sucesso';
    divResultado.innerText = `Intenção de compra registrada com sucesso para: ${dadosReserva.artista}! Comprovante "${nomeArquivo}" baixado.`;
});

// 9. Inicialização: Carrega os dados de artistasData.js dentro do Datalist
popularDatalistArtistas(artistasData);
