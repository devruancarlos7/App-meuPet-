import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView, Alert, Platform, LayoutAnimation, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

const API_URL = 'http://192.168.12.95:3000';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TelaExcluirCasa({
  setTelaAtual, casas, setCasas, pets, setPets, casaAtual, setCasaAtual, usuarioAtual, modoNoturno
}) {
  const minhasCasasParaExcluir = casas.filter(casa => String(casa.adminId ?? casa.admin_id) === String(usuarioAtual?.id));

  const tema = modoNoturno ? {
    fundo: ['#121212', '#2C3E50'],
    cartao: '#1E1E1E',
    texto: '#FFF',
    texto2: '#AAA',
    avisoFundo: '#331515',
    avisoBorda: '#551A1A',
    avisoTexto: '#FF8A8A',
    casaFundo: '#232D3F',
    casaBorda: '#1A2333',
    vazioFundo: '#0F1E38',
    vazioBorda: '#1E3C70'
  } : {
    fundo: ['#F86F03', '#4F7FFF'],
    cartao: '#FFF',
    texto: '#333',
    texto2: '#555',
    avisoFundo: '#FFF0F0',
    avisoBorda: '#FFD6D6',
    avisoTexto: '#D32F2F',
    casaFundo: '#F0F4FF',
    casaBorda: '#E0E8FF',
    vazioFundo: '#F0F4FF',
    vazioBorda: '#4F7FFF'
  };

  const animar = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const voltar = () => {
    animar();
    setTelaAtual('Casas');
  };

  const handleExcluir = (casa) => {
    const confirmarExclusao = async () => {
      try {
        const resposta = await fetch(`${API_URL}/casas/${casa.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ admin_id: usuarioAtual?.id })
        });

        const dados = await resposta.json();

        if (!dados.sucesso) {
          alert('Ops: ' + (dados.mensagem || 'Erro ao excluir casa.'));
          return;
        }

        animar();

        setCasas(casas.filter(c => c.id !== casa.id));
        setPets(pets.filter(p => p.casaId !== casa.id));

        if (casaAtual?.id === casa.id) {
          setCasaAtual(null);
        }
      } catch (error) {
        console.error(error);
        alert('Erro ao conectar com o servidor para excluir a casa!');
      }
    };

    if (Platform.OS === 'web') {
      const confirmou = window.confirm(`Cuidado! Tem certeza que deseja excluir a casa "${casa.nome}" permanentemente?`);

      if (confirmou) {
        confirmarExclusao();
      }
    } else {
      Alert.alert(
        "Excluir Casa 🗑️",
        `Tem certeza que deseja excluir a casa "${casa.nome}"? Todos os pets dela também serão apagados!`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sim, Excluir", onPress: confirmarExclusao, style: "destructive" }
        ]
      );
    }
  };

  return (
    <LinearGradient colors={tema.fundo} style={styles.container}>
      <StatusBar style={modoNoturno ? "light" : "auto"} />

      <SafeAreaView style={{ flex: 1 }}>
        <FontAwesome5
          name="paw"
          size={120}
          color="rgba(255,255,255,0.2)"
          style={[
            styles.patinha,
            {
              top: -10,
              right: -20,
              transform: [{ rotate: '20deg' }]
            }
          ]}
        />

        <FontAwesome5
          name="paw"
          size={60}
          color="rgba(79,127,255,0.4)"
          style={[
            styles.patinha,
            {
              bottom: 50,
              right: 100,
              transform: [{ rotate: '-10deg' }]
            }
          ]}
        />

        <View style={styles.areaCabecalho}>
          <TouchableOpacity onPress={voltar} style={styles.botaoVoltar}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.textosCabecalho}>
            <Text style={styles.tituloHeader}>Gerenciar</Text>
            <Text style={styles.subTituloHeader}>Limpeza de ambientes</Text>
          </View>
        </View>

        <View style={[styles.cardAlegre, { backgroundColor: tema.cartao }]}>
          <View style={[styles.areaAviso, { backgroundColor: tema.avisoFundo, borderColor: tema.avisoBorda }]}>
            <Feather
              name="alert-triangle"
              size={30}
              color="#FF4C4C"
              style={{ marginBottom: 10 }}
            />

            <Text style={styles.tituloSecao}>
              Excluir Casas
            </Text>

            <Text style={[styles.textoAviso, { color: tema.avisoTexto }]}>
              Atenção: Ao excluir uma casa, todos os pets e membros associados a ela serão removidos.
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {minhasCasasParaExcluir.length > 0 ? (
              minhasCasasParaExcluir.map(casa => (
                <View
                  key={casa.id}
                  style={[
                    styles.cartaoCasa,
                    {
                      backgroundColor: tema.casaFundo,
                      borderColor: tema.casaBorda
                    }
                  ]}
                >
                  <Image source={{ uri: casa.imagem }} style={styles.imagemCasa} />

                  <View style={styles.infoCasa}>
                    <Text style={[styles.nomeCasa, { color: tema.texto }]}>
                      {casa.nome}
                    </Text>

                    <Text style={styles.statusCasa}>
                      👑 Você é o líder
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.botaoLixeira} onPress={() => handleExcluir(casa)}>
                    <Feather name="trash-2" size={22} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View
                style={[
                  styles.areaVazia,
                  {
                    backgroundColor: tema.vazioFundo,
                    borderColor: tema.vazioBorda
                  }
                ]}
              >
                <FontAwesome5
                  name="check-circle"
                  size={50}
                  color="#4F7FFF"
                  style={{ marginBottom: 15 }}
                />

                <Text style={styles.textoVazioAzul}>
                  Tudo limpo!
                </Text>

                <Text style={[styles.subTextoVazio, { color: tema.texto2 }]}>
                  Você não tem nenhuma casa para excluir no momento.
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

  areaCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 55,
    paddingBottom: 30
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
    textShadowOffset: { width: 1, height: 1 },
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
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 15
  },

  areaAviso: {
    alignItems: 'center',
    marginBottom: 25,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2
  },

  tituloSecao: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF4C4C',
    marginBottom: 5
  },

  textoAviso: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600'
  },

  cartaoCasa: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 25,
    marginBottom: 15,
    borderWidth: 2
  },

  imagemCasa: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 3,
    borderColor: '#4F7FFF'
  },

  infoCasa: {
    flex: 1,
    marginLeft: 15
  },

  nomeCasa: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },

  statusCasa: {
    fontSize: 13,
    color: '#4F7FFF',
    fontWeight: 'bold'
  },

  botaoLixeira: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FF4C4C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#FF4C4C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4
  },

  areaVazia: {
    alignItems: 'center',
    marginTop: 20,
    padding: 30,
    borderRadius: 25,
    borderWidth: 2,
    borderStyle: 'dashed'
  },

  textoVazioAzul: {
    color: '#4F7FFF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center'
  },

  subTextoVazio: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600'
  }
});