import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Feather } from '@expo/vector-icons';

// Importação de todas as suas telas
import TelaDeLogin from './TelaDeLogin';
import TelaDeCadastro from './TelaDeCadastro';
import ListaDeCasas from './ListaDeCasas';
import TelaNovaCasa from './TelaNovaCasa';
import TelaExcluirCasa from './TelaExcluirCasa';
import ListaDePets from './ListaDePets';
import TelaNovoPet from './TelaNovoPet';
import TelaPerfilPet from './TelaPerfilPet';
import TelaAgendar from './TelaAgendar';
import TelaMetasCuidados from './TelaMetasCuidados';
import TelaPerfilUsuario from './TelaPerfilUsuario';
import TelaConfigurarCasa from './TelaConfigurarCasa';
import TelaEntrarCasa from './TelaEntrarCasa';
import TelaEmergencia from './TelaEmergencia';

export default function App() {
  const [telaAtual, setTelaAtual] = useState('Principal');
  
  // O usuário padrão falso que será substituído no momento do Login
  const [usuarioAtual, setUsuarioAtual] = useState({ id: 'user123', nome: 'Criador', imagem: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' });

  // 👉 NOSSAS CONFIGURAÇÕES GLOBAIS
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [modoNoturno, setModoNoturno] = useState(false);

  // Array inicial de casas (O banco de dados vai substituir isso assim que a tela de Casas abrir)
  const [casas, setCasas] = useState([
    { id: '1', nome: 'Minha casa', imagem: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=250&auto=format&fit=crop', adminId: 'user123' },
    { id: '2', nome: 'Casa do Vizinho', imagem: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=250&auto=format&fit=crop', adminId: 'user999' }
  ]);
  const [casaAtual, setCasaAtual] = useState(null);

  const [pets, setPets] = useState([
    { id: '1', nome: 'Bolinha', imagem: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=250&auto=format&fit=crop', casaId: '1' }
  ]);

  const [membros, setMembros] = useState([
    { id: 'user123', nome: 'Criador (Você)', imagem: 'https://cdn-icons-png.flaticon.com/512/149/149071.png', casaId: '1' }
  ]);
  const [petAtual, setPetAtual] = useState(null);

  const [metas, setMetas] = useState([
    { petId: '1', comidaMeta: 3, comidaFeita: 0, comidaPeriodo: 'Diário', passeioMeta: 2, passeioFeita: 0, passeioPeriodo: 'Diário', curativoMeta: 0, curativoFeita: 0, curativoPeriodo: 'Mensal', vetMeta: 1, vetFeita: 0, vetPeriodo: 'Semestral' }
  ]);
  const [agendamentos, setAgendamentos] = useState([]);

  // 👉 ROTEAMENTO COM MODO NOTURNO INJETADO EM TODAS AS TELAS
  if (telaAtual === 'Login') return <TelaDeLogin setTelaAtual={setTelaAtual} setUsuarioAtual={setUsuarioAtual} modoNoturno={modoNoturno} />;
  if (telaAtual === 'Cadastro') return <TelaDeCadastro setTelaAtual={setTelaAtual} modoNoturno={modoNoturno} />;
  
  // 🔥 A MÁGICA FOI FEITA AQUI: Adicionamos o setCasas={setCasas} para a tela poder atualizar os dados!
  if (telaAtual === 'Casas') return <ListaDeCasas setTelaAtual={setTelaAtual} casas={casas} setCasas={setCasas} setCasaAtual={setCasaAtual} usuarioAtual={usuarioAtual} membros={membros} modoNoturno={modoNoturno} />;
  
  if (telaAtual === 'NovaCasa') return <TelaNovaCasa setTelaAtual={setTelaAtual} casas={casas} setCasas={setCasas} usuarioAtual={usuarioAtual} modoNoturno={modoNoturno} />;
  if (telaAtual === 'ExcluirCasa') return <TelaExcluirCasa setTelaAtual={setTelaAtual} casas={casas} setCasas={setCasas} pets={pets} setPets={setPets} casaAtual={casaAtual} setCasaAtual={setCasaAtual} usuarioAtual={usuarioAtual} modoNoturno={modoNoturno} />;
  if (telaAtual === 'EntrarCasa') return <TelaEntrarCasa setTelaAtual={setTelaAtual} casas={casas} membros={membros} setMembros={setMembros} usuarioAtual={usuarioAtual} modoNoturno={modoNoturno} />;
  
  if (telaAtual === 'ListaDePets') return <ListaDePets setTelaAtual={setTelaAtual} pets={pets} casaAtual={casaAtual} setPetAtual={setPetAtual} usuarioAtual={usuarioAtual} modoNoturno={modoNoturno} />;
  if (telaAtual === 'NovoPet') return <TelaNovoPet setTelaAtual={setTelaAtual} pets={pets} setPets={setPets} casaAtual={casaAtual} modoNoturno={modoNoturno} />;
  if (telaAtual === 'Agendar') return <TelaAgendar setTelaAtual={setTelaAtual} petAtual={petAtual} agendamentos={agendamentos} setAgendamentos={setAgendamentos} modoNoturno={modoNoturno} />;
  if (telaAtual === 'MetasCuidados') return <TelaMetasCuidados setTelaAtual={setTelaAtual} petAtual={petAtual} setPetAtual={setPetAtual} pets={pets} setPets={setPets} casaAtual={casaAtual} usuarioAtual={usuarioAtual} metas={metas} setMetas={setMetas} agendamentos={agendamentos} modoNoturno={modoNoturno} />;
  if (telaAtual === 'ConfigurarCasa') return <TelaConfigurarCasa setTelaAtual={setTelaAtual} casaAtual={casaAtual} setCasaAtual={setCasaAtual} casas={casas} setCasas={setCasas} usuarioAtual={usuarioAtual} pets={pets} membros={membros} setMembros={setMembros} modoNoturno={modoNoturno} />;
  if (telaAtual === 'Emergencia') return <TelaEmergencia setTelaAtual={setTelaAtual} petAtual={petAtual} modoNoturno={modoNoturno} />;

  // Tela de Perfil
  if (telaAtual === 'PerfilUsuario') {
    return (
      <TelaPerfilUsuario
        setTelaAtual={setTelaAtual}
        usuarioAtual={usuarioAtual}
        setUsuarioAtual={setUsuarioAtual}
        pets={pets}
        notificacoesAtivas={notificacoesAtivas}
        setNotificacoesAtivas={setNotificacoesAtivas}
        modoNoturno={modoNoturno}
        setModoNoturno={setModoNoturno}
      />
    );
  }

  // 👉 A TELA INICIAL (PRINCIPAL) COM CORES DINÂMICAS PARA TRANSIÇÃO SUAVE
  const coresFundo = modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF'];
  const corCartao = modoNoturno ? '#1E1E1E' : '#FFF';
  const corTextoPrincipal = modoNoturno ? '#FFF' : '#333';
  const corTextoSecundario = modoNoturno ? '#AAA' : '#666';
  const corBotaoBorda = modoNoturno ? '#1E1E1E' : '#F86F03';

  return (
    <LinearGradient colors={coresFundo} style={styles.container}>
      <StatusBar style={modoNoturno ? "light" : "auto"} />
      <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
        
        <View style={styles.areaLogo}>
          <FontAwesome5 name="paw" size={80} color="#FFF" style={{ marginBottom: 20 }} />
          <Text style={styles.tituloApp}>MeuPets</Text>
          <Text style={styles.subtituloApp}>Organize a rotina do seu melhor amigo</Text>
        </View>

        <View style={[styles.cardBranco, { backgroundColor: corCartao }]}>
          <Text style={[styles.tituloBoasVindas, { color: corTextoPrincipal }]}>Bem-vindo!</Text>
          <Text style={[styles.textoBoasVindas, { color: corTextoSecundario }]}>
            Acesse sua conta ou crie uma nova para começar a gerenciar seus pets.
          </Text>

          <TouchableOpacity style={styles.botaoLogin} onPress={() => setTelaAtual('Login')}>
            <Text style={styles.textoBotaoLogin}>Fazer Login</Text>
            <Feather name="arrow-right" size={20} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.botaoCadastrar, { borderColor: corBotaoBorda }]} onPress={() => setTelaAtual('Cadastro')}>
            <Text style={[styles.textoBotaoCadastrar, { color: modoNoturno ? '#FFF' : '#F86F03' }]}>Criar Conta</Text>
          </TouchableOpacity>

          <Text style={styles.versao}>v0.0.1</Text>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  areaLogo: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  tituloApp: { fontSize: 48, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 },
  subtituloApp: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 5 },
  cardBranco: { borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30, paddingTop: 40, paddingBottom: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  tituloBoasVindas: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  textoBoasVindas: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  botaoLogin: { flexDirection: 'row', backgroundColor: '#F86F03', width: '100%', height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 15, shadowColor: '#F86F03', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  textoBotaoLogin: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  botaoCadastrar: { width: '100%', height: 60, borderWidth: 2, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  textoBotaoCadastrar: { fontSize: 18, fontWeight: 'bold' },
  versao: { color: '#AAA', fontSize: 12, fontWeight: 'bold', marginTop: 25 }
});