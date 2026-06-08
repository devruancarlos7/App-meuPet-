import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView, Platform, LayoutAnimation, UIManager, LogBox } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TelaMetasCuidados({
  setTelaAtual, petAtual, setPetAtual, pets, setPets, casaAtual, usuarioAtual,
  metas, setMetas, agendamentos, notificacoesAtivas, modoNoturno
}) {
  const isAdmin = casaAtual?.adminId === usuarioAtual?.id;
  const [configurando, setConfigurando] = useState(false);
  const [felicidade, setFelicidade] = useState(50);
  const [ultimaAbertura, setUltimaAbertura] = useState(new Date().toDateString());

  const metaPadrao = {
    petId: petAtual?.id, comidaMeta: 3, comidaFeita: 0, comidaPeriodo: 'Diário',
    passeioMeta: 2, passeioFeita: 0, passeioPeriodo: 'Diário',
    curativoMeta: 0, curativoFeita: 0, curativoPeriodo: 'Mensal',
    vetMeta: 1, vetFeita: 0, vetPeriodo: 'Semestral'
  };

  const metaDoPet = metas.find(m => m.petId === petAtual?.id) || metaPadrao;
  const agendamentosDoPet = agendamentos?.filter(a => a.petId === petAtual?.id) || [];

  const tema = modoNoturno ? {
    fundo: ['#121212', '#2C3E50'], cartao: '#1E1E1E', texto: '#FFF', texto2: '#AAA',
    area: '#2A2A2A', borda: '#444', barra: '#444', item: '#232D3F',
    itemBorda: '#1A2333', calendario: '#331E0B', calendarioBorda: '#663C16',
    calendarioIcone: '#2A2A2A', menosFundo: '#331515', menosBorda: '#551A1A',
    fundosIcones: ['#331E0B', '#0F1E38', '#2A2A2A']
  } : {
    fundo: ['#F86F03', '#4F7FFF'], cartao: '#FFF', texto: '#333', texto2: '#666',
    area: '#F9F9F9', borda: '#EEE', barra: '#EAEAEA', item: '#F4F5F7',
    itemBorda: '#EAEAEA', calendario: '#FFF3E0', calendarioBorda: '#FFD1A3',
    calendarioIcone: '#FFF', menosFundo: '#FFF0F0', menosBorda: '#FFD6D6',
    fundosIcones: ['#FFF3E0', '#E3F2FD', '#F4F5F7']
  };

  useEffect(() => {
    const hoje = new Date().toDateString();

    if (hoje !== ultimaAbertura) {
      const index = metas.findIndex(m => m.petId === petAtual?.id);

      if (index !== -1) {
        const metaAntiga = metas[index];
        const tarefasIgnoradas = metaAntiga.comidaMeta + metaAntiga.passeioMeta - metaAntiga.comidaFeita - metaAntiga.passeioFeita;

        if (tarefasIgnoradas > 0) {
          setFelicidade(prev => Math.max(10, prev - tarefasIgnoradas * 5));

          if (notificacoesAtivas) {
            try {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: `Atenção com o(a) ${petAtual?.nome}! 💔`,
                  body: `Você esqueceu ${tarefasIgnoradas} tarefa(s) ontem e a felicidade dele(a) caiu. Vamos compensar hoje? 🐾`,
                  sound: true
                },
                trigger: null
              });
            } catch (error) {
              console.log("Erro na notificação", error);
            }
          }
        }

        const novasMetas = [...metas];
        novasMetas[index].comidaFeita = 0;
        novasMetas[index].passeioFeita = 0;
        setMetas(novasMetas);
      }

      setUltimaAbertura(hoje);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [ultimaAbertura, metas, petAtual]);

  const animar = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  const navegarComAnimacao = (tela) => { animar(); setTelaAtual(tela); };

  const escolherImagemPet = async () => {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissao.granted) return alert('Precisamos de permissão para acessar suas fotos!');

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1
      });

      if (!resultado.canceled) {
        animar();
        const [primeiraFoto] = resultado.assets;
        const petAtualizado = { ...petAtual, imagem: primeiraFoto.uri };
        setPetAtual(petAtualizado);
        setPets(pets.map(p => p.id === petAtual.id ? petAtualizado : p));
      }
    } catch (error) {
      alert("Erro ao abrir a galeria!");
    }
  };

  const alterarValor = (tipo, acao) => {
    animar();

    const campo = configurando ? `${tipo}Meta` : `${tipo}Feita`;
    const novasMetas = [...metas];
    let index = novasMetas.findIndex(m => m.petId === petAtual?.id);

    if (index === -1) {
      novasMetas.push(metaDoPet);
      index = novasMetas.length - 1;
    }

    const valorAtual = novasMetas[index][campo];
    let novoValor = Math.max(0, valorAtual + acao);

    if (!configurando && novoValor > novasMetas[index][`${tipo}Meta`]) {
      novoValor = novasMetas[index][`${tipo}Meta`];
    }

    novasMetas[index][campo] = novoValor;
    setMetas(novasMetas);

    if (!configurando && valorAtual !== novoValor) {
      if (acao > 0) setFelicidade(prev => Math.min(100, prev + 5));
      if (acao < 0) setFelicidade(prev => Math.max(0, prev - 5));
    }
  };

  const alterarPeriodo = (tipo) => {
    animar();

    const periodos = ['Diário', 'Semanal', 'Mensal', 'Semestral', 'Anual'];
    const novasMetas = [...metas];
    let index = novasMetas.findIndex(m => m.petId === petAtual?.id);

    if (index === -1) {
      novasMetas.push(metaDoPet);
      index = novasMetas.length - 1;
    }

    const campo = `${tipo}Periodo`;
    const proximoIndex = (periodos.indexOf(novasMetas[index][campo]) + 1) % periodos.length;

    novasMetas[index][campo] = periodos[proximoIndex];
    setMetas(novasMetas);
  };

  const corFelicidade = felicidade >= 75 ? '#4CAF50' : felicidade >= 40 ? '#F86F03' : '#FF4C4C';
  const iconeFelicidade = felicidade >= 75 ? 'smile-beam' : felicidade >= 40 ? 'meh' : 'sad-tear';
  const statusFelicidade = felicidade >= 75 ? 'Muito Feliz!' : felicidade >= 40 ? 'Normal' : 'Precisando de atenção!';

  const metasTela = [
    { tipo: 'comida', nome: 'Alimentação', icone: 'hotdog', cor: '#F86F03' },
    { tipo: 'passeio', nome: 'Passeios', icone: 'dog', cor: '#4F7FFF' },
    { tipo: 'vet', nome: 'Ida ao Vet.', icone: 'stethoscope', cor: '#555' }
  ];

  return (
    <LinearGradient colors={tema.fundo} style={styles.container}>
      <StatusBar style={modoNoturno ? "light" : "auto"} />

      <SafeAreaView style={{ flex: 1 }}>
        <FontAwesome5 name="paw" size={120} color="rgba(255,255,255,0.2)" style={[styles.patinha, { top: -10, right: -20, transform: [{ rotate: '20deg' }] }]} />
        <FontAwesome5 name="paw" size={60} color="rgba(79,127,255,0.4)" style={[styles.patinha, { bottom: 50, right: 100, transform: [{ rotate: '-10deg' }] }]} />

        <View style={styles.areaCabecalho}>
          <TouchableOpacity onPress={() => navegarComAnimacao('ListaDePets')} style={styles.botaoVoltar}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.textosCabecalho}>
            <Text style={styles.tituloHeader}>Cuidados</Text>
            <Text style={styles.subTituloHeader}>Rotina do pet</Text>
          </View>

          {isAdmin && (
            <TouchableOpacity
              style={[styles.botaoIconeTop, configurando && { backgroundColor: '#F86F03' }]}
              onPress={() => { animar(); setConfigurando(!configurando); }}
            >
              <Feather name={configurando ? "check" : "settings"} size={22} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={[styles.cardAlegre, { backgroundColor: tema.cartao }]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
          <View style={styles.areaInfoPet}>
            <TouchableOpacity style={styles.areaFotoPet} onPress={escolherImagemPet}>
              <Image source={{ uri: petAtual?.imagem }} style={styles.imagemPet} />
              <View style={styles.iconeEdicaoPet}>
                <Feather name="camera" size={16} color="#FFF" />
              </View>
            </TouchableOpacity>

            <Text style={[styles.nomePet, { color: tema.texto }]}>{petAtual?.nome}</Text>
          </View>

          <View style={[styles.areaFelicidade, { backgroundColor: tema.area, borderColor: tema.borda }]}>
            <View style={styles.topoFelicidade}>
              <Text style={[styles.tituloFelicidade, { color: tema.texto }]}>Nível de Felicidade</Text>

              <View style={styles.linha}>
                <Text style={[styles.statusFelicidade, { color: corFelicidade }]}>{statusFelicidade}</Text>
                <FontAwesome5 name={iconeFelicidade} size={20} color={corFelicidade} style={{ marginLeft: 8 }} />
              </View>
            </View>

            <View style={[styles.barraFundo, { backgroundColor: tema.barra }]}>
              <View style={[styles.barraPreenchida, { width: `${felicidade}%`, backgroundColor: corFelicidade }]} />
            </View>
          </View>

          <Text style={[styles.tituloSecao, { color: tema.texto }]}>
            {configurando ? "Ajustando Metas ⚙️" : "Tarefas Diárias ✅"}
          </Text>

          {metasTela.map((item, index) => (
            <View key={item.tipo} style={[styles.itemMeta, { backgroundColor: tema.item, borderColor: tema.itemBorda }]}>
              <View style={[styles.iconeMetaFundo, { backgroundColor: tema.fundosIcones[index] }]}>
                <FontAwesome5 name={item.icone} size={24} color={item.cor} />
              </View>

              <View style={styles.areaContador}>
                <Text style={[styles.nomeMeta, { color: tema.texto }]}>{item.nome}</Text>
                <Text style={[styles.textoContador, { color: tema.texto2 }]}>
                  {configurando ? `Meta: ${metaDoPet[`${item.tipo}Meta`]}` : `Feito: ${metaDoPet[`${item.tipo}Feita`]} de ${metaDoPet[`${item.tipo}Meta`]}`}
                </Text>
                <Text style={[styles.textoPeriodo, { color: tema.texto2 }]}>
                  {metaDoPet[`${item.tipo}Periodo`]}
                </Text>
              </View>

              <View style={styles.botoesAcao}>
                {configurando && (
                  <TouchableOpacity style={styles.botaoPeriodo} onPress={() => alterarPeriodo(item.tipo)}>
                    <Feather name="refresh-cw" size={16} color="#FFF" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.botaoAcaoMenos, { backgroundColor: tema.menosFundo, borderColor: tema.menosBorda }]}
                  onPress={() => alterarValor(item.tipo, -1)}
                >
                  <Feather name="minus" size={20} color="#FF4C4C" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.botaoAcaoMais} onPress={() => alterarValor(item.tipo, 1)}>
                  <Feather name="plus" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <Text style={[styles.tituloSecao, { color: tema.texto }]}>Próximos Compromissos 📅</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carrosselAgendamentos}>
            {agendamentosDoPet.length > 0 ? agendamentosDoPet.map(agendamento => (
              <View key={agendamento.id} style={[styles.cartaoCalendario, { backgroundColor: tema.calendario, borderColor: tema.calendarioBorda }]}>
                <View style={[styles.iconeCalendarioFundo, { backgroundColor: tema.calendarioIcone }]}>
                  <FontAwesome5 name="calendar-day" size={20} color="#F86F03" />
                </View>

                <Text style={styles.textoDataCartao}>{agendamento.data}</Text>
                <Text style={[styles.textoCompromissoCartao, { color: tema.texto2 }]}>{agendamento.compromisso}</Text>
              </View>
            )) : (
              <View style={[styles.areaVaziaCalendario, { backgroundColor: tema.area, borderColor: tema.borda }]}>
                <Text style={[styles.textoVazioCalendario, { color: tema.texto2 }]}>Nenhum compromisso.</Text>
              </View>
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
  linha: { flexDirection: 'row', alignItems: 'center' },
  patinha: { position: 'absolute', zIndex: 0 },
  areaCabecalho: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingTop: 40, paddingBottom: 60, zIndex: 1 },
  botaoVoltar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textosCabecalho: { flex: 1 },
  tituloHeader: { fontSize: 28, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  subTituloHeader: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' },
  botaoIconeTop: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  cardAlegre: { borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 25, paddingTop: 30, flex: 1, marginTop: 10, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.15, shadowRadius: 15 },
  areaInfoPet: { alignItems: 'center', marginBottom: 20 },
  areaFotoPet: { position: 'relative', marginBottom: 10 },
  imagemPet: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#F86F03' },
  iconeEdicaoPet: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4F7FFF', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF', elevation: 4 },
  nomePet: { fontSize: 26, fontWeight: '900' },
  areaFelicidade: { padding: 20, borderRadius: 25, marginBottom: 30, borderWidth: 1 },
  topoFelicidade: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tituloFelicidade: { fontSize: 18, fontWeight: '900' },
  statusFelicidade: { fontSize: 14, fontWeight: 'bold' },
  barraFundo: { height: 16, borderRadius: 10, overflow: 'hidden' },
  barraPreenchida: { height: '100%', borderRadius: 10 },
  tituloSecao: { fontSize: 22, fontWeight: '900', marginBottom: 15, paddingHorizontal: 5 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 25, marginBottom: 15, borderWidth: 1 },
  iconeMetaFundo: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  areaContador: { flex: 1, paddingHorizontal: 15 },
  nomeMeta: { fontSize: 16, fontWeight: 'bold' },
  textoContador: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  textoPeriodo: { fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  botoesAcao: { flexDirection: 'row', gap: 8 },
  botaoAcaoMenos: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  botaoAcaoMais: { backgroundColor: '#4CAF50', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
  botaoPeriodo: { backgroundColor: '#333', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  carrosselAgendamentos: { flexDirection: 'row', marginBottom: 25 },
  cartaoCalendario: { width: 130, padding: 15, borderRadius: 20, alignItems: 'center', marginRight: 15, borderWidth: 1 },
  iconeCalendarioFundo: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 2 },
  textoDataCartao: { color: '#F86F03', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  textoCompromissoCartao: { fontSize: 13, fontWeight: '600', marginTop: 5, textAlign: 'center' },
  areaVaziaCalendario: { padding: 15, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', width: '100%', alignItems: 'center' },
  textoVazioCalendario: { fontStyle: 'italic', fontWeight: '500' },
  botaoAgendarNovo: { flexDirection: 'row', backgroundColor: '#F86F03', height: 65, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#F86F03', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  textoBotaoAgendar: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});