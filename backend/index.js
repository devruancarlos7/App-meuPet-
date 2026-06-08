// 1. Importando as ferramentas
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

// 2. Inicializando o servidor
const app = express();
app.use(cors());
app.use(express.json()); // Permite que o servidor entenda dados em JSON (como senhas e emails do celular)

// 3. Configurando a conexão com o seu Banco de Dados (MeuPets)
const db = mysql.createConnection({
    host: 'localhost',
    port: 3307,          // A mesma porta que usamos lá na extensão SQLTools hoje!
    user: 'root',
    password: '',        // A famosa senha vazia do XAMPP
    database: 'meupets'  // O nome da pasta do banco que criamos
});

// 4. Testando a conexão
db.connect((erro) => {
    if (erro) {
        console.error('Ops! Erro ao conectar ao banco de dados:', erro);
        return;
    }
    console.log('Conectado com sucesso ao banco MeuPets! 🐾');
});

// ---------------------------------------------------------
// ROTA 1: CADASTRAR NOVO USUÁRIO
// ---------------------------------------------------------
app.post('/cadastro', (req, res) => {
    // 1. Pegando os dados que vão vir da tela do celular
    const { nome, email, senha } = req.body;

    // 2. O comando SQL para inserir na tabela 'usuarios'
    const sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
    
    // 3. Executando o comando no banco de dados
    db.query(sql, [nome, email, senha], (erro, resultado) => {
        if (erro) {
            console.error("Erro ao salvar usuário:", erro);
            return res.send({ sucesso: false, mensagem: "Erro ao cadastrar." });
        }
        console.log("Novo usuário cadastrado com sucesso!");
        res.send({ sucesso: true, mensagem: "Usuário cadastrado com sucesso!" });
    });
});
// ---------------------------------------------------------

// ---------------------------------------------------------
// ---------------------------------------------------------
// ROTA 2: FAZER LOGIN
// ---------------------------------------------------------
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
    
    db.query(sql, [email, senha], (erro, resultado) => {
        if (erro) {
            console.error("Erro ao fazer login:", erro);
            return res.send({ sucesso: false, mensagem: "Erro no servidor ao tentar logar." });
        }

        if (resultado.length > 0) {
            console.log("Usuário logado com sucesso!");
            // 👉 O SEGREDO ESTÁ AQUI: Enviamos resultado para pegar a pessoa exata!
            res.send({ sucesso: true, mensagem: "Login realizado com sucesso!", usuario: resultado });
        } else {
            console.log("Tentativa de login falhou (email ou senha incorretos).");
            res.send({ sucesso: false, mensagem: "E-mail ou senha incorretos." });
        }
    });
});
// ---------------------------------------------------------

// 5. Ligando o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor do MeuPets rodando na porta 3000! 🚀');
});