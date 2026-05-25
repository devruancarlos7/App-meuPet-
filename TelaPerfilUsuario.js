import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView, Platform, LayoutAnimation, UIManager, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// 👉 MÁGICA DA FLUIDEZ
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TelaPerfilUsuario({ setTelaAtual, usuarioAtual, setUsuarioAtual, pets, notificacoesAtivas, setNotificacoesAtivas }) {
  
  // NAVEGAÇÃO FLUIDA
  const navegarComAnimacao = (tela) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual(tela);
  };

  // MUDAR FOTO COM ANIMAÇÃO
  const escolherImagemPerfil = async () => {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissao.granted === false) {
        alert('Precisamos de permissão para acessar suas fotos!');
        return;
      }

      let resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: true,
        aspect: [2], 
        quality: 1,
      });

      if (!resultado.canceled) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const [primeiraFoto] = resultado.assets;
        setUsuarioAtual({ ...usuarioAtual, imagem: primeiraFoto.uri });
      }
    } catch (error) {
      alert("Erro ao tentar abrir a galeria! " + error.message);
      console.log(error);
    }
  };

  // ATIVAR/DESATIVAR NOTIFICAÇÕES COM FLUIDEZ
  const toggleNotificacoes = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNotificacoesAtivas(!notificacoesAtivas);
  };

  // BOTÕES DE SAIR/EXCLUIR
  const handleSair = () => {
    Alert.alert("Sair", "Deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: () => navegarComAnimacao('Principal'), style: "destructive" }
    ]);
  };

  return (
    <LinearGradient colors={['#F86F03', '#4F7FFF']} style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* Patinhas vibrantes de fundo */}
        <FontAwesome5 name="paw" size={120} color="rgba(255, 255, 255, 0.2)" style={[styles.patinha, { top: -10, right: -20, transform: [{ rotate: '20deg' }] }]} />
        <FontAwesome5 name="paw" size={60} color="rgba(79, 127, 255, 0.4)" style={[styles.patinha, { bottom: 50, right: 100, transform: [{ rotate: '-10deg' }] }]} />

        {/* 👉 CABEÇALHO ESPAÇOSO (O respiro visual) */}
        <View style={styles.areaCabecalho}>
          <TouchableOpacity onPress={() => navegarComAnimacao('ListaDePets')} style={styles.botaoVoltar}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.textosCabecalho}>
            <Text style={styles.tituloHeader}>Meu Perfil</Text>
            <Text style={styles.subTituloHeader}>Gerencie sua conta</Text>
          </View>
        </View>

        {/* 👉 CARTÃO BRANCO REBAIXADO (ScrollView para caber todas as opções do menu) */}
        <ScrollView style={styles.cardAlegre} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
          
          {/* FOTO E INFORMAÇÕES PRINCIPAIS */}
          <View style={styles.areaInfoUsuario}>
            <TouchableOpacity style={styles.areaFotoUsuario} onPress={escolherImagemPerfil}>
              <Image source={{ uri: usuarioAtual?.imagem }} style={styles.imagemUsuario} />
              <View style={styles.iconeEdicaoUsuario}>
                 <Feather name="camera" size={16} color="#FFF" />
              </View>
            </TouchableOpacity>

            <Text style={styles.nomeUsuario}>{usuarioAtual?.nome}</Text>
            
            {/* Tag do ID da Conta */}
            <View style={styles.badgeID}>
               <Feather name="hash" size={14} color="#4F7FFF" />
               <Text style={styles.textoBadgeID}>ID: {usuarioAtual?.id}</Text>
            </View>
          </View>

          {/* ESTATÍSTICAS ALEGRES */}
          <View style={styles.areaEstatisticas}>
            <View style={styles.cartaoEstatisticaLaranja}>
              <FontAwesome5 name="dog" size={24} color="#F86F03" style={{ marginBottom: 5 }} />
              <Text style={styles.numeroEstatisticaLaranja}>{pets.length}</Text>
              <Text style={styles.textoEstatistica}>Pets Cuidados</Text>
            </View>
            
            <View style={styles.cartaoEstatisticaAzul}>
              <FontAwesome5 name="calendar-alt" size={24} color="#4F7FFF" style={{ marginBottom: 5 }} />
              <Text style={styles.numeroEstatisticaAzul}>2024</Text>
              <Text style={styles.textoEstatistica}>Membro desde</Text>
            </View>
          </View>

          <Text style={styles.tituloSecao}>Preferências</Text>

          {/* MENU DE OPÇÕES (Igual ao seu PDF!) */}
          <View style={styles.areaMenu}>
            
            {/* Notificações (Com Switch Animado) */}
            <View style={styles.itemMenu}>
              <View style={[styles.iconeMenuFundo, { backgroundColor: '#E3F2FD' }]}>
                <Feather name="bell" size={20} color="#4F7FFF" />
              </View>
              <Text style={styles.textoMenu}>Notificações</Text>
              <Switch 
                value={notificacoesAtivas} 
                onValueChange={toggleNotificacoes}
                trackColor={{ false: '#CCC', true: '#FFD1A3' }}
                thumbColor={notificacoesAtivas ? '#F86F03' : '#FFF'}
              />
            </View>

            {/* Convidar Amigos */}
            <TouchableOpacity style={styles.itemMenu}>
              <View style={[styles.iconeMenuFundo, { backgroundColor: '#FFF3E0' }]}>
                <Feather name="user-plus" size={20} color="#F86F03" />
              </View>
              <Text style={styles.textoMenu}>Convidar Amigos</Text>
              <Feather name="chevron-right" size={20} color="#CCC" />
            </TouchableOpacity>

            {/* Ajuda e Feedback */}
            <TouchableOpacity style={styles.itemMenu}>
              <View style={[styles.iconeMenuFundo, { backgroundColor: '#F4F5F7' }]}>
                <Feather name="help-circle" size={20} color="#555" />
              </View>
              <Text style={styles.textoMenu}>Ajuda e Feedback</Text>
              <Feather name="chevron-right" size={20} color="#CCC" />
            </TouchableOpacity>

            {/* Termos de Uso */}
            <TouchableOpacity style={styles.itemMenu}>
              <View style={[styles.iconeMenuFundo, { backgroundColor: '#F4F5F7' }]}>
                <Feather name="file-text" size={20} color="#555" />
              </View>
              <Text style={styles.textoMenu}>Termos de Uso</Text>
              <Feather name="chevron-right" size={20} color="#CCC" />
            </TouchableOpacity>

          </View>

          <Text style={styles.tituloSecao}>Zona de Perigo</Text>

          {/* ÁREA DE SAÍDA E EXCLUSÃO */}
          <TouchableOpacity style={styles.botaoSair} onPress={handleSair}>
            <Feather name="log-out" size={20} color="#FF4C4C" />
            <Text style={styles.textoBotaoSair}>Sair da Conta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoExcluirConta} onPress={handleSair}>
            <Feather name="trash-2" size={20} color="#FF4C4C" />
            <Text style={styles.textoBotaoExcluir}>Excluir Conta Permanentemente</Text>
          </TouchableOpacity>

        </ScrollView>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  patinha: { position: 'absolute', zIndex: 0 },
  
  // Cabeçalho Gigante (Padrão de Respiro do App)
  areaCabecalho: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 40, paddingBottom: 60, zIndex: 1 },
  botaoVoltar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textosCabecalho: { flex: 1 },
  tituloHeader: { fontSize: 28, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  subTituloHeader: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' },

  // Cartão Branco Subindo
  cardAlegre: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 30,
    flex: 1, 
    marginTop: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 15
  },

  // Perfil do Usuário
  areaInfoUsuario: { alignItems: 'center', marginBottom: 25 },
  areaFotoUsuario: { position: 'relative', marginBottom: 15 },
  imagemUsuario: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#F86F03' },
  iconeEdicaoUsuario: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4F7FFF', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF', elevation: 4 },
  nomeUsuario: { fontSize: 26, fontWeight: '900', color: '#333' },
  
  // Badge Elegante para o ID
  badgeID: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4FF', paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20, marginTop: 8, borderWidth: 1, borderColor: '#E0E8FF' },
  textoBadgeID: { color: '#4F7FFF', fontWeight: '900', marginLeft: 8, fontSize: 14 },

  // Estatísticas Divertidas
  areaEstatisticas: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35, gap: 15 },
  cartaoEstatisticaLaranja: { flex: 1, backgroundColor: '#FFF3E0', padding: 15, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#FFD1A3' },
  numeroEstatisticaLaranja: { fontSize: 22, fontWeight: '900', color: '#F86F03' },
  cartaoEstatisticaAzul: { flex: 1, backgroundColor: '#F0F4FF', padding: 15, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E0E8FF' },
  numeroEstatisticaAzul: { fontSize: 22, fontWeight: '900', color: '#4F7FFF' },
  textoEstatistica: { fontSize: 12, color: '#666', fontWeight: 'bold', marginTop: 2 },

  tituloSecao: { fontSize: 20, fontWeight: '900', color: '#333', marginBottom: 15, paddingHorizontal: 5 },

  // Menu de Opções
  areaMenu: { marginBottom: 35 },
  itemMenu: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F5F7', padding: 12, borderRadius: 20, marginBottom: 12 },
  iconeMenuFundo: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textoMenu: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#333' },

  // Botões de Perigo
  botaoSair: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F0', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#FFD6D6' },
  textoBotaoSair: { color: '#FF4C4C', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  
  botaoExcluirConta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 2, borderColor: '#FFD6D6', borderStyle: 'dashed' },
  textoBotaoExcluir: { color: '#FF4C4C', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});
