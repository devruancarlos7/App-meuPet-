import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Platform, SafeAreaView, KeyboardAvoidingView, LayoutAnimation, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

// 👉 MÁGICA DA FLUIDEZ: Habilita animações suaves no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TelaEntrarCasa({ setTelaAtual, casas, membros, setMembros, usuarioAtual }) {
  
  const [codigoCasa, setCodigoCasa] = useState('');

  // 👉 FUNÇÃO PARA VOLTAR COM FLUIDEZ
  const handleVoltar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual('Casas');
  };

  const handleEntrarCasa = () => {
    if (codigoCasa.trim() === '') {
      alert("Por favor, digite o ID da casa!");
      return;
    }

    const casaEncontrada = casas.find(c => c.id === codigoCasa.trim());

    if (!casaEncontrada) {
      alert("Casa não encontrada! Verifique se o ID está correto.");
      return;
    }

    const jaEMembro = membros.some(m => m.casaId === casaEncontrada.id && m.id === usuarioAtual.id);
    const eLider = casaEncontrada.adminId === usuarioAtual.id;

    if (jaEMembro || eLider) {
      alert("Você já faz parte desta casa!");
      return;
    }

    const novoMembro = { 
      id: usuarioAtual.id, 
      nome: usuarioAtual.nome, 
      imagem: usuarioAtual.imagem, 
      casaId: casaEncontrada.id 
    };

    const concluirAcesso = () => {
      // 👉 ANIMAÇÃO NA HORA DE CONFIRMAR O ACESSO
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMembros([...membros, novoMembro]);
      setTelaAtual('Casas');
    };

    if (Platform.OS === 'web') {
      window.alert(`Sucesso! Você entrou na casa: ${casaEncontrada.nome} 🏡`);
      concluirAcesso();
    } else {
      Alert.alert("Sucesso! 🎉", `Você entrou na casa: ${casaEncontrada.nome} 🏡`, [
        { text: "Vamos lá!", onPress: concluirAcesso }
      ]);
    }
  };

  return (
    <LinearGradient colors={['#F86F03', '#4F7FFF']} style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          
          {/* Patinhas vibrantes de fundo */}
          <FontAwesome5 name="paw" size={120} color="rgba(255, 255, 255, 0.2)" style={[styles.patinha, { top: -10, right: -20, transform: [{ rotate: '20deg' }] }]} />
          <FontAwesome5 name="paw" size={60} color="rgba(79, 127, 255, 0.4)" style={[styles.patinha, { bottom: 50, right: 100, transform: [{ rotate: '-10deg' }] }]} />

          {/* 👉 CABEÇALHO COM BOTÃO DE VOLTAR SUAVE */}
          <View style={styles.areaCabecalho}>
            <TouchableOpacity onPress={handleVoltar} style={styles.botaoVoltar}>
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.textosCabecalho}>
              <Text style={styles.tituloHeader}>Convite</Text>
              <Text style={styles.subTituloHeader}>Junte-se a uma casa</Text>
            </View>
          </View>

          {/* 👉 CARTÃO BRANCO FELIZ E CLEAN */}
          <View style={styles.cardAlegre}>
            
            <View style={styles.areaIconeCentral}>
              <View style={styles.circuloIcone}>
                <Feather name="key" size={40} color="#4F7FFF" />
              </View>
              <Text style={styles.tituloSecao}>Código de Acesso</Text>
              <Text style={styles.textoInstrucao}>Digite o ID (código) fornecido pelo líder para entrar na casa e ajudar a cuidar dos pets!</Text>
            </View>

            {/* Input Clean com ícone embutido */}
            <View style={styles.areaInput}>
              <Feather name="hash" size={20} color="#888" style={styles.iconeInput} />
              <TextInput
                style={styles.input}
                placeholder="Ex: 777"
                placeholderTextColor="#A0A0A0"
                value={codigoCasa}
                onChangeText={setCodigoCasa}
              />
            </View>

            {/* Botão Gordinho e Convidativo */}
            <TouchableOpacity style={styles.botaoAcao} onPress={handleEntrarCasa}>
              <Text style={styles.textoBotaoAcao}>Acessar Casa</Text>
              <Feather name="arrow-right" size={22} color="#FFF" style={{ position: 'absolute', right: 20 }} />
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
  
  areaCabecalho: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 20, paddingBottom: 30 },
  botaoVoltar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textosCabecalho: { flex: 1 },
  tituloHeader: { fontSize: 28, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  subTituloHeader: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' },

  cardAlegre: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 40,
    flex: 1, 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 15
  },

  areaIconeCentral: { alignItems: 'center', marginBottom: 35 },
  circuloIcone: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#4F7FFF' },
  tituloSecao: { fontSize: 24, fontWeight: '900', color: '#333', marginBottom: 10 },
  textoInstrucao: { fontSize: 15, color: '#666', textAlign: 'center', fontWeight: '500', lineHeight: 22 },

  areaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
    borderRadius: 16,
    marginBottom: 30,
    paddingHorizontal: 20,
    height: 65,
    borderWidth: 1,
    borderColor: '#EAEAEA'
  },
  iconeInput: { marginRight: 15 },
  input: { flex: 1, fontSize: 18, color: '#333', fontWeight: 'bold' },

  botaoAcao: {
    flexDirection: 'row',
    backgroundColor: '#F86F03',
    borderRadius: 16,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F86F03',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  textoBotaoAcao: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});