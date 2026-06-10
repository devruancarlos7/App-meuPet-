import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Platform, LayoutAnimation, UIManager, Alert, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 👉 AGORA RECEBEMOS O "casas" AQUI EM CIMA!
export default function TelaPerfilUsuario({ setTelaAtual, usuarioAtual, setUsuarioAtual, pets, casas, notificacoesAtivas, setNotificacoesAtivas, modoNoturno, setModoNoturno }) {

  // 1. Navegação Fluida
  const navegarComAnimacao = (tela) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual(tela);
  };

  // 2. Mudar Foto com Animação
  const escolherImagemPerfil = async () => {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissao.granted) return alert('Precisamos de permissão para acessar suas fotos!');
      
      let resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1],
        quality: 1
      });

      if (!resultado.canceled) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setUsuarioAtual({ ...usuarioAtual, imagem: resultado.assets.uri });
      }
    } catch (error) {
      alert("Erro ao abrir a galeria!");
    }
  };

  // 3. Ativar/Desativar Configurações
  const toggleNotificacoes = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNotificacoesAtivas(!notificacoesAtivas);
  };

  const alternarTema = (valor) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setModoNoturno(valor);
  };

  // 4. Botões de Sair e Excluir
  const handleSair = () => {
    Alert.alert("Sair da Conta", "Tem certeza que deseja desconectar do MeuPets?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: () => navegarComAnimacao('Login'), style: "destructive" }
    ]);
  };

  const handleExcluirConta = () => {
    Alert.alert("Excluir Conta", "Atenção: Esta ação apagará todos os seus dados e não pode ser desfeita. Deseja continuar?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", onPress: () => navegarComAnimacao('Login'), style: "destructive" }
    ]);
  };

  // 5. Cores Dinâmicas do Modo Noturno
  const coresFundo = modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF'];
  const corCartao = modoNoturno ? '#1E1E1E' : '#FFF';
  const corTextoPrincipal = modoNoturno ? '#FFF' : '#333';
  const corTextoSecundario = modoNoturno ? '#AAA' : '#666';

  const corCartaoLaranja = modoNoturno ? '#331E0B' : '#FFF3E0';
  const corBordaLaranja = modoNoturno ? '#663C16' : '#FFD1A3';
  
  const corCartaoAzul = modoNoturno ? '#0F1E38' : '#F0F4FF';
  const corBordaAzul = modoNoturno ? '#1E3C70' : '#E0E8FF';

  // 👉 Nova cor verde para a 3ª caixinha
  const corCartaoVerde = modoNoturno ? '#143314' : '#E8F5E9';
  const corBordaVerde = modoNoturno ? '#2E592E' : '#C8E6C9';

  const corMenuFundo = modoNoturno ? '#2A2A2A' : '#F4F5F7';
  const corBotaoSairFundo = modoNoturno ? '#331515' : '#FFF0F0';
  const corBotaoSairBorda = modoNoturno ? '#551A1A' : '#FFD6D6';

  // 6. Matemática das Estatísticas Completas
  const quantidadePets = pets ? pets.length : 0; 
  const quantidadeCasas = casas ? casas.length : 0; 
  const anoAtual = new Date().getFullYear();

  return (
    <LinearGradient colors={coresFundo} style={styles.container}>
      <StatusBar style={modoNoturno ? "light" : "auto"} />

      {/* Cabeçalho */}
      <View style={styles.areaCabecalho}>
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => navegarComAnimacao('Casas')}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.textosCabecalho}>
          <Text style={styles.tituloHeader}>Meu Perfil</Text>
          <Text style={styles.subTituloHeader}>Configurações da Conta</Text>
        </View>
      </View>

      {/* Cartão Principal */}
      <View style={[styles.cardAlegre, { backgroundColor: corCartao }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* Foto e Nome do Usuário */}
          <View style={styles.areaInfoUsuario}>
            <TouchableOpacity style={styles.areaFotoUsuario} onPress={escolherImagemPerfil}>
              {usuarioAtual?.imagem ? (
                <Image source={{ uri: usuarioAtual.imagem }} style={styles.imagemUsuario} />
              ) : (
                <View style={[styles.imagemUsuario, { backgroundColor: corCartaoLaranja, justifyContent: 'center', alignItems: 'center' }]}>
                  <FontAwesome5 name="user-alt" size={40} color="#F86F03" />
                </View>
              )}
              <View style={styles.iconeEdicaoUsuario}>
                <Feather name="camera" size={14} color="#FFF" />
              </View>
            </TouchableOpacity>
            
            <Text style={[styles.nomeUsuario, { color: corTextoPrincipal }]}>
              {usuarioAtual?.nome || 'Usuário'}
            </Text>
            
            <View style={[styles.badgeID, { backgroundColor: corCartaoAzul, borderColor: corBordaAzul }]}>
              <Feather name="hash" size={14} color="#4F7FFF" />
              <Text style={styles.textoBadgeID}>ID: {usuarioAtual?.id || '0000'}</Text>
            </View>
          </View>

          {/* 👉 AS TRÊS CAIXINHAS DE ESTATÍSTICAS */}
          <View style={styles.areaEstatisticas}>
            <View style={[styles.cartaoEstatistica, { backgroundColor: corCartaoLaranja, borderColor: corBordaLaranja }]}>
              <FontAwesome5 name="paw" size={20} color="#F86F03" style={{ marginBottom: 5 }} />
              <Text style={[styles.numeroEstatistica, { color: '#F86F03' }]}>{quantidadePets}</Text>
              <Text style={[styles.textoEstatistica, { color: corTextoSecundario }]}>Pets</Text>
            </View>

            <View style={[styles.cartaoEstatistica, { backgroundColor: corCartaoAzul, borderColor: corBordaAzul }]}>
              <FontAwesome5 name="home" size={20} color="#4F7FFF" style={{ marginBottom: 5 }} />
              <Text style={[styles.numeroEstatistica, { color: '#4F7FFF' }]}>{quantidadeCasas}</Text>
              <Text style={[styles.textoEstatistica, { color: corTextoSecundario }]}>Casas</Text>
            </View>

            <View style={[styles.cartaoEstatistica, { backgroundColor: corCartaoVerde, borderColor: corBordaVerde }]}>
              <FontAwesome5 name="calendar-check" size={20} color="#4CAF50" style={{ marginBottom: 5 }} />
              <Text style={[styles.numeroEstatistica, { color: '#4CAF50' }]}>{anoAtual}</Text>
              <Text style={[styles.textoEstatistica, { color: corTextoSecundario }]}>Desde</Text>
            </View>
          </View>

          <Text style={[styles.tituloSecao, { color: corTextoPrincipal }]}>Preferências</Text>

          {/* Botão de Notificações */}
          <TouchableOpacity style={[styles.itemMenu, { backgroundColor: corMenuFundo }]} onPress={toggleNotificacoes} activeOpacity={0.8}>
            <View style={[styles.iconeMenuFundo, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="notifications" size={20} color="#FFF" />
            </View>
            <Text style={[styles.textoMenu, { color: corTextoPrincipal }]}>Notificações do App</Text>
            <Switch
              value={notificacoesAtivas}
              onValueChange={toggleNotificacoes}
              trackColor={{ false: '#CCC', true: '#4CAF50' }}
              thumbColor="#FFF"
            />
          </TouchableOpacity>

          {/* Botão de Modo Noturno */}
          <TouchableOpacity style={[styles.itemMenu, { backgroundColor: corMenuFundo }]} onPress={() => alternarTema(!modoNoturno)} activeOpacity={0.8}>
            <View style={[styles.iconeMenuFundo, { backgroundColor: '#333' }]}>
              <Ionicons name={modoNoturno ? "moon" : "moon-outline"} size={20} color="#FFF" />
            </View>
            <Text style={[styles.textoMenu, { color: corTextoPrincipal }]}>Modo Noturno</Text>
            <Switch
              value={modoNoturno}
              onValueChange={alternarTema}
              trackColor={{ false: '#CCC', true: '#333' }}
              thumbColor="#FFF"
            />
          </TouchableOpacity>

          <Text style={[styles.tituloSecao, { color: corTextoPrincipal, marginTop: 15 }]}>Conta e Segurança</Text>

          <TouchableOpacity style={[styles.botaoSair, { backgroundColor: corBotaoSairFundo, borderColor: corBotaoSairBorda }]} onPress={handleSair}>
            <Feather name="log-out" size={20} color="#FF4C4C" />
            <Text style={styles.textoBotaoSair}>Sair da Conta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.botaoExcluirConta, { backgroundColor: corCartao, borderColor: corBotaoSairBorda }]} onPress={handleExcluirConta}>
            <Feather name="trash-2" size={20} color="#FF4C4C" />
            <Text style={styles.textoBotaoExcluir}>Excluir Conta Permanentemente</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  areaCabecalho: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 50, paddingBottom: 60, zIndex: 1 },
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
  textoBadgeID: { fontWeight: '900', marginLeft: 8, fontSize: 14 },
  
  // 👉 NOVO VISUAL PARA AS 3 CAIXINHAS LADO A LADO
  areaEstatisticas: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35, gap: 10 },
  cartaoEstatistica: { flex: 1, paddingVertical: 15, paddingHorizontal: 5, borderRadius: 20, alignItems: 'center', borderWidth: 1 },
  numeroEstatistica: { fontSize: 20, fontWeight: '900' },
  textoEstatistica: { fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  
  tituloSecao: { fontSize: 20, fontWeight: '900', marginBottom: 15, paddingHorizontal: 5 },
  
  areaMenu: { marginBottom: 20 },
  itemMenu: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 20, marginBottom: 12 },
  iconeMenuFundo: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textoMenu: { flex: 1, fontSize: 16, fontWeight: 'bold' },
  
  botaoSair: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1 },
  textoBotaoSair: { fontSize: 16, fontWeight: 'bold', marginLeft: 10, color: '#FF4C4C' },
  
  botaoExcluirConta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 2, borderStyle: 'dashed' },
  textoBotaoExcluir: { fontSize: 16, fontWeight: 'bold', marginLeft: 10, color: '#FF4C4C' }
});
