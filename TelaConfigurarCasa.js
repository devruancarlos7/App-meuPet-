import React, { useState } from 'react'; 
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView, Alert, Platform, LayoutAnimation, UIManager } from 'react-native'; 
import { LinearGradient } from 'expo-linear-gradient'; 
import { StatusBar } from 'expo-status-bar'; 
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons'; 
import * as ImagePicker from 'expo-image-picker';

// 👉 MÁGICA DA FLUIDEZ
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) { 
  UIManager.setLayoutAnimationEnabledExperimental(true); 
}

// 👉 RECEBENDO O MODO NOTURNO
export default function TelaConfigurarCasa({ setTelaAtual, casaAtual, setCasaAtual, casas, setCasas, usuarioAtual, pets, membros, setMembros, modoNoturno }) {

  const petsDestaCasa = pets.filter(p => p.casaId === casaAtual?.id); 
  const membrosDestaCasa = membros.filter(m => m.casaId === casaAtual?.id);

  const navegarComAnimacao = (tela) => { 
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
    setTelaAtual(tela); 
  };

  const escolherImagemCasa = async () => { 
    try { 
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync(); 
      if (!permissao.granted) return alert('Precisamos de permissão para acessar suas fotos!'); 
      let resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1], quality: 1 }); 
      if (!resultado.canceled) { 
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
        const casaAtualizada = { ...casaAtual, imagem: resultado.assets.uri };
        setCasaAtual(casaAtualizada);
        // Atualiza a casa também na lista global
        setCasas(casas.map(c => c.id === casaAtual.id ? casaAtualizada : c));
      } 
    } catch (error) { 
      alert("Erro ao abrir a galeria!"); 
    } 
  };

  const handleExpulsarMembro = (membro) => { 
    Alert.alert(
      "Remover Membro",
      `Tem certeza que deseja remover ${membro.nome} desta casa?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", onPress: () => alert("Membro removido!"), style: "destructive" }
      ]
    ); 
  };

  // 👉 CORES DINÂMICAS DO MODO NOTURNO
  const coresFundo = modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF'];
  const corCartao = modoNoturno ? '#1E1E1E' : '#FFF';
  const corTextoPrincipal = modoNoturno ? '#FFF' : '#333';
  const corTextoSecundario = modoNoturno ? '#AAA' : '#666';

  const corMembroComum = modoNoturno ? '#2A2A2A' : '#F4F5F7';
  const corMembroComumBorda = modoNoturno ? '#444' : '#EAEAEA';

  const corMembroLider = modoNoturno ? '#331E0B' : '#FFF3E0';
  const corMembroLiderBorda = modoNoturno ? '#663C16' : '#FFD1A3';

  const corBadgeID = modoNoturno ? '#331E0B' : '#FFF3E0';
  const corBadgeBorda = modoNoturno ? '#663C16' : '#FFD1A3';

  const corPetFundo = modoNoturno ? '#232D3F' : '#F0F4FF';
  const corPetBorda = modoNoturno ? '#1A2333' : '#E0E8FF';
  
  const corAreaVazia = modoNoturno ? '#1A1A1A' : '#F9F9F9';
  const corAreaVaziaBorda = modoNoturno ? '#444' : '#EEE';

  return ( 
    <LinearGradient colors={coresFundo} style={styles.container}> 
      <StatusBar style={modoNoturno ? "light" : "auto"} /> 
      
      <SafeAreaView style={{ flex: 1 }}> 
        
        {/* CABEÇALHO COM RESPIRO CORRIGIDO */}
        <View style={styles.areaCabecalho}> 
          <TouchableOpacity onPress={() => navegarComAnimacao('ListaDePets')} style={styles.botaoVoltar}> 
            <Ionicons name="arrow-back" size={28} color="#FFF" /> 
          </TouchableOpacity> 
          <View style={styles.textosCabecalho}> 
            <Text style={styles.tituloHeader}>Ajustes da Casa</Text> 
            <Text style={styles.subTituloHeader}>Gerencie os membros</Text> 
          </View> 
        </View>

        {/* CARTÃO BRANCO DINÂMICO COM RESPIRO CORRIGIDO */}
        <View style={[styles.cardAlegre, { backgroundColor: corCartao }]}> 
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}> 
            
            {/* Foto e Info da Casa */}
            <View style={styles.areaInfoCasa}> 
              <TouchableOpacity style={styles.areaFotoCasa} onPress={escolherImagemCasa}> 
                <Image source={{ uri: casaAtual?.imagem || 'https://via.placeholder.com/150' }} style={styles.imagemCasa} /> 
                <View style={styles.iconeEdicaoCasa}> 
                  <Feather name="camera" size={16} color="#FFF" /> 
                </View> 
              </TouchableOpacity> 
              <Text style={[styles.nomeCasa, { color: corTextoPrincipal }]}>{casaAtual?.nome}</Text> 
              
              <View style={[styles.badgeID, { backgroundColor: corBadgeID, borderColor: corBadgeBorda }]}> 
                <Feather name="hash" size={14} color="#F86F03" /> 
                <Text style={styles.textoBadgeID}>{casaAtual?.id || "12345"}</Text> 
              </View> 
            </View>

            {/* Secão de Membros com Destaque Dinâmico */}
            <View style={styles.secao}> 
              <Text style={[styles.tituloSecao, { color: corTextoPrincipal }]}>Membros 👥</Text> 
              
              {membrosDestaCasa.map((membro, index) => {
                const isLider = membro.id === casaAtual?.adminId;
                const backgroundColor = isLider ? corMembroLider : corMembroComum;
                const borderColor = isLider ? corMembroLiderBorda : corMembroComumBorda;

                return (
                  <View key={index} style={[styles.cartaoMembro, { backgroundColor, borderColor, borderWidth: isLider ? 2 : 1 }]}> 
                    <Image source={{ uri: membro.imagem || 'https://via.placeholder.com/150' }} style={styles.imagemMembro} /> 
                    <View style={styles.infoMembro}> 
                      <Text style={[styles.nomeMembro, { color: corTextoPrincipal }]}>{membro.nome}</Text> 
                      {isLider ? (
                        <Text style={styles.statusLider}>⭐ Administrador</Text>
                      ) : (
                        <Text style={[styles.statusComum, { color: corTextoSecundario }]}>Membro</Text>
                      )}
                    </View>

                    {/* Botão Expulsar (Apenas Admin vê e não pode se expulsar) */}
                    {casaAtual?.adminId === usuarioAtual?.id && !isLider && (
                      <TouchableOpacity style={styles.botaoExpulsar} onPress={() => handleExpulsarMembro(membro)}>
                        <Feather name="user-x" size={18} color="#FFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Secão de Pets Rápidos */}
            <View style={styles.secao}> 
              <Text style={[styles.tituloSecao, { color: corTextoPrincipal }]}>Nossos Pets 🐾</Text> 
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollHorizontal}> 
                {petsDestaCasa.length > 0 ? (
                  petsDestaCasa.map((pet, index) => (
                    <View key={index} style={[styles.cartaoPet, { backgroundColor: corPetFundo, borderColor: corPetBorda }]}> 
                      <Image source={{ uri: pet.imagem || 'https://via.placeholder.com/150' }} style={styles.imagemPetMini} /> 
                      <Text style={[styles.nomePetMini, { color: corTextoPrincipal }]} numberOfLines={1}>{pet.nome}</Text> 
                    </View>
                  ))
                ) : (
                  <View style={[styles.areaVaziaPets, { backgroundColor: corAreaVazia, borderColor: corAreaVaziaBorda }]}> 
                    <Text style={styles.textoVazioPets}>Nenhum pet aqui.</Text> 
                  </View>
                )}
              </ScrollView> 
            </View>

          </ScrollView> 
        </View>

      </SafeAreaView> 
    </LinearGradient> 
  ); 
}

const styles = StyleSheet.create({ 
  container: { flex: 1 }, 
  patinha: { position: 'absolute', zIndex: 0 },

  // 👉 CORREÇÃO DO RESPIRO SUPERIOR AQUI: paddingTop 50 e paddingBottom 60
  areaCabecalho: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 50, paddingBottom: 60, zIndex: 1 }, 
  botaoVoltar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 15 }, 
  textosCabecalho: { flex: 1 }, 
  tituloHeader: { fontSize: 28, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }, 
  subTituloHeader: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' },

  // 👉 CORREÇÃO DO RESPIRO DO CARTÃO AQUI: paddingTop 45 e marginTop 10
  cardAlegre: { borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 25, paddingTop: 45, flex: 1, marginTop: 10, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.15, shadowRadius: 15 },

  areaInfoCasa: { alignItems: 'center', marginBottom: 40 }, 
  areaFotoCasa: { position: 'relative', marginBottom: 15 }, 
  imagemCasa: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#4F7FFF' }, 
  iconeEdicaoCasa: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#F86F03', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 }, 
  nomeCasa: { fontSize: 28, fontWeight: '900' }, 
  
  badgeID: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginTop: 10, borderWidth: 1 }, 
  textoBadgeID: { color: '#F86F03', fontWeight: '900', marginLeft: 8, fontSize: 16 },

  secao: { marginBottom: 35 }, 
  tituloSecao: { fontSize: 22, fontWeight: '900', marginBottom: 15, paddingHorizontal: 5 },

  // Estilos Membros
  cartaoMembro: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, marginBottom: 12 }, 
  imagemMembro: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#CCC' }, 
  infoMembro: { flex: 1, marginLeft: 15 }, 
  nomeMembro: { fontSize: 18, fontWeight: 'bold' }, 
  statusLider: { fontSize: 13, color: '#F86F03', fontWeight: 'bold' }, 
  statusComum: { fontSize: 13, fontWeight: '500', marginTop: 2 }, 
  
  botaoExpulsar: { backgroundColor: '#FF4C4C', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#FF4C4C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },

  // Estilos Pets Minis
  scrollHorizontal: { flexDirection: 'row' }, 
  cartaoPet: { alignItems: 'center', padding: 15, borderRadius: 20, marginRight: 15, borderWidth: 2, width: 110 }, 
  imagemPetMini: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#4F7FFF', marginBottom: 10 }, 
  nomePetMini: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' }, 
  
  areaVaziaPets: { padding: 20, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', width: '100%', alignItems: 'center' }, 
  textoVazioPets: { color: '#888', fontStyle: 'italic', fontWeight: '500' } 
});