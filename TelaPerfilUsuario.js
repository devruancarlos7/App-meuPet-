import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Switch, Image, ScrollView, Platform, LayoutAnimation, UIManager, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TelaPerfilUsuario({ setTelaAtual, usuarioAtual, setUsuarioAtual, pets, notificacoesAtivas, setNotificacoesAtivas, modoNoturno, setModoNoturno }) {

  // NAVEGAÇÃO FLUIDA
  const navegarComAnimacao = (tela) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual(tela);
  };

  // MUDAR FOTO COM ANIMAÇÃO
  const escolherImagemPerfil = async () => {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissao.granted) return alert('Precisamos de permissão para acessar suas fotos!');
      let resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1], quality: 1 });
      if (!resultado.canceled) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setUsuarioAtual({ ...usuarioAtual, imagem: resultado.assets.uri });
      }
    } catch (error) {
      alert("Erro ao abrir a galeria!");
    }
  };

  // ATIVAR/DESATIVAR COM FLUIDEZ
  const toggleNotificacoes = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNotificacoesAtivas(!notificacoesAtivas);
  };

  const alternarTema = (valor) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setModoNoturno(valor);
  };

  // BOTÕES DE SAIR/EXCLUIR
  const handleSair = () => {
    Alert.alert("Sair", "Deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: () => navegarComAnimacao('Principal'), style: "destructive" } // Note que agora ele volta para a 'Principal'
    ]);
  };

  // 👉 A MÁGICA DO MODO NOTURNO (VARIÁVEIS DE COR)
  const coresFundo = modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF'];
  const corCartao = modoNoturno ? '#1E1E1E' : '#FFF';
  const corTextoPrincipal = modoNoturno ? '#FFF' : '#333';
  const corTextoSecundario = modoNoturno ? '#AAA' : '#666';
  
  const corCartaoAzul = modoNoturno ? '#0F1E38' : '#F0F4FF';
  const corBordaAzul = modoNoturno ? '#1E3C70' : '#E0E8FF';
  
  const corCartaoLaranja = modoNoturno ? '#331E0B' : '#FFF3E0';
  const corBordaLaranja = modoNoturno ? '#663C16' : '#FFD1A3';
  
  const corMenuFundo = modoNoturno ? '#2A2A2A' : '#F4F5F7';
  
  const corBotaoSairFundo = modoNoturno ? '#331515' : '#FFF0F0';
  const corBotaoSairBorda = modoNoturno ? '#551A1A' : '#FFD6D6';

  return (
    <LinearGradient colors={coresFundo} style={styles.container}>
      <StatusBar style={modoNoturno ? "light" : "auto"} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Cabeçalho Gigante (Padrão de Respiro do App) */}
        <View style={styles.areaCabecalho}>
          <TouchableOpacity onPress={() => navegarComAnimacao('ListaDePets')} style={styles.botaoVoltar}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.textosCabecalho}>
            <Text style={styles.tituloHeader}>Perfil</Text>
            <Text style={styles.subTituloHeader}>Suas configurações</Text>
          </View>
        </View>

        {/* Cartão Subindo (A cor muda dependendo do tema!) */}
        <View style={[styles.cardAlegre, { backgroundColor: corCartao }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

            {/* Perfil do Usuário */}
            <View style={styles.areaInfoUsuario}>
              <TouchableOpacity style={styles.areaFotoUsuario} onPress={escolherImagemPerfil}>
                <Image source={{ uri: usuarioAtual?.imagem || 'https://via.placeholder.com/150' }} style={styles.imagemUsuario} />
                <View style={styles.iconeEdicaoUsuario}>
                  <Feather name="camera" size={16} color="#FFF" />
                </View>
              </TouchableOpacity>
              
              <Text style={[styles.nomeUsuario, { color: corTextoPrincipal }]}>{usuarioAtual?.nome}</Text>

              {/* Badge Elegante para o ID */}
              <View style={[styles.badgeID, { backgroundColor: corCartaoAzul, borderColor: corBordaAzul }]}>
                <Feather name="hash" size={14} color="#4F7FFF" />
                <Text style={styles.textoBadgeID}>{usuarioAtual?.id}</Text>
              </View>
            </View>

            {/* Estatísticas Divertidas */}
            <View style={styles.areaEstatisticas}>
              <View style={[styles.cartaoEstatisticaLaranja, { backgroundColor: corCartaoLaranja, borderColor: corBordaLaranja }]}>
                <Text style={styles.numeroEstatisticaLaranja}>{pets?.length || 0}</Text>
                <Text style={[styles.textoEstatistica, { color: corTextoSecundario }]}>Pets</Text>
              </View>
              <View style={[styles.cartaoEstatisticaAzul, { backgroundColor: corCartaoAzul, borderColor: corBordaAzul }]}>
                <Text style={styles.numeroEstatisticaAzul}>1</Text>
                <Text style={[styles.textoEstatistica, { color: corTextoSecundario }]}>Casas</Text>
              </View>
            </View>

            <Text style={[styles.tituloSecao, { color: corTextoPrincipal }]}>Opções do App</Text>

            {/* Menu de Opções Dinâmico */}
            <View style={styles.areaMenu}>
              
              {/* Notificações */}
              <View style={[styles.itemMenu, { backgroundColor: corMenuFundo }]}>
                <View style={[styles.iconeMenuFundo, { backgroundColor: corCartaoLaranja }]}>
                  <Feather name={notificacoesAtivas ? "bell" : "bell-off"} size={20} color={notificacoesAtivas ? "#F86F03" : "#888"} />
                </View>
                <Text style={[styles.textoMenu, { color: corTextoPrincipal }]}>Notificações</Text>
                <Switch value={notificacoesAtivas} onValueChange={toggleNotificacoes} trackColor={{ false: '#CCC', true: '#F86F03' }} thumbColor={'#FFF'} />
              </View>

              {/* 👉 CHAVE DO MODO ESCURO AQUI! */}
              <View style={[styles.itemMenu, { backgroundColor: corMenuFundo }]}>
                <View style={[styles.iconeMenuFundo, { backgroundColor: corCartaoAzul }]}>
                  <Feather name={modoNoturno ? "moon" : "sun"} size={20} color={modoNoturno ? "#4F7FFF" : "#F86F03"} />
                </View>
                <Text style={[styles.textoMenu, { color: corTextoPrincipal }]}>Modo Escuro</Text>
                <Switch value={modoNoturno} onValueChange={alternarTema} trackColor={{ false: '#CCC', true: '#4F7FFF' }} thumbColor={'#FFF'} />
              </View>
              
            </View>

            <Text style={[styles.tituloSecao, { color: corTextoPrincipal, marginTop: 10 }]}>Ações da Conta</Text>

            <View style={styles.areaMenu}>
              {/* Botões de Perigo (Sair e Excluir) */}
              <TouchableOpacity style={[styles.botaoSair, { backgroundColor: corBotaoSairFundo, borderColor: corBotaoSairBorda }]} onPress={handleSair}>
                <Feather name="log-out" size={20} color="#FF4C4C" />
                <Text style={styles.textoBotaoSair}>Sair do aplicativo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.botaoExcluirConta, { backgroundColor: corCartao, borderColor: corBotaoSairBorda }]}>
                <Feather name="trash-2" size={20} color="#FF4C4C" />
                <Text style={styles.textoBotaoExcluir}>Excluir conta</Text>
              </TouchableOpacity>
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

  areaCabecalho: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 40, paddingBottom: 60, zIndex: 1 },
  botaoVoltar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textosCabecalho: { flex: 1 },
  tituloHeader: { fontSize: 28, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  subTituloHeader: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' },

  cardAlegre: { borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 25, paddingTop: 30, flex: 1, marginTop: 10, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.15, shadowRadius: 15 },

  areaInfoUsuario: { alignItems: 'center', marginBottom: 25 },
  areaFotoUsuario: { position: 'relative', marginBottom: 15 },
  imagemUsuario: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#F86F03' },
  iconeEdicaoUsuario: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4F7FFF', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF', elevation: 4 },
  nomeUsuario: { fontSize: 26, fontWeight: '900' },

  badgeID: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20, marginTop: 8, borderWidth: 1 },
  textoBadgeID: { color: '#4F7FFF', fontWeight: '900', marginLeft: 8, fontSize: 14 },

  areaEstatisticas: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35, gap: 15 },
  cartaoEstatisticaLaranja: { flex: 1, padding: 15, borderRadius: 20, alignItems: 'center', borderWidth: 1 },
  numeroEstatisticaLaranja: { fontSize: 22, fontWeight: '900', color: '#F86F03' },
  cartaoEstatisticaAzul: { flex: 1, padding: 15, borderRadius: 20, alignItems: 'center', borderWidth: 1 },
  numeroEstatisticaAzul: { fontSize: 22, fontWeight: '900', color: '#4F7FFF' },
  textoEstatistica: { fontSize: 12, fontWeight: 'bold', marginTop: 2 },

  tituloSecao: { fontSize: 20, fontWeight: '900', marginBottom: 15, paddingHorizontal: 5 },

  areaMenu: { marginBottom: 20 },
  itemMenu: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 20, marginBottom: 12 },
  iconeMenuFundo: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textoMenu: { flex: 1, fontSize: 16, fontWeight: 'bold' },

  botaoSair: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1 },
  textoBotaoSair: { color: '#FF4C4C', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },

  botaoExcluirConta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 2, borderStyle: 'dashed' },
  textoBotaoExcluir: { color: '#FF4C4C', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});