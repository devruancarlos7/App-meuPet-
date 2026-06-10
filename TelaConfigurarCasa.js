import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Platform,
  LayoutAnimation,
  UIManager,
  Share
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000'
  : 'http://192.168.1.245:3000';

export default function TelaConfigurarCasa({
  setTelaAtual,
  casaAtual,
  setCasaAtual,
  casas,
  setCasas,
  usuarioAtual,
  pets,
  setPets,
  membros,
  setMembros,
  modoNoturno,
  buscarCasasDoUsuario,
  buscarPetsDaCasa,
  buscarMembrosDaCasa
}) {
  const ehLider =
    String(casaAtual?.adminId ?? casaAtual?.admin_id) === String(usuarioAtual?.id);

  const petsDestaCasa =
    pets?.filter(p => String(p.casaId ?? p.casa_id) === String(casaAtual?.id)) || [];

  const membrosDestaCasa =
    membros?.filter(m => String(m.casaId ?? m.casa_id) === String(casaAtual?.id)) || [];

  const membrosAtivos = membrosDestaCasa.filter(m => m.tipo !== 'pendente');
  const membrosPendentes = membrosDestaCasa.filter(m => m.tipo === 'pendente');

  const navegarComAnimacao = (tela) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual(tela);
  };

  const escolherImagemCasa = async () => {
    try {
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
        aspect: [3, 2],
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

      const resposta = await fetch(`${API_URL}/casas/${casaAtual.id}/imagem`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imagem: novaImagem
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok || dados.sucesso === false) {
        Alert.alert('Erro', dados.erro || 'Erro ao salvar imagem no servidor.');
        return;
      }

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      const casaAtualizada = {
        ...casaAtual,
        imagem: novaImagem
      };

      setCasaAtual(casaAtualizada);

      setCasas(casasAtuais =>
        casasAtuais.map(c =>
          String(c.id) === String(casaAtual.id) ? casaAtualizada : c
        )
      );

      if (buscarCasasDoUsuario && usuarioAtual?.id) {
        await buscarCasasDoUsuario(usuarioAtual.id);
      }

      if (buscarPetsDaCasa && casaAtual?.id) {
        await buscarPetsDaCasa(casaAtual.id);
      }

      if (buscarMembrosDaCasa && casaAtual?.id) {
        await buscarMembrosDaCasa(casaAtual.id);
      }

      Alert.alert('Sucesso', 'Imagem da casa atualizada!');
    } catch (error) {
      console.error('Erro ao abrir/salvar imagem da casa:', error);
      Alert.alert(
        'Erro',
        'Erro ao abrir a galeria. Verifique a permissão de fotos do Expo Go.'
      );
    }
  };

  const compartilharCodigo = async () => {
    try {
      await Share.share({
        message: `🐾 Olá! Venha cuidar dos pets comigo no app MeuPets!\n\nPara pedir para entrar na minha casa, use o código ID: ${casaAtual.id}`
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const aprovarMembro = async (membro) => {
    try {
      const resposta = await fetch(`${API_URL}/casas/membros/aprovar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          casa_id: casaAtual.id,
          usuario_id: membro.id
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok || dados.sucesso === false) {
        Alert.alert('Erro', dados.erro || 'Erro ao aprovar membro.');
        return;
      }

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      setMembros(membrosGlobais =>
        membrosGlobais.map(m =>
          String(m.id) === String(membro.id) &&
          String(m.casaId ?? m.casa_id) === String(casaAtual.id)
            ? { ...m, tipo: 'convidado' }
            : m
        )
      );

      if (buscarMembrosDaCasa && casaAtual?.id) {
        await buscarMembrosDaCasa(casaAtual.id);
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    }
  };

  const rejeitarMembro = async (membro) => {
    Alert.alert(
      'Rejeitar Solicitação',
      `Não deixar ${membro.nome} entrar?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: async () => {
            try {
              const resposta = await fetch(`${API_URL}/casas/membros/rejeitar`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  casa_id: casaAtual.id,
                  usuario_id: membro.id
                })
              });

              const dados = await resposta.json();

              if (!resposta.ok || dados.sucesso === false) {
                Alert.alert('Erro', dados.erro || 'Erro ao rejeitar membro.');
                return;
              }

              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

              setMembros(membrosGlobais =>
                membrosGlobais.filter(m =>
                  !(
                    String(m.id) === String(membro.id) &&
                    String(m.casaId ?? m.casa_id) === String(casaAtual.id)
                  )
                )
              );

              if (buscarMembrosDaCasa && casaAtual?.id) {
                await buscarMembrosDaCasa(casaAtual.id);
              }
            } catch (error) {
              console.error('Erro ao rejeitar:', error);
              Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
            }
          }
        }
      ]
    );
  };

  const excluirPet = (pet) => {
    if (!ehLider) {
      Alert.alert('Atenção', 'Apenas o líder da casa pode excluir pets.');
      return;
    }

    Alert.alert(
      'Remover Pet',
      `Tem certeza que deseja remover o(a) ${pet.nome} desta casa? As metas e agendamentos dele também serão apagados.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const resposta = await fetch(`${API_URL}/pets/${pet.id}/excluir`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  casa_id: casaAtual.id,
                  admin_id: usuarioAtual.id
                })
              });

              const dados = await resposta.json();

              if (!resposta.ok || dados.sucesso === false) {
                Alert.alert('Erro', dados.erro || 'Erro ao excluir o pet.');
                return;
              }

              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

              setPets(petsGlobais =>
                petsGlobais.filter(p => String(p.id) !== String(pet.id))
              );

              if (buscarPetsDaCasa && casaAtual?.id) {
                await buscarPetsDaCasa(casaAtual.id);
              }

              Alert.alert('Sucesso', 'Pet removido com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir pet:', error);
              Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
            }
          }
        }
      ]
    );
  };

  const coresFundo = modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF'];
  const corCartao = modoNoturno ? '#1E1E1E' : '#FFF';
  const corTextoPrincipal = modoNoturno ? '#FFF' : '#333';
  const corTextoSecundario = modoNoturno ? '#AAA' : '#666';

  const corMembroComum = modoNoturno ? '#2A2A2A' : '#F4F5F7';
  const corMembroComumBorda = modoNoturno ? '#444' : '#EAEAEA';
  const corMembroLider = modoNoturno ? '#331E0B' : '#FFF3E0';
  const corMembroLiderBorda = modoNoturno ? '#663C16' : '#FFD1A3';
  const corPendente = modoNoturno ? '#331E0B' : '#FFF3E0';
  const corPendenteBorda = modoNoturno ? '#663C16' : '#FFD1A3';

  const corBadgeID = modoNoturno ? '#331E0B' : '#FFF3E0';
  const corBadgeBorda = modoNoturno ? '#663C16' : '#FFD1A3';
  const corPetFundo = modoNoturno ? '#232D3F' : '#F0F4FF';
  const corPetBorda = modoNoturno ? '#1A2333' : '#E0E8FF';
  const corAreaVazia = modoNoturno ? '#1A1A1A' : '#F9F9F9';
  const corAreaVaziaBorda = modoNoturno ? '#444' : '#EEE';

  return (
    <LinearGradient colors={coresFundo} style={styles.container}>
      <StatusBar style={modoNoturno ? 'light' : 'auto'} />

      <View style={styles.areaCabecalho}>
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navegarComAnimacao('Casas')}
        >
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.textosCabecalho}>
          <Text style={styles.tituloHeader}>Ajustes</Text>
          <Text style={styles.subTituloHeader}>Configurar Casa</Text>
        </View>
      </View>

      <View style={[styles.cardAlegre, { backgroundColor: corCartao }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.areaInfoCasa}>
            <TouchableOpacity style={styles.areaFotoCasa} onPress={escolherImagemCasa}>
              <Image
                source={{
                  uri:
                    casaAtual?.imagem ||
                    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=250&auto=format&fit=crop'
                }}
                style={styles.imagemCasa}
              />

              <View style={styles.iconeEdicaoCasa}>
                <Feather name="camera" size={16} color="#FFF" />
              </View>
            </TouchableOpacity>

            <Text style={[styles.nomeCasa, { color: corTextoPrincipal }]}>
              {casaAtual?.nome}
            </Text>

            <View
              style={[
                styles.badgeID,
                {
                  backgroundColor: corBadgeID,
                  borderColor: corBadgeBorda
                }
              ]}
            >
              <Feather name="hash" size={16} color="#F86F03" />
              <Text style={styles.textoBadgeID}>ID: {casaAtual?.id}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.botaoConvidar,
              {
                backgroundColor: '#F0F4FF',
                borderColor: '#4F7FFF'
              }
            ]}
            onPress={compartilharCodigo}
          >
            <Feather name="share-2" size={20} color="#4F7FFF" />
            <Text style={styles.textoBotaoConvidar}>Enviar código de acesso</Text>
          </TouchableOpacity>

          {ehLider && membrosPendentes.length > 0 && (
            <View style={styles.secao}>
              <Text style={[styles.tituloSecao, { color: '#F86F03' }]}>
                Aprovações Pendentes
              </Text>

              {membrosPendentes.map((membro, index) => (
                <View
                  key={`pendente-${index}`}
                  style={[
                    styles.cartaoPendente,
                    {
                      backgroundColor: corPendente,
                      borderColor: corPendenteBorda
                    }
                  ]}
                >
                  <Image
                    source={{
                      uri:
                        membro.imagem ||
                        'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                    }}
                    style={styles.imagemMembro}
                  />

                  <View style={styles.infoMembro}>
                    <Text style={[styles.nomeMembro, { color: corTextoPrincipal }]}>
                      {membro.nome}
                    </Text>

                    <Text style={styles.statusPendente}>
                      Aguardando sua permissão
                    </Text>
                  </View>

                  <View style={styles.areaBotoesAprovacao}>
                    <TouchableOpacity
                      style={styles.botaoRejeitar}
                      onPress={() => rejeitarMembro(membro)}
                    >
                      <Feather name="x" size={20} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.botaoAprovar}
                      onPress={() => aprovarMembro(membro)}
                    >
                      <Feather name="check" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.secao}>
            <Text style={[styles.tituloSecao, { color: corTextoPrincipal }]}>
              Membros Ativos
            </Text>

            {membrosAtivos.map((membro, index) => {
              const eOLider =
                String(membro.id) === String(casaAtual?.adminId ?? casaAtual?.admin_id);

              return (
                <View
                  key={`ativo-${index}`}
                  style={[
                    styles.cartaoMembro,
                    {
                      backgroundColor: eOLider ? corMembroLider : corMembroComum,
                      borderColor: eOLider ? corMembroLiderBorda : corMembroComumBorda,
                      borderWidth: 1
                    }
                  ]}
                >
                  <Image
                    source={{
                      uri:
                        membro.imagem ||
                        'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                    }}
                    style={styles.imagemMembro}
                  />

                  <View style={styles.infoMembro}>
                    <Text style={[styles.nomeMembro, { color: corTextoPrincipal }]}>
                      {membro.nome}{' '}
                      {String(membro.id) === String(usuarioAtual?.id) && '(Você)'}
                    </Text>

                    <Text
                      style={
                        eOLider
                          ? styles.statusLider
                          : [styles.statusComum, { color: corTextoSecundario }]
                      }
                    >
                      {eOLider ? '👑 Líder da Casa' : '👤 Convidado'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.secao}>
            <Text style={[styles.tituloSecao, { color: corTextoPrincipal }]}>
              Pets Morando Aqui
            </Text>

            {petsDestaCasa.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollHorizontal}>
                {petsDestaCasa.map((pet, index) => (
                  <View
                    key={`pet-${pet.id ?? index}`}
                    style={[
                      styles.cartaoPet,
                      {
                        backgroundColor: corPetFundo,
                        borderColor: corPetBorda
                      }
                    ]}
                  >
                    {ehLider && (
                      <TouchableOpacity
                        style={styles.botaoLixeiraPet}
                        onPress={() => excluirPet(pet)}
                      >
                        <Feather name="trash-2" size={14} color="#FFF" />
                      </TouchableOpacity>
                    )}

                    <Image
                      source={{
                        uri:
                          pet.imagem ||
                          'https://images.unsplash.com/photo-1552053831-71594a27632d'
                      }}
                      style={styles.imagemPetMini}
                    />

                    <Text style={[styles.nomePetMini, { color: corTextoPrincipal }]}>
                      {pet.nome}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View
                style={[
                  styles.areaVaziaPets,
                  {
                    backgroundColor: corAreaVazia,
                    borderColor: corAreaVaziaBorda
                  }
                ]}
              >
                <Text style={styles.textoVazioPets}>Nenhum pet cadastrado.</Text>
              </View>
            )}
          </View>
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

  areaInfoCasa: {
    alignItems: 'center',
    marginBottom: 20
  },

  areaFotoCasa: {
    position: 'relative',
    marginBottom: 15
  },

  imagemCasa: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#4F7FFF'
  },

  iconeEdicaoCasa: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F86F03',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 4
  },

  nomeCasa: {
    fontSize: 28,
    fontWeight: '900'
  },

  badgeID: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1
  },

  textoBadgeID: {
    color: '#F86F03',
    fontWeight: '900',
    marginLeft: 8,
    fontSize: 16
  },

  botaoConvidar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderStyle: 'dashed'
  },

  textoBotaoConvidar: {
    color: '#4F7FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10
  },

  secao: {
    marginBottom: 35
  },

  tituloSecao: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 15,
    paddingHorizontal: 5
  },

  cartaoPendente: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderStyle: 'dashed'
  },

  statusPendente: {
    fontSize: 12,
    color: '#F86F03',
    fontWeight: 'bold',
    marginTop: 2
  },

  areaBotoesAprovacao: {
    flexDirection: 'row',
    gap: 10
  },

  botaoRejeitar: {
    backgroundColor: '#FF4C4C',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3
  },

  botaoAprovar: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3
  },

  cartaoMembro: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12
  },

  imagemMembro: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#CCC'
  },

  infoMembro: {
    flex: 1,
    marginLeft: 15
  },

  nomeMembro: {
    fontSize: 18,
    fontWeight: 'bold'
  },

  statusLider: {
    fontSize: 13,
    color: '#F86F03',
    fontWeight: 'bold'
  },

  statusComum: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2
  },

  scrollHorizontal: {
    flexDirection: 'row'
  },

  cartaoPet: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    marginRight: 15,
    borderWidth: 2,
    width: 110,
    position: 'relative'
  },

  imagemPetMini: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#4F7FFF',
    marginBottom: 10
  },

  nomePetMini: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },

  botaoLixeiraPet: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4C4C',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#FF4C4C',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    zIndex: 10
  },

  areaVaziaPets: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    width: '100%',
    alignItems: 'center'
  },

  textoVazioPets: {
    color: '#888',
    fontStyle: 'italic',
    fontWeight: '500'
  }
});