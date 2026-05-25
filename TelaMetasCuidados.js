import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView, Platform, LayoutAnimation, UIManager, LogBox } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
// 👉 IMPORTAMOS O SISTEMA DE NOTIFICAÇÕES AQUI TAMBÉM
import * as Notifications from 'expo-notifications'; 

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 👉 ADICIONAMOS A VARIÁVEL 'notificacoesAtivas' AQUI EM CIMA
export default function TelaMetasCuidados({ setTelaAtual, petAtual, setPetAtual, pets, setPets, casaAtual, usuarioAtual, metas, setMetas, agendamentos, notificacoesAtivas }) {
  
  const isAdmin = casaAtual?.adminId === usuarioAtual?.id;
  const [configurando, setConfigurando] = useState(false);
  const [felicidade, setFelicidade] = useState(50);
  const [ultimaAbertura, setUltimaAbertura] = useState(new Date().toDateString());

  const metaDoPet = metas.find(m => m.petId === petAtual?.id) || {
    petId: petAtual?.id, comidaMeta: 3, comidaFeita: 0, comidaPeriodo: 'Diário', 
    passeioMeta: 2, passeioFeita: 0, passeioPeriodo: 'Diário', 
    curativoMeta: 0, curativoFeita: 0, curativoPeriodo: 'Mensal',
    vetMeta: 1, vetFeita: 0, vetPeriodo: 'Semestral'
  };

  useEffect(() => {
    const dataDeHoje = new Date().toDateString();

    if (dataDeHoje !== ultimaAbertura) {
      let index = metas.findIndex(m => m.petId === petAtual?.id);
      
      if (index !== -1) {
        let metaAntiga = metas[index];
        let totalMetasDiarias = metaAntiga.comidaMeta + metaAntiga.passeioMeta;
        let totalFeitoOntem = metaAntiga.comidaFeita + metaAntiga.passeioFeita;
        let tarefasIgnoradas = totalMetasDiarias - totalFeitoOntem;

        // SE O USUÁRIO DEIXOU O PET SEM CUIDADOS...
        if (tarefasIgnoradas > 0) {
           setFelicidade(prev => Math.max(10, prev - (tarefasIgnoradas * 5))); 
           
           // 👉 AQUI ENTRA A NOTIFICAÇÃO DE "PUXÃO DE ORELHA" SE ESTIVER ATIVADA
           if (notificacoesAtivas) {
             try {
               Notifications.scheduleNotificationAsync({
                 content: {
                   title: `Atenção com o(a) ${petAtual?.nome}! 💔`,
                   body: `Você esqueceu ${tarefasIgnoradas} tarefa(s) ontem e a felicidade dele(a) caiu. Vamos compensar hoje? 🐾`,
                   sound: true,
                 },
                 trigger: null, // trigger null = dispara na mesma hora!
               });
             } catch (error) {
               console.log("Erro na notificação", error);
             }
           }
        }

        let novasMetas = [...metas];
        novasMetas[index].comidaFeita = 0;
        novasMetas[index].passeioFeita = 0;
        setMetas(novasMetas);
      }
      
      setUltimaAbertura(dataDeHoje);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [ultimaAbertura, metas, petAtual]); 

  const navegarComAnimacao = (tela) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setTelaAtual(tela); };

  const escolherImagemPet = async () => {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissao.granted) return alert('Precisamos de permissão para acessar suas fotos!');
      let resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: new Array(1, 1), quality: 1 });
      if (!resultado.canceled) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const [primeiraFoto] = resultado.assets;
        const petAtualizado = { ...petAtual, imagem: primeiraFoto.uri };
        setPetAtual(petAtualizado);
        setPets(pets.map(p => p.id === petAtual.id ? petAtualizado : p));
      }
    } catch (error) { alert("Erro ao abrir a galeria!"); }
  };

  const agendamentosDoPet = agendamentos?.filter(a => a.petId === petAtual?.id) || [];

  const alterarValor = (tipo, acao) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const campo = configurando ? `${tipo}Meta` : `${tipo}Feita`;
    let novasMetas = [...metas];
    let index = novasMetas.findIndex(m => m.petId === petAtual?.id);
    if (index === -1) { novasMetas.push(metaDoPet); index = novasMetas.length - 1; }

    const valorAtual = novasMetas[index][campo];
    let novoValor = Math.max(0, valorAtual + acao);
    if (!configurando && novoValor > novasMetas[index][`${tipo}Meta`]) novoValor = novasMetas[index][`${tipo}Meta`];

    const valorMudou = valorAtual !== novoValor;
    novasMetas[index][campo] = novoValor;
    setMetas(novasMetas); 

    if (!configurando && valorMudou) {
      if (acao > 0) setFelicidade(prev => Math.min(100, prev + 5)); 
      else if (acao < 0) setFelicidade(prev => Math.max(0, prev - 5)); 
    }
  };

  const alterarPeriodo = (tipo) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const periodos = ['Diário', 'Semanal', 'Mensal', 'Semestral', 'Anual'];
    let novasMetas = [...metas];
    let index = novasMetas.findIndex(m => m.petId === petAtual?.id);
    if (index === -1) { novasMetas.push(metaDoPet); index = novasMetas.length - 1; }
    let proximoIndex = (periodos.indexOf(novasMetas[index][`${tipo}Periodo`]) + 1) % periodos.length;
    novasMetas[index][`${tipo}Periodo`] = periodos[proximoIndex];
    setMetas(novasMetas);
  };

  const corFelicidade = felicidade >= 75 ? '#4CAF50' : felicidade >= 40 ? '#F86F03' : '#FF4C4C';
  const iconeFelicidade = felicidade >= 75 ? 'smile-beam' : felicidade >= 40 ? 'meh' : 'sad-tear';
  const statusFelicidade = felicidade >= 75 ? 'Muito Feliz!' : felicidade >= 40 ? 'Normal' : 'Precisando de atenção!';

  return (
    <LinearGradient colors={['#F86F03', '#4F7FFF']} style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        <FontAwesome5 name="paw" size={120} color="rgba(255, 255, 255, 0.2)" style={[styles.patinha, { top: -10, right: -20, transform: [{ rotate: '20deg' }] }]} />
        <FontAwesome5 name="paw" size={60} color="rgba(79, 127, 255, 0.4)" style={[styles.patinha, { bottom: 50, right: 100, transform: [{ rotate: '-10deg' }] }]} />

        <View style={styles.areaCabecalho}>
          <TouchableOpacity onPress={() => navegarComAnimacao('ListaDePets')} style={styles.botaoVoltar}><Ionicons name="arrow-back" size={28} color="#FFF" /></TouchableOpacity>
          <View style={styles.textosCabecalho}><Text style={styles.tituloHeader}>Cuidados</Text><Text style={styles.subTituloHeader}>Rotina do pet</Text></View>
          {isAdmin && (
            <TouchableOpacity style={[styles.botaoIconeTop, configurando && { backgroundColor: '#F86F03' }]} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setConfigurando(!configurando); }}>
              <Feather name={configurando ? "check" : "settings"} size={22} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.cardAlegre} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
          <View style={styles.areaInfoPet}>
            <TouchableOpacity style={styles.areaFotoPet} onPress={escolherImagemPet}>
              <Image source={{ uri: petAtual?.imagem }} style={styles.imagemPet} />
              <View style={styles.iconeEdicaoPet}><Feather name="camera" size={16} color="#FFF" /></View>
            </TouchableOpacity>
            <Text style={styles.nomePet}>{petAtual?.nome}</Text>
          </View>

          <View style={styles.areaFelicidade}>
            <View style={styles.topoFelicidade}>
              <Text style={styles.tituloFelicidade}>Nível de Felicidade</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.statusFelicidade, { color: corFelicidade }]}>{statusFelicidade}</Text>
                <FontAwesome5 name={iconeFelicidade} size={20} color={corFelicidade} style={{ marginLeft: 8 }} />
              </View>
            </View>
            <View style={styles.barraFundo}><View style={[styles.barraPreenchida, { width: `${felicidade}%`, backgroundColor: corFelicidade }]} /></View>
          </View>

          <Text style={styles.tituloSecao}>{configurando ? "Ajustando Metas ⚙️" : "Tarefas Diárias ✅"}</Text>

          {['comida', 'passeio', 'vet'].map((tipo, idx) => {
             const icones = ['hotdog', 'dog', 'stethoscope'];
             const cores = ['#FFF3E0', '#E3F2FD', '#F4F5F7'];
             const coresIcone = ['#F86F03', '#4F7FFF', '#555'];
             const nomes = ['Alimentação', 'Passeios', 'Ida ao Vet.'];
             return (
              <View key={tipo} style={styles.itemMeta}>
                <View style={[styles.iconeMetaFundo, { backgroundColor: cores[idx] }]}><FontAwesome5 name={icones[idx]} size={24} color={coresIcone[idx]} /></View>
                <View style={styles.areaContador}>
                  <Text style={styles.nomeMeta}>{nomes[idx]}</Text>
                  <Text style={styles.textoContador}>{configurando ? `Meta: ${metaDoPet[`${tipo}Meta`]}` : `Feito: ${metaDoPet[`${tipo}Feita`]} de ${metaDoPet[`${tipo}Meta`]}`}</Text>
                  <Text style={styles.textoPeriodo}>{metaDoPet[`${tipo}Periodo`]}</Text>
                </View>
                <View style={styles.botoesAcao}>
                  {configurando && <TouchableOpacity style={styles.botaoPeriodo} onPress={() => alterarPeriodo(tipo)}><Feather name="refresh-cw" size={16} color="#FFF" /></TouchableOpacity>}
                  <TouchableOpacity style={styles.botaoAcaoMenos} onPress={() => alterarValor(tipo, -1)}><Feather name="minus" size={20} color="#FF4C4C" /></TouchableOpacity>
                  <TouchableOpacity style={styles.botaoAcaoMais} onPress={() => alterarValor(tipo, 1)}><Feather name="plus" size={20} color="#FFF" /></TouchableOpacity>
                </View>
              </View>
             );
          })}

          <Text style={styles.tituloSecao}>Próximos Compromissos 📅</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carrosselAgendamentos}>
            {agendamentosDoPet.length > 0 ? (
              agendamentosDoPet.map((agendamento) => (
                <View key={agendamento.id} style={styles.cartaoCalendario}>
                  <View style={styles.iconeCalendarioFundo}><FontAwesome5 name="calendar-day" size={20} color="#F86F03" /></View>
                  <Text style={styles.textoDataCartao}>{agendamento.data}</Text>
                  <Text style={styles.textoCompromissoCartao}>{agendamento.compromisso}</Text>
                </View>
              ))
            ) : (
              <View style={styles.areaVaziaCalendario}><Text style={styles.textoVazioCalendario}>Nenhum compromisso.</Text></View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.botaoAgendarNovo} onPress={() => navegarComAnimacao('Agendar')}>
            <Text style={styles.textoBotaoAgendar}>Adicionar Compromisso</Text>
            <Feather name="calendar" size={20} color="#FFF" style={{ position: 'absolute', right: 20 }} />
          </TouchableOpacity>
        </ScrollView>
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
  botaoIconeTop: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  cardAlegre: { backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 25, paddingTop: 30, flex: 1, marginTop: 10, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.15, shadowRadius: 15 },
  areaInfoPet: { alignItems: 'center', marginBottom: 20 },
  areaFotoPet: { position: 'relative', marginBottom: 10 },
  imagemPet: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#F86F03' },
  iconeEdicaoPet: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4F7FFF', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF', elevation: 4 },
  nomePet: { fontSize: 26, fontWeight: '900', color: '#333' },
  areaFelicidade: { backgroundColor: '#F9F9F9', padding: 20, borderRadius: 25, marginBottom: 30, borderWidth: 1, borderColor: '#EEE' },
  topoFelicidade: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tituloFelicidade: { fontSize: 18, fontWeight: '900', color: '#333' },
  statusFelicidade: { fontSize: 14, fontWeight: 'bold' },
  barraFundo: { height: 16, backgroundColor: '#EAEAEA', borderRadius: 10, overflow: 'hidden' },
  barraPreenchida: { height: '100%', borderRadius: 10 },
  tituloSecao: { fontSize: 22, fontWeight: '900', color: '#333', marginBottom: 15, paddingHorizontal: 5 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F5F7', padding: 15, borderRadius: 25, marginBottom: 15, borderWidth: 1, borderColor: '#EAEAEA' },
  iconeMetaFundo: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  areaContador: { flex: 1, paddingHorizontal: 15 },
  nomeMeta: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  textoContador: { fontSize: 14, fontWeight: '600', color: '#666', marginTop: 2 },
  textoPeriodo: { fontSize: 12, color: '#AAA', fontStyle: 'italic', marginTop: 2 }, 
  botoesAcao: { flexDirection: 'row', gap: 8 },
  botaoAcaoMenos: { backgroundColor: '#FFF0F0', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFD6D6' },
  botaoAcaoMais: { backgroundColor: '#4CAF50', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
  botaoPeriodo: { backgroundColor: '#333', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  carrosselAgendamentos: { flexDirection: 'row', marginBottom: 25 },
  cartaoCalendario: { backgroundColor: '#FFF3E0', width: 130, padding: 15, borderRadius: 20, alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#FFD1A3' },
  iconeCalendarioFundo: { backgroundColor: '#FFF', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 2 },
  textoDataCartao: { color: '#F86F03', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  textoCompromissoCartao: { color: '#666', fontSize: 13, fontWeight: '600', marginTop: 5, textAlign: 'center' },
  areaVaziaCalendario: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#EEE', borderStyle: 'dashed', width: '100%', alignItems: 'center' },
  textoVazioCalendario: { color: '#888', fontStyle: 'italic', fontWeight: '500' },
  botaoAgendarNovo: { flexDirection: 'row', backgroundColor: '#F86F03', height: 65, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#F86F03', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  textoBotaoAgendar: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});