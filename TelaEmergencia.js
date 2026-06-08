import React, { useState } from 'react'; 
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, SafeAreaView, Platform, LayoutAnimation, UIManager, Alert, Linking, ActivityIndicator, KeyboardAvoidingView } from 'react-native'; 
import { LinearGradient } from 'expo-linear-gradient'; 
import { StatusBar } from 'expo-status-bar'; 
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) { 
  UIManager.setLayoutAnimationEnabledExperimental(true); 
}

// Número do veterinário. Depois você troca por um número real. 
const NUMERO_WHATSAPP_VET = '5516999999999';

export default function TelaEmergencia({ setTelaAtual, petAtual, modoNoturno }) { 
  const [relato, setRelato] = useState(''); 
  const [buscandoSocorro, setBuscandoSocorro] = useState(false);

  const navegarComAnimacao = (tela) => { 
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
    setTelaAtual(tela); 
  };

  const tema = modoNoturno ? { 
    fundo: ['#121212', '#2C3E50'], cartao: '#1E1E1E', texto: '#FFF', texto2: '#AAA', inputFundo: '#2A2A2A', inputBorda: '#444', avisoFundo: '#331515', avisoBorda: '#551A1A', avisoTexto: '#FF8A8A', circuloFundo: '#331515', placeholder: '#888' 
  } : { 
    fundo: ['#D32F2F', '#FF5252'], cartao: '#FFF', texto: '#333', texto2: '#666', inputFundo: '#F4F5F7', inputBorda: '#EAEAEA', avisoFundo: '#FFEBEE', avisoBorda: '#FFCDD2', avisoTexto: '#B71C1C', circuloFundo: '#FFEBEE', placeholder: '#A0A0A0' 
  };

  const acionarSocorro = async () => { 
    if (relato.trim() === '') { 
      alert('Por favor, descreva brevemente o que está acontecendo com o pet para o veterinário entender a urgência.'); 
      return; 
    }

    setBuscandoSocorro(true);

    try {
      // 1. Lendo os dados do pet ou colocando "Não informado" caso esteja vazio
      const nomePet = petAtual?.nome || 'o pet';
      const tipoPet = petAtual?.tipo || 'Não informado';
      const racaPet = petAtual?.raca || 'Não informada';
      const nascimentoPet = petAtual?.nascimento || 'Não informado';

      // 2. Montando a mensagem com as crases (``)
      const mensagem = `🚨 *EMERGÊNCIA VETERINÁRIA* 🚨\n\nOlá, preciso de ajuda urgente com ${nomePet}.\n\n📋 *Resumo do pet:*\n• Nome: ${nomePet}\n• Tipo: ${tipoPet}\n• Raça: ${racaPet}\n• Nascimento/idade: ${nascimentoPet}\n\n🩺 *Relato da emergência:*\n${relato}\n\nVocês estão disponíveis para atendimento imediato?`;

      // 3. Montando a URL do WhatsApp
      const url = `whatsapp://send?phone=${NUMERO_WHATSAPP_VET}&text=${encodeURIComponent(mensagem)}`;

      // 4. Executando a abertura do App
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        alert('Não foi possível abrir o WhatsApp neste dispositivo.');
      }
    } catch (error) {
      alert('Erro ao tentar acionar o socorro. Verifique sua conexão.');
    } finally {
      setBuscandoSocorro(false);
    }
  };

  return ( 
    <LinearGradient colors={tema.fundo} style={styles.container}> 
      <StatusBar style={modoNoturno ? "light" : "auto"} /> 
      
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          
          <View style={styles.areaCabecalho}> 
            <TouchableOpacity onPress={() => navegarComAnimacao('ListaDePets')} style={styles.botaoVoltar}> 
              <Ionicons name="arrow-back" size={28} color="#FFF" /> 
            </TouchableOpacity> 
            <View style={styles.textosCabecalho}> 
              <Text style={styles.tituloHeader}>Emergência</Text> 
              <Text style={styles.subTituloHeader}>Busque socorro rápido</Text> 
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
                  Use esta tela apenas para casos de real urgência médica. Ao acionar, buscaremos a clínica mais próxima para o atendimento.
                </Text> 
              </View>

              <Text style={[styles.tituloSecao, { color: tema.texto }]}>Relato Rápido</Text> 
              <Text style={[styles.textoExplicativo, { color: tema.texto2 }]}>O que está acontecendo?</Text> 

              <View style={[styles.areaInput, { backgroundColor: tema.inputFundo, borderColor: tema.inputBorda }]}> 
                <Feather name="alert-circle" size={20} color={tema.placeholder} style={styles.iconeInput} /> 
                <TextInput 
                  style={[styles.input, { color: tema.texto }]} 
                  placeholder="Ex: Comeu chocolate, atropelado..." 
                  placeholderTextColor={tema.placeholder} 
                  value={relato} 
                  onChangeText={setRelato}
                  multiline={true} 
                /> 
              </View>

              <TouchableOpacity 
                style={styles.botaoAcao} 
                onPress={acionarSocorro}
                disabled={buscandoSocorro}
              > 
                {buscandoSocorro ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.textoBotaoAcao}>Acionar Veterinário</Text> 
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
  container: { flex: 1 }, 
  patinha: { position: 'absolute', zIndex: 0 }, 
  areaCabecalho: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 40, paddingBottom: 60, zIndex: 1 }, 
  botaoVoltar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 15 }, 
  textosCabecalho: { flex: 1 }, 
  tituloHeader: { fontSize: 28, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }, 
  subTituloHeader: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' }, 
  cardAlegre: { backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 25, paddingTop: 30, flex: 1, marginTop: 10, elevation: 10 }, 
  areaIconeCentral: { alignItems: 'center', marginBottom: 20 }, 
  circuloIcone: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#D32F2F' }, 
  caixaAviso: { backgroundColor: '#FFEBEE', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#FFCDD2', marginBottom: 25, alignItems: 'center' }, 
  textoAvisoTitulo: { color: '#D32F2F', fontWeight: '900', fontSize: 14, marginBottom: 5 }, 
  textoAviso: { color: '#B71C1C', fontSize: 12, textAlign: 'center', fontWeight: '600', lineHeight: 18 }, 
  tituloSecao: { fontSize: 20, fontWeight: '900', color: '#333', marginLeft: 5 }, 
  textoExplicativo: { fontSize: 14, color: '#666', marginLeft: 5, marginBottom: 15, marginTop: 2 }, 
  areaInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F5F7', borderRadius: 16, marginBottom: 20, paddingHorizontal: 20, height: 65, borderWidth: 1, borderColor: '#EAEAEA' }, 
  iconeInput: { marginRight: 15 }, 
  input: { flex: 1, fontSize: 16, color: '#333', fontWeight: 'bold' }, 
  botaoAcao: { flexDirection: 'row', backgroundColor: '#25D366', borderRadius: 16, height: 65, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 5, shadowColor: '#25D366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }, 
  textoBotaoAcao: { color: '#FFF', fontSize: 18, fontWeight: 'bold' } 
});