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

export default function App() { 
  const [telaAtual, setTelaAtual] = useState('Principal');

  const [usuarioAtual, setUsuarioAtual] = useState({ 
    id: 'user123', 
    nome: 'Criador', 
    imagem: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' 
  });

  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);

  const [casas, setCasas] = useState([
    { id: '1', nome: 'Minha casa', imagem: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=250&auto=format&fit=crop', adminId: 'user123' },
    { id: '2', nome: 'Casa do Vizinho', imagem: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=250&auto=format&fit=crop', adminId: 'user999' },
    { id: '777', nome: 'Casa da Praia (Secreta)', imagem: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=250&auto=format&fit=crop', adminId: 'admin_secreto' }
  ]);
  
  const [casaAtual, setCasaAtual] = useState(null);

  const [pets, setPets] = useState([
    { id: '1', nome: 'Bolinha', imagem: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=250&auto=format&fit=crop', casaId: '1' }
  ]);

  const [membros, setMembros] = useState([
    { id: 'user123', nome: 'Criador (Você)', imagem: 'https://cdn-icons-png.flaticon.com/512/149/149071.png', casaId: '1' },
    { id: 'user999', nome: 'Tio João', imagem: 'https://cdn-icons-png.flaticon.com/512/149/149071.png', casaId: '1' },
    { id: 'user123', nome: 'Criador (Você)', imagem: 'https://cdn-icons-png.flaticon.com/512/149/149071.png', casaId: '2' }
  ]);
  
  const [petAtual, setPetAtual] = useState(null);

  const [metas, setMetas] = useState([
    { 
      petId: '1', comidaMeta: 3, comidaFeita: 0, comidaPeriodo: 'Diário', 
      passeioMeta: 2, passeioFeita: 0, passeioPeriodo: 'Diário', 
      curativoMeta: 0, curativoFeita: 0, curativoPeriodo: 'Mensal',
      vetMeta: 1, vetFeita: 0, vetPeriodo: 'Semestral'
    }
  ]);

  const [agendamentos, setAgendamentos] = useState([]);

  // Roteamento das telas
  if (telaAtual === 'Login') return <TelaDeLogin setTelaAtual={setTelaAtual} />;
  if (telaAtual === 'Cadastro') return <TelaDeCadastro setTelaAtual={setTelaAtual} />; 
  if (telaAtual === 'Casas') return <ListaDeCasas setTelaAtual={setTelaAtual} casas={casas} setCasaAtual={setCasaAtual} usuarioAtual={usuarioAtual} membros={membros} />;
  if (telaAtual === 'NovaCasa') return <TelaNovaCasa setTelaAtual={setTelaAtual} casas={casas} setCasas={setCasas} usuarioAtual={usuarioAtual} />; 
  if (telaAtual === 'ExcluirCasa') return <TelaExcluirCasa setTelaAtual={setTelaAtual} casas={casas} setCasas={setCasas} pets={pets} setPets={setPets} casaAtual={casaAtual} setCasaAtual={setCasaAtual} usuarioAtual={usuarioAtual} />; 
  if (telaAtual === 'EntrarCasa') return <TelaEntrarCasa setTelaAtual={setTelaAtual} casas={casas} membros={membros} setMembros={setMembros} usuarioAtual={usuarioAtual} />;
  if (telaAtual === 'ListaDePets') return <ListaDePets setTelaAtual={setTelaAtual} pets={pets} casaAtual={casaAtual} setPetAtual={setPetAtual} usuarioAtual={usuarioAtual} />; 
  if (telaAtual === 'NovoPet') return <TelaNovoPet setTelaAtual={setTelaAtual} pets={pets} setPets={setPets} casaAtual={casaAtual} />; 
  if (telaAtual === 'Agendar') return <TelaAgendar setTelaAtual={setTelaAtual} petAtual={petAtual} agendamentos={agendamentos} setAgendamentos={setAgendamentos} />; 
  if (telaAtual === 'MetasCuidados') return <TelaMetasCuidados setTelaAtual={setTelaAtual} petAtual={petAtual} setPetAtual={setPetAtual} pets={pets} setPets={setPets} casaAtual={casaAtual} usuarioAtual={usuarioAtual} metas={metas} setMetas={setMetas} agendamentos={agendamentos} />; 
  if (telaAtual === 'PerfilUsuario') return <TelaPerfilUsuario setTelaAtual={setTelaAtual} usuarioAtual={usuarioAtual} setUsuarioAtual={setUsuarioAtual} pets={pets} notificacoesAtivas={notificacoesAtivas} setNotificacoesAtivas={setNotificacoesAtivas} />; 
  if (telaAtual === 'ConfigurarCasa') return <TelaConfigurarCasa setTelaAtual={setTelaAtual} casaAtual={casaAtual} setCasaAtual={setCasaAtual} casas={casas} setCasas={setCasas} usuarioAtual={usuarioAtual} pets={pets} membros={membros} setMembros={setMembros} />;

  // 👉 A TELA INICIAL (PRINCIPAL) COM VISUAL CLEAN
  return ( 
    <LinearGradient colors={['#F86F03', '#4F7FFF']} style={styles.container}> 
      <StatusBar style="light" /> 

      <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
        
        {/* Parte Superior: Branding do App */}
        <View style={styles.areaLogo}>
          <FontAwesome5 name="paw" size={70} color="#FFF" style={{ marginBottom: 15 }} />
          <Text style={styles.tituloApp}>MeuPets</Text>
          <Text style={styles.subtituloApp}>O melhor amigo da rotina do seu pet.</Text>
        </View>

        {/* Parte Inferior: Cartão Branco com as Ações */}
        <View style={styles.cardBranco}>
          <Text style={styles.tituloBoasVindas}>Bem-vindo!</Text>
          <Text style={styles.textoBoasVindas}>Como você deseja acessar o aplicativo hoje?</Text>

          <TouchableOpacity style={styles.botaoLogin} onPress={() => setTelaAtual('Login')}> 
            <Text style={styles.textoBotaoLogin}>Fazer Login</Text> 
            <Feather name="arrow-right" size={20} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoCadastrar} onPress={() => setTelaAtual('Cadastro')}> 
            <Text style={styles.textoBotaoCadastrar}>Criar nova conta</Text> 
          </TouchableOpacity>

          <Text style={styles.versao}>v00.1</Text> 
        </View>

      </SafeAreaView>
    </LinearGradient>
  ); 
}

const styles = StyleSheet.create({ 
  container: { flex: 1 }, 
  
  // Estilos da Logo no topo
  areaLogo: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  tituloApp: { fontSize: 48, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 },
  subtituloApp: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 5 },

  // Estilos do Cartão Branco Inferior
  cardBranco: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10
  },
  
  tituloBoasVindas: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  textoBoasVindas: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },

  // Botão Preenchido (Ação Principal)
  botaoLogin: { 
    flexDirection: 'row',
    backgroundColor: '#F86F03', 
    width: '100%',
    height: 60,
    borderRadius: 16, 
    justifyContent: 'center',
    alignItems: 'center', 
    marginBottom: 15,
    shadowColor: '#F86F03',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  }, 
  textoBotaoLogin: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginRight: 10 }, 
  
  // Botão com Borda (Ação Secundária)
  botaoCadastrar: { 
    width: '100%',
    height: 60,
    backgroundColor: '#FFF', 
    borderWidth: 2, 
    borderColor: '#F86F03', 
    borderRadius: 16, 
    justifyContent: 'center',
    alignItems: 'center' 
  }, 
  textoBotaoCadastrar: { color: '#F86F03', fontSize: 18, fontWeight: 'bold' },

  versao: { color: '#AAA', fontSize: 12, fontWeight: 'bold', marginTop: 25 }
});