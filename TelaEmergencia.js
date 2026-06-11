import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
  LayoutAnimation,
  UIManager,
  Alert,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Número fixo do veterinário.
// Use sempre com código do país + DDD + número.
// Exemplo: 55 + 16 + 999999999
const NUMERO_WHATSAPP_VET = '5516999999999';

export default function TelaEmergencia({
  setTelaAtual,
  petAtual,
  pets = [],
  modoNoturno
}) {
  const listaPets = pets && pets.length > 0
    ? pets
    : petAtual
      ? [petAtual]
      : [];

  const [petSelecionadoId, setPetSelecionadoId] = useState(
    petAtual?.id ? String(petAtual.id) : listaPets[0]?.id ? String(listaPets[0].id) : ''
  );

  const [relato, setRelato] = useState('');
  const [buscandoSocorro, setBuscandoSocorro] = useState(false);

  const navegarComAnimacao = (tela) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual(tela);
  };

  const tema = modoNoturno ? {
    fundo: ['#121212', '#2C3E50'],
    cartao: '#1E1E1E',
    texto: '#FFF',
    texto2: '#AAA',
    inputFundo: '#2A2A2A',
    inputBorda: '#444',
    avisoFundo: '#331515',
    avisoBorda: '#551A1A',
    avisoTexto: '#FF8A8A',
    circuloFundo: '#331515',
    placeholder: '#888',
    cardPet: '#2A2A2A',
    cardPetSelecionado: '#17351F',
    bordaPet: '#444',
    bordaPetSelecionado: '#25D366'
  } : {
    fundo: ['#D32F2F', '#FF5252'],
    cartao: '#FFF',
    texto: '#333',
    texto2: '#666',
    inputFundo: '#F4F5F7',
    inputBorda: '#EAEAEA',
    avisoFundo: '#FFEBEE',
    avisoBorda: '#FFCDD2',
    avisoTexto: '#B71C1C',
    circuloFundo: '#FFEBEE',
    placeholder: '#A0A0A0',
    cardPet: '#F4F5F7',
    cardPetSelecionado: '#E8F5E9',
    bordaPet: '#EAEAEA',
    bordaPetSelecionado: '#25D366'
  };

  const petSelecionado = listaPets.find(
    pet => String(pet.id) === String(petSelecionadoId)
  );

  const calcularIdadePet = (nascimento) => {
    if (!nascimento) return 'Não informada';

    const texto = String(nascimento).trim();

    // Aceita formato DD/MM/AAAA
    const partes = texto.split('/');

    if (partes.length !== 3) {
      return texto;
    }

    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const ano = Number(partes[2]);

    if (!dia || !mes || !ano) {
      return texto;
    }

    const dataNascimento = new Date(ano, mes - 1, dia);

    const dataExiste =
      dataNascimento.getFullYear() === ano &&
      dataNascimento.getMonth() === mes - 1 &&
      dataNascimento.getDate() === dia;

    if (!dataExiste) {
      return texto;
    }

    const hoje = new Date();

    let anos = hoje.getFullYear() - ano;
    let meses = hoje.getMonth() - (mes - 1);

    if (hoje.getDate() < dia) {
      meses -= 1;
    }

    if (meses < 0) {
      anos -= 1;
      meses += 12;
    }

    if (anos <= 0 && meses <= 0) {
      return 'Menos de 1 mês';
    }

    if (anos <= 0) {
      return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    }

    if (meses <= 0) {
      return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    }

    return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  };

  const limparNumeroWhatsApp = (numero) => {
    return String(numero || '').replace(/\D/g, '');
  };

  const abrirWhatsApp = async (numero, mensagem) => {
    const numeroLimpo = limparNumeroWhatsApp(numero);

    if (!numeroLimpo) {
      Alert.alert('Erro', 'Número do veterinário não configurado.');
      return;
    }

    const urlWhatsAppApp = `whatsapp://send?phone=${numeroLimpo}&text=${encodeURIComponent(mensagem)}`;
    const urlWhatsAppWeb = `https://wa.me/${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;

    try {
      const suportaApp = await Linking.canOpenURL(urlWhatsAppApp);

      if (suportaApp) {
        await Linking.openURL(urlWhatsAppApp);
      } else {
        await Linking.openURL(urlWhatsAppWeb);
      }
    } catch (error) {
      console.log('Erro ao abrir WhatsApp:', error);
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp neste dispositivo.');
    }
  };

  const montarMensagemEmergencia = () => {
    const nomePet = petSelecionado?.nome || 'Não informado';
    const tipoPet = petSelecionado?.tipo || 'Não informado';
    const racaPet = petSelecionado?.raca || 'Não informada';
    const nascimentoPet = petSelecionado?.nascimento || 'Não informado';
    const idadePet = calcularIdadePet(nascimentoPet);

    return `🚨 *EMERGÊNCIA VETERINÁRIA* 🚨

Olá, preciso de ajuda urgente com meu pet.

🐾 *Informações do pet:*
• Nome: ${nomePet}
• Tipo: ${tipoPet}
• Raça: ${racaPet}
• Nascimento: ${nascimentoPet}
• Idade aproximada: ${idadePet}

🩺 *Sintomas / Observação:*
${relato.trim()}

Vocês estão disponíveis para atendimento imediato?`;
  };

  const acionarSocorro = async () => {
    if (!petSelecionado) {
      Alert.alert(
        'Escolha um pet',
        'Selecione qual pet está precisando de atendimento.'
      );
      return;
    }

    if (relato.trim() === '') {
      Alert.alert(
        'Relato obrigatório',
        'Descreva brevemente os sintomas ou o que aconteceu com o pet.'
      );
      return;
    }

    setBuscandoSocorro(true);

    try {
      const mensagem = montarMensagemEmergencia();

      await abrirWhatsApp(NUMERO_WHATSAPP_VET, mensagem);
    } catch (error) {
      console.log('Erro ao acionar veterinário:', error);

      Alert.alert(
        'Erro',
        'Erro ao tentar acionar o veterinário. Verifique sua conexão.'
      );
    } finally {
      setBuscandoSocorro(false);
    }
  };

  return (
    <LinearGradient colors={tema.fundo} style={styles.container}>
      <StatusBar style={modoNoturno ? 'light' : 'auto'} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >

          <View style={styles.areaCabecalho}>
            <TouchableOpacity
              onPress={() => navegarComAnimacao('ListaDePets')}
              style={styles.botaoVoltar}
              disabled={buscandoSocorro}
            >
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.textosCabecalho}>
              <Text style={styles.tituloHeader}>Emergência</Text>
              <Text style={styles.subTituloHeader}>Envie ajuda pelo WhatsApp</Text>
            </View>
          </View>

          <View style={[styles.cardAlegre, { backgroundColor: tema.cartao }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

              <View style={styles.areaIconeCentral}>
                <View style={[styles.circuloIcone, { backgroundColor: tema.circuloFundo }]}>
                  <FontAwesome5 name="ambulance" size={35} color="#D32F2F" />
                </View>
              </View>

              <View style={[styles.caixaAviso, { backgroundColor: tema.avisoFundo, borderColor: tema.avisoBorda }]}>
                <Text style={styles.textoAvisoTitulo}>⚠️ ATENÇÃO</Text>

                <Text style={[styles.textoAviso, { color: tema.avisoTexto }]}>
                  Use esta tela apenas para casos de urgência. Escolha o pet e descreva os sintomas para enviar uma mensagem rápida ao veterinário.
                </Text>
              </View>

              <Text style={[styles.tituloSecao, { color: tema.texto }]}>
                Escolha o pet
              </Text>

              {listaPets.length === 0 ? (
                <View style={[styles.caixaSemPets, { backgroundColor: tema.inputFundo, borderColor: tema.inputBorda }]}>
                  <Feather name="alert-circle" size={22} color="#D32F2F" />

                  <Text style={[styles.textoSemPets, { color: tema.texto }]}>
                    Nenhum pet encontrado nesta casa.
                  </Text>
                </View>
              ) : (
                <View style={styles.listaPets}>
                  {listaPets.map((pet) => {
                    const selecionado = String(pet.id) === String(petSelecionadoId);

                    return (
                      <TouchableOpacity
                        key={String(pet.id)}
                        style={[
                          styles.cardPet,
                          {
                            backgroundColor: selecionado ? tema.cardPetSelecionado : tema.cardPet,
                            borderColor: selecionado ? tema.bordaPetSelecionado : tema.bordaPet
                          }
                        ]}
                        onPress={() => setPetSelecionadoId(String(pet.id))}
                        disabled={buscandoSocorro}
                      >
                        <View style={styles.areaIconePet}>
                          <FontAwesome5
                            name="paw"
                            size={18}
                            color={selecionado ? '#25D366' : '#888'}
                          />
                        </View>

                        <View style={styles.areaTextoPet}>
                          <Text style={[styles.nomePet, { color: tema.texto }]}>
                            {pet.nome || 'Pet sem nome'}
                          </Text>

                          <Text style={[styles.infoPet, { color: tema.texto2 }]}>
                            {pet.raca || 'Raça não informada'} • {calcularIdadePet(pet.nascimento)}
                          </Text>
                        </View>

                        {selecionado && (
                          <Feather name="check-circle" size={22} color="#25D366" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <Text style={[styles.tituloSecao, { color: tema.texto, marginTop: 10 }]}>
                Sintomas / Observação
              </Text>

              <Text style={[styles.textoExplicativo, { color: tema.texto2 }]}>
                O que está acontecendo?
              </Text>

              <View style={[styles.areaInput, { backgroundColor: tema.inputFundo, borderColor: tema.inputBorda }]}>
                <Feather name="alert-circle" size={20} color={tema.placeholder} style={styles.iconeInput} />

                <TextInput
                  style={[styles.input, { color: tema.texto }]}
                  placeholder="Ex: Comeu chocolate, está vomitando, foi atropelado..."
                  placeholderTextColor={tema.placeholder}
                  value={relato}
                  onChangeText={setRelato}
                  multiline={true}
                  editable={!buscandoSocorro}
                />
              </View>

              <TouchableOpacity
                style={[styles.botaoAcao, buscandoSocorro && { opacity: 0.7 }]}
                onPress={acionarSocorro}
                disabled={buscandoSocorro}
              >
                {buscandoSocorro ? (
                  <>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={[styles.textoBotaoAcao, { marginLeft: 10 }]}>
                      Abrindo WhatsApp...
                    </Text>
                  </>
                ) : (
                  <>
                    <FontAwesome5 name="whatsapp" size={24} color="#FFF" style={{ marginRight: 10 }} />
                    <Text style={styles.textoBotaoAcao}>
                      Enviar para o Veterinário
                    </Text>
                  </>
                )}
              </TouchableOpacity>

            </ScrollView>
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
    paddingTop: 40,
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
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 30,
    flex: 1,
    marginTop: 10,
    elevation: 10
  },

  areaIconeCentral: {
    alignItems: 'center',
    marginBottom: 20
  },

  circuloIcone: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D32F2F'
  },

  caixaAviso: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginBottom: 25,
    alignItems: 'center'
  },

  textoAvisoTitulo: {
    color: '#D32F2F',
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 5
  },

  textoAviso: {
    color: '#B71C1C',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18
  },

  tituloSecao: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333',
    marginLeft: 5,
    marginBottom: 12
  },

  listaPets: {
    marginBottom: 20
  },

  cardPet: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    padding: 14,
    marginBottom: 12
  },

  areaIconePet: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginRight: 12
  },

  areaTextoPet: {
    flex: 1
  },

  nomePet: {
    fontSize: 16,
    fontWeight: '900'
  },

  infoPet: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3
  },

  caixaSemPets: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },

  textoSemPets: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 10,
    flex: 1
  },

  textoExplicativo: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
    marginBottom: 15,
    marginTop: -8
  },

  areaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    minHeight: 95,
    borderWidth: 1,
    borderColor: '#EAEAEA'
  },

  iconeInput: {
    marginRight: 15
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    minHeight: 75,
    textAlignVertical: 'center'
  },

  botaoAcao: {
    flexDirection: 'row',
    backgroundColor: '#25D366',
    borderRadius: 16,
    minHeight: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
    shadowColor: '#25D366',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    paddingHorizontal: 15
  },

  textoBotaoAcao: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});