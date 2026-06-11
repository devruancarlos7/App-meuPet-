import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  AppState
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importação de todas as suas telas
import TelaDeLogin from './TelaDeLogin';
import TelaDeCadastro from './TelaDeCadastro';
import ListaDeCasas from './ListaDeCasas';
import TelaNovaCasa from './TelaNovaCasa';
import TelaExcluirCasa from './TelaExcluirCasa';
import ListaDePets from './ListaDePets';
import TelaNovoPet from './TelaNovoPet';
import TelaPerfilPet from './TelaPerfilPet';
import TelaAgendar from './TelaAgendar';
import TelaMetasCuidados from './TelaMetasCuidados';
import TelaPerfilUsuario from './TelaPerfilUsuario';
import TelaConfigurarCasa from './TelaConfigurarCasa';
import TelaEntrarCasa from './TelaEntrarCasa';
import TelaEmergencia from './TelaEmergencia';

const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000'
  : 'http://192.168.1.244:3000';

const CHAVE_USUARIO_LOGADO = '@usuario_logado_meupets';
const CHAVE_MODO_NOTURNO = '@meupets_modo_noturno';

export default function App() {
  const [telaAtual, setTelaAtual] = useState('Principal');

  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [carregandoInicial, setCarregandoInicial] = useState(true);

  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);

  // Agora começa como true, ou seja, modo noturno vem ativado por padrão
  const [modoNoturno, setModoNoturno] = useState(true);

  const [casas, setCasas] = useState([]);
  const [casaAtual, setCasaAtual] = useState(null);

  const [pets, setPets] = useState([]);
  const [membros, setMembros] = useState([]);

  const [petAtual, setPetAtual] = useState(null);
  const [metas, setMetas] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);

  const normalizarUsuario = (dados) => {
    if (!dados) return null;

    if (dados.usuario) return dados.usuario;

    if (Array.isArray(dados)) {
      if (Array.isArray(dados[0])) return dados[0][0] || null;
      return dados[0] || null;
    }

    return dados;
  };

  const normalizarCasa = (casa) => ({
    ...casa,
    adminId: casa.adminId ?? casa.admin_id,
    admin_id: casa.admin_id ?? casa.adminId,
    codigoConvite: casa.codigoConvite ?? casa.codigo_convite,
    codigo_convite: casa.codigo_convite ?? casa.codigoConvite,
    papel: casa.papel ?? casa.tipo
  });

  const normalizarPet = (pet) => ({
    ...pet,
    casaId: pet.casaId ?? pet.casa_id,
    casa_id: pet.casa_id ?? pet.casaId
  });

  const normalizarMembro = (membro) => ({
    ...membro,
    casaId: membro.casaId ?? membro.casa_id,
    casa_id: membro.casa_id ?? membro.casaId
  });

  const limparDadosLocais = () => {
    setCasas([]);
    setCasaAtual(null);
    setPets([]);
    setMembros([]);
    setPetAtual(null);
    setMetas([]);
    setAgendamentos([]);
  };

  const buscarCasasDoUsuario = useCallback(async (usuarioId) => {
    if (!usuarioId) return [];

    try {
      const resposta = await fetch(`${API_URL}/casas/${usuarioId}`);

      if (!resposta.ok) {
        console.log('Erro ao buscar casas:', resposta.status);
        return [];
      }

      const dados = await resposta.json();

      let casasRecebidas = [];

      if (Array.isArray(dados)) {
        casasRecebidas = dados;
      } else if (Array.isArray(dados.casas)) {
        casasRecebidas = dados.casas;
      }

      const casasFormatadas = casasRecebidas.map(normalizarCasa);

      setCasas(casasFormatadas);

      setCasaAtual(casaAnterior => {
        if (!casaAnterior?.id) return casaAnterior;

        const casaAtualizada = casasFormatadas.find(
          c => String(c.id) === String(casaAnterior.id)
        );

        return casaAtualizada || null;
      });

      return casasFormatadas;
    } catch (erro) {
      console.error('Erro ao buscar casas do banco:', erro);
      return [];
    }
  }, []);

  const buscarPetsDaCasa = useCallback(async (casaId) => {
    if (!casaId) return [];

    try {
      const resposta = await fetch(`${API_URL}/casas/${casaId}/pets`);

      if (!resposta.ok) {
        console.log('Erro ao buscar pets:', resposta.status);
        return [];
      }

      const dados = await resposta.json();

      let petsRecebidos = [];

      if (Array.isArray(dados)) {
        petsRecebidos = dados;
      } else if (Array.isArray(dados.pets)) {
        petsRecebidos = dados.pets;
      }

      const petsFormatados = petsRecebidos.map(normalizarPet);

      setPets(petsFormatados);

      setPetAtual(petAnterior => {
        if (!petAnterior?.id) return petAnterior;

        const petAtualizado = petsFormatados.find(
          p => String(p.id) === String(petAnterior.id)
        );

        return petAtualizado || null;
      });

      return petsFormatados;
    } catch (erro) {
      console.error('Erro ao buscar pets do banco:', erro);
      return [];
    }
  }, []);

  const buscarMembrosDaCasa = useCallback(async (casaId) => {
    if (!casaId) return [];

    try {
      const resposta = await fetch(`${API_URL}/casas/${casaId}/membros`);

      if (!resposta.ok) {
        console.log('Erro ao buscar membros:', resposta.status);
        return [];
      }

      const dados = await resposta.json();

      let membrosRecebidos = [];

      if (Array.isArray(dados)) {
        membrosRecebidos = dados;
      } else if (Array.isArray(dados.membros)) {
        membrosRecebidos = dados.membros;
      }

      const membrosFormatados = membrosRecebidos.map(normalizarMembro);

      setMembros(membrosFormatados);

      return membrosFormatados;
    } catch (erro) {
      console.error('Erro ao buscar membros do banco:', erro);
      return [];
    }
  }, []);

  const buscarTudoDoUsuario = useCallback(async (usuarioId) => {
    if (!usuarioId) return;

    const casasDoBanco = await buscarCasasDoUsuario(usuarioId);

    if (casaAtual?.id) {
      await buscarPetsDaCasa(casaAtual.id);
      await buscarMembrosDaCasa(casaAtual.id);
    } else if (casasDoBanco.length > 0) {
      const primeiraCasa = casasDoBanco[0];

      await buscarPetsDaCasa(primeiraCasa.id);
      await buscarMembrosDaCasa(primeiraCasa.id);
    }
  }, [buscarCasasDoUsuario, buscarPetsDaCasa, buscarMembrosDaCasa, casaAtual?.id]);

  // Carrega usuário salvo e tema salvo quando o app abre
  useEffect(() => {
    const carregarDadosSalvos = async () => {
      try {
        const temaSalvo = await AsyncStorage.getItem(CHAVE_MODO_NOTURNO);

        if (temaSalvo === null) {
          setModoNoturno(true);
        } else {
          setModoNoturno(temaSalvo === 'true');
        }

        const usuarioSalvo = await AsyncStorage.getItem(CHAVE_USUARIO_LOGADO);

        if (usuarioSalvo) {
          const usuario = JSON.parse(usuarioSalvo);

          if (usuario?.id) {
            setUsuarioAtual(usuario);
            setTelaAtual('Casas');
            await buscarCasasDoUsuario(usuario.id);
          }
        }
      } catch (erro) {
        console.error('Erro ao carregar dados salvos:', erro);
        setModoNoturno(true);
      } finally {
        setCarregandoInicial(false);
      }
    };

    carregarDadosSalvos();
  }, [buscarCasasDoUsuario]);

  // Salva o modo noturno sempre que a pessoa mudar no Perfil
  useEffect(() => {
    const salvarTema = async () => {
      if (carregandoInicial) return;

      try {
        await AsyncStorage.setItem(CHAVE_MODO_NOTURNO, String(modoNoturno));
      } catch (erro) {
        console.error('Erro ao salvar modo noturno:', erro);
      }
    };

    salvarTema();
  }, [modoNoturno, carregandoInicial]);

  useEffect(() => {
    if (usuarioAtual?.id && telaAtual === 'Casas') {
      buscarCasasDoUsuario(usuarioAtual.id);
    }
  }, [usuarioAtual?.id, telaAtual, buscarCasasDoUsuario]);

  useEffect(() => {
    if (casaAtual?.id) {
      buscarPetsDaCasa(casaAtual.id);
      buscarMembrosDaCasa(casaAtual.id);
    }
  }, [casaAtual?.id, buscarPetsDaCasa, buscarMembrosDaCasa]);

  useEffect(() => {
    const assinatura = AppState.addEventListener('change', async (estado) => {
      if (estado === 'active' && usuarioAtual?.id) {
        await buscarCasasDoUsuario(usuarioAtual.id);

        if (casaAtual?.id) {
          await buscarPetsDaCasa(casaAtual.id);
          await buscarMembrosDaCasa(casaAtual.id);
        }
      }
    });

    return () => {
      assinatura.remove();
    };
  }, [
    usuarioAtual?.id,
    casaAtual?.id,
    buscarCasasDoUsuario,
    buscarPetsDaCasa,
    buscarMembrosDaCasa
  ]);

  const finalizarLogin = async (usuarioRecebido) => {
    const usuarioReal = normalizarUsuario(usuarioRecebido);

    if (!usuarioReal?.id) {
      console.log('Usuário inválido recebido no login:', usuarioRecebido);
      return;
    }

    setUsuarioAtual(usuarioReal);

    try {
      await AsyncStorage.setItem(
        CHAVE_USUARIO_LOGADO,
        JSON.stringify(usuarioReal)
      );
    } catch (erro) {
      console.error('Erro ao salvar usuário logado:', erro);
    }

    limparDadosLocais();

    await buscarCasasDoUsuario(usuarioReal.id);

    setTelaAtual('Casas');
  };

  const sairDaConta = async () => {
    try {
      await AsyncStorage.removeItem(CHAVE_USUARIO_LOGADO);
    } catch (erro) {
      console.error('Erro ao remover usuário salvo:', erro);
    }

    setUsuarioAtual(null);
    limparDadosLocais();
    setTelaAtual('Principal');
  };

  const selecionarCasa = async (casa) => {
    const casaFormatada = normalizarCasa(casa);

    setCasaAtual(casaFormatada);

    await buscarPetsDaCasa(casaFormatada.id);
    await buscarMembrosDaCasa(casaFormatada.id);

    setTelaAtual('ListaDePets');
  };

  const selecionarPet = (pet) => {
    const petFormatado = normalizarPet(pet);

    setPetAtual(petFormatado);
    setTelaAtual('MetasCuidados');
  };

  if (carregandoInicial) {
    return (
      <LinearGradient
        colors={modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF']}
        style={styles.container}
      >
        <StatusBar style={modoNoturno ? 'light' : 'auto'} />

        <SafeAreaView style={styles.areaCarregando}>
          <FontAwesome5 name="paw" size={70} color="#FFF" />
          <Text style={styles.textoCarregando}>Carregando MeuPets...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (telaAtual === 'Login') {
    return (
      <TelaDeLogin
        setTelaAtual={setTelaAtual}
        setUsuarioAtual={setUsuarioAtual}
        onLogin={finalizarLogin}
        modoNoturno={modoNoturno}
      />
    );
  }

  if (telaAtual === 'Cadastro') {
    return (
      <TelaDeCadastro
        setTelaAtual={setTelaAtual}
        modoNoturno={modoNoturno}
      />
    );
  }

  if (telaAtual === 'Casas') {
    return (
      <ListaDeCasas
        setTelaAtual={setTelaAtual}
        casas={casas}
        setCasas={setCasas}
        casaAtual={casaAtual}
        setCasaAtual={setCasaAtual}
        usuarioAtual={usuarioAtual}
        membros={membros}
        setMembros={setMembros}
        modoNoturno={modoNoturno}
        buscarCasasDoUsuario={buscarCasasDoUsuario}
        buscarPetsDaCasa={buscarPetsDaCasa}
        buscarMembrosDaCasa={buscarMembrosDaCasa}
        selecionarCasa={selecionarCasa}
      />
    );
  }

  if (telaAtual === 'NovaCasa') {
    return (
      <TelaNovaCasa
        setTelaAtual={setTelaAtual}
        casas={casas}
        setCasas={setCasas}
        usuarioAtual={usuarioAtual}
        modoNoturno={modoNoturno}
        buscarCasasDoUsuario={buscarCasasDoUsuario}
      />
    );
  }

  if (telaAtual === 'ExcluirCasa') {
    return (
      <TelaExcluirCasa
        setTelaAtual={setTelaAtual}
        casas={casas}
        setCasas={setCasas}
        pets={pets}
        setPets={setPets}
        casaAtual={casaAtual}
        setCasaAtual={setCasaAtual}
        usuarioAtual={usuarioAtual}
        modoNoturno={modoNoturno}
        buscarCasasDoUsuario={buscarCasasDoUsuario}
      />
    );
  }

  if (telaAtual === 'EntrarCasa') {
    return (
      <TelaEntrarCasa
        setTelaAtual={setTelaAtual}
        casas={casas}
        setCasas={setCasas}
        casaAtual={casaAtual}
        setCasaAtual={setCasaAtual}
        membros={membros}
        setMembros={setMembros}
        usuarioAtual={usuarioAtual}
        modoNoturno={modoNoturno}
        buscarCasasDoUsuario={buscarCasasDoUsuario}
      />
    );
  }

  if (telaAtual === 'ListaDePets') {
    return (
      <ListaDePets
        setTelaAtual={setTelaAtual}
        pets={pets}
        setPets={setPets}
        casaAtual={casaAtual}
        setPetAtual={setPetAtual}
        usuarioAtual={usuarioAtual}
        modoNoturno={modoNoturno}
        buscarPetsDaCasa={buscarPetsDaCasa}
        selecionarPet={selecionarPet}
      />
    );
  }

  if (telaAtual === 'NovoPet') {
    return (
      <TelaNovoPet
        setTelaAtual={setTelaAtual}
        pets={pets}
        setPets={setPets}
        casaAtual={casaAtual}
        modoNoturno={modoNoturno}
        buscarPetsDaCasa={buscarPetsDaCasa}
      />
    );
  }

  if (telaAtual === 'Agendar') {
    return (
      <TelaAgendar
        setTelaAtual={setTelaAtual}
        petAtual={petAtual}
        agendamentos={agendamentos}
        setAgendamentos={setAgendamentos}
        notificacoesAtivas={notificacoesAtivas}
        modoNoturno={modoNoturno}
      />
    );
  }

  if (telaAtual === 'MetasCuidados') {
    return (
      <TelaMetasCuidados
        setTelaAtual={setTelaAtual}
        petAtual={petAtual}
        setPetAtual={setPetAtual}
        pets={pets}
        setPets={setPets}
        casaAtual={casaAtual}
        usuarioAtual={usuarioAtual}
        metas={metas}
        setMetas={setMetas}
        agendamentos={agendamentos}
        setAgendamentos={setAgendamentos}
        notificacoesAtivas={notificacoesAtivas}
        modoNoturno={modoNoturno}
        buscarPetsDaCasa={buscarPetsDaCasa}
      />
    );
  }

  if (telaAtual === 'ConfigurarCasa') {
    return (
      <TelaConfigurarCasa
        setTelaAtual={setTelaAtual}
        casaAtual={casaAtual}
        setCasaAtual={setCasaAtual}
        casas={casas}
        setCasas={setCasas}
        usuarioAtual={usuarioAtual}
        pets={pets}
        setPets={setPets}
        membros={membros}
        setMembros={setMembros}
        modoNoturno={modoNoturno}
        buscarCasasDoUsuario={buscarCasasDoUsuario}
        buscarPetsDaCasa={buscarPetsDaCasa}
        buscarMembrosDaCasa={buscarMembrosDaCasa}
      />
    );
  }

  if (telaAtual === 'Emergencia') {
    return (
      <TelaEmergencia
        setTelaAtual={setTelaAtual}
        petAtual={petAtual}
        modoNoturno={modoNoturno}
      />
    );
  }

  if (telaAtual === 'PerfilUsuario') {
    return (
      <TelaPerfilUsuario
        setTelaAtual={setTelaAtual}
        usuarioAtual={usuarioAtual}
        setUsuarioAtual={setUsuarioAtual}
        pets={pets}
        casas={casas}
        notificacoesAtivas={notificacoesAtivas}
        setNotificacoesAtivas={setNotificacoesAtivas}
        modoNoturno={modoNoturno}
        setModoNoturno={setModoNoturno}
        sairDaConta={sairDaConta}
      />
    );
  }

  const coresFundo = modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF'];
  const corCartao = modoNoturno ? '#1E1E1E' : '#FFF';
  const corTextoPrincipal = modoNoturno ? '#FFF' : '#333';
  const corTextoSecundario = modoNoturno ? '#AAA' : '#666';
  const corBotaoBorda = modoNoturno ? '#1E1E1E' : '#F86F03';

  return (
    <LinearGradient colors={coresFundo} style={styles.container}>
      <StatusBar style={modoNoturno ? 'light' : 'auto'} />

      <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={styles.areaLogo}>
          <FontAwesome5
            name="paw"
            size={80}
            color="#FFF"
            style={{ marginBottom: 20 }}
          />

          <Text style={styles.tituloApp}>MeuPets</Text>

          <Text style={styles.subtituloApp}>
            O melhor amigo do seu pet
          </Text>
        </View>

        <View style={[styles.cardBranco, { backgroundColor: corCartao }]}>
          <Text style={[styles.tituloBoasVindas, { color: corTextoPrincipal }]}>
            Bem-vindo!
          </Text>

          <Text style={[styles.textoBoasVindas, { color: corTextoSecundario }]}>
            Escolha uma opção para começar
          </Text>

          <TouchableOpacity
            style={styles.botaoLogin}
            onPress={() => setTelaAtual('Login')}
          >
            <Text style={styles.textoBotaoLogin}>Entrar</Text>
            <Feather name="arrow-right" size={20} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.botaoCadastrar,
              {
                borderColor: corBotaoBorda
              }
            ]}
            onPress={() => setTelaAtual('Cadastro')}
          >
            <Text style={[styles.textoBotaoCadastrar, { color: corTextoPrincipal }]}>
              Criar uma Conta
            </Text>
          </TouchableOpacity>

          <Text style={styles.versao}>v1.0.0</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  areaCarregando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  textoCarregando: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20
  },

  areaLogo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30
  },

  tituloApp: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {
      width: 1,
      height: 1
    },
    textShadowRadius: 5
  },

  subtituloApp: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 5
  },

  cardBranco: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10
  },

  tituloBoasVindas: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10
  },

  textoBoasVindas: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30
  },

  botaoLogin: {
    flexDirection: 'row',
    backgroundColor: '#F86F03',
    width: '100%',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#F86F03',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },

  textoBotaoLogin: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10
  },

  botaoCadastrar: {
    width: '100%',
    height: 60,
    borderWidth: 2,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },

  textoBotaoCadastrar: {
    fontSize: 18,
    fontWeight: 'bold'
  },

  versao: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 25
  }
});