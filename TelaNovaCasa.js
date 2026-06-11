import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Platform, SafeAreaView, KeyboardAvoidingView, LayoutAnimation, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

const API_URL = 'http://192.168.1.244:3000';

// 👉 MÁGICA DA FLUIDEZ: Habilita animações suaves no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 👉 RECEBENDO A VARIÁVEL modoNoturno DA TELA PRINCIPAL
export default function TelaNovaCasa({ setTelaAtual, casas, setCasas, usuarioAtual, modoNoturno }) {

  const [nomeCasa, setNomeCasa] = useState('');

  // 👉 VOLTAR COM ANIMAÇÃO FLUIDA
  const handleVoltar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual('Casas');
  };

  const handleCriarCasa = async () => {
    if (nomeCasa.trim() === '') {
      alert("Por favor, dê um nome para a sua casa!");
      return;
    }

    try {
      // ⚠️ ATENÇÃO: Troque "SEU_IP" pelo IP atual do seu notebook!
      const resposta = await fetch(`${API_URL}/casas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nome: nomeCasa, 
          imagem: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=250&auto=format&fit=crop',
          admin_id: usuarioAtual.id
        }),
      });

      const dados = await resposta.json();

      if (dados.sucesso) {
        if (dados.casa) {
          const casaCriada = {
            ...dados.casa,
            adminId: dados.casa.adminId ?? dados.casa.admin_id,
            admin_id: dados.casa.admin_id ?? dados.casa.adminId,
          };

          setCasas([...casas, casaCriada]);
        }

        alert('🎉 ' + dados.mensagem);
        handleVoltar();
      } else {
        alert('Ops: ' + dados.mensagem);
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao conectar com o servidor para criar a casa!');
    }
  };

  // 👉 CORES DINÂMICAS DO MODO NOTURNO
  const coresFundo = modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF'];
  const corCartao = modoNoturno ? '#1E1E1E' : '#FFF';
  const corTextoPrincipal = modoNoturno ? '#FFF' : '#333';
  const corTextoSecundario = modoNoturno ? '#AAA' : '#666';

  const corInputFundo = modoNoturno ? '#2A2A2A' : '#F4F5F7';
  const corInputBorda = modoNoturno ? '#444' : '#EAEAEA';
  const corIconeFundo = modoNoturno ? '#331E0B' : '#FFF3E0';

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
              <Text style={styles.tituloHeader}>Nova Casa</Text>
              <Text style={styles.subTituloHeader}>Crie um lar para os pets</Text>
            </View>
          </View>

          <View style={[styles.cardAlegre, { backgroundColor: corCartao }]}>
            
            <View style={styles.areaIconeCentral}>
              <View style={[styles.circuloIcone, { backgroundColor: corIconeFundo }]}>
                <FontAwesome5 name="home" size={32} color="#F86F03" />
              </View>
              <Text style={[styles.tituloSecao, { color: corTextoPrincipal }]}>Detalhes da Casa</Text>
              <Text style={[styles.textoInstrucao, { color: corTextoSecundario }]}>Dê um nome divertido ou fácil de lembrar</Text>
            </View>

            <View style={[styles.areaInput, { backgroundColor: corInputFundo, borderColor: corInputBorda }]}>
              <Feather name="edit-3" size={20} color={corTextoSecundario} style={styles.iconeInput} />
              <TextInput
                style={[styles.input, { color: corTextoPrincipal }]}
                placeholder="Nome da Casa"
                placeholderTextColor={corTextoSecundario}
                value={nomeCasa}
                onChangeText={setNomeCasa}
              />
            </View>

            <TouchableOpacity style={styles.botaoAcao} onPress={handleCriarCasa}>
              <Text style={styles.textoBotaoAcao}>Criar Casa</Text>
            </TouchableOpacity>

          </View>
          
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  areaCabecalho: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 40, paddingBottom: 60 },
  botaoVoltar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textosCabecalho: { flex: 1 },
  tituloHeader: { fontSize: 28, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  subTituloHeader: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' },
  cardAlegre: { borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30, paddingTop: 45, flex: 1, marginTop: 10, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.15, shadowRadius: 15 },
  areaIconeCentral: { alignItems: 'center', marginBottom: 35 },
  circuloIcone: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#F86F03' },
  tituloSecao: { fontSize: 24, fontWeight: '900', marginBottom: 10 },
  textoInstrucao: { fontSize: 15, textAlign: 'center', fontWeight: '500', lineHeight: 22 },
  areaInput: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, marginBottom: 30, paddingHorizontal: 20, height: 65, borderWidth: 1 },
  iconeInput: { marginRight: 15 },
  input: { flex: 1, fontSize: 18, fontWeight: 'bold' },
  botaoAcao: { flexDirection: 'row', backgroundColor: '#F86F03', borderRadius: 16, height: 65, justifyContent: 'center', alignItems: 'center', shadowColor: '#F86F03', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  textoBotaoAcao: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});
