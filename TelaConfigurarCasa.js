import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, Platform, SafeAreaView, LayoutAnimation, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// 👉 MÁGICA DA FLUIDEZ
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TelaConfigurarCasa({ setTelaAtual, casaAtual, setCasaAtual, casas, setCasas, usuarioAtual, pets, membros, setMembros }) {
  
  const petsDestaCasa = pets.filter(p => p.casaId === casaAtual?.id);
  const membrosDestaCasa = membros.filter(m => m.casaId === casaAtual?.id);

  // NAVEGAÇÃO FLUIDA
  const navegarComAnimacao = (tela) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual(tela);
  };

  // MUDAR FOTO DA CASA (Agora com animação ao atualizar a tela)
  const escolherImagemCasa = async () => {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissao.granted === false) {
        alert('Precisamos de permissão para acessar suas fotos!');
        return;
      }

      let resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: true,
        aspect: new Array(1, 1), 
        quality: 1,
      });

      if (!resultado.canceled) {
        const [primeiraFoto] = resultado.assets;
        
        // Avisa que o layout vai mudar (a foto vai piscar suavemente)
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        
        const casaAtualizada = { ...casaAtual, imagem: primeiraFoto.uri };
        setCasaAtual(casaAtualizada);

        const novaListaCasas = casas.map(c => c.id === casaAtual.id ? casaAtualizada : c);
        setCasas(novaListaCasas);
      }
    } catch (error) {
      alert("Erro ao tentar abrir a galeria! " + error.message);
      console.log(error);
    }
  };

  // LÓGICA DE EXPULSAR COM ANIMAÇÃO
  const handleExpulsarMembro = (membro) => {
    const mensagem = `Tem certeza que deseja remover ${membro.nome} desta casa?`;
    
    const confirmarExpulsao = () => {
      // 👉 ANIMAÇÃO FLUIDA: O cartão do membro vai encolher até sumir!
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMembros(membros.filter(m => m.id !== membro.id));
    };

    if (Platform.OS === 'web') {
      const confirmou = window.confirm(mensagem);
      if (confirmou) confirmarExpulsao();
    } else {
      Alert.alert("Remover Membro 👋", mensagem, [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim, remover", onPress: confirmarExpulsao, style: "destructive" }
      ]);
    }
  };

  return (
    <LinearGradient colors={['#F86F03', '#4F7FFF']} style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* Patinhas vibrantes de fundo */}
        <FontAwesome5 name="paw" size={120} color="rgba(255, 255, 255, 0.2)" style={[styles.patinha, { top: -10, right: -20, transform: [{ rotate: '20deg' }] }]} />
        <FontAwesome5 name="paw" size={60} color="rgba(79, 127, 255, 0.4)" style={[styles.patinha, { bottom: 50, right: 100, transform: [{ rotate: '-10deg' }] }]} />

        {/* 👉 CABEÇALHO COM AQUELE RESPIRO GIGANTE */}
        <View style={styles.areaCabecalho}>
          <TouchableOpacity onPress={() => navegarComAnimacao('ListaDePets')} style={styles.botaoVoltar}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.textosCabecalho}>
            <Text style={styles.tituloHeader}>Configurações</Text>
            <Text style={styles.subTituloHeader}>Gerencie seu lar</Text>
          </View>
        </View>

        {/* 👉 CARTÃO BRANCO REBAIXADO */}
        <ScrollView style={styles.cardAlegre} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
          
          {/* FOTO DA CASA EM DESTAQUE */}
          <View style={styles.areaInfoCasa}>
            <TouchableOpacity style={styles.areaFotoCasa} onPress={escolherImagemCasa}>
              <Image source={{ uri: casaAtual?.imagem }} style={styles.imagemCasa} />
              <View style={styles.iconeEdicaoCasa}>
                 <Feather name="camera" size={18} color="#FFF" />
              </View>
            </TouchableOpacity>

            <Text style={styles.nomeCasa}>{casaAtual?.nome}</Text>
            
            <View style={styles.badgeID}>
               <Feather name="key" size={14} color="#F86F03" />
               <Text style={styles.textoBadgeID}>ID: {casaAtual?.id}</Text>
            </View>
          </View>

          {/* SESSÃO DE MEMBROS */}
          <View style={styles.secao}>
            <Text style={styles.tituloSecao}>Membros da Casa 👨‍👩‍👧</Text>
            
            {membrosDestaCasa.map((membro) => {
              const ehLider = membro.id === casaAtual?.adminId;
              
              return (
                <View key={membro.id} style={[styles.cartaoMembro, ehLider && styles.cartaoMembroLider]}>
                  <Image source={{ uri: membro.imagem }} style={[styles.imagemMembro, ehLider && { borderColor: '#F86F03' }]} />
                  
                  <View style={styles.infoMembro}>
                    <Text style={styles.nomeMembro}>{membro.nome}</Text>
                    {ehLider ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <FontAwesome5 name="crown" size={12} color="#F86F03" />
                        <Text style={styles.statusLider}> Líder da Casa</Text>
                      </View>
                    ) : (
                      <Text style={styles.statusComum}>Convidado</Text>
                    )}
                  </View>

                  {/* Lixeira só aparece para quem não é o líder */}
                  {!ehLider && (
                    <TouchableOpacity style={styles.botaoExpulsar} onPress={() => handleExpulsarMembro(membro)}>
                      <Feather name="user-x" size={20} color="#FFF" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* SESSÃO DE PETS (Carrossel Horizontal) */}
          <View style={styles.secao}>
            <Text style={styles.tituloSecao}>Nossos Pets 🐶</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollHorizontal}>
              {petsDestaCasa.length > 0 ? (
                petsDestaCasa.map((pet) => (
                  <View key={pet.id} style={styles.cartaoPet}>
                    <Image source={{ uri: pet.imagem }} style={styles.imagemPetMini} />
                    <Text style={styles.nomePetMini}>{pet.nome}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.areaVaziaPets}>
                  <Text style={styles.textoVazioPets}>Nenhum pet adicionado ainda.</Text>
                </View>
              )}
            </ScrollView>
          </View>

        </ScrollView>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  patinha: { position: 'absolute', zIndex: 0 },
  
  // 👉 O CABEÇALHO ESPAÇOSO
  areaCabecalho: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 40, paddingBottom: 60, zIndex: 1 },
  botaoVoltar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textosCabecalho: { flex: 1 },
  tituloHeader: { fontSize: 28, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  subTituloHeader: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' },

  // 👉 CARTÃO BRANCO PRINCIPAL
  cardAlegre: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 30,
    flex: 1, 
    marginTop: 10, // O respiro extra!
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 15
  },

  // Foto da Casa e Info
  areaInfoCasa: { alignItems: 'center', marginBottom: 40 },
  areaFotoCasa: { position: 'relative', marginBottom: 15 },
  imagemCasa: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#4F7FFF' },
  iconeEdicaoCasa: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#F86F03', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  nomeCasa: { fontSize: 28, fontWeight: '900', color: '#333' },
  
  badgeID: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: '#FFD1A3' },
  textoBadgeID: { color: '#F86F03', fontWeight: '900', marginLeft: 8, fontSize: 16 },

  secao: { marginBottom: 35 },
  tituloSecao: { fontSize: 22, fontWeight: '900', color: '#333', marginBottom: 15, paddingHorizontal: 5 },

  // Estilos Felizes dos Membros
  cartaoMembro: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F5F7', padding: 15, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#EAEAEA' },
  cartaoMembroLider: { backgroundColor: '#FFF3E0', borderColor: '#FFD1A3', borderWidth: 2 }, // Destaque Laranja para o Líder
  imagemMembro: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#CCC' },
  infoMembro: { flex: 1, marginLeft: 15 },
  nomeMembro: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statusLider: { fontSize: 13, color: '#F86F03', fontWeight: 'bold' },
  statusComum: { fontSize: 13, color: '#888', fontWeight: '500', marginTop: 2 },
  
  botaoExpulsar: { backgroundColor: '#FF4C4C', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#FF4C4C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },

  // Estilos Felizes dos Pets
  scrollHorizontal: { flexDirection: 'row' },
  cartaoPet: { backgroundColor: '#F0F4FF', alignItems: 'center', padding: 15, borderRadius: 20, marginRight: 15, borderWidth: 2, borderColor: '#E0E8FF', width: 110 },
  imagemPetMini: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#4F7FFF', marginBottom: 10 },
  nomePetMini: { fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  
  areaVaziaPets: { backgroundColor: '#F9F9F9', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#EEE', borderStyle: 'dashed', width: '100%', alignItems: 'center' },
  textoVazioPets: { color: '#888', fontStyle: 'italic', fontWeight: '500' }
});