import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function TelaDeCadastro({ setTelaAtual }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleCadastro = () => {
    if (nome.trim() === '' || email.trim() === '' || senha.trim() === '' || confirmarSenha.trim() === '') {
      alert('Por favor, preencha todos os campos!');
      return;
    }
    
    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    // Sucesso, manda o usuário fazer login ou já entra direto nas Casas
    alert('Conta criada com sucesso! 🐾');
    setTelaAtual('Login');
  };

  return (
    <LinearGradient colors={['#F86F03', '#4F7FFF']} style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.teclado}>

          {/* 👉 CABEÇALHO CLEAN E MINIMALISTA */}
          <View style={styles.areaCabecalho}>
            <TouchableOpacity style={styles.botaoVoltar} onPress={() => setTelaAtual('Principal')}>
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.titulo}>Criar Conta</Text>
            <Text style={styles.subtitulo}>Junte-se a nós e comece a cuidar dos seus pets!</Text>
          </View>

          {/* 👉 CARTÃO BRANCO LISO (O Segredo do visual Clean) */}
          <View style={styles.cardBranco}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              
              <View style={styles.areaInput}>
                <Feather name="user" size={20} color="#888" style={styles.iconeInput} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome completo"
                  placeholderTextColor="#A0A0A0"
                  value={nome}
                  onChangeText={setNome}
                />
              </View>

              <View style={styles.areaInput}>
                <Feather name="mail" size={20} color="#888" style={styles.iconeInput} />
                <TextInput
                  style={styles.input}
                  placeholder="E-mail"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.areaInput}>
                <Feather name="lock" size={20} color="#888" style={styles.iconeInput} />
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={true}
                  value={senha}
                  onChangeText={setSenha}
                />
              </View>

              <View style={styles.areaInput}>
                <Feather name="check-circle" size={20} color="#888" style={styles.iconeInput} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar Senha"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={true}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                />
              </View>

              <TouchableOpacity style={styles.botaoAcao} onPress={handleCadastro}>
                <Text style={styles.textoBotaoAcao}>Cadastrar</Text>
              </TouchableOpacity>

              {/* Rodapé Clean para voltar ao Login */}
              <View style={styles.rodape}>
                <Text style={styles.textoRodape}>Já tem uma conta? </Text>
                <TouchableOpacity onPress={() => setTelaAtual('Login')}>
                  <Text style={styles.textoLinkRodape}>Faça Login</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  teclado: { flex: 1, justifyContent: 'space-between' },

  // Área do topo (Com o fundo do degradê visível)
  areaCabecalho: { paddingHorizontal: 30, paddingTop: 20, paddingBottom: 40 },
  botaoVoltar: { marginBottom: 30, alignSelf: 'flex-start' },
  titulo: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginBottom: 5 },
  subtitulo: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },

  // O cartão branco que sobe na tela (agora com ScrollView dentro)
  cardBranco: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 40,
    flex: 1, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10
  },

  // Inputs com fundo cinza suave, sem bordas pesadas
  areaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 60
  },
  iconeInput: { marginRight: 15 },
  input: { flex: 1, fontSize: 16, color: '#333' },

  // Botão sólido e arredondado
  botaoAcao: {
    backgroundColor: '#F86F03',
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#F86F03',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  textoBotaoAcao: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  rodape: { flexDirection: 'row', justifyContent: 'center' },
  textoRodape: { color: '#666', fontSize: 15 },
  textoLinkRodape: { color: '#F86F03', fontSize: 15, fontWeight: 'bold' }
});