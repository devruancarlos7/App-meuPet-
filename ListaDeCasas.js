import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  Platform,
  LayoutAnimation,
  UIManager
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';

const API_URL = 'http://10.141.52.10:3000';

// Mágica da animação no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const normalizarCasa = (casa) => ({
  ...casa,
  adminId: casa.adminId ?? casa.admin_id,
  admin_id: casa.admin_id ?? casa.adminId,
  papel: casa.papel,
});

const normalizarMembro = (membro) => ({
  ...membro,
  casaId: membro.casaId ?? membro.casa_id,
  casa_id: membro.casa_id ?? membro.casaId,
});

export default function ListaDeCasas({
  setTelaAtual,
  casas,
  setCasas,
  setCasaAtual,
  usuarioAtual,
  membros,
  setMembros,
  modoNoturno
}) {

  useEffect(() => {
    const buscarCasasDoUsuario = async () => {
      if (!usuarioAtual?.id || !setCasas) return;

      try {
        const resposta = await fetch(`${API_URL}/casas/${usuarioAtual.id}`);
        const dados = await resposta.json();

        // Aceita tanto resposta em array quanto resposta { sucesso, casas }
        let casasRecebidas = [];

        if (Array.isArray(dados)) {
          casasRecebidas = dados;
        } else if (dados.sucesso && Array.isArray(dados.casas)) {
          casasRecebidas = dados.casas;
        } else if (Array.isArray(dados.casas)) {
          casasRecebidas = dados.casas;
        }

        const casasDoUsuario = casasRecebidas.map(normalizarCasa);
        setCasas(casasDoUsuario);

      } catch (error) {
        console.error('Erro ao buscar casas:', error);
      }
    };

    buscarCasasDoUsuario();
  }, [usuarioAtual?.id]);

  const minhasCasas = (casas || []).map(normalizarCasa);

  const primeiroNome = usuarioAtual?.nome
    ? usuarioAtual.nome.split(' ')[0]
    : 'Usuário';

  const navegarComAnimacao = (tela) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual(tela);
  };

  const entrarNaCasa = async (casa) => {
    const casaNormalizada = normalizarCasa(casa);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCasaAtual(casaNormalizada);

    try {
      const resposta = await fetch(`${API_URL}/casas/${casaNormalizada.id}/membros`);
      const dados = await resposta.json();

      let membrosRecebidos = [];

      if (Array.isArray(dados)) {
        membrosRecebidos = dados;
      } else if (dados.sucesso && Array.isArray(dados.membros)) {
        membrosRecebidos = dados.membros;
      } else if (Array.isArray(dados.membros)) {
        membrosRecebidos = dados.membros;
      }

      if (setMembros) {
        const membrosDaCasa = membrosRecebidos.map(normalizarMembro);

        setMembros((listaAtual) => {
          const listaSegura = Array.isArray(listaAtual) ? listaAtual : membros || [];

          const membrosDeOutrasCasas = listaSegura.filter(
            m => String(m.casaId ?? m.casa_id) !== String(casaNormalizada.id)
          );

          return [...membrosDeOutrasCasas, ...membrosDaCasa];
        });
      }
    } catch (error) {
      console.error('Erro ao buscar membros da casa:', error);
    }

    setTelaAtual('ListaDePets');
  };

  const coresFundo = modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF'];
  const corCartao = modoNoturno ? '#1E1E1E' : '#FFF';
  const corTextoPrincipal = modoNoturno ? '#FFF' : '#333';

  const corAcaoFundo = modoNoturno ? '#2A2A2A' : '#FFF';

  const corCasaFundo = modoNoturno ? '#232D3F' : '#F0F4FF';
  const corCasaBorda = modoNoturno ? '#1A2333' : '#E0E8FF';

  const corVaziaFundo = modoNoturno ? '#331E0B' : '#FFF3E0';
  const corVaziaBorda = modoNoturno ? '#663C16' : '#F86F03';

  return (
    <LinearGradient colors={coresFundo} style={styles.container}>
      <StatusBar style={modoNoturno ? "light" : "auto"} />

      <SafeAreaView style={{ flex: 1 }}>

        {/* CABEÇALHO */}
        <View style={styles.areaCabecalho}>
          <View style={styles.areaTextoCabecalho}>
            <Text style={styles.saudacao} numberOfLines={1}>
              Olá, {primeiroNome}!
            </Text>

            <Text style={styles.subSaudacao}>
              Suas casas
            </Text>
          </View>

          <View style={styles.areaBotoesCabecalho}>
            <TouchableOpacity
              onPress={() => navegarComAnimacao('PerfilUsuario')}
              style={styles.botaoPerfil}
            >
              {usuarioAtual?.imagem ? (
                <Image
                  source={{ uri: usuarioAtual.imagem }}
                  style={styles.imagemPerfilPequena}
                />
              ) : (
                <Feather name="user" size={23} color="#FFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navegarComAnimacao('Principal')}
              style={styles.botaoSair}
            >
              <Feather name="log-out" size={23} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* CARTÃO PRINCIPAL */}
        <View style={[styles.cardAlegre, { backgroundColor: corCartao }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

            {/* AÇÕES */}
            <View style={styles.areaAcoes}>
              <TouchableOpacity
                style={styles.cartaoAcao}
                onPress={() => navegarComAnimacao('NovaCasa')}
              >
                <View style={[styles.iconeAcaoFundo, { backgroundColor: corAcaoFundo }]}>
                  <Feather name="plus" size={32} color="#F86F03" />
                </View>

                <Text style={[styles.textoAcao, { color: corTextoPrincipal }]}>
                  Nova Casa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cartaoAcao}
                onPress={() => navegarComAnimacao('EntrarCasa')}
              >
                <View style={[styles.iconeAcaoFundo, { backgroundColor: corAcaoFundo }]}>
                  <Feather name="log-in" size={32} color="#4F7FFF" />
                </View>

                <Text style={[styles.textoAcao, { color: corTextoPrincipal }]}>
                  Entrar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cartaoAcao}
                onPress={() => navegarComAnimacao('ExcluirCasa')}
              >
                <View style={[styles.iconeAcaoFundo, { backgroundColor: corAcaoFundo }]}>
                  <Feather name="settings" size={32} color="#FF4C4C" />
                </View>

                <Text style={[styles.textoAcao, { color: corTextoPrincipal }]}>
                  Ajustes
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.tituloSecao, { color: corTextoPrincipal }]}>
              Ambientes
            </Text>

            {/* LISTA DE CASAS */}
            {minhasCasas.length > 0 ? (
              minhasCasas.map((casa) => (
                <TouchableOpacity
                  key={casa.id}
                  style={[
                    styles.cartaoCasa,
                    {
                      backgroundColor: corCasaFundo,
                      borderColor: corCasaBorda
                    }
                  ]}
                  onPress={() => entrarNaCasa(casa)}
                >
                  <Image
                    source={{ uri: casa.imagem || 'https://via.placeholder.com/150' }}
                    style={styles.imagemCasa}
                  />

                  <View style={styles.infoCasa}>
                    <Text
                      style={[styles.nomeCasa, { color: corTextoPrincipal }]}
                      numberOfLines={1}
                    >
                      {casa.nome}
                    </Text>

                    <Text style={styles.statusCasa}>
                      {casa.papel ||
                        (String(casa.adminId ?? casa.admin_id) === String(usuarioAtual?.id)
                          ? 'Administrador'
                          : 'Membro')}
                    </Text>
                  </View>

                  <View style={styles.botaoSeta}>
                    <Feather name="chevron-right" size={24} color="#FFF" />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View
                style={[
                  styles.areaVazia,
                  {
                    backgroundColor: corVaziaFundo,
                    borderColor: corVaziaBorda
                  }
                ]}
              >
                <Feather name="home" size={40} color="#F86F03" style={{ marginBottom: 15 }} />

                <Text style={styles.textoVazio}>
                  Nenhuma casa ainda
                </Text>

                <Text style={[styles.subTextoVazio, { color: corTextoPrincipal }]}>
                  Crie uma nova ou entre usando um código!
                </Text>
              </View>
            )}

          </ScrollView>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  patinha: {
    position: 'absolute',
    zIndex: 0
  },

  // Aumentei o paddingTop para descer o "Olá, usuário"
  areaCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'android' ? 58 : 35,
    paddingBottom: 35
  },

  areaTextoCabecalho: {
    flex: 1,
    marginRight: 15
  },

  saudacao: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {
      width: 1,
      height: 1
    },
    textShadowRadius: 3
  },

  subSaudacao: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: 'bold',
    marginTop: 3
  },

  areaBotoesCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },

  botaoPerfil: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },

  imagemPerfilPequena: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFF'
  },

  botaoSair: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  cardAlegre: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 35,
    flex: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5
    },
    shadowOpacity: 0.15,
    shadowRadius: 15
  },

  areaAcoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 35,
    paddingHorizontal: 5
  },

  cartaoAcao: {
    alignItems: 'center',
    flex: 1
  },

  iconeAcaoFundo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },

  textoAcao: {
    color: '#333',
    fontSize: 15,
    fontWeight: '900'
  },

  tituloSecao: {
    fontSize: 24,
    fontWeight: '900',
    color: '#333',
    marginBottom: 20,
    paddingHorizontal: 5
  },

  cartaoCasa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    padding: 15,
    borderRadius: 25,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#E0E8FF'
  },

  imagemCasa: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#4F7FFF'
  },

  infoCasa: {
    flex: 1,
    marginLeft: 15
  },

  nomeCasa: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },

  statusCasa: {
    fontSize: 14,
    color: '#F86F03',
    fontWeight: 'bold'
  },

  botaoSeta: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F86F03',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#F86F03',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.4,
    shadowRadius: 4
  },

  areaVazia: {
    alignItems: 'center',
    marginTop: 40,
    backgroundColor: '#FFF3E0',
    padding: 30,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#F86F03',
    borderStyle: 'dashed'
  },

  textoVazio: {
    color: '#F86F03',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center'
  },

  subTextoVazio: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600'
  }
});