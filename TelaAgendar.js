import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, SafeAreaView, Platform, LayoutAnimation, UIManager, Alert, LogBox } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

// 👉 IGORA A TELA VERMELHA DE AVISO DO EXPO GO
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

// 👉 MÁGICA DA FLUIDEZ
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Configuração da Notificação
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function TelaAgendar({ setTelaAtual, petAtual, agendamentos, setAgendamentos, notificacoesAtivas }) {
  
  // 👉 ESTADOS DO CALENDÁRIO NATIVO
  const [dataExata, setDataExata] = useState(new Date()); 
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [modoPicker, setModoPicker] = useState('date'); 
  
  const [textoData, setTextoData] = useState('');
  const [textoHorario, setTextoHorario] = useState('');
  const [compromisso, setCompromisso] = useState('');
  const [observacao, setObservacao] = useState('');

  // Pede permissão para enviar notificações assim que a tela abre
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

  // 👉 MESCLANDO DATA E HORA DE FORMA SEGURA
  const aoEscolherDataHora = (event, dataSelecionada) => {
    if (Platform.OS === 'android') {
      setMostrarPicker(false);
    }

    if (event.type === 'set' && dataSelecionada) {
      const novaData = new Date(dataExata); 

      if (modoPicker === 'date') {
        novaData.setFullYear(dataSelecionada.getFullYear());
        novaData.setMonth(dataSelecionada.getMonth());
        novaData.setDate(dataSelecionada.getDate());

        const dia = String(novaData.getDate()).padStart(2, '0');
        const mes = String(novaData.getMonth() + 1).padStart(2, '0');
        const ano = novaData.getFullYear();
        setTextoData(`${dia}/${mes}/${ano}`);
        
      } else if (modoPicker === 'time') {
        novaData.setHours(dataSelecionada.getHours());
        novaData.setMinutes(dataSelecionada.getMinutes());

        const hora = String(novaData.getHours()).padStart(2, '0');
        const minuto = String(novaData.getMinutes()).padStart(2, '0');
        setTextoHorario(`${hora}:${minuto}`);
      }

      setDataExata(novaData); 
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

    // 👉 BLOQUEIO CONTRA ERROS SILENCIOSOS E RESPEITO ÀS CONFIGURAÇÕES
    try {
      if (notificacoesAtivas) {
        const dataDaNotificacao = new Date(dataExata.getTime() - (2 * 60 * 60 * 1000));

        if (dataDaNotificacao > new Date()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `Lembrete: ${petAtual?.nome} 🐾`,
              body: `Faltam 2 horas para: ${compromisso}. Prepare-se!`,
              sound: true,
            },
            trigger: { date: dataDaNotificacao }, 
          });
        } else {
          alert('Atenção: Esse horário é muito próximo ou já passou, o alarme de 2h não tocará.');
        }
      }
    } catch (error) {
      console.log("Aviso de Notificação:", error.message);
    }

    // 👉 SALVANDO NO APLICATIVO
    const novoAgendamento = {
      id: Math.random().toString(36).substring(7),
      petId: petAtual?.id,
      data: textoData,
      compromisso: `${compromisso} às ${textoHorario}`,
      observacao: observacao
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAgendamentos([...agendamentos, novoAgendamento]);
    
    if (Platform.OS !== 'web') {
      Alert.alert(
        "Agendado! ✅", 
        notificacoesAtivas 
          ? `O compromisso "${compromisso}" foi salvo e o alarme tocará 2 horas antes!`
          : `Compromisso salvo! (Aviso: As notificações estão desativadas no seu perfil).`
      );
    }
    setTelaAtual('MetasCuidados');
  };

  return (
    <LinearGradient colors={['#F86F03', '#4F7FFF']} style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView style={{ flex: 1 }}>
        <FontAwesome5 name="paw" size={120} color="rgba(255, 255, 255, 0.2)" style={[styles.patinha, { top: -10, right: -20, transform: [{ rotate: '20deg' }] }]} />
        <FontAwesome5 name="paw" size={60} color="rgba(79, 127, 255, 0.4)" style={[styles.patinha, { bottom: 50, right: 100, transform: [{ rotate: '-10deg' }] }]} />

        <View style={styles.areaCabecalho}>
          <TouchableOpacity onPress={() => navegarComAnimacao('MetasCuidados')} style={styles.botaoVoltar}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.textosCabecalho}>
            <Text style={styles.tituloHeader}>Nova Tarefa</Text>
            <Text style={styles.subTituloHeader}>Agenda do {petAtual?.nome}</Text>
          </View>
        </View>

        <View style={styles.cardAlegre}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            
            <View style={styles.areaIconeCentral}>
              <View style={[styles.circuloIcone, !notificacoesAtivas && { borderColor: '#CCC', backgroundColor: '#F4F5F7' }]}>
                <FontAwesome5 name={notificacoesAtivas ? "bell" : "bell-slash"} size={35} color={notificacoesAtivas ? "#F86F03" : "#888"} />
              </View>
              <Text style={[styles.textoInstrucao, !notificacoesAtivas && { color: '#888' }]}>
                {notificacoesAtivas 
                  ? "Você será notificado automaticamente 2 horas antes do evento!" 
                  : "As notificações estão desativadas no seu perfil."}
              </Text>
            </View>

            <Text style={styles.tituloSecao}>Data e Horário 📅</Text>

            <TouchableOpacity style={styles.areaInputBotao} onPress={abrirCalendario}>
              <Feather name="calendar" size={20} color="#888" style={styles.iconeInput} />
              <Text style={[styles.textoInputBotao, !textoData && { color: '#A0A0A0' }]}>
                {textoData || "Toque para escolher a data"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.areaInputBotao} onPress={abrirRelogio}>
              <Feather name="clock" size={20} color="#888" style={styles.iconeInput} />
              <Text style={[styles.textoInputBotao, !textoHorario && { color: '#A0A0A0' }]}>
                {textoHorario || "Toque para escolher o horário"}
              </Text>
            </TouchableOpacity>

            {/* O CALENDÁRIO/RELÓGIO INVISÍVEL DO CELULAR */}
            {mostrarPicker && (
              <DateTimePicker
                value={dataExata}
                mode={modoPicker}
                is24Hour={true}
                display="default"
                onChange={aoEscolherDataHora}
              />
            )}

            <Text style={styles.tituloSecao}>Detalhes do Evento</Text>

            <View style={styles.areaInput}>
              <Feather name="bookmark" size={20} color="#888" style={styles.iconeInput} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Vacina, Banho, Tosar..."
                placeholderTextColor="#A0A0A0"
                value={compromisso}
                onChangeText={setCompromisso}
              />
            </View>

            <View style={[styles.areaInput, { height: 100, alignItems: 'flex-start', paddingTop: 15 }]}>
              <Feather name="align-left" size={20} color="#888" style={styles.iconeInput} />
              <TextInput
                style={[styles.input, { textAlignVertical: 'top' }]}
                placeholder="Observações adicionais..."
                placeholderTextColor="#A0A0A0"
                multiline={true}
                value={observacao}
                onChangeText={setObservacao}
              />
            </View>

            <TouchableOpacity 
              style={[styles.botaoAcao, !notificacoesAtivas && { backgroundColor: '#4F7FFF', shadowColor: '#4F7FFF' }]} 
              onPress={handleAgendar}
            >
              <Text style={styles.textoBotaoAcao}>{notificacoesAtivas ? "Agendar & Notificar" : "Apenas Agendar"}</Text>
              <Feather name="check" size={22} color="#FFF" style={{ position: 'absolute', right: 20 }} />
            </TouchableOpacity>

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

  areaIconeCentral: { alignItems: 'center', marginBottom: 30 },
  circuloIcone: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F86F03', marginBottom: 10 },
  textoInstrucao: { fontSize: 14, color: '#F86F03', textAlign: 'center', fontWeight: 'bold', paddingHorizontal: 10 },

  tituloSecao: { fontSize: 20, fontWeight: '900', color: '#333', marginBottom: 15, marginLeft: 5 },

  areaInputBotao: {
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
  textoInputBotao: { flex: 1, fontSize: 16, color: '#333', fontWeight: 'bold' },

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