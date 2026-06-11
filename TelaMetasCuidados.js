import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  LayoutAnimation,
  UIManager,
  LogBox,
  Alert
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000'
  : 'http://192.168.1.244:3000';

export default function TelaMetasCuidados({
  setTelaAtual,
  petAtual,
  setPetAtual,
  pets,
  setPets,
  casaAtual,
  usuarioAtual,
  metas,
  setMetas,
  agendamentos,
  setAgendamentos,
  notificacoesAtivas,
  modoNoturno,
  buscarPetsDaCasa
}) {
  const [felicidade, setFelicidade] = useState(50);

  const animar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const navegarComAnimacao = (tela) => {
    animar();
    setTelaAtual(tela);
  };

  const metaPadrao = {
    petId: petAtual?.id,

    comidaMeta: 3,
    comidaFeita: 0,
    comidaPeriodo: 'Diário',

    passeioMeta: 2,
    passeioFeita: 0,
    passeioPeriodo: 'Diário',

    curativoMeta: 0,
    curativoFeita: 0,
    curativoPeriodo: 'Mensal',

    vetMeta: 1,
    vetFeita: 0,
    vetPeriodo: 'Semestral'
  };

  const metaDoPet =
    metas?.find(m => String(m.petId) === String(petAtual?.id)) || metaPadrao;

  const salvarMetasNoBanco = async (novaMeta) => {
    if (!petAtual?.id) return;

    try {
      const dadosParaBanco = {
        comida_meta: Number(novaMeta.comidaMeta ?? 3),
        comida_feita: Number(novaMeta.comidaFeita ?? 0),
        comida_periodo: novaMeta.comidaPeriodo ?? 'Diário',

        passeio_meta: Number(novaMeta.passeioMeta ?? 2),
        passeio_feita: Number(novaMeta.passeioFeita ?? 0),
        passeio_periodo: novaMeta.passeioPeriodo ?? 'Diário',

        curativo_meta: Number(novaMeta.curativoMeta ?? 0),
        curativo_feita: Number(novaMeta.curativoFeita ?? 0),
        curativo_periodo: novaMeta.curativoPeriodo ?? 'Mensal',

        vet_meta: Number(novaMeta.vetMeta ?? 1),
        vet_feita: Number(novaMeta.vetFeita ?? 0),
        vet_periodo: novaMeta.vetPeriodo ?? 'Semestral'
      };

      const resposta = await fetch(`${API_URL}/pets/${petAtual.id}/metas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosParaBanco)
      });

      if (!resposta.ok) {
        console.log('Erro ao salvar metas:', resposta.status);
      }
    } catch (erro) {
      console.error('Erro ao salvar meta no banco:', erro);
    }
  };

  const buscarAgendamentos = async () => {
    if (!petAtual?.id) return;

    try {
      const resposta = await fetch(`${API_URL}/pets/${petAtual.id}/agendamentos`);

      if (resposta.ok) {
        const dados = await resposta.json();
        setAgendamentos(dados);
      }
    } catch (erro) {
      console.error('Erro ao buscar agendamentos do pet:', erro);
    }
  };

  useEffect(() => {
    buscarAgendamentos();
  }, [petAtual?.id]);

  useEffect(() => {
    const buscarMetasEChecarDia = async () => {
      if (!petAtual?.id) return;

      try {
        const resposta = await fetch(`${API_URL}/pets/${petAtual.id}/metas`);

        if (!resposta.ok) return;

        const dados = await resposta.json();

        let metaFormatada = {
          ...metaPadrao,
          petId: petAtual.id
        };

        if (Array.isArray(dados) && dados.length > 0) {
          const b = dados[0];

          metaFormatada = {
            petId: petAtual.id,

            comidaMeta: Number(b.comida_meta ?? 3),
            comidaFeita: Number(b.comida_feita ?? 0),
            comidaPeriodo: b.comida_periodo ?? 'Diário',

            passeioMeta: Number(b.passeio_meta ?? 2),
            passeioFeita: Number(b.passeio_feita ?? 0),
            passeioPeriodo: b.passeio_periodo ?? 'Diário',

            curativoMeta: Number(b.curativo_meta ?? 0),
            curativoFeita: Number(b.curativo_feita ?? 0),
            curativoPeriodo: b.curativo_periodo ?? 'Mensal',

            vetMeta: Number(b.vet_meta ?? 1),
            vetFeita: Number(b.vet_feita ?? 0),
            vetPeriodo: b.vet_periodo ?? 'Semestral'
          };
        }

        const hoje = new Date().toDateString();
        const chave = `@ultimo_dia_${petAtual.id}`;
        const ultimoAcesso = await AsyncStorage.getItem(chave);

        if (ultimoAcesso && ultimoAcesso !== hoje) {
          if (metaFormatada.comidaPeriodo === 'Diário') metaFormatada.comidaFeita = 0;
          if (metaFormatada.passeioPeriodo === 'Diário') metaFormatada.passeioFeita = 0;
          if (metaFormatada.curativoPeriodo === 'Diário') metaFormatada.curativoFeita = 0;
          if (metaFormatada.vetPeriodo === 'Diário') metaFormatada.vetFeita = 0;

          salvarMetasNoBanco(metaFormatada);
        }

        await AsyncStorage.setItem(chave, hoje);

        setMetas(metasAntigas => {
          const outras = metasAntigas.filter(m => String(m.petId) !== String(petAtual.id));
          return [...outras, metaFormatada];
        });
      } catch (erro) {
        console.error('Erro ao buscar metas do pet:', erro);
      }
    };

    buscarMetasEChecarDia();

    const relogio = setInterval(async () => {
      if (!petAtual?.id) return;

      const hoje = new Date().toDateString();
      const chave = `@ultimo_dia_${petAtual.id}`;
      const ultimoAcesso = await AsyncStorage.getItem(chave);

      if (ultimoAcesso && ultimoAcesso !== hoje) {
        buscarMetasEChecarDia();
      }
    }, 60000);

    return () => clearInterval(relogio);
  }, [petAtual?.id]);

  useEffect(() => {
    const metaAtual = metas?.find(m => String(m.petId) === String(petAtual?.id));

    if (metaAtual) {
      const totalMetas =
        Number(metaAtual.comidaMeta || 0) +
        Number(metaAtual.passeioMeta || 0) +
        Number(metaAtual.curativoMeta || 0) +
        Number(metaAtual.vetMeta || 0);

      const totalFeitas =
        Number(metaAtual.comidaFeita || 0) +
        Number(metaAtual.passeioFeita || 0) +
        Number(metaAtual.curativoFeita || 0) +
        Number(metaAtual.vetFeita || 0);

      if (totalMetas > 0) {
        const porcentagem = Math.round((totalFeitas / totalMetas) * 100);
        setFelicidade(porcentagem > 100 ? 100 : porcentagem);
      } else {
        setFelicidade(50);
      }
    }
  }, [metas, petAtual?.id]);

  const montarDataAgendamento = (agendamento) => {
    const dataTexto = agendamento.texto_data;
    const horaTexto = agendamento.texto_horario || '00:00';

    if (!dataTexto) return null;

    const partesData = String(dataTexto).split('/');
    const partesHora = String(horaTexto).split(':');

    if (partesData.length !== 3) return null;

    const dia = Number(partesData[0]);
    const mes = Number(partesData[1]) - 1;
    const ano = Number(partesData[2]);
    const hora = Number(partesHora[0] || 0);
    const minuto = Number(partesHora[1] || 0);

    if (
      Number.isNaN(dia) ||
      Number.isNaN(mes) ||
      Number.isNaN(ano) ||
      Number.isNaN(hora) ||
      Number.isNaN(minuto)
    ) {
      return null;
    }

    return new Date(ano, mes, dia, hora, minuto, 0, 0);
  };

  const agendamentoAindaAtivo = (agendamento) => {
    const dataAgendamento = montarDataAgendamento(agendamento);

    if (!dataAgendamento) return true;

    const dataExpiracao = new Date(dataAgendamento.getTime() + 24 * 60 * 60 * 1000);
    const agora = new Date();

    return agora <= dataExpiracao;
  };

  const agendamentosDoPet =
    agendamentos
      ?.filter(a => String(a.petId ?? a.pet_id) === String(petAtual?.id))
      ?.filter(agendamentoAindaAtivo) || [];

  const escolherImagemPet = async () => {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar suas fotos.'
        );
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: true
      });

      if (resultado.canceled) return;

      const asset = resultado.assets?.[0];

      if (!asset) {
        Alert.alert('Erro', 'Nenhuma imagem foi selecionada.');
        return;
      }

      const novaImagem = asset.base64
        ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;

      const resposta = await fetch(`${API_URL}/pets/${petAtual.id}/imagem`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imagem: novaImagem
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok || dados.sucesso === false) {
        Alert.alert('Erro', dados.erro || 'Erro ao salvar a foto do pet no banco.');
        return;
      }

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      const petAtualizado = {
        ...petAtual,
        imagem: novaImagem
      };

      setPetAtual(petAtualizado);

      setPets(petsAtuais =>
        petsAtuais.map(p =>
          String(p.id) === String(petAtual.id) ? petAtualizado : p
        )
      );

      if (buscarPetsDaCasa && casaAtual?.id) {
        await buscarPetsDaCasa(casaAtual.id);
      }

      Alert.alert('Sucesso', 'Imagem do pet atualizada!');
    } catch (erro) {
      console.error('Erro ao abrir/salvar imagem do pet:', erro);
      Alert.alert(
        'Erro',
        'Erro ao abrir a galeria. Verifique a permissão de fotos do Expo Go.'
      );
    }
  };

  const alterarValor = (tipo, acao) => {
    animar();

    const novaMeta = {
      ...metaDoPet,
      petId: petAtual?.id
    };

    const campoFeita = `${tipo}Feita`;
    const campoMeta = `${tipo}Meta`;

    const valorAtual = Number(novaMeta[campoFeita] ?? 0);
    const limite = Number(novaMeta[campoMeta] ?? 0);

    if (acao === 'mais') {
      if (valorAtual < limite) {
        novaMeta[campoFeita] = valorAtual + 1;
      } else {
        return;
      }
    }

    if (acao === 'menos') {
      if (valorAtual > 0) {
        novaMeta[campoFeita] = valorAtual - 1;
      } else {
        return;
      }
    }

    setMetas(metasAntigas => {
      const outras = metasAntigas.filter(m => String(m.petId) !== String(petAtual?.id));
      return [...outras, novaMeta];
    });

    salvarMetasNoBanco(novaMeta);
  };

  const alterarPeriodo = (tipo) => {
    animar();

    const periodos = ['Diário', 'Semanal', 'Mensal', 'Semestral', 'Anual'];

    const campoPeriodo = `${tipo}Periodo`;

    const novaMeta = {
      ...metaDoPet,
      petId: petAtual?.id
    };

    const indexAtual = periodos.indexOf(novaMeta[campoPeriodo]);
    const proximoIndex = indexAtual === -1 ? 0 : (indexAtual + 1) % periodos.length;

    novaMeta[campoPeriodo] = periodos[proximoIndex];

    setMetas(metasAntigas => {
      const outras = metasAntigas.filter(m => String(m.petId) !== String(petAtual?.id));
      return [...outras, novaMeta];
    });

    salvarMetasNoBanco(novaMeta);
  };

  const excluirAgendamento = (id) => {
    Alert.alert(
      'Remover Compromisso',
      'Deseja realmente apagar este agendamento do calendário?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              const resposta = await fetch(`${API_URL}/agendamentos/${id}`, {
                method: 'DELETE'
              });

              const dados = await resposta.json();

              if (!resposta.ok || dados.sucesso === false) {
                Alert.alert('Erro', dados.erro || 'Erro ao excluir agendamento.');
                return;
              }

              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

              setAgendamentos(agendamentosGlobais =>
                agendamentosGlobais.filter(a => String(a.id) !== String(id))
              );

              Alert.alert('Sucesso', 'Agendamento removido com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir agendamento:', error);
              Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
            }
          }
        }
      ]
    );
  };

  const tema = modoNoturno
    ? {
        fundo: ['#121212', '#2C3E50'],
        cartao: '#1E1E1E',
        texto: '#FFF',
        texto2: '#AAA',
        area: '#2A2A2A',
        borda: '#444',
        barra: '#444',
        item: '#232D3F',
        itemBorda: '#1A2333',
        calendario: '#331E0B',
        calendarioBorda: '#663C16',
        menosFundo: '#331515',
        menosBorda: '#551A1A'
      }
    : {
        fundo: ['#F86F03', '#4F7FFF'],
        cartao: '#FFF',
        texto: '#333',
        texto2: '#666',
        area: '#F9F9F9',
        borda: '#EEE',
        barra: '#EAEAEA',
        item: '#F4F5F7',
        itemBorda: '#EAEAEA',
        calendario: '#FFF3E0',
        calendarioBorda: '#FFD1A3',
        menosFundo: '#FFF0F0',
        menosBorda: '#FFD6D6'
      };

  const corFelicidade =
    felicidade >= 75 ? '#4CAF50' : felicidade >= 40 ? '#F86F03' : '#FF4C4C';

  const iconeFelicidade =
    felicidade >= 75 ? 'smile-beam' : felicidade >= 40 ? 'meh' : 'sad-tear';

  const statusFelicidade =
    felicidade >= 75 ? 'Muito Feliz!' : felicidade >= 40 ? 'Normal' : 'Precisando de atenção!';

  const metasTela = [
    {
      tipo: 'comida',
      nome: 'Alimentação',
      icone: 'hotdog',
      cor: '#F86F03'
    },
    {
      tipo: 'passeio',
      nome: 'Passeios',
      icone: 'dog',
      cor: '#4F7FFF'
    },
    {
      tipo: 'vet',
      nome: 'Ida ao Vet.',
      icone: 'stethoscope',
      cor: '#555'
    }
  ];

  return (
    <LinearGradient colors={tema.fundo} style={styles.container}>
      <StatusBar style={modoNoturno ? 'light' : 'auto'} />

      <View style={styles.areaCabecalho}>
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navegarComAnimacao('ListaDePets')}
        >
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.textosCabecalho}>
          <Text style={styles.tituloHeader}>Saúde & Rotina</Text>
          <Text style={styles.subTituloHeader}>Cuidados do {petAtual?.nome}</Text>
        </View>
      </View>

      <View style={[styles.cardAlegre, { backgroundColor: tema.cartao }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.areaInfoPet}>
            <TouchableOpacity style={styles.areaFotoPet} onPress={escolherImagemPet}>
              {petAtual?.imagem ? (
                <Image source={{ uri: petAtual.imagem }} style={styles.imagemPet} />
              ) : (
                <View style={[styles.imagemPet, styles.imagemPetSemFoto]}>
                  <FontAwesome5 name="paw" size={40} color="#F86F03" />
                </View>
              )}

              <View style={styles.iconeEdicaoPet}>
                <Feather name="camera" size={16} color="#FFF" />
              </View>
            </TouchableOpacity>

            <Text style={[styles.nomePet, { color: tema.texto }]}>
              {petAtual?.nome}
            </Text>
          </View>

          <View
            style={[
              styles.areaFelicidade,
              {
                backgroundColor: tema.area,
                borderColor: tema.borda
              }
            ]}
          >
            <View style={styles.topoFelicidade}>
              <Text style={[styles.tituloFelicidade, { color: tema.texto }]}>
                Nível de Cuidado
              </Text>

              <Text style={[styles.statusFelicidade, { color: corFelicidade }]}>
                <FontAwesome5 name={iconeFelicidade} size={16} /> {statusFelicidade}
              </Text>
            </View>

            <View style={[styles.barraFundo, { backgroundColor: tema.barra }]}>
              <View
                style={[
                  styles.barraPreenchida,
                  {
                    width: `${felicidade}%`,
                    backgroundColor: corFelicidade
                  }
                ]}
              />
            </View>
          </View>

          <Text style={[styles.tituloSecao, { color: tema.texto }]}>
            Metas de Cuidados
          </Text>

          {metasTela.map((meta, index) => {
            const feitas = Number(metaDoPet[`${meta.tipo}Feita`] ?? 0);
            const total = Number(metaDoPet[`${meta.tipo}Meta`] ?? 0);
            const periodo = metaDoPet[`${meta.tipo}Periodo`] ?? 'Diário';
            const concluido = total > 0 && feitas >= total;

            return (
              <View
                key={index}
                style={[
                  styles.itemMeta,
                  {
                    backgroundColor: tema.item,
                    borderColor: tema.itemBorda
                  }
                ]}
              >
                <View
                  style={[
                    styles.iconeMetaFundo,
                    {
                      backgroundColor: concluido ? '#4CAF50' : meta.cor
                    }
                  ]}
                >
                  <FontAwesome5
                    name={concluido ? 'check' : meta.icone}
                    size={20}
                    color="#FFF"
                  />
                </View>

                <View style={styles.areaContador}>
                  <Text style={[styles.nomeMeta, { color: tema.texto }]}>
                    {meta.nome}
                  </Text>

                  <Text
                    style={[
                      styles.textoContador,
                      {
                        color: concluido ? '#4CAF50' : tema.texto2
                      }
                    ]}
                  >
                    {feitas} / {total} realizadas
                  </Text>

                  <TouchableOpacity onPress={() => alterarPeriodo(meta.tipo)}>
                    <Text style={[styles.textoPeriodo, { color: tema.texto2 }]}>
                      ↻ Repete: {periodo}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.botoesAcao}>
                  <TouchableOpacity
                    style={[
                      styles.botaoAcaoMenos,
                      {
                        backgroundColor: tema.menosFundo,
                        borderColor: tema.menosBorda
                      }
                    ]}
                    onPress={() => alterarValor(meta.tipo, 'menos')}
                  >
                    <Feather name="minus" size={18} color="#FF4C4C" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.botaoAcaoMais,
                      {
                        backgroundColor: concluido ? '#AAA' : '#4CAF50'
                      }
                    ]}
                    onPress={() => alterarValor(meta.tipo, 'mais')}
                    disabled={concluido}
                  >
                    <Feather name="plus" size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <Text style={[styles.tituloSecao, { color: tema.texto, marginTop: 15 }]}>
            Calendário do Pet
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.carrosselAgendamentos}
          >
            {agendamentosDoPet.length > 0 ? (
              agendamentosDoPet.map((agendamento, index) => (
                <View
                  key={agendamento.id || index}
                  style={[
                    styles.cartaoCalendario,
                    {
                      backgroundColor: tema.calendario,
                      borderColor: tema.calendarioBorda
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.botaoLixeiraAgendamento}
                    onPress={() => excluirAgendamento(agendamento.id)}
                  >
                    <Feather name="trash-2" size={14} color="#FFF" />
                  </TouchableOpacity>

                  <View style={styles.iconeCalendarioFundo}>
                    <FontAwesome5 name="calendar-alt" size={18} color="#F86F03" />
                  </View>

                  <Text style={styles.textoDataCartao}>
                    {agendamento.texto_data}
                  </Text>

                  <Text style={[styles.textoCompromissoCartao, { color: tema.texto }]}>
                    {agendamento.compromisso}
                  </Text>

                  <Text style={[styles.textoPeriodo, { color: tema.texto2, marginTop: 5 }]}>
                    {agendamento.texto_horario}
                  </Text>
                </View>
              ))
            ) : (
              <View style={[styles.areaVaziaCalendario, { borderColor: tema.borda }]}>
                <Text style={[styles.textoVazioCalendario, { color: tema.texto2 }]}>
                  Nenhum agendamento futuro.
                </Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.botaoAgendarNovo}
            onPress={() => navegarComAnimacao('Agendar')}
          >
            <Text style={styles.textoBotaoAgendar}>Marcar Novo Compromisso</Text>
            <Feather name="plus" size={20} color="#FFF" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
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
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 30,
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
    marginBottom: 20
  },

  areaFotoPet: {
    position: 'relative',
    marginBottom: 10
  },

  imagemPet: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#F86F03'
  },

  imagemPetSemFoto: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF3E0'
  },

  iconeEdicaoPet: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4F7FFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 4
  },

  nomePet: {
    fontSize: 26,
    fontWeight: '900'
  },

  areaFelicidade: {
    padding: 20,
    borderRadius: 25,
    marginBottom: 30,
    borderWidth: 1
  },

  topoFelicidade: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },

  tituloFelicidade: {
    fontSize: 18,
    fontWeight: '900'
  },

  statusFelicidade: {
    fontSize: 14,
    fontWeight: 'bold'
  },

  barraFundo: {
    height: 16,
    borderRadius: 10,
    overflow: 'hidden'
  },

  barraPreenchida: {
    height: '100%',
    borderRadius: 10
  },

  tituloSecao: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 15,
    paddingHorizontal: 5
  },

  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 25,
    marginBottom: 15,
    borderWidth: 1
  },

  iconeMetaFundo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },

  areaContador: {
    flex: 1,
    paddingHorizontal: 15
  },

  nomeMeta: {
    fontSize: 16,
    fontWeight: 'bold'
  },

  textoContador: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2
  },

  textoPeriodo: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2
  },

  botoesAcao: {
    flexDirection: 'row',
    gap: 8
  },

  botaoAcaoMenos: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },

  botaoAcaoMais: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.3,
    shadowRadius: 3
  },

  carrosselAgendamentos: {
    flexDirection: 'row',
    marginBottom: 25,
    paddingTop: 10
  },

  cartaoCalendario: {
    width: 130,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    position: 'relative'
  },

  iconeCalendarioFundo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFF',
    elevation: 2
  },

  textoDataCartao: {
    color: '#F86F03',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },

  textoCompromissoCartao: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center'
  },

  areaVaziaCalendario: {
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    width: '100%',
    alignItems: 'center'
  },

  textoVazioCalendario: {
    fontStyle: 'italic',
    fontWeight: '500'
  },

  botaoLixeiraAgendamento: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4C4C',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5
  },

  botaoAgendarNovo: {
    flexDirection: 'row',
    backgroundColor: '#F86F03',
    height: 65,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#F86F03',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },

  textoBotaoAgendar: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold'
  }
});