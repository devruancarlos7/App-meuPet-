// 1. Importando as ferramentas
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

// 2. Inicializando o servidor
const app = express();
app.use(cors());

// IMPORTANTE: limite maior para salvar imagens em base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 3. Configurando a conexão com o seu Banco de Dados
const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'meupets'
});

// ---------------------------------------------------------
// FUNÇÕES AUXILIARES
// ---------------------------------------------------------
const imagemPadraoCasa = 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=250&auto=format&fit=crop';

const limparNumeros = (valor = '') => String(valor).replace(/\D/g, '');

const gerarCodigoConvite = () => {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let codigo = 'CASA-';

    for (let i = 0; i < 8; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    return codigo;
};

const criarCodigoConviteUnico = (callback) => {
    const codigo = gerarCodigoConvite();

    db.query(
        'SELECT id FROM casas WHERE codigo_convite = ? LIMIT 1',
        [codigo],
        (erro, resultados) => {
            if (erro) {
                return callback(erro);
            }

            if (resultados.length > 0) {
                return criarCodigoConviteUnico(callback);
            }

            callback(null, codigo);
        }
    );
};

const verificarColunaExiste = (tabela, coluna, callback) => {
    db.query(
        `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
        `,
        [tabela, coluna],
        (erro, resultados) => {
            if (erro) {
                console.error(`Erro ao verificar coluna ${coluna} da tabela ${tabela}:`, erro.message);
                return callback(false);
            }

            callback(resultados.length > 0);
        }
    );
};

const garantirColuna = (tabela, coluna, definicao) => {
    verificarColunaExiste(tabela, coluna, (existe) => {
        if (!existe) {
            db.query(
                `ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${definicao}`,
                (erroAdicionar) => {
                    if (erroAdicionar) {
                        console.error(`Erro ao adicionar coluna ${coluna} na tabela ${tabela}:`, erroAdicionar.message);
                    } else {
                        console.log(`Coluna ${coluna} adicionada na tabela ${tabela}.`);
                    }
                }
            );
        }
    });
};

const garantirColunaImagem = (tabela) => {
    verificarColunaExiste(tabela, 'imagem', (existe) => {
        if (!existe) {
            db.query(
                `ALTER TABLE ${tabela} ADD COLUMN imagem LONGTEXT NULL`,
                (erroAdicionar) => {
                    if (erroAdicionar) {
                        console.error(`Erro ao adicionar imagem na tabela ${tabela}:`, erroAdicionar.message);
                    } else {
                        console.log(`Coluna imagem adicionada na tabela ${tabela}.`);
                    }
                }
            );
        } else {
            db.query(
                `ALTER TABLE ${tabela} MODIFY imagem LONGTEXT NULL`,
                (erroModificar) => {
                    if (erroModificar) {
                        console.error(`Aviso ao ajustar imagem da tabela ${tabela}:`, erroModificar.message);
                    }
                }
            );
        }
    });
};

const gerarCodigosParaCasasAntigas = () => {
    db.query(
        `
        UPDATE casas
        SET codigo_convite = CONCAT('CASA-', UPPER(SUBSTRING(MD5(CONCAT(id, nome, NOW())), 1, 8)))
        WHERE codigo_convite IS NULL OR codigo_convite = ''
        `,
        (erroAtualizarCodigos) => {
            if (erroAtualizarCodigos) {
                console.error('Aviso ao gerar códigos para casas antigas:', erroAtualizarCodigos.message);
            }
        }
    );
};

const garantirCodigoConviteCasa = () => {
    verificarColunaExiste('casas', 'codigo_convite', (existe) => {
        if (!existe) {
            db.query(
                'ALTER TABLE casas ADD COLUMN codigo_convite VARCHAR(30) UNIQUE NULL',
                (erroAdicionar) => {
                    if (erroAdicionar) {
                        console.error('Erro ao adicionar codigo_convite:', erroAdicionar.message);
                        return;
                    }

                    console.log('Coluna codigo_convite adicionada na tabela casas.');
                    gerarCodigosParaCasasAntigas();
                }
            );
        } else {
            gerarCodigosParaCasasAntigas();
        }
    });
};

const garantirTabelaCasaMembros = () => {
    db.query(
        `
        CREATE TABLE IF NOT EXISTS casa_membros (
            id INT AUTO_INCREMENT PRIMARY KEY,
            casa_id INT NOT NULL,
            usuario_id INT NOT NULL,
            tipo VARCHAR(20) NOT NULL DEFAULT 'convidado',
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unico_membro_casa (casa_id, usuario_id)
        )
        `,
        (erro) => {
            if (erro) {
                console.error('Erro ao garantir tabela casa_membros:', erro.message);
                return;
            }

            db.query(
                `ALTER TABLE casa_membros MODIFY tipo VARCHAR(20) NOT NULL DEFAULT 'convidado'`,
                (erroAlterarTipo) => {
                    if (erroAlterarTipo) {
                        console.error('Aviso ao ajustar tipo da tabela casa_membros:', erroAlterarTipo.message);
                    }
                }
            );
        }
    );
};

const garantirTabelaAgendamentos = () => {
    db.query(
        `
        CREATE TABLE IF NOT EXISTS agendamentos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pet_id INT NOT NULL,
            texto_data VARCHAR(20) NOT NULL,
            texto_horario VARCHAR(20) NOT NULL,
            compromisso VARCHAR(255) NOT NULL,
            observacao TEXT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `,
        (erro) => {
            if (erro) {
                console.error('Erro ao garantir tabela agendamentos:', erro.message);
            }
        }
    );
};

const garantirTabelaMetas = () => {
    db.query(
        `
        CREATE TABLE IF NOT EXISTS metas_cuidados (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pet_id INT NOT NULL UNIQUE,

            comida_meta INT DEFAULT 3,
            comida_feita INT DEFAULT 0,
            comida_periodo VARCHAR(50) DEFAULT 'Diário',

            passeio_meta INT DEFAULT 2,
            passeio_feita INT DEFAULT 0,
            passeio_periodo VARCHAR(50) DEFAULT 'Diário',

            curativo_meta INT DEFAULT 0,
            curativo_feita INT DEFAULT 0,
            curativo_periodo VARCHAR(50) DEFAULT 'Mensal',

            vet_meta INT DEFAULT 1,
            vet_feita INT DEFAULT 0,
            vet_periodo VARCHAR(50) DEFAULT 'Semestral',

            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `,
        (erro) => {
            if (erro) {
                console.error('Erro ao garantir tabela metas_cuidados:', erro.message);
            }
        }
    );
};

const limparAgendamentosExpiradosDoPet = (petId, callback) => {
    const sql = `
        DELETE FROM agendamentos
        WHERE pet_id = ?
        AND texto_data IS NOT NULL
        AND texto_data <> ''
        AND STR_TO_DATE(
            CONCAT(texto_data, ' ', COALESCE(NULLIF(texto_horario, ''), '00:00')),
            '%d/%m/%Y %H:%i'
        ) IS NOT NULL
        AND DATE_ADD(
            STR_TO_DATE(
                CONCAT(texto_data, ' ', COALESCE(NULLIF(texto_horario, ''), '00:00')),
                '%d/%m/%Y %H:%i'
            ),
            INTERVAL 24 HOUR
        ) < NOW()
    `;

    db.query(sql, [petId], callback);
};

// ---------------------------------------------------------
// 4. TESTANDO CONEXÃO E AJUSTANDO BANCO
// ---------------------------------------------------------
db.connect((erro) => {
    if (erro) {
        console.error('Ops! Erro ao conectar ao banco de dados:', erro);
        return;
    }

    console.log('Conectado ao banco de dados com sucesso! 🐾');

    garantirColunaImagem('casas');
    garantirColunaImagem('pets');
    garantirColunaImagem('usuarios');

    garantirColuna('usuarios', 'cpf', 'VARCHAR(20) NULL');
    garantirColuna('usuarios', 'telefone', 'VARCHAR(20) NULL');

    garantirCodigoConviteCasa();
    garantirTabelaCasaMembros();
    garantirTabelaAgendamentos();
    garantirTabelaMetas();
});

// ---------------------------------------------------------
// TESTE PARA SABER SE O INDEX CERTO ESTÁ RODANDO
// ---------------------------------------------------------
app.get('/teste-servidor', (req, res) => {
    res.status(200).json({
        sucesso: true,
        mensagem: 'Index.js correto rodando!'
    });
});

// ---------------------------------------------------------
// ROTA 1: CADASTRAR NOVO USUÁRIO
// ---------------------------------------------------------
app.post('/cadastro', (req, res) => {
    const nome = String(req.body.nome || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const senha = String(req.body.senha || '');
    const cpf = limparNumeros(req.body.cpf || '');
    const telefone = limparNumeros(req.body.telefone || '');

    if (!nome || !email || !senha) {
        return res.status(400).json({
            sucesso: false,
            erro: 'Nome, email e senha são obrigatórios.'
        });
    }

    db.query(
        'SELECT * FROM usuarios WHERE email = ?',
        [email],
        (erro, resultados) => {
            if (erro) {
                console.error('Erro ao verificar email:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao verificar email.'
                });
            }

            if (resultados.length > 0) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Este email já está cadastrado!'
                });
            }

            db.query(
                'INSERT INTO usuarios (nome, email, senha, cpf, telefone) VALUES (?, ?, ?, ?, ?)',
                [nome, email, senha, cpf || null, telefone || null],
                (errInsert) => {
                    if (errInsert) {
                        console.error('Erro ao cadastrar usuário:', errInsert);
                        return res.status(500).json({
                            sucesso: false,
                            erro: 'Erro ao cadastrar usuário.',
                            detalhes: errInsert.message
                        });
                    }

                    res.status(201).json({
                        sucesso: true,
                        mensagem: 'Usuário cadastrado com sucesso!'
                    });
                }
            );
        }
    );
});

// ---------------------------------------------------------
// ROTA 2: FAZER LOGIN
// ---------------------------------------------------------
app.post('/login', (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const senha = String(req.body.senha || '');

    db.query(
        'SELECT * FROM usuarios WHERE email = ? AND senha = ? LIMIT 1',
        [email, senha],
        (erro, resultados) => {
            if (erro) {
                console.error('Erro ao fazer login:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao fazer login.'
                });
            }

            if (resultados.length > 0) {
                return res.status(200).json({
                    sucesso: true,
                    mensagem: 'Login realizado com sucesso!',
                    usuario: resultados[0]
                });
            }

            res.status(401).json({
                sucesso: false,
                erro: 'Email ou senha incorretos.'
            });
        }
    );
});

// ---------------------------------------------------------
// ROTA 3: CRIAR UMA NOVA CASA
// ---------------------------------------------------------
app.post('/casas', (req, res) => {
    const nome = String(req.body.nome || '').trim();
    const imagem = req.body.imagem || imagemPadraoCasa;
    const admin_id = req.body.admin_id;

    if (!nome || !admin_id) {
        return res.status(400).json({
            sucesso: false,
            erro: 'Nome da casa e admin_id são obrigatórios.'
        });
    }

    criarCodigoConviteUnico((erroCodigo, codigoConvite) => {
        if (erroCodigo) {
            console.error('Erro ao gerar código de convite:', erroCodigo);
            return res.status(500).json({
                sucesso: false,
                erro: 'Erro ao gerar código de convite.'
            });
        }

        db.query(
            'INSERT INTO casas (nome, imagem, codigo_convite, admin_id) VALUES (?, ?, ?, ?)',
            [nome, imagem, codigoConvite, admin_id],
            (erro, result) => {
                if (erro) {
                    console.error('Erro ao criar casa:', erro);
                    return res.status(500).json({
                        sucesso: false,
                        erro: 'Erro ao criar casa.',
                        detalhes: erro.message
                    });
                }

                const casaId = result.insertId;

                db.query(
                    `
                    INSERT INTO casa_membros (casa_id, usuario_id, tipo)
                    VALUES (?, ?, 'admin')
                    ON DUPLICATE KEY UPDATE tipo = 'admin'
                    `,
                    [casaId, admin_id],
                    (err2) => {
                        if (err2) {
                            console.error('Erro ao vincular membro à casa:', err2);
                            return res.status(500).json({
                                sucesso: false,
                                erro: 'Erro ao vincular membro à casa.',
                                detalhes: err2.message
                            });
                        }

                        res.status(201).json({
                            sucesso: true,
                            mensagem: 'Casa criada com sucesso!',
                            id: casaId,
                            casa: {
                                id: casaId,
                                nome,
                                imagem,
                                codigo_convite: codigoConvite,
                                codigoConvite,
                                admin_id,
                                adminId: admin_id,
                                papel: 'admin'
                            }
                        });
                    }
                );
            }
        );
    });
});

// ---------------------------------------------------------
// ROTA 4: SOLICITAR ENTRADA EM UMA CASA
// ATENÇÃO: agora entra SOMENTE por codigo_convite.
// O id numérico da casa continua existindo no banco,
// mas não serve mais para convidado entrar.
// ---------------------------------------------------------
app.post('/casas/entrar', (req, res) => {
    let codigoCasa = String(req.body.codigo || '').trim().toUpperCase();
    const usuarioId = req.body.usuario_id;

    codigoCasa = codigoCasa.replace(/\s/g, '');
    codigoCasa = codigoCasa.replace(/[^A-Z0-9-]/g, '');

    if (!codigoCasa.startsWith('CASA-')) {
        if (codigoCasa.startsWith('CASA')) {
            codigoCasa = 'CASA-' + codigoCasa.replace('CASA', '').replace('-', '');
        } else {
            codigoCasa = 'CASA-' + codigoCasa;
        }
    }

    if (!codigoCasa || !usuarioId) {
        return res.status(400).json({
            sucesso: false,
            erro: 'Código de convite e usuário são obrigatórios.'
        });
    }

    if (codigoCasa.length < 11) {
        return res.status(400).json({
            sucesso: false,
            erro: 'O código de convite precisa ter mais de 5 caracteres depois de CASA-.'
        });
    }

    db.query(
        `
        SELECT *
        FROM casas
        WHERE UPPER(codigo_convite) = ?
        LIMIT 1
        `,
        [codigoCasa],
        (erro, casas) => {
            if (erro) {
                console.error('Erro ao buscar casa pelo código:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao buscar casa.',
                    detalhes: erro.message
                });
            }

            if (casas.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Casa não encontrada! Verifique se o código de convite está correto.'
                });
            }

            const casa = casas[0];

            if (String(casa.admin_id) === String(usuarioId)) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Você já é o líder desta casa.'
                });
            }

            db.query(
                'SELECT * FROM casa_membros WHERE casa_id = ? AND usuario_id = ?',
                [casa.id, usuarioId],
                (err, membros) => {
                    if (err) {
                        console.error('Erro ao verificar membros:', err);
                        return res.status(500).json({
                            sucesso: false,
                            erro: 'Erro ao verificar membros.',
                            detalhes: err.message
                        });
                    }

                    if (membros.length > 0) {
                        const membro = membros[0];

                        if (membro.tipo === 'pendente') {
                            return res.status(400).json({
                                sucesso: false,
                                erro: 'Sua solicitação já está pendente. Aguarde o líder aprovar.'
                            });
                        }

                        return res.status(400).json({
                            sucesso: false,
                            erro: 'Você já faz parte desta casa.'
                        });
                    }

                    db.query(
                        'INSERT INTO casa_membros (casa_id, usuario_id, tipo) VALUES (?, ?, "pendente")',
                        [casa.id, usuarioId],
                        (errInsert) => {
                            if (errInsert) {
                                console.error('Erro ao solicitar entrada:', errInsert);
                                return res.status(500).json({
                                    sucesso: false,
                                    erro: 'Erro ao solicitar entrada.',
                                    detalhes: errInsert.message
                                });
                            }

                            res.status(201).json({
                                sucesso: true,
                                mensagem: 'Solicitação enviada! Aguarde o líder aprovar sua entrada.',
                                casa: {
                                    id: casa.id,
                                    nome: casa.nome,
                                    codigo_convite: casa.codigo_convite,
                                    codigoConvite: casa.codigo_convite
                                }
                            });
                        }
                    );
                }
            );
        }
    );
});

// ---------------------------------------------------------
// ROTA 5: BUSCAR CASAS DO USUÁRIO
// ---------------------------------------------------------
app.get('/casas/:usuarioId', (req, res) => {
    const usuarioId = req.params.usuarioId;

    const query = `
        SELECT 
            c.*,
            c.admin_id AS adminId,
            c.codigo_convite AS codigoConvite,
            cm.tipo AS papel
        FROM casas c
        JOIN casa_membros cm ON c.id = cm.casa_id
        WHERE cm.usuario_id = ? AND cm.tipo != 'pendente'
        ORDER BY c.id DESC
    `;

    db.query(query, [usuarioId], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar casas:', erro);
            return res.status(500).json({
                sucesso: false,
                erro: 'Erro ao buscar casas.',
                detalhes: erro.message
            });
        }

        res.status(200).json(resultados);
    });
});

// ---------------------------------------------------------
// ROTA 6: BUSCAR MEMBROS DE UMA CASA
// ---------------------------------------------------------
app.get('/casas/:casaId/membros', (req, res) => {
    const casaId = req.params.casaId;

    const query = `
        SELECT 
            u.id,
            u.nome,
            u.imagem,
            cm.tipo,
            cm.casa_id,
            cm.casa_id AS casaId
        FROM usuarios u
        JOIN casa_membros cm ON u.id = cm.usuario_id
        WHERE cm.casa_id = ?
        ORDER BY
            CASE WHEN cm.tipo = 'admin' THEN 0 ELSE 1 END,
            u.nome ASC
    `;

    db.query(query, [casaId], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar membros:', erro);
            return res.status(500).json({
                sucesso: false,
                erro: 'Erro ao buscar membros.',
                detalhes: erro.message
            });
        }

        res.status(200).json(resultados);
    });
});

// ---------------------------------------------------------
// ROTA 7: EXCLUIR CASA
// ---------------------------------------------------------
app.delete('/casas/:casaId', (req, res) => {
    const casaId = req.params.casaId;

    db.query(
        'DELETE a FROM agendamentos a INNER JOIN pets p ON p.id = a.pet_id WHERE p.casa_id = ?',
        [casaId],
        (errAgendamentos) => {
            if (errAgendamentos) {
                console.error('Erro ao limpar agendamentos:', errAgendamentos);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao limpar agendamentos da casa.'
                });
            }

            db.query(
                'DELETE m FROM metas_cuidados m INNER JOIN pets p ON p.id = m.pet_id WHERE p.casa_id = ?',
                [casaId],
                (errMetas) => {
                    if (errMetas) {
                        console.error('Erro ao limpar metas:', errMetas);
                        return res.status(500).json({
                            sucesso: false,
                            erro: 'Erro ao limpar metas da casa.'
                        });
                    }

                    db.query(
                        'DELETE FROM casa_membros WHERE casa_id = ?',
                        [casaId],
                        (err1) => {
                            if (err1) {
                                console.error('Erro ao limpar membros da casa:', err1);
                                return res.status(500).json({
                                    sucesso: false,
                                    erro: 'Erro ao limpar membros da casa.'
                                });
                            }

                            db.query(
                                'DELETE FROM pets WHERE casa_id = ?',
                                [casaId],
                                (err2) => {
                                    if (err2) {
                                        console.error('Erro ao limpar pets da casa:', err2);
                                        return res.status(500).json({
                                            sucesso: false,
                                            erro: 'Erro ao limpar pets da casa.'
                                        });
                                    }

                                    db.query(
                                        'DELETE FROM casas WHERE id = ?',
                                        [casaId],
                                        (err3) => {
                                            if (err3) {
                                                console.error('Erro ao excluir casa:', err3);
                                                return res.status(500).json({
                                                    sucesso: false,
                                                    erro: 'Erro ao excluir casa.'
                                                });
                                            }

                                            res.status(200).json({
                                                sucesso: true,
                                                mensagem: 'Casa excluída com sucesso!'
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

// ---------------------------------------------------------
// ROTA 8: CADASTRAR UM NOVO PET
// ---------------------------------------------------------
app.post('/pets', (req, res) => {
    const nome = String(req.body.nome || '').trim();
    const tipo = String(req.body.tipo || '').trim();
    const raca = String(req.body.raca || '').trim();
    const nascimento = String(req.body.nascimento || '').trim();
    const imagem = req.body.imagem || null;
    const casa_id = req.body.casa_id;

    if (!nome || !casa_id) {
        return res.status(400).json({
            sucesso: false,
            erro: 'Nome do pet e ID da casa são obrigatórios!'
        });
    }

    db.query(
        'INSERT INTO pets (nome, tipo, raca, nascimento, imagem, casa_id) VALUES (?, ?, ?, ?, ?, ?)',
        [nome, tipo, raca, nascimento, imagem, casa_id],
        (erro, resultado) => {
            if (erro) {
                console.error('Erro ao cadastrar pet:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao cadastrar pet.',
                    detalhes: erro.message
                });
            }

            res.status(201).json({
                sucesso: true,
                mensagem: 'Pet cadastrado com sucesso!',
                id: resultado.insertId,
                pet: {
                    id: resultado.insertId,
                    nome,
                    tipo,
                    raca,
                    nascimento,
                    imagem,
                    casa_id,
                    casaId: casa_id
                }
            });
        }
    );
});

// ---------------------------------------------------------
// ROTA 9: LISTAR PETS DE UMA CASA
// ---------------------------------------------------------
app.get('/casas/:casaId/pets', (req, res) => {
    const casaId = req.params.casaId;

    db.query(
        'SELECT *, casa_id AS casaId FROM pets WHERE casa_id = ? ORDER BY id DESC',
        [casaId],
        (erro, resultados) => {
            if (erro) {
                console.error('Erro ao buscar pets:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao buscar pets.',
                    detalhes: erro.message
                });
            }

            res.status(200).json(resultados);
        }
    );
});

// ---------------------------------------------------------
// ROTA 10: CADASTRAR UM NOVO AGENDAMENTO
// ---------------------------------------------------------
app.post('/agendamentos', (req, res) => {
    const {
        pet_id,
        texto_data,
        texto_horario,
        compromisso,
        observacao
    } = req.body;

    if (!pet_id || !texto_data || !texto_horario || !compromisso) {
        return res.status(400).json({
            sucesso: false,
            erro: 'Dados obrigatórios do agendamento estão faltando!'
        });
    }

    db.query(
        'INSERT INTO agendamentos (pet_id, texto_data, texto_horario, compromisso, observacao) VALUES (?, ?, ?, ?, ?)',
        [pet_id, texto_data, texto_horario, compromisso, observacao || null],
        (erro, resultado) => {
            if (erro) {
                console.error('Erro ao criar agendamento:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao criar agendamento.',
                    detalhes: erro.message
                });
            }

            res.status(201).json({
                sucesso: true,
                mensagem: 'Agendamento criado com sucesso!',
                id: resultado.insertId
            });
        }
    );
});

// ---------------------------------------------------------
// ROTA 11: LISTAR AGENDAMENTOS DE UM PET
// ---------------------------------------------------------
app.get('/pets/:petId/agendamentos', (req, res) => {
    const petId = req.params.petId;

    limparAgendamentosExpiradosDoPet(petId, (erroLimpeza) => {
        if (erroLimpeza) {
            console.error('Erro ao limpar agendamentos expirados:', erroLimpeza);
            return res.status(500).json({
                sucesso: false,
                erro: 'Erro ao limpar agendamentos expirados.'
            });
        }

        const query = `
            SELECT *
            FROM agendamentos
            WHERE pet_id = ?
            ORDER BY STR_TO_DATE(
                CONCAT(texto_data, ' ', COALESCE(NULLIF(texto_horario, ''), '00:00')),
                '%d/%m/%Y %H:%i'
            ) ASC, id DESC
        `;

        db.query(query, [petId], (erro, resultados) => {
            if (erro) {
                console.error('Erro ao buscar agendamentos:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao buscar agendamentos.',
                    detalhes: erro.message
                });
            }

            res.status(200).json(resultados);
        });
    });
});

// ---------------------------------------------------------
// ROTA 12: BUSCAR AS METAS DE UM PET
// ---------------------------------------------------------
app.get('/pets/:petId/metas', (req, res) => {
    const petId = req.params.petId;

    db.query(
        'SELECT * FROM metas_cuidados WHERE pet_id = ? LIMIT 1',
        [petId],
        (erro, resultados) => {
            if (erro) {
                console.error('Erro ao buscar metas:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao buscar metas.',
                    detalhes: erro.message
                });
            }

            res.status(200).json(resultados);
        }
    );
});

// ---------------------------------------------------------
// ROTA 13: ATUALIZAR OU CRIAR AS METAS DO PET
// ---------------------------------------------------------
app.post('/pets/:petId/metas', (req, res) => {
    const petId = req.params.petId;

    const {
        comida_meta,
        comida_feita,
        comida_periodo,
        passeio_meta,
        passeio_feita,
        passeio_periodo,
        curativo_meta,
        curativo_feita,
        curativo_periodo,
        vet_meta,
        vet_feita,
        vet_periodo
    } = req.body;

    const dados = {
        comida_meta: Number(comida_meta ?? 3),
        comida_feita: Number(comida_feita ?? 0),
        comida_periodo: comida_periodo || 'Diário',

        passeio_meta: Number(passeio_meta ?? 2),
        passeio_feita: Number(passeio_feita ?? 0),
        passeio_periodo: passeio_periodo || 'Diário',

        curativo_meta: Number(curativo_meta ?? 0),
        curativo_feita: Number(curativo_feita ?? 0),
        curativo_periodo: curativo_periodo || 'Mensal',

        vet_meta: Number(vet_meta ?? 1),
        vet_feita: Number(vet_feita ?? 0),
        vet_periodo: vet_periodo || 'Semestral'
    };

    db.query(
        'SELECT * FROM metas_cuidados WHERE pet_id = ? LIMIT 1',
        [petId],
        (erro, resultados) => {
            if (erro) {
                console.error('Erro ao verificar metas:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao verificar metas no banco.'
                });
            }

            if (resultados.length > 0) {
                const queryUpdate = `
                    UPDATE metas_cuidados SET
                        comida_meta = ?,
                        comida_feita = ?,
                        comida_periodo = ?,

                        passeio_meta = ?,
                        passeio_feita = ?,
                        passeio_periodo = ?,

                        curativo_meta = ?,
                        curativo_feita = ?,
                        curativo_periodo = ?,

                        vet_meta = ?,
                        vet_feita = ?,
                        vet_periodo = ?
                    WHERE pet_id = ?
                `;

                db.query(
                    queryUpdate,
                    [
                        dados.comida_meta,
                        dados.comida_feita,
                        dados.comida_periodo,

                        dados.passeio_meta,
                        dados.passeio_feita,
                        dados.passeio_periodo,

                        dados.curativo_meta,
                        dados.curativo_feita,
                        dados.curativo_periodo,

                        dados.vet_meta,
                        dados.vet_feita,
                        dados.vet_periodo,

                        petId
                    ],
                    (err) => {
                        if (err) {
                            console.error('Erro ao atualizar metas:', err);
                            return res.status(500).json({
                                sucesso: false,
                                erro: 'Erro ao atualizar metas.',
                                detalhes: err.message
                            });
                        }

                        res.status(200).json({
                            sucesso: true,
                            mensagem: 'Metas atualizadas com sucesso!'
                        });
                    }
                );
            } else {
                const queryInsert = `
                    INSERT INTO metas_cuidados (
                        pet_id,
                        comida_meta,
                        comida_feita,
                        comida_periodo,
                        passeio_meta,
                        passeio_feita,
                        passeio_periodo,
                        curativo_meta,
                        curativo_feita,
                        curativo_periodo,
                        vet_meta,
                        vet_feita,
                        vet_periodo
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.query(
                    queryInsert,
                    [
                        petId,
                        dados.comida_meta,
                        dados.comida_feita,
                        dados.comida_periodo,
                        dados.passeio_meta,
                        dados.passeio_feita,
                        dados.passeio_periodo,
                        dados.curativo_meta,
                        dados.curativo_feita,
                        dados.curativo_periodo,
                        dados.vet_meta,
                        dados.vet_feita,
                        dados.vet_periodo
                    ],
                    (err) => {
                        if (err) {
                            console.error('Erro ao criar metas:', err);
                            return res.status(500).json({
                                sucesso: false,
                                erro: 'Erro ao criar novas metas.',
                                detalhes: err.message
                            });
                        }

                        res.status(201).json({
                            sucesso: true,
                            mensagem: 'Metas criadas com sucesso!'
                        });
                    }
                );
            }
        }
    );
});

// ---------------------------------------------------------
// ROTA 14: APROVAR MEMBRO PENDENTE
// ---------------------------------------------------------
app.put('/casas/membros/aprovar', (req, res) => {
    const { casa_id, usuario_id } = req.body;

    db.query(
        'UPDATE casa_membros SET tipo = "convidado" WHERE casa_id = ? AND usuario_id = ?',
        [casa_id, usuario_id],
        (err, resultado) => {
            if (err) {
                console.error('Erro ao aprovar membro:', err);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao aprovar membro.',
                    detalhes: err.message
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Solicitação não encontrada.'
                });
            }

            res.status(200).json({
                sucesso: true,
                mensagem: 'Membro aprovado com sucesso!'
            });
        }
    );
});

// ---------------------------------------------------------
// ROTA 15: REJEITAR MEMBRO PENDENTE
// ---------------------------------------------------------
app.delete('/casas/membros/rejeitar', (req, res) => {
    const { casa_id, usuario_id } = req.body;

    db.query(
        'DELETE FROM casa_membros WHERE casa_id = ? AND usuario_id = ? AND tipo = "pendente"',
        [casa_id, usuario_id],
        (err) => {
            if (err) {
                console.error('Erro ao rejeitar membro:', err);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao rejeitar membro.',
                    detalhes: err.message
                });
            }

            res.status(200).json({
                sucesso: true,
                mensagem: 'Solicitação rejeitada.'
            });
        }
    );
});

// ---------------------------------------------------------
// ROTA 16: EXCLUIR UM PET DA CASA COM POST
// ---------------------------------------------------------
app.post('/pets/:petId/excluir', (req, res) => {
    const petId = req.params.petId;

    db.query(
        'DELETE FROM agendamentos WHERE pet_id = ?',
        [petId],
        (erroAgendamentos) => {
            if (erroAgendamentos) {
                console.error('Erro ao excluir agendamentos do pet:', erroAgendamentos);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao excluir agendamentos do pet.'
                });
            }

            db.query(
                'DELETE FROM metas_cuidados WHERE pet_id = ?',
                [petId],
                (erroMetas) => {
                    if (erroMetas) {
                        console.error('Erro ao excluir metas do pet:', erroMetas);
                        return res.status(500).json({
                            sucesso: false,
                            erro: 'Erro ao excluir metas do pet.'
                        });
                    }

                    db.query(
                        'DELETE FROM pets WHERE id = ?',
                        [petId],
                        (erroPet, resultado) => {
                            if (erroPet) {
                                console.error('Erro ao excluir pet:', erroPet);
                                return res.status(500).json({
                                    sucesso: false,
                                    erro: 'Erro ao excluir o pet.'
                                });
                            }

                            if (resultado.affectedRows === 0) {
                                return res.status(404).json({
                                    sucesso: false,
                                    erro: 'Pet não encontrado.'
                                });
                            }

                            res.status(200).json({
                                sucesso: true,
                                mensagem: 'Pet removido com sucesso!'
                            });
                        }
                    );
                }
            );
        }
    );
});

// ---------------------------------------------------------
// ROTA 17: EXCLUIR UM PET DA CASA COM DELETE
// ---------------------------------------------------------
app.delete('/pets/:petId', (req, res) => {
    const petId = req.params.petId;

    db.query(
        'DELETE FROM agendamentos WHERE pet_id = ?',
        [petId],
        (erroAgendamentos) => {
            if (erroAgendamentos) {
                console.error('Erro ao excluir agendamentos do pet:', erroAgendamentos);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao excluir agendamentos do pet.'
                });
            }

            db.query(
                'DELETE FROM metas_cuidados WHERE pet_id = ?',
                [petId],
                (erroMetas) => {
                    if (erroMetas) {
                        console.error('Erro ao excluir metas do pet:', erroMetas);
                        return res.status(500).json({
                            sucesso: false,
                            erro: 'Erro ao excluir metas do pet.'
                        });
                    }

                    db.query(
                        'DELETE FROM pets WHERE id = ?',
                        [petId],
                        (erroPet, resultado) => {
                            if (erroPet) {
                                console.error('Erro ao excluir pet:', erroPet);
                                return res.status(500).json({
                                    sucesso: false,
                                    erro: 'Erro ao excluir o pet.'
                                });
                            }

                            if (resultado.affectedRows === 0) {
                                return res.status(404).json({
                                    sucesso: false,
                                    erro: 'Pet não encontrado.'
                                });
                            }

                            res.status(200).json({
                                sucesso: true,
                                mensagem: 'Pet removido com sucesso!'
                            });
                        }
                    );
                }
            );
        }
    );
});

// ---------------------------------------------------------
// ROTA 18: EXCLUIR UM AGENDAMENTO DO CALENDÁRIO
// ---------------------------------------------------------
app.delete('/agendamentos/:id', (req, res) => {
    const agendamentoId = req.params.id;

    db.query(
        'DELETE FROM agendamentos WHERE id = ?',
        [agendamentoId],
        (erro, resultado) => {
            if (erro) {
                console.error('Erro ao excluir agendamento:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao excluir agendamento.',
                    detalhes: erro.message
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Agendamento não encontrado.'
                });
            }

            res.status(200).json({
                sucesso: true,
                mensagem: 'Agendamento removido com sucesso!'
            });
        }
    );
});

// ---------------------------------------------------------
// ROTA 19: ATUALIZAR IMAGEM DA CASA
// ---------------------------------------------------------
app.put('/casas/:id/imagem', (req, res) => {
    const casaId = req.params.id;
    const { imagem } = req.body;

    console.log('----------------------------------------');
    console.log('PEDIDO PARA ATUALIZAR IMAGEM DA CASA');
    console.log('CASA ID:', casaId);
    console.log('IMAGEM RECEBIDA?', imagem ? 'SIM' : 'NÃO');
    console.log('TAMANHO DA IMAGEM:', imagem ? imagem.length : 0);
    console.log('----------------------------------------');

    if (!imagem) {
        return res.status(400).json({
            sucesso: false,
            erro: 'Nenhuma imagem foi enviada.'
        });
    }

    db.query(
        'UPDATE casas SET imagem = ? WHERE id = ?',
        [imagem, casaId],
        (erro, resultado) => {
            if (erro) {
                console.error('Erro ao atualizar imagem da casa:', erro);

                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao atualizar imagem da casa.',
                    detalhes: erro.message,
                    codigo: erro.code
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Casa não encontrada.'
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Imagem da casa atualizada com sucesso!',
                imagem
            });
        }
    );
});

// ---------------------------------------------------------
// ROTA 20: ATUALIZAR IMAGEM DO PET
// ---------------------------------------------------------
app.put('/pets/:id/imagem', (req, res) => {
    const petId = req.params.id;
    const { imagem } = req.body;

    console.log('----------------------------------------');
    console.log('PEDIDO PARA ATUALIZAR IMAGEM DO PET');
    console.log('PET ID:', petId);
    console.log('IMAGEM RECEBIDA?', imagem ? 'SIM' : 'NÃO');
    console.log('TAMANHO DA IMAGEM:', imagem ? imagem.length : 0);
    console.log('----------------------------------------');

    if (!imagem) {
        return res.status(400).json({
            sucesso: false,
            erro: 'Nenhuma imagem foi enviada.'
        });
    }

    db.query(
        'UPDATE pets SET imagem = ? WHERE id = ?',
        [imagem, petId],
        (erro, resultado) => {
            if (erro) {
                console.error('Erro ao atualizar imagem do pet:', erro);

                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao atualizar imagem do pet.',
                    detalhes: erro.message,
                    codigo: erro.code
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Pet não encontrado.'
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Imagem do pet atualizada com sucesso!',
                imagem
            });
        }
    );
});

// ---------------------------------------------------------
// ROTA 21: ATUALIZAR IMAGEM DO USUÁRIO
// ---------------------------------------------------------
app.put('/usuarios/:id/imagem', (req, res) => {
    const usuarioId = req.params.id;
    const { imagem } = req.body;

    console.log('----------------------------------------');
    console.log('PEDIDO PARA ATUALIZAR IMAGEM DO USUÁRIO');
    console.log('USUÁRIO ID:', usuarioId);
    console.log('IMAGEM RECEBIDA?', imagem ? 'SIM' : 'NÃO');
    console.log('TAMANHO DA IMAGEM:', imagem ? imagem.length : 0);
    console.log('----------------------------------------');

    if (!usuarioId) {
        return res.status(400).json({
            sucesso: false,
            erro: 'ID do usuário não informado.'
        });
    }

    if (!imagem) {
        return res.status(400).json({
            sucesso: false,
            erro: 'Nenhuma imagem foi enviada.'
        });
    }

    db.query(
        'UPDATE usuarios SET imagem = ? WHERE id = ?',
        [imagem, usuarioId],
        (erro, resultado) => {
            if (erro) {
                console.error('Erro ao atualizar imagem do usuário:', erro);

                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao atualizar imagem do usuário.',
                    detalhes: erro.message,
                    codigo: erro.code
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Usuário não encontrado.'
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Imagem do usuário atualizada com sucesso!',
                imagem
            });
        }
    );
});

// ---------------------------------------------------------
// ROTA 22: EXCLUIR CONTA DO USUÁRIO PERMANENTEMENTE
// ---------------------------------------------------------
app.delete('/usuarios/:id', (req, res) => {
    const usuarioId = req.params.id;

    if (!usuarioId) {
        return res.status(400).json({
            sucesso: false,
            erro: 'ID do usuário não informado.'
        });
    }

    db.beginTransaction((erroTransacao) => {
        if (erroTransacao) {
            console.error('Erro ao iniciar transação:', erroTransacao);

            return res.status(500).json({
                sucesso: false,
                erro: 'Erro ao iniciar exclusão da conta.',
                detalhes: erroTransacao.message
            });
        }

        const cancelar = (erro, mensagem) => {
            console.error(mensagem, erro);

            db.rollback(() => {
                return res.status(500).json({
                    sucesso: false,
                    erro: mensagem,
                    detalhes: erro?.message
                });
            });
        };

        db.query(
            'SELECT id FROM usuarios WHERE id = ? LIMIT 1',
            [usuarioId],
            (erroUsuario, usuarios) => {
                if (erroUsuario) {
                    return cancelar(erroUsuario, 'Erro ao verificar usuário.');
                }

                if (usuarios.length === 0) {
                    return db.rollback(() => {
                        res.status(404).json({
                            sucesso: false,
                            erro: 'Usuário não encontrado.'
                        });
                    });
                }

                // 1. Exclui agendamentos dos pets das casas que esse usuário administra
                db.query(
                    `
                    DELETE a FROM agendamentos a
                    INNER JOIN pets p ON p.id = a.pet_id
                    INNER JOIN casas c ON c.id = p.casa_id
                    WHERE c.admin_id = ?
                    `,
                    [usuarioId],
                    (erroAgendamentos) => {
                        if (erroAgendamentos) {
                            return cancelar(erroAgendamentos, 'Erro ao excluir agendamentos do usuário.');
                        }

                        // 2. Exclui metas dos pets das casas que esse usuário administra
                        db.query(
                            `
                            DELETE m FROM metas_cuidados m
                            INNER JOIN pets p ON p.id = m.pet_id
                            INNER JOIN casas c ON c.id = p.casa_id
                            WHERE c.admin_id = ?
                            `,
                            [usuarioId],
                            (erroMetas) => {
                                if (erroMetas) {
                                    return cancelar(erroMetas, 'Erro ao excluir metas do usuário.');
                                }

                                // 3. Exclui pets das casas que esse usuário administra
                                db.query(
                                    `
                                    DELETE p FROM pets p
                                    INNER JOIN casas c ON c.id = p.casa_id
                                    WHERE c.admin_id = ?
                                    `,
                                    [usuarioId],
                                    (erroPets) => {
                                        if (erroPets) {
                                            return cancelar(erroPets, 'Erro ao excluir pets do usuário.');
                                        }

                                        // 4. Exclui membros das casas que esse usuário administra
                                        db.query(
                                            `
                                            DELETE cm FROM casa_membros cm
                                            INNER JOIN casas c ON c.id = cm.casa_id
                                            WHERE c.admin_id = ?
                                            `,
                                            [usuarioId],
                                            (erroMembrosCasasAdmin) => {
                                                if (erroMembrosCasasAdmin) {
                                                    return cancelar(erroMembrosCasasAdmin, 'Erro ao excluir membros das casas do usuário.');
                                                }

                                                // 5. Exclui casas que esse usuário administra
                                                db.query(
                                                    'DELETE FROM casas WHERE admin_id = ?',
                                                    [usuarioId],
                                                    (erroCasas) => {
                                                        if (erroCasas) {
                                                            return cancelar(erroCasas, 'Erro ao excluir casas do usuário.');
                                                        }

                                                        // 6. Remove esse usuário de casas onde ele era convidado ou pendente
                                                        db.query(
                                                            'DELETE FROM casa_membros WHERE usuario_id = ?',
                                                            [usuarioId],
                                                            (erroMembrosUsuario) => {
                                                                if (erroMembrosUsuario) {
                                                                    return cancelar(erroMembrosUsuario, 'Erro ao remover usuário das casas.');
                                                                }

                                                                // 7. Exclui o usuário definitivamente
                                                                db.query(
                                                                    'DELETE FROM usuarios WHERE id = ?',
                                                                    [usuarioId],
                                                                    (erroExcluirUsuario, resultadoUsuario) => {
                                                                        if (erroExcluirUsuario) {
                                                                            return cancelar(erroExcluirUsuario, 'Erro ao excluir usuário.');
                                                                        }

                                                                        if (resultadoUsuario.affectedRows === 0) {
                                                                            return db.rollback(() => {
                                                                                res.status(404).json({
                                                                                    sucesso: false,
                                                                                    erro: 'Usuário não encontrado.'
                                                                                });
                                                                            });
                                                                        }

                                                                        db.commit((erroCommit) => {
                                                                            if (erroCommit) {
                                                                                return cancelar(erroCommit, 'Erro ao finalizar exclusão da conta.');
                                                                            }

                                                                            return res.status(200).json({
                                                                                sucesso: true,
                                                                                mensagem: 'Conta excluída permanentemente com sucesso!'
                                                                            });
                                                                        });
                                                                    }
                                                                );
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });
});

// --------------------------------------------------------
// 5. Ligando o servidor
// ---------------------------------------------------------
app.listen(3000, '0.0.0.0', () => {
    console.log('Servidor do MeuPets rodando na porta 3000! 🚀');
});