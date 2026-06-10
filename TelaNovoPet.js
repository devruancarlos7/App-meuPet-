import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// 👉 MÁGICA DA FLUIDEZ (Ativa animações suaves no Android)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TelaNovoPet({ setTelaAtual, pets, setPets, casaAtual, modoNoturno }) {
  
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [raca, setRaca] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState(null);

  // 👉 NAVEGAÇÃO FLUIDA PARA VOLTAR
  const navegarComAnimacao = (tela) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual(tela);
  };

  // ESCOLHER A FOTO DO BICHINHO
  const escolherImagemPet = async () => {
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
        // Animação suave quando a foto aparece
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const [primeiraFoto] = resultado.assets;
        setImagemSelecionada(primeiraFoto.uri);
      }
    } catch (error) {
      alert("Erro ao tentar abrir a galeria! " + error.message);
      console.log(error);
    }
  };

  const handleCriarPet = async () => {
    if (nome.trim() === '') {
      alert('Por favor, digite o nome do pet!');
      return;
    }

    try {
      // 1. Empacotamos os dados que o usuário digitou
      const dadosDoPet = {
        nome: nome,
        tipo: tipo,
        raca: raca,
        nascimento: nascimento,
        imagem: imagemSelecionada,
        casa_id: casaAtual.id // Pegamos o ID da casa onde o usuário está no momento
      };

      // 2. Enviamos para a Rota 8 do nosso backend
      const resposta = await fetch('http://192.168.1.245:3000/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosDoPet)
      });

      const json = await resposta.json();

      // 3. Verificamos se o backend disse que deu tudo certo
      if (resposta.ok) {
        alert('Pet criado com sucesso! 🐾');
        
        // Adicionamos o novo pet à lista local do App para ele aparecer na hora na tela
        const novoPetLocal = {
          ...dadosDoPet,
          id: json.id,
          casaId: casaAtual.id
        };
        setPets([...pets, novoPetLocal]);
        
        // Volta para a tela da lista de pets
        navegarComAnimacao('ListaDePets'); 
      } else {
        alert('Erro ao criar pet: ' + json.erro);
      }
    } catch (erro) {
      console.error("Erro ao enviar pet para o banco:", erro);
      alert('Erro de conexão com o servidor. Verifique se o backend está rodando!');
    }
  };

  // 👉 CORES DO MODO NOTURNO
  const coresFundo = modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF'];
  const corCartao = modoNoturno ? '#1E1E1E' : '#FFF';
  const corTextoPrincipal = modoNoturno ? '#FFF' : '#333';
  const corInputFundo = modoNoturno ? '#2A2A2A' : '#F4F5F7';
  const corInputBorda = modoNoturno ? '#444' : '#EAEAEA';
  const corFotoFundo = modoNoturno ? '#331E0B' : '#FFF3E0';
  const corFotoBorda = modoNoturno ? '#663C16' : '#FFD1A3';
  const corPlaceholder = modoNoturno ? '#888' : '#A0A0A0';

  return (
    <LinearGradient colors={coresFundo} style={styles.container}>
      <StatusBar style={modoNoturno ? "light" : "auto"} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          
          {/* Patinhas de fundo coloridas */}
          <FontAwesome5 name="paw" size={120} color="rgba(255, 255, 255, 0.2)" style={[styles.patinha, { top: -10, right: -20, transform: [{ rotate: '20deg' }] }]} />
          <FontAwesome5 name="paw" size={60} color="rgba(79, 127, 255, 0.4)" style={[styles.patinha, { bottom: 50, right: 100, transform: [{ rotate: '-10deg' }] }]} />

          {/* 👉 CABEÇALHO COM O RESPIRO GIGANTE PARA BAIXAR A TELA */}
          <View style={styles.areaCabecalho}>
            <TouchableOpacity onPress={() => navegarComAnimacao('ListaDePets')} style={styles.botaoVoltar}>
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.textosCabecalho}>
              <Text style={styles.tituloHeader}>Novo Pet</Text>
              <Text style={styles.subTituloHeader}>Adicione um amiguinho</Text>
            </View>
          </View>

          {/* 👉 CARTÃO BRANCO REBAIXADO COM SCROLLVIEW */}
          <View style={[styles.cardAlegre, { backgroundColor: corCartao }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              
              {/* AREA DA FOTO DO PET */}
              <View style={styles.areaInfoPet}>
                <TouchableOpacity style={styles.areaFotoPet} onPress={escolherImagemPet}>
                  {imagemSelecionada ? (
                    <Image source={{ uri: imagemSelecionada }} style={styles.imagemPet} />
                  ) : (
                    <View style={[styles.bolinhaFotoVazia, { backgroundColor: corFotoFundo, borderColor: corFotoBorda }]}>
                      <FontAwesome5 name="camera" size={35} color="#F86F03" />
                      <Text style={styles.textoAddFoto}>Foto</Text>
                    </View>
                  )}
                  <View style={[styles.iconeEdicaoPet, { borderColor: corCartao }]}>
                     <Feather name="plus" size={18} color="#FFF" />
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={[styles.tituloSecao, { color: corTextoPrincipal }]}>Informações do Pet</Text>

              {/* INPUT NOME */}
              <View style={[styles.areaInput, { backgroundColor: corInputFundo, borderColor: corInputBorda }]}>
                <Feather name="edit-3" size={20} color="#888" style={styles.iconeInput} />
                <TextInput
                  style={[styles.input, { color: corTextoPrincipal }]}
                  placeholder="Nome do pet"
                  placeholderTextColor={corPlaceholder}
                  value={nome}
                  onChangeText={setNome}
                />
              </View>

              {/* INPUT TIPO (Ex: Cachorro, Gato, Pássaro) */}
              <View style={[styles.areaInput, { backgroundColor: corInputFundo, borderColor: corInputBorda }]}>
                <FontAwesome5 name="paw" size={18} color="#888" style={styles.iconeInput} />
                <TextInput
                  style={[styles.input, { color: corTextoPrincipal }]}
                  placeholder="Tipo de pet (Ex: Cachorro, Gato)"
                  placeholderTextColor={corPlaceholder}
                  value={tipo}
                  onChangeText={setTipo}
                />
              </View>

              {/* INPUT RAÇA */}
              <View style={[styles.areaInput, { backgroundColor: corInputFundo, borderColor: corInputBorda }]}>
                <Feather name="tag" size={20} color="#888" style={styles.iconeInput} />
                <TextInput
                  style={[styles.input, { color: corTextoPrincipal }]}
                  placeholder="Raça"
                  placeholderTextColor={corPlaceholder}
                  value={raca}
                  onChangeText={setRaca}
                />
              </View>

              {/* INPUT NASCIMENTO */}
              <View style={[styles.areaInput, { backgroundColor: corInputFundo, borderColor: corInputBorda }]}>
                <Feather name="calendar" size={20} color="#888" style={styles.iconeInput} />
                <TextInput
                  style={[styles.input, { color: corTextoPrincipal }]}
                  placeholder="Data de Nascimento / Idade"
                  placeholderTextColor={corPlaceholder}
                  value={nascimento}
                  onChangeText={setNascimento}
                />
              </View>

              {/* BOTÃO DE CADASTRAR */}
              <TouchableOpacity style={styles.botaoAcao} onPress={handleCriarPet}>
                <Text style={styles.textoBotaoAcao}>Cadastrar Pet</Text>
                <Feather name="check-circle" size={22} color="#FFF" style={{ position: 'absolute', right: 20 }} />
              </TouchableOpacity>

            </ScrollView>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  patinha: { position: 'absolute', zIndex: 0 },
  
  // 👉 CABEÇALHO COM O RESPIRO (Afastando da barra superior)
  areaCabecalho: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 40, paddingBottom: 60, zIndex: 1 },
  botaoVoltar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textosCabecalho: { flex: 1 },
  tituloHeader: { fontSize: 28, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  subTituloHeader: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' },

  // 👉 CARTÃO BRANCO REBAIXADO
  cardAlegre: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 35,
    flex: 1, 
    marginTop: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 15
  },

  // Área da Foto do Pet
  areaInfoPet: { alignItems: 'center', marginBottom: 25 },
  areaFotoPet: { position: 'relative', marginBottom: 10 },
  imagemPet: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#F86F03' },
  bolinhaFotoVazia: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFF3E0', borderWidth: 3, borderColor: '#FFD1A3', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  textoAddFoto: { color: '#F86F03', fontWeight: 'bold', marginTop: 5 },
  iconeEdicaoPet: { position: 'absolute', bottom: 0, right: 5, backgroundColor: '#4F7FFF', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF', elevation: 4 },

  tituloSecao: { fontSize: 20, fontWeight: '900', color: '#333', marginBottom: 15, marginLeft: 5 },

  // Inputs Clean
  areaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    height: 65,
    borderWidth: 1,
    borderColor: '#EAEAEA'
  },
  iconeInput: { marginRight: 15 },
  input: { flex: 1, fontSize: 16, color: '#333', fontWeight: 'bold' },

  // Botão Gordinho de Ação
  botaoAcao: {
    flexDirection: 'row',
    backgroundColor: '#F86F03',
    borderRadius: 16,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#F86F03',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  textoBotaoAcao: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});