import React, { useState } from 'react'; 
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native'; 
import { LinearGradient } from 'expo-linear-gradient'; 
import { StatusBar } from 'expo-status-bar'; 
import { Feather, Ionicons } from '@expo/vector-icons';

// 👉 RECEBENDO A VARIÁVEL 
export default function TelaDeCadastro({ setTelaAtual, modoNoturno }) { 
  const [nome, setNome] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [senha, setSenha] = useState(''); 
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleCadastro = async () => {
    if (nome.trim() === '' || email.trim() === '' || senha.trim() === '' || confirmarSenha.trim() === '') {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    try {
      const resposta = await fetch('http://192.168.1.180:3000/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome, email: email, senha: senha }),
      });

      const dados = await resposta.json();

      if (dados.sucesso) {
        alert('🎉 ' + dados.mensagem);
        setTelaAtual('Login');
      } else {
        alert('Ops: ' + dados.mensagem);
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao conectar com o servidor!');
    }
  };

  // 👉 CORES DINÂMICAS DO MODO NOTURNO
  const coresFundo = modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF'];
  const corCartao = modoNoturno ? '#1E1E1E' : '#FFF';
  const corInputFundo = modoNoturno ? '#2A2A2A' : '#F4F5F7';
  const corTextoPrincipal = modoNoturno ? '#FFF' : '#333';
  const corTextoSecundario = modoNoturno ? '#AAA' : '#666';

  return ( 
    <LinearGradient colors={coresFundo} style={styles.container}> 
      <StatusBar style={modoNoturno ? "light" : "auto"} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.teclado}
        >
          {/* ScrollView garante que a tela role se o teclado cobrir algo */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            
            {/* CABEÇALHO */}
            <View style={styles.areaCabecalho}>
              <TouchableOpacity onPress={() => setTelaAtual('Principal')} style={styles.botaoVoltar}>
                <Ionicons name="arrow-back" size={28} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.titulo}>Criar conta</Text>
              <Text style={styles.subtitulo}>Junte-se a nós e cuide do seu pet</Text>
            </View>

            {/* CARTÃO BRANCO DINÂMICO */}
            <View style={[styles.cardBranco, { backgroundColor: corCartao }]}>
              
              <View style={[styles.areaInput, { backgroundColor: corInputFundo }]}>
                <Feather name="user" size={20} color="#888" style={styles.iconeInput} />
                <TextInput 
                  style={[styles.input, { color: corTextoPrincipal }]} 
                  placeholder="Seu nome" 
                  placeholderTextColor={modoNoturno ? "#888" : "#A0A0A0"}
                  value={nome}
                  onChangeText={setNome}
                />
              </View>

              <View style={[styles.areaInput, { backgroundColor: corInputFundo }]}>
                <Feather name="mail" size={20} color="#888" style={styles.iconeInput} />
                <TextInput 
                  style={[styles.input, { color: corTextoPrincipal }]} 
                  placeholder="Seu e-mail" 
                  placeholderTextColor={modoNoturno ? "#888" : "#A0A0A0"}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={[styles.areaInput, { backgroundColor: corInputFundo }]}>
                <Feather name="lock" size={20} color="#888" style={styles.iconeInput} />
                <TextInput 
                  style={[styles.input, { color: corTextoPrincipal }]} 
                  placeholder="Crie uma senha" 
                  placeholderTextColor={modoNoturno ? "#888" : "#A0A0A0"}
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={true}
                />
              </View>

              <View style={[styles.areaInput, { backgroundColor: corInputFundo }]}>
                <Feather name="check-circle" size={20} color="#888" style={styles.iconeInput} />
                <TextInput 
                  style={[styles.input, { color: corTextoPrincipal }]} 
                  placeholder="Confirme sua senha" 
                  placeholderTextColor={modoNoturno ? "#888" : "#A0A0A0"}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  secureTextEntry={true}
                />
              </View>

              <TouchableOpacity style={styles.botaoAcao} onPress={handleCadastro}>
                <Text style={styles.textoBotaoAcao}>Cadastrar</Text>
              </TouchableOpacity>

              <View style={styles.rodape}>
                <Text style={[styles.textoRodape, { color: corTextoSecundario }]}>Já tem uma conta? </Text>
                <TouchableOpacity onPress={() => setTelaAtual('Login')}>
                  <Text style={styles.textoLinkRodape}>Fazer Login</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient> 
  ); 
}

const styles = StyleSheet.create({ 
  container: { flex: 1 }, 
  teclado: { flex: 1 },

  areaCabecalho: { paddingHorizontal: 30, paddingTop: 20, paddingBottom: 40 }, 
  botaoVoltar: { marginBottom: 30, alignSelf: 'flex-start' }, 
  titulo: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginBottom: 5 }, 
  subtitulo: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },

  cardBranco: { borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30, paddingTop: 40, flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },

  areaInput: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, marginBottom: 20, paddingHorizontal: 15, height: 60 }, 
  iconeInput: { marginRight: 15 }, 
  input: { flex: 1, fontSize: 16 },

  botaoAcao: { backgroundColor: '#F86F03', borderRadius: 16, height: 60, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 30, shadowColor: '#F86F03', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }, 
  textoBotaoAcao: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  rodape: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 }, 
  textoRodape: { fontSize: 15 }, 
  textoLinkRodape: { color: '#F86F03', fontSize: 15, fontWeight: 'bold' } 
});