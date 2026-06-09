import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons } from '@expo/vector-icons';

const API_URL = 'http://192.168.12.95:3000';

export default function TelaDeLogin({ setTelaAtual, setUsuarioAtual, onLogin, modoNoturno }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    if (email.trim() === '' || senha.trim() === '') {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    try {
      // ⚠️ ATENÇÃO: Troque "SEU_IP" pelo IP atual do seu notebook! (ex: 192.168.1.XXX)
      const resposta = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, senha: senha }),
      });

      const dados = await resposta.json();

      if (dados.sucesso) {
        // 🔥 A MÁGICA E CORREÇÃO FINAL ESTÁ AQUI:
        // O "" garante que o app tire você de dentro da lista e pegue o seu ID real!
        const usuarioReal = Array.isArray(dados.usuario) ? dados.usuario[0] : dados.usuario;

        if (onLogin) {
          onLogin(usuarioReal);
        } else {
          setUsuarioAtual(usuarioReal);
          setTelaAtual('Casas');
        }
      } else {
        alert('Ops: ' + dados.mensagem);
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao conectar com o servidor! Verifique se o IP mudou.');
    }
  };

  const coresFundo = modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF'];
  const corCartao = modoNoturno ? '#1E1E1E' : '#FFF';
  const corInputFundo = modoNoturno ? '#2A2A2A' : '#F4F5F7';
  const corTextoPrincipal = modoNoturno ? '#FFF' : '#333';
  const corTextoSecundario = modoNoturno ? '#AAA' : '#666';

  return (
    <LinearGradient colors={coresFundo} style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.teclado}>
          
          <View style={styles.areaCabecalho}>
            <TouchableOpacity onPress={() => setTelaAtual('Principal')} style={styles.botaoVoltar}>
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.titulo}>Bem-vindo de volta!</Text>
            <Text style={styles.subtitulo}>Acesse sua conta para continuar</Text>
          </View>

          <View style={[styles.cardBranco, { backgroundColor: corCartao }]}>
            
            <View style={[styles.areaInput, { backgroundColor: corInputFundo }]}>
              <Feather name="mail" size={20} color={corTextoSecundario} style={styles.iconeInput} />
              <TextInput
                style={[styles.input, { color: corTextoPrincipal }]}
                placeholder="Seu e-mail"
                placeholderTextColor={corTextoSecundario}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={[styles.areaInput, { backgroundColor: corInputFundo }]}>
              <Feather name="lock" size={20} color={corTextoSecundario} style={styles.iconeInput} />
              <TextInput
                style={[styles.input, { color: corTextoPrincipal }]}
                placeholder="Sua senha"
                placeholderTextColor={corTextoSecundario}
                secureTextEntry={true}
                value={senha}
                onChangeText={setSenha}
              />
            </View>

            <TouchableOpacity style={styles.esqueciSenha}>
              <Text style={styles.textoEsqueciSenha}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoAcao} onPress={handleLogin}>
              <Text style={styles.textoBotaoAcao}>Entrar</Text>
            </TouchableOpacity>

            <View style={styles.rodape}>
              <Text style={[styles.textoRodape, { color: corTextoSecundario }]}>Ainda não tem conta? </Text>
              <TouchableOpacity onPress={() => setTelaAtual('Cadastro')}>
                <Text style={styles.textoLinkRodape}>Crie uma agora!</Text>
              </TouchableOpacity>
            </View>

          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  teclado: { flex: 1, justifyContent: 'space-between' },
  areaCabecalho: { paddingHorizontal: 30, paddingTop: 20, paddingBottom: 40 },
  botaoVoltar: { marginBottom: 30, alignSelf: 'flex-start' },
  titulo: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginBottom: 5 },
  subtitulo: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  cardBranco: { borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30, paddingTop: 50, paddingBottom: 40, flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  areaInput: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, marginBottom: 20, paddingHorizontal: 15, height: 60 },
  iconeInput: { marginRight: 15 },
  input: { flex: 1, fontSize: 16 },
  esqueciSenha: { alignSelf: 'flex-end', marginBottom: 40 },
  textoEsqueciSenha: { color: '#4F7FFF', fontWeight: 'bold', fontSize: 14 },
  botaoAcao: { backgroundColor: '#F86F03', borderRadius: 16, height: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 30, shadowColor: '#F86F03', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  textoBotaoAcao: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  rodape: { flexDirection: 'row', justifyContent: 'center' },
  textoRodape: { fontSize: 15 },
  textoLinkRodape: { color: '#F86F03', fontSize: 15, fontWeight: 'bold' }
});
