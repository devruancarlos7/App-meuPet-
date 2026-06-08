import React, { useState } from 'react'; 
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, TextInput, ActivityIndicator, SafeAreaView, Platform, LayoutAnimation, UIManager } from 'react-native'; 
import { LinearGradient } from 'expo-linear-gradient'; 
import { StatusBar } from 'expo-status-bar'; 
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) { 
  UIManager.setLayoutAnimationEnabledExperimental(true); 
}

export default function ListaDePets({ setTelaAtual, pets, casaAtual, setPetAtual, usuarioAtual, modoNoturno }) {
  const isAdmin = casaAtual?.adminId === usuarioAtual?.id;

  const bancoDeRacas = [ 
    { id: '1', nome: 'Vira-lata (Cachorro)', descricao: 'Cães sem raça definida são únicos e leais.', expectativa: '12 a 15 anos', problemas: 'Saudáveis (vigor híbrido).', dica: 'Muito amor e passeios!' }, 
    { id: '2', nome: 'Vira-lata (Gato)', descricao: 'Gatos SRD são espertos e se adaptam bem.', expectativa: '15 a 20 anos', problemas: 'Precisam de vacinas anuais.', dica: 'Arranhadores e caixas de papelão.' }, 
    { id: '3', nome: 'Siamês', descricao: 'Gatos inteligentes e comunicativos.', expectativa: '15 a 20 anos', problemas: 'Problemas respiratórios.', dica: 'São muito vocais!' }, 
    { id: '4', nome: 'Golden Retriever', descricao: 'Dóceis, brincalhões e pacientes.', expectativa: '10 a 12 anos', problemas: 'Displasia de quadril.', dica: 'Precisam de muito exercício.' } 
  ];

  const [pesquisa, setPesquisa] = useState(''); 
  const [sugestoes, setSugestoes] = useState([]); 
  const [carregando, setCarregando] = useState(false); 
  const [resultado, setResultado] = useState(null);

  const petsDestaCasa = pets?.filter((pet) => pet.casaId === casaAtual?.id) || [];

  const navegarComAnimacao = (tela) => { 
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
    setTelaAtual(tela); 
  };

  const abrirPerfilPet = (pet) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPetAtual(pet);
    setTelaAtual('MetasCuidados');
  };

  const handlePesquisa = (textoDigitado) => { 
    setPesquisa(textoDigitado); 
    setResultado(null); 
    if (textoDigitado.trim().length > 0) { 
      const filtro = bancoDeRacas.filter(raca => raca.nome.toLowerCase().includes(textoDigitado.toLowerCase())); 
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
      setSugestoes(filtro); 
    } else { 
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
      setSugestoes([]); 
    } 
  };

  const selecionarRaca = (racaEscolhida) => { 
    setPesquisa(racaEscolhida.nome); 
    setSugestoes([]); 
    setCarregando(true); 
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCarregando(false);
      setResultado(racaEscolhida);
    }, 800);
  };

  const buscarManual = () => { 
    if (pesquisa.trim() === '') return; 
    setSugestoes([]); 
    setCarregando(true); 
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCarregando(false);
      const racaEncontrada = bancoDeRacas.find(r => r.nome.toLowerCase() === pesquisa.toLowerCase());
      if(racaEncontrada) setResultado(racaEncontrada);
      else setResultado({ nome: pesquisa, descricao: 'Informação não encontrada.', expectativa: 'N/A', problemas: 'N/A', dica: 'Consulte um veterinário.'});
    }, 800);
  };

  const fecharPesquisa = () => { 
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
    setPesquisa(''); 
    setSugestoes([]); 
    setResultado(null); 
  };

  // CORES DINÂMICAS PARA A TRANSIÇÃO SUAVE
  const coresFundo = modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF'];
  const corCartao = modoNoturno ? '#1E1E1E' : '#FFF';
  const corTextoPrincipal = modoNoturno ? '#FFF' : '#333';
  const corBuscaFundo = modoNoturno ? '#2A2A2A' : '#F4F5F7';
  const corBuscaBorda = modoNoturno ? '#444' : '#EAEAEA';
  
  const corCartaoPet = modoNoturno ? '#232D3F' : '#F0F4FF';
  const corBordaPet = modoNoturno ? '#1A2333' : '#E0E8FF';
  
  const corAdicionarFundo = modoNoturno ? '#331E0B' : '#FFF3E0';
  const corAdicionarBorda = modoNoturno ? '#663C16' : '#FFD1A3';
  const corAdicionarFundoInterno = modoNoturno ? '#4A2E12' : '#FFF';

  return ( 
    <LinearGradient colors={coresFundo} style={styles.container}> 
      <StatusBar style={modoNoturno ? "light" : "auto"} /> 
      
      <SafeAreaView style={{ flex: 1 }}> 
        <FontAwesome5 name="paw" size={120} color="rgba(255, 255, 255, 0.2)" style={[styles.patinha, { top: -10, right: -20, transform: [{ rotate: '20deg' }] }]} /> 
        <FontAwesome5 name="paw" size={60} color="rgba(79, 127, 255, 0.4)" style={[styles.patinha, { bottom: 50, right: 100, transform: [{ rotate: '-10deg' }] }]} />

        {/* CABEÇALHO */}
        <View style={styles.areaCabecalho}> 
          {/* 👉 ROTA CORRIGIDA PARA 'Casas' AQUI */}
          <TouchableOpacity onPress={() => navegarComAnimacao('Casas')} style={styles.botaoVoltar}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity> 
          
          <View style={styles.infoCasaHeader}>
            <Text style={styles.tituloHeader} numberOfLines={1}>Pets da Casa</Text>
            {/* 👉 NOME DA CASA DESTACADO AQUI */}
            <Text style={styles.subTituloHeader}>📍 {casaAtual?.nome || "Nenhuma casa selecionada"}</Text>
          </View> 
          
          <View style={styles.botoesDireita}>
            <TouchableOpacity style={styles.botaoIconeTop} onPress={() => navegarComAnimacao('PerfilUsuario')}>
              <Feather name="user" size={22} color="#FFF" />
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity style={styles.botaoIconeTop} onPress={() => navegarComAnimacao('ConfigurarCasa')}>
                <Feather name="settings" size={22} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={[styles.cardAlegre, { backgroundColor: corCartao }]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* BARRA DE PESQUISA INTELIGENTE */}
          <View style={styles.areaBuscaInteligente}> 
            <View style={[styles.barraPesquisa, { backgroundColor: corBuscaFundo, borderColor: corBuscaBorda }]}> 
              <TextInput 
                style={[styles.inputPesquisa, { color: corTextoPrincipal }]} 
                placeholder="Pesquisar raça..." 
                placeholderTextColor={modoNoturno ? "#888" : "#A0A0A0"} 
                value={pesquisa} 
                onChangeText={handlePesquisa} 
              /> 
              {pesquisa.length > 0 && !resultado && !carregando && (
                <TouchableOpacity style={styles.botaoBuscarAction} onPress={buscarManual}>
                  <Feather name="search" size={18} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>

            {sugestoes.length > 0 && (
              <View style={[styles.areaSugestoes, { backgroundColor: corCartao, borderColor: corBuscaBorda }]}> 
                {sugestoes.map((item) => (
                  <TouchableOpacity key={item.id} style={[styles.itemSugestao, { borderBottomColor: corBuscaFundo }]} onPress={() => selecionarRaca(item)}> 
                    <FontAwesome5 name="paw" size={14} color="#F86F03" />
                    <Text style={[styles.textoSugestao, { color: corTextoPrincipal }]}>{item.nome}</Text> 
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {carregando && (
            <View style={[styles.cartaoIACarregando, { backgroundColor: corAdicionarFundo, borderColor: corAdicionarBorda }]}> 
              <ActivityIndicator size="large" color="#F86F03" />
              <Text style={styles.textoCarregando}>Buscando informações...</Text> 
            </View>
          )}

          {resultado && (
            <View style={[styles.cartaoIAResultado, { backgroundColor: corCartao, borderColor: '#F86F03' }]}> 
              <TouchableOpacity style={[styles.botaoFecharIA, { backgroundColor: corBuscaFundo }]} onPress={fecharPesquisa}> 
                <Feather name="x" size={16} color={modoNoturno ? "#FFF" : "#888"} /> 
              </TouchableOpacity> 
              <View style={[styles.topoCartaoIA, { borderBottomColor: corBuscaBorda }]}> 
                <FontAwesome5 name="info-circle" size={24} color="#F86F03" /> 
                <Text style={styles.tituloRaca}>{resultado.nome}</Text> 
              </View> 
              <Text style={[styles.textoInfoIA, { color: modoNoturno ? "#CCC" : "#555" }]}><Text style={[styles.labelIA, { color: corTextoPrincipal }]}>Descrição: </Text>{resultado.descricao}</Text> 
              <Text style={[styles.textoInfoIA, { color: modoNoturno ? "#CCC" : "#555" }]}><Text style={[styles.labelIA, { color: corTextoPrincipal }]}>Expectativa: </Text>{resultado.expectativa}</Text> 
              <Text style={[styles.textoInfoIA, { color: modoNoturno ? "#CCC" : "#555" }]}><Text style={[styles.labelIA, { color: corTextoPrincipal }]}>Saúde: </Text>{resultado.problemas}</Text> 
              <View style={[styles.dicaIA, { backgroundColor: modoNoturno ? '#1A2333' : '#E3F2FD' }]}> 
                <Text style={styles.textoDicaIA}>💡 {resultado.dica}</Text> 
              </View> 
            </View>
          )}

          <View style={styles.cabecalhoPets}> 
            <Text style={[styles.tituloSecao, { color: corTextoPrincipal }]}>Moradores Peludos 🐾</Text> 
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingBottom: 20 }}>
            {petsDestaCasa.length > 0 ? (
              petsDestaCasa.map((pet) => (
                <TouchableOpacity key={pet.id} style={[styles.cartaoPet, { backgroundColor: corCartaoPet, borderColor: corBordaPet }]} onPress={() => abrirPerfilPet(pet)}> 
                  <Image source={{ uri: pet.imagem || 'https://via.placeholder.com/150' }} style={styles.imagemPet} /> 
                  <Text style={[styles.nomePet, { color: corTextoPrincipal }]} numberOfLines={1}>{pet.nome}</Text> 
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.areaVaziaPets}>
                <Text style={styles.textoVazioPets}>Nenhum pet cadastrado.</Text>
              </View>
            )}

            <TouchableOpacity style={[styles.cartaoAdicionarPet, { backgroundColor: corAdicionarFundo, borderColor: corAdicionarBorda }]} onPress={() => navegarComAnimacao('NovoPet')}> 
              <View style={[styles.iconeAdicionarFundo, { backgroundColor: corAdicionarFundoInterno }]}> 
                <Feather name="plus" size={24} color="#F86F03" /> 
              </View> 
              <Text style={styles.textoAdicionarPet}>Novo Pet</Text> 
            </TouchableOpacity>
          </ScrollView>

        </ScrollView>

        {/* 🚨 BOTÃO DE EMERGÊNCIA */}
        <TouchableOpacity 
          style={styles.botaoEmergencia} 
          onPress={() => navegarComAnimacao('Emergencia')}
        >
          <FontAwesome5 name="ambulance" size={24} color="#FFF" />
        </TouchableOpacity>

      </SafeAreaView> 
    </LinearGradient> 
  ); 
}

const styles = StyleSheet.create({ 
  container: { flex: 1 }, 
  patinha: { position: 'absolute', zIndex: 0 },

  areaCabecalho: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 40, paddingBottom: 60, zIndex: 1 }, 
  botaoVoltar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 15 }, 
  infoCasaHeader: { flex: 1 }, 
  tituloHeader: { fontSize: 26, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }, 
  subTituloHeader: { fontSize: 16, color: '#FFD1A3', fontWeight: 'bold' },
  botoesDireita: { flexDirection: 'row', gap: 10 }, 
  botaoIconeTop: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  cardAlegre: { borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 25, paddingTop: 35, flex: 1, marginTop: 10, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.15, shadowRadius: 15, zIndex: 2 }, 
  
  tituloSecao: { fontSize: 22, fontWeight: '900', marginBottom: 15, paddingHorizontal: 5 },

  areaBuscaInteligente: { position: 'relative', marginBottom: 30, zIndex: 10 }, 
  barraPesquisa: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 15, height: 60, borderWidth: 1 }, 
  inputPesquisa: { flex: 1, fontSize: 16, fontWeight: 'bold' }, 
  botaoBuscarAction: { backgroundColor: '#F86F03', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  areaSugestoes: { position: 'absolute', top: 65, left: 0, right: 0, borderRadius: 15, padding: 10, borderWidth: 1, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5 }, 
  itemSugestao: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1 }, 
  textoSugestao: { fontSize: 16, fontWeight: 'bold', marginLeft: 12 },

  cartaoIACarregando: { marginTop: 15, borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 2 }, 
  textoCarregando: { color: '#F86F03', fontWeight: 'bold', marginTop: 10 },

  cartaoIAResultado: { marginTop: 15, borderRadius: 20, padding: 20, borderWidth: 2, elevation: 3 }, 
  botaoFecharIA: { position: 'absolute', top: 15, right: 15, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' }, 
  topoCartaoIA: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, paddingBottom: 10 }, 
  tituloRaca: { fontSize: 20, fontWeight: '900', color: '#F86F03', marginLeft: 10, flex: 1 }, 
  textoInfoIA: { fontSize: 14, lineHeight: 22, marginBottom: 8 }, 
  labelIA: { fontWeight: 'bold' }, 
  dicaIA: { padding: 12, borderRadius: 12, marginTop: 10 }, 
  textoDicaIA: { color: '#4F7FFF', fontSize: 13, fontStyle: 'italic', fontWeight: 'bold' },

  cabecalhoPets: { marginTop: 10, marginBottom: 10 },

  cartaoAdicionarPet: { alignItems: 'center', justifyContent: 'center', borderRadius: 25, padding: 15, marginRight: 15, borderWidth: 2, width: 110, height: 140, borderStyle: 'dashed' }, 
  iconeAdicionarFundo: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 }, 
  textoAdicionarPet: { fontSize: 14, fontWeight: 'bold', color: '#F86F03', textAlign: 'center' },

  cartaoPet: { alignItems: 'center', borderRadius: 25, padding: 15, marginRight: 15, borderWidth: 2, width: 110, height: 140 }, 
  imagemPet: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#4F7FFF', marginBottom: 10 }, 
  nomePet: { fontSize: 15, fontWeight: 'bold', textAlign: 'center' },

  areaVaziaPets: { justifyContent: 'center', paddingHorizontal: 20 }, 
  textoVazioPets: { color: '#AAA', fontStyle: 'italic', fontSize: 16 },

  botaoEmergencia: { position: 'absolute', bottom: 30, right: 25, backgroundColor: '#D32F2F', width: 65, height: 65, borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 15, shadowColor: '#D32F2F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 5, zIndex: 15 }
});