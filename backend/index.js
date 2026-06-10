// 1. Importando as ferramentas
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

// 2. Inicializando o servidor
const app = express();
app.use(cors());

// IMPORTANTE: limite maior para salvar imagens em base64
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// 3. Configurando a conexão com o seu Banco de Dados
const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'meupets'
});

// 4. Testando a conexão
db.connect((erro) => {
    if (erro) {
        console.error('Ops! Erro ao conectar ao banco de dados:', erro);
        return;
    }

    console.log('Conectado ao banco de dados com sucesso! 🐾');

    db.query('ALTER TABLE casas MODIFY imagem LONGTEXT NULL', (erroAlterCasa) => {
        if (erroAlterCasa) {
            console.error('Aviso ao ajustar imagem da tabela casas:', erroAlterCasa.message);
        }
    });

    db.query('ALTER TABLE pets MODIFY imagem LONGTEXT NULL', (erroAlterPet) => {
        if (erroAlterPet) {
            console.error('Aviso ao ajustar imagem da tabela pets:', erroAlterPet.message);
        }
    });

    db.query('ALTER TABLE usuarios MODIFY imagem LONGTEXT NULL', (erroAlterUsuario) => {
        if (erroAlterUsuario) {
            console.error('Aviso ao ajustar imagem da tabela usuarios:', erroAlterUsuario.message);
        }
    });
});

// ---------------------------------------------------------
// FUNÇÕES AUXILIARES
// ---------------------------------------------------------
const imagemPadraoCasa = 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=250&auto=format&fit=crop';

const limparNumeros = (valor = '') => String(valor).replace(/\D/g, '');

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
// TESTE PARA SABER SE O INDEX CERTO ESTÁ RODANDO
// ---------------------------------------------------------
app.get('/teste-servidor', (req, res) => {
    res.send('Index.js correto rodando!');
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
        `SELECT * FROM usuarios WHERE email = ?`,
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
                `INSERT INTO usuarios (nome, email, senha, cpf, telefone) VALUES (?, ?, ?, ?, ?)`,
                [nome, email, senha, cpf || null, telefone || null],
                (errInsert) => {
                    if (errInsert) {
                        console.error('Erro ao cadastrar usuário:', errInsert);
                        return res.status(500).json({
                            sucesso: false,
                            erro: 'Erro ao cadastrar usuário.'
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
        `SELECT * FROM usuarios WHERE email = ? AND senha = ? LIMIT 1`,
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

    db.query(
        `INSERT INTO casas (nome, imagem, admin_id) VALUES (?, ?, ?)`,
        [nome, imagem, admin_id],
        (erro, result) => {
            if (erro) {
                console.error('Erro ao criar casa:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao criar casa.'
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
                            erro: 'Erro ao vincular membro à casa.'
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

// ---------------------------------------------------------
// ROTA 4: SOLICITAR ENTRADA EM UMA CASA
// ---------------------------------------------------------
app.post('/casas/entrar', (req, res) => {
    const codigoCasa = String(req.body.codigo || '').trim();
    const usuarioId = req.body.usuario_id;

    if (!codigoCasa || !usuarioId) {
        return res.status(400).json({
            sucesso: false,
            erro: 'Código da casa e usuário são obrigatórios.'
        });
    }

    db.query(
        `SELECT * FROM casas WHERE id = ?`,
        [codigoCasa],
        (erro, casas) => {
            if (erro) {
                console.error('Erro ao buscar casa:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao buscar casa.'
                });
            }

            if (casas.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Casa não encontrada! Verifique se o ID está correto.'
                });
            }

            db.query(
                `SELECT * FROM casa_membros WHERE casa_id = ? AND usuario_id = ?`,
                [codigoCasa, usuarioId],
                (err, membros) => {
                    if (err) {
                        console.error('Erro ao verificar membros:', err);
                        return res.status(500).json({
                            sucesso: false,
                            erro: 'Erro ao verificar membros.'
                        });
                    }

                    if (membros.length > 0) {
                        return res.status(400).json({
                            sucesso: false,
                            erro: 'Você já é membro ou sua solicitação está pendente!'
                        });
                    }

                    db.query(
                        `INSERT INTO casa_membros (casa_id, usuario_id, tipo) VALUES (?, ?, 'pendente')`,
                        [codigoCasa, usuarioId],
                        (errInsert) => {
                            if (errInsert) {
                                console.error('Erro ao solicitar entrada:', errInsert);
                                return res.status(500).json({
                                    sucesso: false,
                                    erro: 'Erro ao solicitar entrada.'
                                });
                            }

                            res.status(201).json({
                                sucesso: true,
                                mensagem: 'Solicitação enviada! Aguarde o líder aprovar sua entrada.'
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
                erro: 'Erro ao buscar casas.'
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
                erro: 'Erro ao buscar membros.'
            });
        }

        res.status(200).json(resultados);
    });
});

// ---------------------------------------------------------
// ROTA 7: EXCLUIR CASA DO USUÁRIO LOGADO
// ---------------------------------------------------------
app.delete('/casas/:casaId', (req, res) => {
    const casaId = req.params.casaId;

    db.query(
        `DELETE a FROM agendamentos a INNER JOIN pets p ON p.id = a.pet_id WHERE p.casa_id = ?`,
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
                `DELETE m FROM metas_cuidados m INNER JOIN pets p ON p.id = m.pet_id WHERE p.casa_id = ?`,
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
                        `DELETE FROM casa_membros WHERE casa_id = ?`,
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
                                `DELETE FROM pets WHERE casa_id = ?`,
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
                                        `DELETE FROM casas WHERE id = ?`,
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
        `INSERT INTO pets (nome, tipo, raca, nascimento, imagem, casa_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [nome, tipo, raca, nascimento, imagem, casa_id],
        (erro, resultado) => {
            if (erro) {
                console.error('Erro ao cadastrar pet:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao cadastrar pet.'
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
        `SELECT *, casa_id AS casaId FROM pets WHERE casa_id = ? ORDER BY id DESC`,
        [casaId],
        (erro, resultados) => {
            if (erro) {
                console.error('Erro ao buscar pets:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao buscar pets.'
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

    console.log('CHEGOU UM PEDIDO DE AGENDAMENTO:', req.body);

    if (!pet_id || !texto_data || !texto_horario || !compromisso) {
        return res.status(400).json({
            sucesso: false,
            erro: 'Dados obrigatórios do agendamento estão faltando!'
        });
    }

    db.query(
        `INSERT INTO agendamentos (pet_id, texto_data, texto_horario, compromisso, observacao) VALUES (?, ?, ?, ?, ?)`,
        [pet_id, texto_data, texto_horario, compromisso, observacao || null],
        (erro, resultado) => {
            if (erro) {
                console.error('Erro ao criar agendamento:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao criar agendamento.'
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
                    erro: 'Erro ao buscar agendamentos.'
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
        `SELECT * FROM metas_cuidados WHERE pet_id = ? LIMIT 1`,
        [petId],
        (erro, resultados) => {
            if (erro) {
                console.error('Erro ao buscar metas:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao buscar metas.'
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
        `SELECT * FROM metas_cuidados WHERE pet_id = ? LIMIT 1`,
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
                                erro: 'Erro ao atualizar metas.'
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
                                erro: 'Erro ao criar novas metas.'
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
        `UPDATE casa_membros SET tipo = 'convidado' WHERE casa_id = ? AND usuario_id = ?`,
        [casa_id, usuario_id],
        (err) => {
            if (err) {
                console.error('Erro ao aprovar membro:', err);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao aprovar membro.'
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
        `DELETE FROM casa_membros WHERE casa_id = ? AND usuario_id = ? AND tipo = 'pendente'`,
        [casa_id, usuario_id],
        (err) => {
            if (err) {
                console.error('Erro ao rejeitar membro:', err);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao rejeitar membro.'
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

    console.log('PEDIDO PARA EXCLUIR PET VIA POST:', petId);

    db.query(
        `DELETE FROM agendamentos WHERE pet_id = ?`,
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
                `DELETE FROM metas_cuidados WHERE pet_id = ?`,
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
                        `DELETE FROM pets WHERE id = ?`,
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

    console.log('PEDIDO PARA EXCLUIR PET VIA DELETE:', petId);

    db.query(
        `DELETE FROM agendamentos WHERE pet_id = ?`,
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
                `DELETE FROM metas_cuidados WHERE pet_id = ?`,
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
                        `DELETE FROM pets WHERE id = ?`,
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

    console.log('PEDIDO PARA EXCLUIR AGENDAMENTO:', agendamentoId);

    db.query(
        `DELETE FROM agendamentos WHERE id = ?`,
        [agendamentoId],
        (erro, resultado) => {
            if (erro) {
                console.error('Erro ao excluir agendamento:', erro);
                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao excluir agendamento.'
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
    console.log('TAMANHO DA IMAGEM:', imagem ? imagem.length : 0);
    console.log('----------------------------------------');

    if (!imagem) {
        return res.status(400).json({
            sucesso: false,
            erro: 'Nenhuma imagem foi enviada.'
        });
    }

    db.query(
        `UPDATE casas SET imagem = ? WHERE id = ?`,
        [imagem, casaId],
        (erro, resultado) => {
            if (erro) {
                console.error('Erro ao atualizar imagem da casa:', erro);

                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao atualizar imagem da casa.',
                    detalhes: erro.message
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
    console.log('TAMANHO DA IMAGEM:', imagem ? imagem.length : 0);
    console.log('----------------------------------------');

    if (!imagem) {
        return res.status(400).json({
            sucesso: false,
            erro: 'Nenhuma imagem foi enviada.'
        });
    }

    db.query(
        `UPDATE pets SET imagem = ? WHERE id = ?`,
        [imagem, petId],
        (erro, resultado) => {
            if (erro) {
                console.error('Erro ao atualizar imagem do pet:', erro);

                return res.status(500).json({
                    sucesso: false,
                    erro: 'Erro ao atualizar imagem do pet.',
                    detalhes: erro.message
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
// 5. Ligando o servidor
// ---------------------------------------------------------
app.listen(3000, '0.0.0.0', () => {
    console.log('Servidor do MeuPets rodando na porta 3000! 🚀');
});