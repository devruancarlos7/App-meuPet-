import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, TextInput, ActivityIndicator, SafeAreaView, Platform, LayoutAnimation, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

// 👉 MÁGICA DA FLUIDEZ (Ativa animações no Android)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ListaDePets({ setTelaAtual, pets, casaAtual, setPetAtual, usuarioAtual }) {
  
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

  const petsDestaCasa = pets.filter((pet) => pet.casaId === casaAtual?.id);

  // 👉 NAVEGAÇÃO FLUIDA
  const navegarComAnimacao = (tela) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual(tela);
  };

  const handlePesquisa = (textoDigitado) => {
    setPesquisa(textoDigitado);
    setResultado(null); 
    if (textoDigitado.trim().length > 0) {
      const filtro = bancoDeRacas.filter(raca => raca.nome.toLowerCase().includes(textoDigitado.toLowerCase()));
      // Anima a lista de sugestões abrindo
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
      setResultado(racaEscolhida);
      setCarregando(false);
    }, 1200);
  };

  const buscarManual = () => {
    if (pesquisa.trim() === '') return;
    setSugestoes([]);
    setCarregando(true);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const racaEncontrada = bancoDeRacas.find(r => r.nome.toLowerCase().includes(pesquisa.toLowerCase()));
      if (racaEncontrada) {
        setResultado(racaEncontrada);
      } else {
        setResultado({
          nome: pesquisa.toUpperCase(),
          descricao: `Ainda não temos dados profundos sobre "${pesquisa}".`,
          expectativa: 'Consulte um veterinário.',
          problemas: 'Acompanhamento regular.',
          dica: 'Dê muito carinho e água fresca.'
        });
      }
      setCarregando(false);
    }, 1500);
  };

  const fecharPesquisa = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPesquisa('');
    setSugestoes([]);
    setResultado(null);
  };

  return (
    <LinearGradient colors={['#F86F03', '#4F7FFF']} style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* Patinhas vibrantes de fundo */}
        <FontAwesome5 name="paw" size={120} color="rgba(255, 255, 255, 0.2)" style={[styles.patinha, { top: -10, right: -20, transform: [{ rotate: '20deg' }] }]} />
        <FontAwesome5 name="paw" size={60} color="rgba(79, 127, 255, 0.4)" style={[styles.patinha, { bottom: 50, right: 100, transform: [{ rotate: '-10deg' }] }]} />

        {/* 👉 CABEÇALHO ESPAÇADO (Empurrando o cartão para baixo) */}
        <View style={styles.areaCabecalho}>
          <TouchableOpacity onPress={() => navegarComAnimacao('Casas')} style={styles.botaoVoltar}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.infoCasaHeader}>
            <Text style={styles.tituloHeader}>{casaAtual?.nome}</Text>
            <Text style={styles.subTituloHeader}>Casa Atual</Text>
          </View>

          <View style={styles.botoesDireita}>
            {isAdmin && (
              <TouchableOpacity onPress={() => navegarComAnimacao('ConfigurarCasa')} style={styles.botaoIconeTop}>
                <Feather name="settings" size={22} color="#FFF" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => navegarComAnimacao('PerfilUsuario')} style={styles.botaoIconeTop}>
              <Feather name="user" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 👉 CARTÃO BRANCO (O Respiro Visual) */}
        <View style={styles.cardAlegre}>
          
          <Text style={styles.tituloSecao}>Busca Inteligente 🧠</Text>
          
          {/* Barra de Pesquisa Clean */}
          <View style={styles.areaBuscaInteligente}>
            <View style={styles.barraPesquisa}>
              <Feather name="search" size={22} color="#888" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.inputPesquisa}
                placeholder="Ex: Siamês, Golden..."
                placeholderTextColor="#A0A0A0"
                value={pesquisa}
                onChangeText={handlePesquisa}
              />
              {pesquisa.length > 0 && (
                <TouchableOpacity onPress={buscarManual} style={styles.botaoBuscarAction}>
                  <Feather name="arrow-right" size={20} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>

            {sugestoes.length > 0 && (
              <View style={styles.areaSugestoes}>
                {sugestoes.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.itemSugestao} onPress={() => selecionarRaca(item)}>
                    <Feather name="search" size={16} color="#F86F03" />
                    <Text style={styles.textoSugestao}>{item.nome}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {carregando && (
              <View style={styles.cartaoIACarregando}>
                <ActivityIndicator size="large" color="#F86F03" />
                <Text style={styles.textoCarregando}>A IA está processando...</Text>
              </View>
            )}

            {resultado && !carregando && (
              <View style={styles.cartaoIAResultado}>
                <TouchableOpacity style={styles.botaoFecharIA} onPress={fecharPesquisa}>
                  <Feather name="x" size={20} color="#333" />
                </TouchableOpacity>

                <View style={styles.topoCartaoIA}>
                  <FontAwesome5 name="robot" size={24} color="#F86F03" />
                  <Text style={styles.tituloRaca}>{resultado.nome}</Text>
                </View>

                <Text style={styles.textoInfoIA}><Text style={styles.labelIA}>🐾 Sobre:</Text> {resultado.descricao}</Text>
                <Text style={styles.textoInfoIA}><Text style={styles.labelIA}>⏳ Vida:</Text> {resultado.expectativa}</Text>
                <Text style={styles.textoInfoIA}><Text style={styles.labelIA}>🏥 Saúde:</Text> {resultado.problemas}</Text>
                <View style={styles.dicaIA}>
                  <Text style={styles.textoDicaIA}>💡 Dica: {resultado.dica}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Área dos Pets */}
          <View style={styles.cabecalhoPets}>
            <Text style={styles.tituloSecao}>Pets da Casa 🐶</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 20 }}>
            
            {/* O Botão de Adicionar Pet agora é o primeiro "Cartão" da lista */}
            <TouchableOpacity style={styles.cartaoAdicionarPet} onPress={() => navegarComAnimacao('NovoPet')}>
              <View style={styles.iconeAdicionarFundo}>
                 <Feather name="plus" size={30} color="#F86F03" />
              </View>
              <Text style={styles.textoAdicionarPet}>Novo Pet</Text>
            </TouchableOpacity>

            {/* A Lista de Pets que moram na casa */}
            {petsDestaCasa.length > 0 ? (
              petsDestaCasa.map((pet) => (
                <TouchableOpacity 
                  key={pet.id} 
                  style={styles.cartaoPet} 
                  onPress={() => { setPetAtual(pet); navegarComAnimacao('MetasCuidados'); }}
                >
                  <Image source={{ uri: pet.imagem }} style={styles.imagemPet} />
                  <Text style={styles.nomePet}>{pet.nome}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.areaVaziaPets}>
                <Text style={styles.textoVazioPets}>Nenhum pet aqui!</Text>
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
  
  // 👉 CABEÇALHO ESPAÇOSO
  areaCabecalho: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 40, paddingBottom: 60, zIndex: 1 },
  botaoVoltar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoCasaHeader: { flex: 1 },
  tituloHeader: { fontSize: 26, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  subTituloHeader: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' },
  botoesDireita: { flexDirection: 'row', gap: 10 },
  botaoIconeTop: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  // 👉 CARTÃO BRANCO REBAIXADO
  cardAlegre: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 35,
    flex: 1, 
    marginTop: 10, // O respiro!
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    zIndex: 2
  },

  tituloSecao: { fontSize: 22, fontWeight: '900', color: '#333', marginBottom: 15, paddingHorizontal: 5 },

  // Busca Inteligente
  areaBuscaInteligente: { position: 'relative', marginBottom: 30, zIndex: 10 },
  barraPesquisa: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F5F7', borderRadius: 20, paddingHorizontal: 15, height: 60, borderWidth: 1, borderColor: '#EAEAEA' },
  inputPesquisa: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#333' },
  botaoBuscarAction: { backgroundColor: '#F86F03', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  areaSugestoes: { position: 'absolute', top: 65, left: 0, right: 0, backgroundColor: '#FFF', borderRadius: 15, padding: 10, borderWidth: 1, borderColor: '#EEE', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5 },
  itemSugestao: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#F4F5F7' },
  textoSugestao: { color: '#555', fontSize: 16, fontWeight: 'bold', marginLeft: 12 },

  cartaoIACarregando: { backgroundColor: '#FFF3E0', marginTop: 15, borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: '#FFD1A3' },
  textoCarregando: { color: '#F86F03', fontWeight: 'bold', marginTop: 10 },

  cartaoIAResultado: { backgroundColor: '#FFF', marginTop: 15, borderRadius: 20, padding: 20, borderWidth: 2, borderColor: '#F86F03', elevation: 3 },
  botaoFecharIA: { position: 'absolute', top: 15, right: 15, backgroundColor: '#F4F5F7', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  topoCartaoIA: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 10 },
  tituloRaca: { fontSize: 20, fontWeight: '900', color: '#F86F03', marginLeft: 10, flex: 1 },
  textoInfoIA: { color: '#555', fontSize: 14, lineHeight: 22, marginBottom: 8 },
  labelIA: { fontWeight: 'bold', color: '#333' },
  dicaIA: { backgroundColor: '#E3F2FD', padding: 12, borderRadius: 12, marginTop: 10 },
  textoDicaIA: { color: '#4F7FFF', fontSize: 13, fontStyle: 'italic', fontWeight: 'bold' },

  cabecalhoPets: { marginTop: 10 },

  // Estilos Felizes dos Pets
  cartaoAdicionarPet: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF3E0', borderRadius: 25, padding: 15, marginRight: 15, borderWidth: 2, borderColor: '#FFD1A3', width: 110, height: 140, borderStyle: 'dashed' },
  iconeAdicionarFundo: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  textoAdicionarPet: { fontSize: 14, fontWeight: 'bold', color: '#F86F03', textAlign: 'center' },

  cartaoPet: { alignItems: 'center', backgroundColor: '#F0F4FF', borderRadius: 25, padding: 15, marginRight: 15, borderWidth: 2, borderColor: '#E0E8FF', width: 110, height: 140 },
  imagemPet: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#4F7FFF', marginBottom: 10 },
  nomePet: { fontSize: 15, fontWeight: 'bold', color: '#333', textAlign: 'center' },

  areaVaziaPets: { justifyContent: 'center', paddingHorizontal: 20 },
  textoVazioPets: { color: '#AAA', fontStyle: 'italic', fontSize: 16 }
});