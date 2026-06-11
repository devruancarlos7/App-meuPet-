import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  LayoutAnimation,
  UIManager,
  Alert,
  Switch,
  ActivityIndicator
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Habilita animações fluidas no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000'
  : 'http://10.141.52.10:3000';

const CHAVE_USUARIO_LOGADO = '@usuario_logado_meupets';

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

export default function TelaPerfilUsuario({
  setTelaAtual,
  usuarioAtual,
  setUsuarioAtual,
  pets,
  casas,
  notificacoesAtivas,
  setNotificacoesAtivas,
  modoNoturno,
  setModoNoturno,
  sairDaConta
}) {
  const [excluindoConta, setExcluindoConta] = useState(false);

  const navegarComAnimacao = (tela) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual(tela);
  };

  const escolherImagemPerfil = async () => {
    try {
      if (!usuarioAtual?.id) {
        Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
        return;
      }

      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar suas fotos.'
        );
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: true
      });

      if (resultado.canceled) return;

      const asset = resultado.assets?.[0];

      if (!asset) {
        Alert.alert('Erro', 'Nenhuma imagem foi selecionada.');
        return;
      }

      const novaImagem = asset.base64
        ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;

      const resposta = await fetch(`${API_URL}/usuarios/${usuarioAtual.id}/imagem`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imagem: novaImagem
        })
      });

      const dados = await lerJsonSeguro(resposta);

      if (!resposta.ok || dados.sucesso === false) {
        Alert.alert('Erro', dados.erro || 'Erro ao salvar imagem no servidor.');
        return;
      }

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      const usuarioAtualizado = {
        ...usuarioAtual,
        imagem: dados.imagem || novaImagem
      };

      setUsuarioAtual(usuarioAtualizado);

      await AsyncStorage.setItem(
        CHAVE_USUARIO_LOGADO,
        JSON.stringify(usuarioAtualizado)
      );

      Alert.alert('Sucesso', 'Foto de perfil atualizada!');
    } catch (error) {
      console.error('Erro ao abrir/salvar imagem do perfil:', error);

      Alert.alert(
        'Erro',
        error.message || 'Erro ao abrir a galeria ou salvar a imagem.'
      );
    }
  };

  const toggleNotificacoes = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNotificacoesAtivas(!notificacoesAtivas);
  };

  const alternarTema = (valor) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setModoNoturno(valor);
  };

  const handleSair = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja desconectar do MeuPets?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sair',
          onPress: () => {
            if (sairDaConta) {
              sairDaConta();
            } else {
              setUsuarioAtual(null);
              navegarComAnimacao('Principal');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const excluirContaPermanentemente = async () => {
    try {
      if (!usuarioAtual?.id) {
        Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
        return;
      }

      setExcluindoConta(true);

      const resposta = await fetch(`${API_URL}/usuarios/${usuarioAtual.id}`, {
        method: 'DELETE'
      });

      const dados = await lerJsonSeguro(resposta);

      if (!resposta.ok || dados.sucesso === false) {
        Alert.alert('Erro', dados.erro || 'Não foi possível excluir a conta.');
        return;
      }

      await AsyncStorage.removeItem(CHAVE_USUARIO_LOGADO);

      Alert.alert(
        'Conta excluída',
        dados.mensagem || 'Sua conta foi excluída permanentemente.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (sairDaConta) {
                sairDaConta();
              } else {
                setUsuarioAtual(null);
                navegarComAnimacao('Principal');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao excluir conta:', error);

      Alert.alert(
        'Erro',
        error.message || 'Erro ao excluir conta permanentemente.'
      );
    } finally {
      setExcluindoConta(false);
    }
  };

  const handleExcluirConta = () => {
    Alert.alert(
      'Excluir Conta Permanentemente',
      'Atenção: esta ação apagará sua conta, suas casas, seus pets, metas e agendamentos criados por você. Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir permanentemente',
          onPress: excluirContaPermanentemente,
          style: 'destructive'
        }
      ]
    );
  };

  const coresFundo = modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF'];
  const corCartao = modoNoturno ? '#1E1E1E' : '#FFF';
  const corTextoPrincipal = modoNoturno ? '#FFF' : '#333';
  const corTextoSecundario = modoNoturno ? '#AAA' : '#666';

  const corCartaoLaranja = modoNoturno ? '#331E0B' : '#FFF3E0';
  const corBordaLaranja = modoNoturno ? '#663C16' : '#FFD1A3';
  const corCartaoAzul = modoNoturno ? '#0F1E38' : '#F0F4FF';
  const corBordaAzul = modoNoturno ? '#1E3C70' : '#E0E8FF';
  const corCartaoVerde = modoNoturno ? '#143314' : '#E8F5E9';
  const corBordaVerde = modoNoturno ? '#2E592E' : '#C8E6C9';

  const corMenuFundo = modoNoturno ? '#2A2A2A' : '#F4F5F7';
  const corBotaoSairFundo = modoNoturno ? '#331515' : '#FFF0F0';
  const corBotaoSairBorda = modoNoturno ? '#551A1A' : '#FFD6D6';

  const quantidadePets = pets ? pets.length : 0;
  const quantidadeCasas = casas ? casas.length : 0;
  const anoAtual = new Date().getFullYear();

  return (
    <LinearGradient colors={coresFundo} style={styles.container}>
      <StatusBar style={modoNoturno ? 'light' : 'auto'} />

      <View style={styles.areaCabecalho}>
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navegarComAnimacao('Casas')}
          disabled={excluindoConta}
        >
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.textosCabecalho}>
          <Text style={styles.tituloHeader}>Perfil</Text>
          <Text style={styles.subTituloHeader}>Configurações da Conta</Text>
        </View>
      </View>

      <View style={[styles.cardAlegre, { backgroundColor: corCartao }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          <View style={styles.areaInfoUsuario}>
            <TouchableOpacity
              style={styles.areaFotoUsuario}
              onPress={escolherImagemPerfil}
              disabled={excluindoConta}
            >
              <Image
                source={{
                  uri: usuarioAtual?.imagem || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                }}
                style={styles.imagemUsuario}
              />

              <View style={styles.iconeEdicaoUsuario}>
                <Feather name="camera" size={16} color="#FFF" />
              </View>
            </TouchableOpacity>

            <Text style={[styles.nomeUsuario, { color: corTextoPrincipal }]}>
              {usuarioAtual?.nome}
            </Text>

            <View style={[styles.badgeID, { backgroundColor: corCartaoLaranja, borderColor: corBordaLaranja }]}>
              <Feather name="hash" size={14} color="#F86F03" />

              <Text style={[styles.textoBadgeID, { color: '#F86F03' }]}>
                ID: {usuarioAtual?.id}
              </Text>
            </View>
          </View>

          <View style={styles.areaEstatisticas}>
            <View style={[styles.cartaoEstatistica, { backgroundColor: corCartaoAzul, borderColor: corBordaAzul }]}>
              <Text style={[styles.numeroEstatistica, { color: '#4F7FFF' }]}>
                {quantidadePets}
              </Text>

              <Text style={[styles.textoEstatistica, { color: corTextoSecundario }]}>
                Pets Salvos
              </Text>
            </View>

            <View style={[styles.cartaoEstatistica, { backgroundColor: corCartaoLaranja, borderColor: corBordaLaranja }]}>
              <Text style={[styles.numeroEstatistica, { color: '#F86F03' }]}>
                {quantidadeCasas}
              </Text>

              <Text style={[styles.textoEstatistica, { color: corTextoSecundario }]}>
                Casas
              </Text>
            </View>

            <View style={[styles.cartaoEstatistica, { backgroundColor: corCartaoVerde, borderColor: corBordaVerde }]}>
              <Text style={[styles.numeroEstatistica, { color: '#4CAF50' }]}>
                {anoAtual}
              </Text>

              <Text style={[styles.textoEstatistica, { color: corTextoSecundario }]}>
                Desde
              </Text>
            </View>
          </View>

          <Text style={[styles.tituloSecao, { color: corTextoPrincipal }]}>
            Ajustes
          </Text>

          <View style={styles.areaMenu}>
            <View style={[styles.itemMenu, { backgroundColor: corMenuFundo }]}>
              <View style={[styles.iconeMenuFundo, { backgroundColor: '#E8F5E9' }]}>
                <Feather name="bell" size={20} color="#4CAF50" />
              </View>

              <Text style={[styles.textoMenu, { color: corTextoPrincipal }]}>
                Notificações
              </Text>

              <Switch
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={notificacoesAtivas ? '#4F7FFF' : '#f4f3f4'}
                onValueChange={toggleNotificacoes}
                value={notificacoesAtivas}
                disabled={excluindoConta}
              />
            </View>

            <View style={[styles.itemMenu, { backgroundColor: corMenuFundo }]}>
              <View style={[styles.iconeMenuFundo, { backgroundColor: '#E3F2FD' }]}>
                <Feather name="moon" size={20} color="#4F7FFF" />
              </View>

              <Text style={[styles.textoMenu, { color: corTextoPrincipal }]}>
                Modo Noturno
              </Text>

              <Switch
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={modoNoturno ? '#4F7FFF' : '#f4f3f4'}
                onValueChange={alternarTema}
                value={modoNoturno}
                disabled={excluindoConta}
              />
            </View>
          </View>

          <Text style={[styles.tituloSecao, { color: corTextoPrincipal, marginTop: 10 }]}>
            Conta
          </Text>

          <TouchableOpacity
            style={[styles.botaoSair, { backgroundColor: corBotaoSairFundo, borderColor: corBotaoSairBorda }]}
            onPress={handleSair}
            disabled={excluindoConta}
          >
            <Feather name="log-out" size={20} color="#FF4C4C" />

            <Text style={styles.textoBotaoSair}>
              Sair da Conta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.botaoExcluirConta,
              {
                borderColor: corBotaoSairBorda,
                opacity: excluindoConta ? 0.6 : 1
              }
            ]}
            onPress={handleExcluirConta}
            disabled={excluindoConta}
          >
            {excluindoConta ? (
              <ActivityIndicator size="small" color="#FF4C4C" />
            ) : (
              <Feather name="trash-2" size={20} color="#FF4C4C" />
            )}

            <Text style={styles.textoBotaoExcluir}>
              {excluindoConta ? 'Excluindo conta...' : 'Excluir Conta Definitivamente'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
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
    paddingBottom: 60,
    zIndex: 1
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
    paddingHorizontal: 25,
    paddingTop: 30,
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

  areaInfoUsuario: {
    alignItems: 'center',
    marginBottom: 25
  },

  areaFotoUsuario: {
    position: 'relative',
    marginBottom: 15
  },

  imagemUsuario: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#F86F03'
  },

  iconeEdicaoUsuario: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4F7FFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 4
  },

  nomeUsuario: {
    fontSize: 26,
    fontWeight: '900'
  },

  badgeID: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1
  },

  textoBadgeID: {
    fontWeight: '900',
    marginLeft: 8,
    fontSize: 14
  },

  areaEstatisticas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 35,
    gap: 10
  },

  cartaoEstatistica: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1
  },

  numeroEstatistica: {
    fontSize: 20,
    fontWeight: '900'
  },

  textoEstatistica: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2
  },

  tituloSecao: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 15,
    paddingHorizontal: 5
  },

  areaMenu: {
    marginBottom: 20
  },

  itemMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    marginBottom: 12
  },

  iconeMenuFundo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },

  textoMenu: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold'
  },

  botaoSair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1
  },

  textoBotaoSair: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#FF4C4C'
  },

  botaoExcluirConta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderStyle: 'dashed'
  },

  textoBotaoExcluir: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#FF4C4C'
  }
});