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
    port: 3306,          // A mesma porta que usamos lá na extensão SQLTools hoje!
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

    // Cria a tabela de convidados/membros se ela ainda não existir.
    // Mesmo assim, deixei um arquivo SQL separado para você rodar manualmente se preferir.
    const sqlCriarTabelaMembros = `
        CREATE TABLE IF NOT EXISTS casa_membros (
            id INT AUTO_INCREMENT PRIMARY KEY,
            casa_id INT NOT NULL,
            usuario_id INT NOT NULL,
            tipo VARCHAR(20) NOT NULL DEFAULT 'membro',
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY casa_usuario_unico (casa_id, usuario_id),
            FOREIGN KEY (casa_id) REFERENCES casas(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
    `;

    db.query(sqlCriarTabelaMembros, (erroTabela) => {
        if (erroTabela) {
            console.error('Aviso: não foi possível criar/verificar a tabela casa_membros:', erroTabela);
            return;
        }

        // Garante que casas antigas também tenham o administrador salvo como membro.
        const sqlVincularAdminsAntigos = `
            INSERT IGNORE INTO casa_membros (casa_id, usuario_id, tipo)
            SELECT id, admin_id, 'admin'
            FROM casas
            WHERE admin_id IS NOT NULL
        `;

        db.query(sqlVincularAdminsAntigos, (erroVinculo) => {
            if (erroVinculo) {
                console.error('Aviso: não foi possível vincular admins antigos como membros:', erroVinculo);
            }
        });
    });
});

const imagemPadraoCasa = 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=250&auto=format&fit=crop';

const limparNumeros = (valor = '') => String(valor).replace(/\D/g, '');

const normalizarCasa = (casa, papelExtra) => ({
    id: casa.id,
    nome: casa.nome,
    imagem: casa.imagem || imagemPadraoCasa,
    adminId: casa.admin_id ?? casa.adminId,
    admin_id: casa.admin_id ?? casa.adminId,
    papel: papelExtra || casa.papel || undefined
});

const normalizarMembro = (membro) => ({
    id: membro.id,
    nome: membro.nome,
    imagem: membro.imagem || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    casaId: membro.casa_id ?? membro.casaId,
    casa_id: membro.casa_id ?? membro.casaId,
    tipo: membro.tipo || 'membro'
});

const validarEmail = (email) => {
    const emailLimpo = String(email || '').trim().toLowerCase();
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return regexEmail.test(emailLimpo);
};

const validarSenha = (senha) => {
    const senhaTexto = String(senha || '');
    const temMaisDeSeis = senhaTexto.length > 6;
    const temLetra = /[A-Za-z]/.test(senhaTexto);
    const temNumero = /\d/.test(senhaTexto);
    return temMaisDeSeis && temLetra && temNumero;
};

const validarCPF = (cpf) => {
    const numeros = limparNumeros(cpf);

    if (numeros.length === 0) return true;
    if (numeros.length !== 11) return false;
    if (/^(\d)\1+$/.test(numeros)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(numeros.charAt(i), 10) * (10 - i);
    }

    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.charAt(9), 10)) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(numeros.charAt(i), 10) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;

    return resto === parseInt(numeros.charAt(10), 10);
};

const validarTelefone = (telefone) => {
    const numeros = limparNumeros(telefone);
    if (numeros.length === 0) return true;
    return numeros.length === 10 || numeros.length === 11;
};

// ---------------------------------------------------------
// ROTA 1: CADASTRAR NOVO USUÁRIO
// ---------------------------------------------------------
app.post('/cadastro', (req, res) => {
    const nome = String(req.body.nome || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const senha = String(req.body.senha || '');
    const cpf = limparNumeros(req.body.cpf || '');
    const telefone = limparNumeros(req.body.telefone || '');

    if (!nome) {
        return res.send({ sucesso: false, mensagem: 'Informe seu nome.' });
    }

    if (!email) {
        return res.send({ sucesso: false, mensagem: 'Informe seu e-mail.' });
    }

    if (!validarEmail(email)) {
        return res.send({ sucesso: false, mensagem: 'Digite um e-mail válido.' });
    }

    if (!validarSenha(senha)) {
        return res.send({ sucesso: false, mensagem: 'A senha precisa ter mais de 6 caracteres e conter letras e números.' });
    }

    if (!validarCPF(cpf)) {
        return res.send({ sucesso: false, mensagem: 'CPF inválido. Corrija ou deixe em branco.' });
    }

    if (!validarTelefone(telefone)) {
        return res.send({ sucesso: false, mensagem: 'Telefone inválido. Use DDD + número ou deixe em branco.' });
    }

    const sqlVerificarEmail = 'SELECT id FROM usuarios WHERE email = ? LIMIT 1';

    db.query(sqlVerificarEmail, [email], (erroEmail, resultadoEmail) => {
        if (erroEmail) {
            console.error('Erro ao verificar e-mail:', erroEmail);
            return res.send({ sucesso: false, mensagem: 'Erro ao verificar o e-mail.' });
        }

        if (resultadoEmail.length > 0) {
            return res.send({ sucesso: false, mensagem: 'Este e-mail já está cadastrado. Use outro e-mail ou faça login.' });
        }

        if (cpf) {
            const sqlVerificarCPF = 'SELECT id FROM usuarios WHERE cpf = ? LIMIT 1';

            db.query(sqlVerificarCPF, [cpf], (erroCPF, resultadoCPF) => {
                if (erroCPF) {
                    console.error('Erro ao verificar CPF:', erroCPF);
                    return res.send({ sucesso: false, mensagem: 'Erro ao verificar o CPF.' });
                }

                if (resultadoCPF.length > 0) {
                    return res.send({ sucesso: false, mensagem: 'Este CPF já está cadastrado.' });
                }

                salvarUsuario();
            });
        } else {
            salvarUsuario();
        }
    });

    function salvarUsuario() {
        const sqlCadastrar = 'INSERT INTO usuarios (nome, email, senha, cpf, telefone) VALUES (?, ?, ?, ?, ?)';
        const valores = [nome, email, senha, cpf || null, telefone || null];

        db.query(sqlCadastrar, valores, (erro) => {
            if (erro) {
                console.error('Erro ao salvar usuário:', erro);
                return res.send({ sucesso: false, mensagem: 'Erro ao cadastrar. Verifique se as colunas cpf e telefone existem no banco.' });
            }

            console.log('Novo usuário cadastrado com sucesso!');
            res.send({ sucesso: true, mensagem: 'Usuário cadastrado com sucesso!' });
        });
    }
});
// ---------------------------------------------------------

// ---------------------------------------------------------
// ROTA 2: FAZER LOGIN
// ---------------------------------------------------------
app.post('/login', (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const senha = String(req.body.senha || '');

    const sql = 'SELECT id, nome, email, cpf, telefone, imagem FROM usuarios WHERE email = ? AND senha = ? LIMIT 1';
    
    db.query(sql, [email, senha], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao fazer login:', erro);
            return res.send({ sucesso: false, mensagem: 'Erro no servidor ao tentar logar.' });
        }

        if (resultado.length > 0) {
            console.log('Usuário logado com sucesso!');
            res.send({ sucesso: true, mensagem: 'Login realizado com sucesso!', usuario: resultado[0] });
        } else {
            console.log('Tentativa de login falhou (email ou senha incorretos).');
            res.send({ sucesso: false, mensagem: 'E-mail ou senha incorretos.' });
        }
    });
});
// ---------------------------------------------------------

// ---------------------------------------------------------
// ROTA 3: CRIAR UMA NOVA CASA
// ---------------------------------------------------------
app.post('/casas', (req, res) => {
    const nome = String(req.body.nome || '').trim();
    const imagem = req.body.imagem || imagemPadraoCasa;
    const admin_id = req.body.admin_id;

    if (!nome || !admin_id) {
        return res.send({ sucesso: false, mensagem: 'Nome da casa e usuário são obrigatórios.' });
    }

    const sqlCriarCasa = 'INSERT INTO casas (nome, imagem, admin_id) VALUES (?, ?, ?)';
    
    db.query(sqlCriarCasa, [nome, imagem, admin_id], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao criar casa:', erro);
            return res.send({ sucesso: false, mensagem: 'Erro ao salvar a casa no banco.' });
        }

        const casaCriada = normalizarCasa({
            id: resultado.insertId,
            nome,
            imagem,
            admin_id
        }, 'Administrador');

        const sqlAdicionarAdminComoMembro = `
            INSERT INTO casa_membros (casa_id, usuario_id, tipo)
            VALUES (?, ?, 'admin')
            ON DUPLICATE KEY UPDATE tipo = 'admin'
        `;

        db.query(sqlAdicionarAdminComoMembro, [resultado.insertId, admin_id], (erroMembro) => {
            if (erroMembro) {
                console.error('Aviso: casa criada, mas erro ao salvar admin como membro:', erroMembro);
            }

            res.send({
                sucesso: true,
                mensagem: 'Casa criada com sucesso no banco de dados!',
                casa: casaCriada
            });
        });
    });
});
// ---------------------------------------------------------

// ---------------------------------------------------------
// ROTA 4: ENTRAR COMO CONVIDADO EM UMA CASA PELO ID
// ---------------------------------------------------------
app.post('/casas/entrar', (req, res) => {
    const codigoCasa = limparNumeros(req.body.codigo || req.body.casa_id || '');
    const usuarioId = req.body.usuario_id;

    if (!codigoCasa) {
        return res.send({ sucesso: false, mensagem: 'Digite o ID da casa.' });
    }

    if (!usuarioId) {
        return res.send({ sucesso: false, mensagem: 'Usuário não identificado. Faça login novamente.' });
    }

    const sqlBuscarCasa = 'SELECT id, nome, imagem, admin_id FROM casas WHERE id = ? LIMIT 1';

    db.query(sqlBuscarCasa, [codigoCasa], (erroCasa, resultadoCasa) => {
        if (erroCasa) {
            console.error('Erro ao procurar casa:', erroCasa);
            return res.send({ sucesso: false, mensagem: 'Erro ao procurar a casa.' });
        }

        if (resultadoCasa.length === 0) {
            return res.send({ sucesso: false, mensagem: 'Nenhuma casa encontrada com esse ID.' });
        }

        const casa = resultadoCasa[0];

        if (String(casa.admin_id) === String(usuarioId)) {
            return res.send({
                sucesso: true,
                mensagem: 'Você já é o administrador desta casa.',
                casa: normalizarCasa(casa, 'Administrador')
            });
        }

        const sqlVerificarMembro = 'SELECT id FROM casa_membros WHERE casa_id = ? AND usuario_id = ? LIMIT 1';

        db.query(sqlVerificarMembro, [casa.id, usuarioId], (erroMembro, resultadoMembro) => {
            if (erroMembro) {
                console.error('Erro ao verificar membro:', erroMembro);
                return res.send({ sucesso: false, mensagem: 'Erro ao verificar sua entrada na casa.' });
            }

            if (resultadoMembro.length > 0) {
                return res.send({
                    sucesso: true,
                    mensagem: 'Você já participa desta casa.',
                    casa: normalizarCasa(casa, 'Membro')
                });
            }

            const sqlEntrarCasa = "INSERT INTO casa_membros (casa_id, usuario_id, tipo) VALUES (?, ?, 'membro')";

            db.query(sqlEntrarCasa, [casa.id, usuarioId], (erroEntrar) => {
                if (erroEntrar) {
                    console.error('Erro ao entrar na casa:', erroEntrar);
                    return res.send({ sucesso: false, mensagem: 'Erro ao entrar na casa.' });
                }

                res.send({
                    sucesso: true,
                    mensagem: 'Você entrou na casa como convidado!',
                    casa: normalizarCasa(casa, 'Membro')
                });
            });
        });
    });
});
// ---------------------------------------------------------

// ---------------------------------------------------------
// ROTA 5: BUSCAR CASAS DO USUÁRIO, COMO ADMIN OU CONVIDADO
// ---------------------------------------------------------
app.get('/casas/:usuarioId', (req, res) => {
    const usuarioId = req.params.usuarioId;

    const sql = `
        SELECT DISTINCT
            c.id,
            c.nome,
            c.imagem,
            c.admin_id,
            CASE
                WHEN c.admin_id = ? THEN 'Administrador'
                ELSE 'Membro'
            END AS papel
        FROM casas c
        LEFT JOIN casa_membros cm ON cm.casa_id = c.id
        WHERE c.admin_id = ? OR cm.usuario_id = ?
        ORDER BY c.id DESC
    `;
    
    db.query(sql, [usuarioId, usuarioId, usuarioId], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar casas:', erro);
            return res.send({ sucesso: false, mensagem: 'Erro ao buscar as casas.' });
        }

        res.send({ sucesso: true, casas: resultados.map(casa => normalizarCasa(casa, casa.papel)) });
    });
});
// ---------------------------------------------------------

// ---------------------------------------------------------
// ROTA 6: BUSCAR MEMBROS DE UMA CASA
// ---------------------------------------------------------
app.get('/casas/:casaId/membros', (req, res) => {
    const casaId = req.params.casaId;

    const sql = `
        SELECT u.id, u.nome, u.imagem, c.id AS casa_id, 'admin' AS tipo
        FROM casas c
        INNER JOIN usuarios u ON u.id = c.admin_id
        WHERE c.id = ?

        UNION

        SELECT u.id, u.nome, u.imagem, cm.casa_id, cm.tipo
        FROM casa_membros cm
        INNER JOIN usuarios u ON u.id = cm.usuario_id
        INNER JOIN casas c ON c.id = cm.casa_id
        WHERE cm.casa_id = ? AND cm.usuario_id <> c.admin_id
    `;

    db.query(sql, [casaId, casaId], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar membros:', erro);
            return res.send({ sucesso: false, mensagem: 'Erro ao buscar membros da casa.' });
        }

        res.send({ sucesso: true, membros: resultados.map(normalizarMembro) });
    });
});
// ---------------------------------------------------------

// ---------------------------------------------------------
// ROTA 7: EXCLUIR CASA DO USUÁRIO LOGADO
// ---------------------------------------------------------
app.delete('/casas/:casaId', (req, res) => {
    const casaId = req.params.casaId;
    const { admin_id } = req.body;

    if (!admin_id) {
        return res.send({ sucesso: false, mensagem: 'Usuário obrigatório para excluir a casa.' });
    }

    db.query('DELETE FROM casa_membros WHERE casa_id = ?', [casaId], (erroMembros) => {
        if (erroMembros) {
            console.error('Erro ao excluir membros da casa:', erroMembros);
            return res.send({ sucesso: false, mensagem: 'Erro ao excluir os membros da casa.' });
        }

        db.query('DELETE FROM pets WHERE casa_id = ?', [casaId], (erroPets) => {
            if (erroPets) {
                console.error('Erro ao excluir pets da casa:', erroPets);
                return res.send({ sucesso: false, mensagem: 'Erro ao excluir os pets da casa.' });
            }

            db.query('DELETE FROM casas WHERE id = ? AND admin_id = ?', [casaId, admin_id], (erroCasa, resultado) => {
                if (erroCasa) {
                    console.error('Erro ao excluir casa:', erroCasa);
                    return res.send({ sucesso: false, mensagem: 'Erro ao excluir casa.' });
                }

                if (resultado.affectedRows === 0) {
                    return res.send({ sucesso: false, mensagem: 'Casa não encontrada para este usuário.' });
                }

                res.send({ sucesso: true, mensagem: 'Casa excluída com sucesso!' });
            });
        });
    });
});
// ---------------------------------------------------------

// 5. Ligando o servidor na porta 3000
app.listen(3000, '0.0.0.0', () => {
    console.log('Servidor do MeuPets rodando na porta 3000! 🚀');
});
