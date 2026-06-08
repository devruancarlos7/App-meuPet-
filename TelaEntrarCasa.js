import React, { useState } from 'react'; 
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Platform, SafeAreaView, KeyboardAvoidingView, LayoutAnimation, UIManager } from 'react-native'; 
import { LinearGradient } from 'expo-linear-gradient'; 
import { StatusBar } from 'expo-status-bar'; 
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) { 
  UIManager.setLayoutAnimationEnabledExperimental(true); 
}

export default function TelaEntrarCasa({ setTelaAtual, casas, membros, setMembros, usuarioAtual, modoNoturno }) {

  const [codigoCasa, setCodigoCasa] = useState('');

  const handleVoltar = () => { 
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
    setTelaAtual('Casas'); 
  };

  const handleEntrarCasa = () => { 
    if (codigoCasa.trim() === '') { 
      alert("Por favor, digite o ID da casa!"); 
      return; 
    }
    handleVoltar();
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
      <StatusBar style={modoNoturno ? "light" : "auto"} /> 
      
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          
          <View style={styles.areaCabecalho}> 
            <TouchableOpacity onPress={handleVoltar} style={styles.botaoVoltar}> 
              <Ionicons name="arrow-back" size={28} color="#FFF" /> 
            </TouchableOpacity> 
            <View style={styles.textosCabecalho}> 
              <Text style={styles.tituloHeader}>Entrar em Casa</Text> 
              <Text style={styles.subTituloHeader}>Junte-se a uma família</Text> 
            </View> 
          </View>

          <View style={[styles.cardAlegre, { backgroundColor: corCartao }]}> 
            
            <View style={styles.areaIconeCentral}> 
              <View style={[styles.circuloIcone, { backgroundColor: corIconeFundo, borderColor: corIconeBorda }]}> 
                <Feather name="log-in" size={40} color="#4F7FFF" /> 
              </View> 
              <Text style={[styles.tituloSecao, { color: corTextoPrincipal }]}>Código de Convite</Text> 
              <Text style={[styles.textoInstrucao, { color: corTextoSecundario }]}>Peça ao administrador da casa o ID para poder entrar.</Text> 
            </View>

            <View style={[styles.areaInput, { backgroundColor: corInputFundo, borderColor: corInputBorda }]}> 
              <Feather name="key" size={20} color="#888" style={styles.iconeInput} /> 
              <TextInput 
                style={[styles.input, { color: corTextoPrincipal }]} 
                placeholder="Digite o código (ex: #12345)" 
                placeholderTextColor={modoNoturno ? "#888" : "#A0A0A0"} 
                value={codigoCasa} 
                onChangeText={setCodigoCasa} 
              /> 
            </View>

            <TouchableOpacity style={styles.botaoAcao} onPress={handleEntrarCasa}> 
              <Text style={styles.textoBotaoAcao}>Entrar na Casa</Text> 
            </TouchableOpacity>

          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient> 
  ); 
}

const styles = StyleSheet.create({ 
  container: { flex: 1 }, 
  patinha: { position: 'absolute', zIndex: 0 },

  // 👉 CORREÇÃO APLICADA AQUI: paddingTop 50 e paddingBottom 60 empurram os textos para baixo da notificação! [1]
  areaCabecalho: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 50, paddingBottom: 60 }, 
  botaoVoltar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 15 }, 
  textosCabecalho: { flex: 1 }, 
  tituloHeader: { fontSize: 28, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }, 
  subTituloHeader: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' },

  // 👉 CORREÇÃO APLICADA AQUI: paddingTop 45 e marginTop 10 dão o respiro que faltava no cartão! [2]
  cardAlegre: { borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30, paddingTop: 45, flex: 1, marginTop: 10, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.15, shadowRadius: 15 },

  areaIconeCentral: { alignItems: 'center', marginBottom: 35 }, 
  circuloIcone: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 2 }, 
  tituloSecao: { fontSize: 24, fontWeight: '900', marginBottom: 10 }, 
  textoInstrucao: { fontSize: 15, textAlign: 'center', fontWeight: '500', lineHeight: 22 },

  areaInput: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, marginBottom: 30, paddingHorizontal: 20, height: 65, borderWidth: 1 }, 
  iconeInput: { marginRight: 15 }, 
  input: { flex: 1, fontSize: 18, fontWeight: 'bold' },

  botaoAcao: { flexDirection: 'row', backgroundColor: '#F86F03', borderRadius: 16, height: 65, justifyContent: 'center', alignItems: 'center', shadowColor: '#F86F03', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }, 
  textoBotaoAcao: { color: '#FFF', fontSize: 18, fontWeight: 'bold' } 
});