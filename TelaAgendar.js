import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
  LayoutAnimation,
  UIManager,
  Alert,
  LogBox
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000'
  : 'http://192.168.1.244:3000';

export default function TelaAgendar({
  setTelaAtual,
  petAtual,
  agendamentos,
  setAgendamentos,
  notificacoesAtivas,
  modoNoturno
}) {
  const [dataExata, setDataExata] = useState(new Date());
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [modoPicker, setModoPicker] = useState('date');

  const [textoData, setTextoData] = useState('');
  const [textoHorario, setTextoHorario] = useState('');
  const [compromisso, setCompromisso] = useState('');
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== 'granted') {
        console.log('Permissão de notificação negada.');
      }
    })();
  }, []);

  const navegarComAnimacao = (tela) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual(tela);
  };

  const buscarAgendamentosDoPet = async () => {
    if (!petAtual?.id) return;

    try {
      const resposta = await fetch(`${API_URL}/pets/${petAtual.id}/agendamentos`);

      if (!resposta.ok) {
        console.log('Erro ao buscar agendamentos:', resposta.status);
        return;
      }

      const dados = await resposta.json();
      setAgendamentos(dados);
    } catch (erro) {
      console.error('Erro ao buscar agendamentos:', erro);
    }
  };

  useEffect(() => {
    buscarAgendamentosDoPet();
  }, [petAtual?.id]);

  const montarDataAgendamento = (agendamento) => {
    const dataTexto = agendamento.texto_data || agendamento.data;
    const horaTexto = agendamento.texto_horario || agendamento.horario || '00:00';

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

  const aoEscolherDataHora = (event, dataSelecionada) => {
    if (Platform.OS === 'android') {
      setMostrarPicker(false);
    }

    if (dataSelecionada) {
      if (modoPicker === 'date') {
        const novaData = new Date(dataExata);
        novaData.setFullYear(dataSelecionada.getFullYear());
        novaData.setMonth(dataSelecionada.getMonth());
        novaData.setDate(dataSelecionada.getDate());

        setDataExata(novaData);

        const dia = String(novaData.getDate()).padStart(2, '0');
        const mes = String(novaData.getMonth() + 1).padStart(2, '0');
        const ano = novaData.getFullYear();

        setTextoData(`${dia}/${mes}/${ano}`);
      } else {
        const novaData = new Date(dataExata);
        novaData.setHours(dataSelecionada.getHours());
        novaData.setMinutes(dataSelecionada.getMinutes());

        setDataExata(novaData);

        const horas = String(novaData.getHours()).padStart(2, '0');
        const min = String(novaData.getMinutes()).padStart(2, '0');

        setTextoHorario(`${horas}:${min}`);
      }
    }
  };

  const abrirCalendario = () => {
    setModoPicker('date');
    setMostrarPicker(true);
  };

  const abrirRelogio = () => {
    setModoPicker('time');
    setMostrarPicker(true);
  };

  const handleAgendar = async () => {
    if (textoData === '' || textoHorario === '' || compromisso.trim() === '') {
      alert('Por favor, preencha a data, o horário e o compromisso!');
      return;
    }

    try {
      const novoAgendamento = {
        pet_id: petAtual.id,
        texto_data: textoData,
        texto_horario: textoHorario,
        compromisso: compromisso.trim(),
        observacao: observacao.trim()
      };

      const resposta = await fetch(`${API_URL}/agendamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoAgendamento)
      });

      if (resposta.ok) {
        alert('Agendamento salvo com sucesso!');

        setTextoData('');
        setTextoHorario('');
        setCompromisso('');
        setObservacao('');
        setDataExata(new Date());

        await buscarAgendamentosDoPet();

        navegarComAnimacao('MetasCuidados');
      } else {
        alert('Erro ao salvar o agendamento no banco.');
      }
    } catch (erro) {
      console.error(erro);
      alert('Não foi possível conectar ao servidor.');
    }
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

              if (resposta.ok) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

                setAgendamentos(agendamentosGlobais =>
                  agendamentosGlobais.filter(a => String(a.id) !== String(id))
                );

                alert('Agendamento removido com sucesso!');
              } else {
                alert('Erro ao excluir agendamento no servidor.');
              }
            } catch (error) {
              console.error('Erro ao excluir:', error);
              alert('Não foi possível conectar ao servidor.');
            }
          }
        }
      ]
    );
  };

  const agendamentosDoPet =
    agendamentos
      ?.filter(a => String(a.petId ?? a.pet_id) === String(petAtual?.id))
      ?.filter(agendamentoAindaAtivo)
      ?.sort((a, b) => {
        const dataA = montarDataAgendamento(a);
        const dataB = montarDataAgendamento(b);

        if (!dataA || !dataB) return 0;

        return dataA.getTime() - dataB.getTime();
      }) || [];

  const tema = modoNoturno
    ? {
        fundo: ['#121212', '#2C3E50'],
        cartao: '#1E1E1E',
        texto: '#FFF',
        texto2: '#AAA',
        inputFundo: '#2A2A2A',
        inputBorda: '#444',
        iconeFundo: '#1A2333',
        iconeBorda: '#1E3C70',
        item: '#232D3F',
        itemBorda: '#1A2333'
      }
    : {
        fundo: ['#F86F03', '#4F7FFF'],
        cartao: '#FFF',
        texto: '#333',
        texto2: '#666',
        inputFundo: '#F4F5F7',
        inputBorda: '#EAEAEA',
        iconeFundo: '#FFF3E0',
        iconeBorda: '#F86F03',
        item: '#F4F5F7',
        itemBorda: '#EAEAEA'
      };

  return (
    <LinearGradient colors={tema.fundo} style={styles.container}>
      <StatusBar style={modoNoturno ? 'light' : 'auto'} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.areaCabecalho}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => navegarComAnimacao('MetasCuidados')}
          >
            <Feather name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.textosCabecalho}>
            <Text style={styles.tituloHeader}>Calendário</Text>
            <Text style={styles.subTituloHeader}>Novo compromisso</Text>
          </View>
        </View>

        <View style={[styles.cardAlegre, { backgroundColor: tema.cartao }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={styles.areaIconeCentral}>
              <View
                style={[
                  styles.circuloIcone,
                  {
                    backgroundColor: tema.iconeFundo,
                    borderColor: tema.iconeBorda
                  }
                ]}
              >
                <FontAwesome5 name="calendar-plus" size={35} color="#F86F03" />
              </View>

              <Text style={[styles.textoInstrucao, { color: tema.texto }]}>
                Marque a próxima vacina, banho ou consulta do {petAtual?.nome}!
              </Text>
            </View>

            <View
              style={[
                styles.areaInput,
                {
                  backgroundColor: tema.inputFundo,
                  borderColor: tema.inputBorda
                }
              ]}
            >
              <Feather name="bookmark" size={20} color="#4F7FFF" style={styles.iconeInput} />

              <TextInput
                style={[styles.input, { color: tema.texto }]}
                placeholder="Compromisso (ex: Banho)"
                placeholderTextColor={tema.texto2}
                value={compromisso}
                onChangeText={setCompromisso}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.areaInputBotao,
                {
                  backgroundColor: tema.inputFundo,
                  borderColor: tema.inputBorda
                }
              ]}
              onPress={abrirCalendario}
            >
              <Feather name="calendar" size={20} color="#4F7FFF" style={styles.iconeInput} />

              <Text
                style={[
                  styles.textoInputBotao,
                  {
                    color: textoData ? tema.texto : tema.texto2
                  }
                ]}
              >
                {textoData || 'Escolher Data'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.areaInputBotao,
                {
                  backgroundColor: tema.inputFundo,
                  borderColor: tema.inputBorda
                }
              ]}
              onPress={abrirRelogio}
            >
              <Feather name="clock" size={20} color="#4F7FFF" style={styles.iconeInput} />

              <Text
                style={[
                  styles.textoInputBotao,
                  {
                    color: textoHorario ? tema.texto : tema.texto2
                  }
                ]}
              >
                {textoHorario || 'Escolher Horário'}
              </Text>
            </TouchableOpacity>

            <View
              style={[
                styles.areaInput,
                {
                  backgroundColor: tema.inputFundo,
                  borderColor: tema.inputBorda
                }
              ]}
            >
              <Feather name="file-text" size={20} color="#4F7FFF" style={styles.iconeInput} />

              <TextInput
                style={[styles.input, { color: tema.texto }]}
                placeholder="Observações (opcional)"
                placeholderTextColor={tema.texto2}
                value={observacao}
                onChangeText={setObservacao}
              />
            </View>

            <TouchableOpacity style={styles.botaoAcao} onPress={handleAgendar}>
              <Text style={styles.textoBotaoAcao}>Salvar Agendamento</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 35 }}>
              <Text style={[styles.tituloSecao, { color: tema.texto }]}>
                Agendamentos Ativos
              </Text>

              {agendamentosDoPet.length > 0 ? (
                agendamentosDoPet.map((agendamento, index) => (
                  <View
                    key={agendamento.id || index}
                    style={[
                      styles.itemLista,
                      {
                        backgroundColor: tema.item,
                        borderColor: tema.itemBorda
                      }
                    ]}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemCompromisso, { color: tema.texto }]}>
                        {agendamento.compromisso}
                      </Text>

                      <Text style={[styles.itemDataHora, { color: tema.texto2 }]}>
                        🗓 {agendamento.texto_data} às {agendamento.texto_horario}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.botaoLixeira}
                      onPress={() => excluirAgendamento(agendamento.id)}
                    >
                      <Feather name="trash-2" size={18} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View
                  style={[
                    styles.areaVazia,
                    {
                      backgroundColor: tema.item,
                      borderColor: tema.itemBorda
                    }
                  ]}
                >
                  <Text style={[styles.textoVazio, { color: tema.texto2 }]}>
                    Nenhum agendamento ativo.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>

      {mostrarPicker && (
        <DateTimePicker
          value={dataExata}
          mode={modoPicker}
          is24Hour={true}
          display="default"
          onChange={aoEscolherDataHora}
        />
      )}
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
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5
    },
    shadowOpacity: 0.15,
    shadowRadius: 15
  },

  areaIconeCentral: {
    alignItems: 'center',
    marginBottom: 30
  },

  circuloIcone: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 10
  },

  textoInstrucao: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingHorizontal: 10
  },

  tituloSecao: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 15,
    marginLeft: 5
  },

  areaInputBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    height: 65,
    borderWidth: 1
  },

  textoInputBotao: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold'
  },

  areaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    height: 65,
    borderWidth: 1
  },

  iconeInput: {
    marginRight: 15
  },

  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold'
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
  },

  itemLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1
  },

  itemInfo: {
    flex: 1
  },

  itemCompromisso: {
    fontSize: 16,
    fontWeight: 'bold'
  },

  itemDataHora: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600'
  },

  botaoLixeira: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF4C4C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#FF4C4C',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.4,
    shadowRadius: 3
  },

  areaVazia: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center'
  },

  textoVazio: {
    fontWeight: '600',
    fontStyle: 'italic'
  }
});