import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView, Platform, LayoutAnimation, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

// 👉 MÁGICA DA FLUIDEZ NO ANDROID
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ListaDeCasas({ setTelaAtual, casas, setCasas, setCasaAtual, usuarioAtual, membros, modoNoturno }) {

  // 👉 O "GARÇOM" QUE BUSCA AS CASAS DO BANCO
  useEffect(() => {
    const buscarCasas = async () => {
      try {
        // ⚠️ ATENÇÃO: Troque "SEU_IP" pelo IP atual do seu notebook!
        const resposta = await fetch(`http://192.168.1.245:3000/casas/${usuarioAtual.id}`);
        const dados = await resposta.json();
        
        if (dados.sucesso) {
          setCasas(dados.casas); // Atualiza a tela com as casas verdadeiras!
        }
      } catch (error) {
        console.error("Erro ao buscar casas:", error);
      }
    };

    // Só busca se o ID do usuário existir
    if (usuarioAtual?.id) {
      buscarCasas();
    }
  }, [usuarioAtual]);

  const minhasCasas = casas.filter(casa => casa.admin_id === usuarioAtual?.id || casa.adminId === usuarioAtual?.id);

  const navegarComAnimacao = (tela) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual(tela);
  };

  const entrarNaCasa = (casa) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCasaAtual(casa);
    setTelaAtual('ListaDePets');
  };

  // 👉 CORES DINÂMICAS DO MODO NOTURNO
  const coresFundo = modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF'];
  const corCartao = modoNoturno ? '#1E1E1E' : '#FFF';
  const corTextoPrincipal = modoNoturno ? '#FFF' : '#333';
  const corTextoSecundario = modoNoturno ? '#AAA' : '#666';
  const corAcaoFundo = modoNoturno ? '#2A2A2A' : '#FFF';
  const corCasaFundo = modoNoturno ? '#232D3F' : '#F0F4FF';
  const corCasaBorda = modoNoturno ? '#1A2333' : '#E0E8FF';
  const corVaziaFundo = modoNoturno ? '#331E0B' : '#FFF3E0';
  const corVaziaBorda = modoNoturno ? '#663C16' : '#F86F03';

  return (
    <LinearGradient colors={coresFundo} style={styles.container}>
      <StatusBar style={modoNoturno ? "light" : "auto"} />
      <SafeAreaView style={{ flex: 1 }}>
        
        <View style={styles.areaCabecalho}>
          <View>
            <Text style={styles.saudacao}>Olá, {usuarioAtual?.nome || 'Usuário'}!</Text>
            <Text style={styles.subSaudacao}>Onde vamos cuidar dos pets hoje?</Text>
          </View>
          <TouchableOpacity style={styles.botaoSair} onPress={() => navegarComAnimacao('PerfilUsuario')}>
            <Image source={{ uri: usuarioAtual?.imagem || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={{ width: 50, height: 50, borderRadius: 25 }} />
          </TouchableOpacity>
        </View>

        <View style={[styles.cardAlegre, { backgroundColor: corCartao }]}>
          
          <View style={styles.areaAcoes}>
            <TouchableOpacity style={styles.cartaoAcao} onPress={() => navegarComAnimacao('NovaCasa')}>
              <View style={[styles.iconeAcaoFundo, { backgroundColor: corAcaoFundo }]}>
                <Feather name="plus" size={32} color="#25D366" />
              </View>
              <Text style={[styles.textoAcao, { color: corTextoPrincipal }]}>Nova Casa</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cartaoAcao} onPress={() => navegarComAnimacao('EntrarCasa')}>
              <View style={[styles.iconeAcaoFundo, { backgroundColor: corAcaoFundo }]}>
                <Ionicons name="enter-outline" size={32} color="#4F7FFF" />
              </View>
              <Text style={[styles.textoAcao, { color: corTextoPrincipal }]}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cartaoAcao} onPress={() => navegarComAnimacao('ExcluirCasa')}>
              <View style={[styles.iconeAcaoFundo, { backgroundColor: corAcaoFundo }]}>
                <Feather name="trash-2" size={30} color="#FF4C4C" />
              </View>
              <Text style={[styles.textoAcao, { color: corTextoPrincipal }]}>Excluir</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.tituloSecao, { color: corTextoPrincipal }]}>Minhas Casas</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {minhasCasas.length > 0 ? (
              minhasCasas.map(casa => (
                <TouchableOpacity key={casa.id} style={[styles.cartaoCasa, { backgroundColor: corCasaFundo, borderColor: corCasaBorda }]} onPress={() => entrarNaCasa(casa)}>
                  <Image source={{ uri: casa.imagem || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=250&auto=format&fit=crop' }} style={styles.imagemCasa} />
                  <View style={styles.infoCasa}>
                    <Text style={[styles.nomeCasa, { color: corTextoPrincipal }]}>{casa.nome}</Text>
                    <Text style={styles.statusCasa}>Administrador</Text>
                  </View>
                  <View style={styles.botaoSeta}>
                    <Feather name="chevron-right" size={24} color="#FFF" />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={[styles.areaVazia, { backgroundColor: corVaziaFundo, borderColor: corVaziaBorda }]}>
                <FontAwesome5 name="sad-tear" size={50} color="#F86F03" style={{ marginBottom: 15 }} />
                <Text style={styles.textoVazio}>Nenhuma casa encontrada</Text>
                <Text style={[styles.subTextoVazio, { color: corTextoSecundario }]}>Crie uma nova casa ou peça o código para entrar em uma existente!</Text>
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>

        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  areaCabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30, paddingTop: 20, paddingBottom: 30 },
  saudacao: { fontSize: 30, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  subSaudacao: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' },
  botaoSair: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  cardAlegre: { backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 25, paddingTop: 35, flex: 1, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.15, shadowRadius: 15 },
  areaAcoes: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35, paddingHorizontal: 5 },
  cartaoAcao: { alignItems: 'center', flex: 1 },
  iconeAcaoFundo: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  textoAcao: { color: '#333', fontSize: 15, fontWeight: '900' },
  tituloSecao: { fontSize: 24, fontWeight: '900', color: '#333', marginBottom: 20, paddingHorizontal: 5 },
  cartaoCasa: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4FF', padding: 15, borderRadius: 25, marginBottom: 15, borderWidth: 2, borderColor: '#E0E8FF' },
  imagemCasa: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#4F7FFF' },
  infoCasa: { flex: 1, marginLeft: 15 },
  nomeCasa: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  statusCasa: { fontSize: 14, color: '#F86F03', fontWeight: 'bold' },
  botaoSeta: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F86F03', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#F86F03', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 4 },
  areaVazia: { alignItems: 'center', marginTop: 40, backgroundColor: '#FFF3E0', padding: 30, borderRadius: 25, borderWidth: 2, borderColor: '#F86F03', borderStyle: 'dashed' },
  textoVazio: { color: '#F86F03', fontSize: 20, fontWeight: '900', textAlign: 'center' },
  subTextoVazio: { color: '#333', fontSize: 16, textAlign: 'center', marginTop: 8, fontWeight: '600' }
});