// js/utils.js
// ---------------------------------------------------------------------------
// FUNÇÕES UTILITÁRIAS GENÉRICAS
// Camada sem regra de negócio: nada aqui conhece o formulário do Rock in Rio.
// São funções puras/reutilizáveis (validação, formatação e exportação de
// arquivos) que poderiam ser copiadas para qualquer outro projeto.
// ---------------------------------------------------------------------------

// Remove qualquer caractere que não seja dígito.
function apenasNumeros(valor) {
    return String(valor).replace(/\D/g, '');
}

// Aplica a máscara 000.000.000-00 progressivamente enquanto o usuário digita.
function formatarCPF(valor) {
    let cpf = apenasNumeros(valor).slice(0, 11);
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return cpf;
}

// Aplica a máscara (00) 00000-0000 progressivamente enquanto o usuário digita.
function formatarCelular(valor) {
    let celular = apenasNumeros(valor).slice(0, 11);
    celular = celular.replace(/^(\d{2})(\d)/g, '($1) $2');
    celular = celular.replace(/(\d{5})(\d)/, '$1-$2');
    return celular;
}

// Validação matemática algorítmica do CPF (dígitos verificadores).
function validarCPF(cpf) {
    // Limpa pontuações mantendo apenas números
    cpf = apenasNumeros(cpf);

    // Verifica tamanho de 11 dígitos ou sequências repetidas
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    // Cálculo do 1º Dígito Verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    // Cálculo do 2º Dígito Verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true; // CPF Válido
}

// Converte um texto livre em um "slug" seguro para nome de arquivo:
// "João da Silva Júnior" -> "joao_da_silva_junior"
function normalizarParaNomeArquivo(texto) {
    return String(texto)
        .normalize('NFD')                 // separa a letra do acento
        .replace(/[̀-ͯ]/g, '') // remove os acentos separados
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_')      // tudo que não é letra/número vira _
        .replace(/^_+|_+$/g, '')          // remove _ das pontas
        || 'usuario';                     // fallback se sobrar string vazia
}

// Gera um arquivo .txt em memória (Blob) e dispara o download automático.
function exportarTXT(nomeArquivo, conteudo) {
    // 1. Cria o arquivo em memória com codificação UTF-8
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });

    // 2. Cria uma URL temporária apontando para esse Blob
    const url = URL.createObjectURL(blob);

    // 3. Usa um link invisível para forçar o download
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();

    // 4. Limpa o link e libera a memória ocupada pelo Blob
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
