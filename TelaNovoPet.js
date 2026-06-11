import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
  Alert
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000'
  : 'http://192.168.1.244:3000';

const formatarDataNascimento = (texto) => {
  // Remove tudo que não for número
  let numeros = texto.replace(/\D/g, '');

  // Limita em 8 números: DDMMAAAA
  if (numeros.length > 8) {
    numeros = numeros.slice(0, 8);
  }

  // Monta DD/MM/AAAA automaticamente
  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 4) {
    return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  }

  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
};

const validarDataNascimento = (dataTexto) => {
  const numeros = dataTexto.replace(/\D/g, '');

  if (numeros.length !== 8) {
    return {
      valido: false,
      mensagem: 'Digite a data completa no formato DD/MM/AAAA.'
    };
  }

  const dia = Number(numeros.slice(0, 2));
  const mes = Number(numeros.slice(2, 4));
  const ano = Number(numeros.slice(4, 8));

  if (dia < 1 || mes < 1 || mes > 12 || ano < 1900) {
    return {
      valido: false,
      mensagem: 'Digite uma data de nascimento válida.'
    };
  }

  const data = new Date(ano, mes - 1, dia);

  const dataExiste =
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia;

  if (!dataExiste) {
    return {
      valido: false,
      mensagem: 'Essa data não existe. Confira o dia, mês e ano.'
    };
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (data > hoje) {
    return {
      valido: false,
      mensagem: 'A data de nascimento não pode ser no futuro.'
    };
  }

  const idadeEmAnos = hoje.getFullYear() - ano;
  const aindaNaoFezAniversario =
    hoje.getMonth() < mes - 1 ||
    (hoje.getMonth() === mes - 1 && hoje.getDate() < dia);

  const idadeFinal = aindaNaoFezAniversario ? idadeEmAnos - 1 : idadeEmAnos;

  if (idadeFinal > 80) {
    return {
      valido: false,
      mensagem: 'Essa data deixa o pet com mais de 80 anos. Confira se está correta.'
    };
  }

  return {
    valido: true,
    dataFormatada: dataTexto,
    idade: idadeFinal
  };
};

export default function TelaNovoPet({
  setTelaAtual,
  pets,
  setPets,
  casaAtual,
  modoNoturno,
  buscarPetsDaCasa
}) {

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [raca, setRaca] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [imagemSelecionada, setImagemSelecionada] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const navegarComAnimacao = (tela) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual(tela);
  };

  const escolherImagemPet = async () => {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos!');
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true
      });

      if (!resultado.canceled) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        const primeiraFoto = resultado.assets?.[0];

        if (!primeiraFoto) {
          Alert.alert('Erro', 'Nenhuma imagem foi selecionada.');
          return;
        }

        const imagemFinal = primeiraFoto.base64
          ? `data:${primeiraFoto.mimeType || 'image/jpeg'};base64,${primeiraFoto.base64}`
          : primeiraFoto.uri;

        setImagemSelecionada(imagemFinal);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao tentar abrir a galeria! ' + error.message);
      console.log(error);
    }
  };

  const handleMudarNascimento = (texto) => {
    setNascimento(formatarDataNascimento(texto));
  };

  const handleCriarPet = async () => {
    const nomeLimpo = nome.trim();
    const tipoLimpo = tipo.trim();
    const racaLimpa = raca.trim();

    if (nomeLimpo === '') {
      Alert.alert('Atenção', 'Por favor, digite o nome do pet!');
      return;
    }

    if (tipoLimpo === '') {
      Alert.alert('Atenção', 'Por favor, digite o tipo do pet!');
      return;
    }

    if (racaLimpa === '') {
      Alert.alert('Atenção', 'Por favor, digite a raça do pet!');
      return;
    }

    if (nascimento.trim() === '') {
      Alert.alert('Atenção', 'A data de nascimento do pet é obrigatória.');
      return;
    }

    const validacaoData = validarDataNascimento(nascimento);

    if (!validacaoData.valido) {
      Alert.alert('Data inválida', validacaoData.mensagem);
      return;
    }

    if (!casaAtual?.id) {
      Alert.alert('Erro', 'Casa atual não encontrada. Volte e entre na casa novamente.');
      return;
    }

    try {
      setSalvando(true);

      const dadosDoPet = {
        nome: nomeLimpo,
        tipo: tipoLimpo,
        raca: racaLimpa,
        nascimento: validacaoData.dataFormatada,
        imagem: imagemSelecionada,
        casa_id: casaAtual.id
      };

      const resposta = await fetch(`${API_URL}/pets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosDoPet)
      });

      const json = await resposta.json();

      if (resposta.ok && json.sucesso !== false) {
        Alert.alert('Sucesso', 'Pet criado com sucesso! 🐾');

        const novoPetLocal = {
          ...dadosDoPet,
          id: json.id,
          casaId: casaAtual.id
        };

        if (setPets) {
          setPets([novoPetLocal, ...(pets || [])]);
        }

        if (buscarPetsDaCasa) {
          await buscarPetsDaCasa(casaAtual.id);
        }

        navegarComAnimacao('ListaDePets');
      } else {
        Alert.alert('Erro', json.erro || 'Erro ao criar pet.');
      }
    } catch (erro) {
      console.error('Erro ao enviar pet para o banco:', erro);
      Alert.alert('Erro', 'Erro de conexão com o servidor. Verifique se o backend está rodando!');
    } finally {
      setSalvando(false);
    }
  };

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
      <StatusBar style={modoNoturno ? 'light' : 'auto'} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >

          <FontAwesome5
            name="paw"
            size={120}
            color="rgba(255, 255, 255, 0.2)"
            style={[styles.patinha, { top: -10, right: -20, transform: [{ rotate: '20deg' }] }]}
          />

          <FontAwesome5
            name="paw"
            size={60}
            color="rgba(79, 127, 255, 0.4)"
            style={[styles.patinha, { bottom: 50, right: 100, transform: [{ rotate: '-10deg' }] }]}
          />

          <View style={styles.areaCabecalho}>
            <TouchableOpacity
              onPress={() => navegarComAnimacao('ListaDePets')}
              style={styles.botaoVoltar}
              disabled={salvando}
            >
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.textosCabecalho}>
              <Text style={styles.tituloHeader}>Novo Pet</Text>
              <Text style={styles.subTituloHeader}>Adicione um amiguinho</Text>
            </View>
          </View>

          <View style={[styles.cardAlegre, { backgroundColor: corCartao }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

              <View style={styles.areaInfoPet}>
                <TouchableOpacity
                  style={styles.areaFotoPet}
                  onPress={escolherImagemPet}
                  disabled={salvando}
                >
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

              <Text style={[styles.tituloSecao, { color: corTextoPrincipal }]}>
                Informações do Pet
              </Text>

              <View style={[styles.areaInput, { backgroundColor: corInputFundo, borderColor: corInputBorda }]}>
                <Feather name="edit-3" size={20} color="#888" style={styles.iconeInput} />

                <TextInput
                  style={[styles.input, { color: corTextoPrincipal }]}
                  placeholder="Nome do pet"
                  placeholderTextColor={corPlaceholder}
                  value={nome}
                  onChangeText={setNome}
                  editable={!salvando}
                />
              </View>

              <View style={[styles.areaInput, { backgroundColor: corInputFundo, borderColor: corInputBorda }]}>
                <FontAwesome5 name="paw" size={18} color="#888" style={styles.iconeInput} />

                <TextInput
                  style={[styles.input, { color: corTextoPrincipal }]}
                  placeholder="Tipo de pet (Ex: Cachorro, Gato)"
                  placeholderTextColor={corPlaceholder}
                  value={tipo}
                  onChangeText={setTipo}
                  editable={!salvando}
                />
              </View>

              <View style={[styles.areaInput, { backgroundColor: corInputFundo, borderColor: corInputBorda }]}>
                <Feather name="tag" size={20} color="#888" style={styles.iconeInput} />

                <TextInput
                  style={[styles.input, { color: corTextoPrincipal }]}
                  placeholder="Raça"
                  placeholderTextColor={corPlaceholder}
                  value={raca}
                  onChangeText={setRaca}
                  editable={!salvando}
                />
              </View>

              <View style={[styles.areaInput, { backgroundColor: corInputFundo, borderColor: corInputBorda }]}>
                <Feather name="calendar" size={20} color="#888" style={styles.iconeInput} />

                <TextInput
                  style={[styles.input, { color: corTextoPrincipal }]}
                  placeholder="Data de nascimento (DD/MM/AAAA)"
                  placeholderTextColor={corPlaceholder}
                  value={nascimento}
                  onChangeText={handleMudarNascimento}
                  keyboardType="number-pad"
                  maxLength={10}
                  editable={!salvando}
                />
              </View>

              <Text style={styles.textoAjudaData}>
                Digite apenas números. Exemplo: 15032022 vira 15/03/2022.
              </Text>

              <TouchableOpacity
                style={[styles.botaoAcao, salvando && { opacity: 0.7 }]}
                onPress={handleCriarPet}
                disabled={salvando}
              >
                <Text style={styles.textoBotaoAcao}>
                  {salvando ? 'Cadastrando...' : 'Cadastrar Pet'}
                </Text>

                <Feather
                  name="check-circle"
                  size={22}
                  color="#FFF"
                  style={{ position: 'absolute', right: 20 }}
                />
              </TouchableOpacity>

            </ScrollView>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  patinha: {
    position: 'absolute',
    zIndex: 0
  },

  areaCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 60,
    zIndex: 1
  },

  botaoVoltar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },

  textosCabecalho: {
    flex: 1
  },

  tituloHeader: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {
      width: 1,
      height: 1
    },
    textShadowRadius: 3
  },

  subTituloHeader: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: 'bold'
  },

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
    shadowOffset: {
      width: 0,
      height: -5
    },
    shadowOpacity: 0.15,
    shadowRadius: 15
  },

  areaInfoPet: {
    alignItems: 'center',
    marginBottom: 25
  },

  areaFotoPet: {
    position: 'relative',
    marginBottom: 10
  },

  imagemPet: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#F86F03'
  },

  bolinhaFotoVazia: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF3E0',
    borderWidth: 3,
    borderColor: '#FFD1A3',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center'
  },

  textoAddFoto: {
    color: '#F86F03',
    fontWeight: 'bold',
    marginTop: 5
  },

  iconeEdicaoPet: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    backgroundColor: '#4F7FFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 4
  },

  tituloSecao: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333',
    marginBottom: 15,
    marginLeft: 5
  },

  areaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
    borderRadius: 16,
    marginBottom: 14,
    paddingHorizontal: 20,
    height: 65,
    borderWidth: 1,
    borderColor: '#EAEAEA'
  },

  iconeInput: {
    marginRight: 15
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold'
  },

  textoAjudaData: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 20,
    marginLeft: 5,
    marginTop: -4
  },

  botaoAcao: {
    flexDirection: 'row',
    backgroundColor: '#F86F03',
    borderRadius: 16,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#F86F03',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },

  textoBotaoAcao: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold'
  }
});