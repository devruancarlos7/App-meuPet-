import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  LayoutAnimation,
  UIManager,
  ActivityIndicator
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000'
  : 'http://10.141.52.10:3000';

const formatarCodigoConvite = (texto) => {
  let codigo = String(texto || '').toUpperCase();

  // Remove espaços
  codigo = codigo.replace(/\s/g, '');

  // Permite só letras, números e traço
  codigo = codigo.replace(/[^A-Z0-9-]/g, '');

  // Tamanho máximo: CASA- + 8 caracteres = 13
  if (codigo.length > 13) {
    codigo = codigo.slice(0, 13);
  }

  return codigo;
};

const prepararCodigoParaEnviar = (texto) => {
  let codigo = formatarCodigoConvite(texto);

  // Se digitar só A7K9P2QW, envia CASA-A7K9P2QW
  if (!codigo.startsWith('CASA-')) {
    if (codigo.startsWith('CASA')) {
      codigo = 'CASA-' + codigo.replace('CASA', '').replace('-', '');
    } else {
      codigo = 'CASA-' + codigo;
    }
  }

  return codigo;
};

const lerJsonSeguro = async (resposta) => {
  const texto = await resposta.text();

  try {
    return JSON.parse(texto);
  } catch (error) {
    console.log('Resposta não JSON recebida do servidor:');
    console.log(texto);

    throw new Error(
      'O servidor respondeu algo que não é JSON. Verifique se o backend está rodando.'
    );
  }
};

export default function TelaEntrarCasa({
  setTelaAtual,
  casas,
  setCasas,
  casaAtual,
  setCasaAtual,
  membros,
  setMembros,
  usuarioAtual,
  modoNoturno,
  buscarCasasDoUsuario
}) {
  const [codigoCasa, setCodigoCasa] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleVoltar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual('Casas');
  };

  const handleMudarCodigo = (texto) => {
    setCodigoCasa(formatarCodigoConvite(texto));
  };

  const handleEntrarCasa = async () => {
    const codigoFinal = prepararCodigoParaEnviar(codigoCasa);

    if (codigoFinal.trim() === 'CASA-' || codigoFinal.trim() === '') {
      Alert.alert('Atenção', 'Digite o código de convite da casa.');
      return;
    }

    if (codigoFinal.length < 11) {
      Alert.alert(
        'Código incompleto',
        'Digite um código com mais de 5 caracteres. Exemplo: CASA-A7K9P2QW'
      );
      return;
    }

    if (!usuarioAtual?.id) {
      Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
      return;
    }

    try {
      setCarregando(true);

      const resposta = await fetch(`${API_URL}/casas/entrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codigo: codigoFinal,
          usuario_id: usuarioAtual.id
        })
      });

      const dados = await lerJsonSeguro(resposta);

      if (!resposta.ok || dados.sucesso === false) {
        Alert.alert('Erro', dados.erro || 'Não foi possível solicitar entrada.');
        return;
      }

      if (buscarCasasDoUsuario && usuarioAtual?.id) {
        await buscarCasasDoUsuario(usuarioAtual.id);
      }

      Alert.alert(
        'Solicitação enviada!',
        dados.mensagem || 'Aguarde o líder da casa aprovar sua entrada.'
      );

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTelaAtual('Casas');
    } catch (error) {
      console.error('Erro ao solicitar entrada:', error);

      Alert.alert(
        'Erro',
        error.message || 'Não foi possível conectar ao servidor.'
      );
    } finally {
      setCarregando(false);
    }
  };

  const coresFundo = modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF'];
  const corCartao = modoNoturno ? '#1E1E1E' : '#FFF';
  const corTextoPrincipal = modoNoturno ? '#FFF' : '#333';
  const corTextoSecundario = modoNoturno ? '#AAA' : '#666';

  const corInputFundo = modoNoturno ? '#2A2A2A' : '#F4F5F7';
  const corInputBorda = modoNoturno ? '#444' : '#EAEAEA';

  const corIconeFundo = modoNoturno ? '#1A2333' : '#E3F2FD';
  const corIconeBorda = modoNoturno ? '#1E3C70' : '#4F7FFF';

  return (
    <LinearGradient colors={coresFundo} style={styles.container}>
      <StatusBar style={modoNoturno ? 'light' : 'auto'} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >

          <View style={styles.areaCabecalho}>
            <TouchableOpacity onPress={handleVoltar} style={styles.botaoVoltar}>
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.textosCabecalho}>
              <Text style={styles.tituloHeader}>Entrar em Casa</Text>
              <Text style={styles.subTituloHeader}>Use um código de convite</Text>
            </View>
          </View>

          <View style={[styles.cardAlegre, { backgroundColor: corCartao }]}>

            <View style={styles.areaIconeCentral}>
              <View
                style={[
                  styles.circuloIcone,
                  {
                    backgroundColor: corIconeFundo,
                    borderColor: corIconeBorda
                  }
                ]}
              >
                <Feather name="key" size={40} color="#4F7FFF" />
              </View>

              <Text style={[styles.tituloSecao, { color: corTextoPrincipal }]}>
                Código de Convite
              </Text>

              <Text style={[styles.textoInstrucao, { color: corTextoSecundario }]}>
                Peça ao líder da casa o código. Ele pode ter letras e números.
              </Text>

              <Text style={styles.exemploCodigo}>
                Exemplo: CASA-A7K9P2QW
              </Text>
            </View>

            <View
              style={[
                styles.areaInput,
                {
                  backgroundColor: corInputFundo,
                  borderColor: corInputBorda
                }
              ]}
            >
              <Feather name="hash" size={20} color="#888" style={styles.iconeInput} />

              <TextInput
                style={[styles.input, { color: corTextoPrincipal }]}
                placeholder="CASA-A7K9P2QW"
                placeholderTextColor={modoNoturno ? '#888' : '#A0A0A0'}
                value={codigoCasa}
                onChangeText={handleMudarCodigo}
                keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'visible-password'}
                autoCapitalize="characters"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                returnKeyType="send"
                onSubmitEditing={handleEntrarCasa}
                maxLength={13}
              />
            </View>

            <TouchableOpacity
              style={[styles.botaoAcao, carregando && { opacity: 0.7 }]}
              onPress={handleEntrarCasa}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.textoBotaoAcao}>Solicitar Entrada</Text>
              )}
            </TouchableOpacity>

          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  areaCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 50,
    paddingBottom: 60
  },

  botaoVoltar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },

  textosCabecalho: {
    flex: 1
  },

  tituloHeader: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {
      width: 1,
      height: 1
    },
    textShadowRadius: 3
  },

  subTituloHeader: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: 'bold'
  },

  cardAlegre: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 45,
    flex: 1,
    marginTop: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5
    },
    shadowOpacity: 0.15,
    shadowRadius: 15
  },

  areaIconeCentral: {
    alignItems: 'center',
    marginBottom: 35
  },

  circuloIcone: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2
  },

  tituloSecao: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 10
  },

  textoInstrucao: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22
  },

  exemploCodigo: {
    marginTop: 12,
    color: '#F86F03',
    fontSize: 15,
    fontWeight: '900'
  },

  areaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 30,
    paddingHorizontal: 20,
    height: 65,
    borderWidth: 1
  },

  iconeInput: {
    marginRight: 15
  },

  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1
  },

  botaoAcao: {
    flexDirection: 'row',
    backgroundColor: '#F86F03',
    borderRadius: 16,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F86F03',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },

  textoBotaoAcao: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold'
  }
});