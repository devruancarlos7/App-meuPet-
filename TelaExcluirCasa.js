import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView, Alert, Platform, LayoutAnimation, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

// 👉 MÁGICA DA FLUIDEZ: Habilita animações suaves no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TelaExcluirCasa({ setTelaAtual, casas, setCasas, pets, setPets, casaAtual, setCasaAtual, usuarioAtual }) {
  
  // O usuário só pode excluir as casas que ele mesmo criou (onde ele é o admin)
  const minhasCasasParaExcluir = casas.filter(casa => casa.adminId === usuarioAtual?.id);

  const handleExcluir = (casa) => {
    const confirmarExclusao = () => {
      // 👉 ANIMAÇÃO FLUIDA: Avisa o celular para animar a próxima mudança de tela!
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      
      // Remove a casa da lista
      setCasas(casas.filter(c => c.id !== casa.id));
      
      // Remove os pets que moravam nessa casa
      setPets(pets.filter(p => p.casaId !== casa.id));

      // Se a casa excluída era a que estava aberta, limpa a memória
      if (casaAtual?.id === casa.id) {
        setCasaAtual(null);
      }
    };

    if (Platform.OS === 'web') {
      const confirmou = window.confirm(`Cuidado! Tem certeza que deseja excluir a casa "${casa.nome}" permanentemente?`);
      if (confirmou) confirmarExclusao();
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
    <LinearGradient colors={['#F86F03', '#4F7FFF']} style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* Patinhas felizes de fundo */}
        <FontAwesome5 name="paw" size={120} color="rgba(255, 255, 255, 0.2)" style={[styles.patinha, { top: -10, right: -20, transform: [{ rotate: '20deg' }] }]} />
        <FontAwesome5 name="paw" size={60} color="rgba(79, 127, 255, 0.4)" style={[styles.patinha, { bottom: 50, right: 100, transform: [{ rotate: '-10deg' }] }]} />

        {/* 👉 CABEÇALHO (Com botão de voltar suave) */}
        <View style={styles.areaCabecalho}>
          <TouchableOpacity onPress={() => setTelaAtual('Casas')} style={styles.botaoVoltar}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.textosCabecalho}>
            <Text style={styles.tituloHeader}>Gerenciar</Text>
            <Text style={styles.subTituloHeader}>Limpeza de ambientes</Text>
          </View>
        </View>

        {/* 👉 CARTÃO BRANCO PRINCIPAL */}
        <View style={styles.cardAlegre}>
          
          <View style={styles.areaAviso}>
            <Feather name="alert-triangle" size={30} color="#FF4C4C" style={{ marginBottom: 10 }} />
            <Text style={styles.tituloSecao}>Excluir Casas</Text>
            <Text style={styles.textoAviso}>Atenção: Ao excluir uma casa, todos os pets e membros associados a ela serão removidos.</Text>
          </View>

          {/* Lista Fluida */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {minhasCasasParaExcluir.length > 0 ? (
              minhasCasasParaExcluir.map((casa) => (
                <View key={casa.id} style={styles.cartaoCasa}>
                  <Image source={{ uri: casa.imagem }} style={styles.imagemCasa} />
                  
                  <View style={styles.infoCasa}>
                    <Text style={styles.nomeCasa}>{casa.nome}</Text>
                    <Text style={styles.statusCasa}>👑 Você é o líder</Text>
                  </View>

                  {/* Botão Vermelho de Excluir */}
                  <TouchableOpacity style={styles.botaoLixeira} onPress={() => handleExcluir(casa)}>
                    <Feather name="trash-2" size={22} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              // Estado Vazio Amigável
              <View style={styles.areaVazia}>
                <FontAwesome5 name="check-circle" size={50} color="#4F7FFF" style={{ marginBottom: 15 }} />
                <Text style={styles.textoVazioAzul}>Tudo limpo!</Text>
                <Text style={styles.subTextoVazio}>Você não tem nenhuma casa para excluir no momento.</Text>
              </View>
            )}
          </ScrollView>

        </View>

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
    paddingHorizontal: 25,
    paddingTop: 30,
    flex: 1, 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 15
  },

  areaAviso: { alignItems: 'center', marginBottom: 25, backgroundColor: '#FFF0F0', padding: 20, borderRadius: 20, borderWidth: 2, borderColor: '#FFD6D6' },
  tituloSecao: { fontSize: 22, fontWeight: '900', color: '#FF4C4C', marginBottom: 5 },
  textoAviso: { fontSize: 14, color: '#D32F2F', textAlign: 'center', fontWeight: '600' },

  // Estilo da Casa mantendo a identidade visual feliz
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
  imagemCasa: { width: 65, height: 65, borderRadius: 32.5, borderWidth: 3, borderColor: '#4F7FFF' },
  infoCasa: { flex: 1, marginLeft: 15 },
  nomeCasa: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  statusCasa: { fontSize: 13, color: '#4F7FFF', fontWeight: 'bold' },

  // O botão de exclusão agora é uma lixeira vermelha flutuante
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
    backgroundColor: '#F0F4FF', 
    padding: 30, 
    borderRadius: 25, 
    borderWidth: 2, 
    borderColor: '#4F7FFF', 
    borderStyle: 'dashed' 
  },
  textoVazioAzul: { color: '#4F7FFF', fontSize: 20, fontWeight: '900', textAlign: 'center' },
  subTextoVazio: { color: '#555', fontSize: 15, textAlign: 'center', marginTop: 8, fontWeight: '600' }
});