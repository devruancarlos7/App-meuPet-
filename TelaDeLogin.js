import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Feather, Ionicons } from '@expo/vector-icons';

export default function TelaDeLogin({ setTelaAtual }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = () => {
    if (email.trim() === '' || senha.trim() === '') {
      alert('Por favor, preencha todos os campos!');
      return;
    }
    // Sucesso, vai para as casas
    setTelaAtual('Casas');
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

            <FontAwesome5 name="paw" size={45} color="#FFF" style={{ marginBottom: 15 }} />
            <Text style={styles.titulo}>Olá novamente!</Text>
            <Text style={styles.subtitulo}>Acesse sua conta para continuar.</Text>
          </View>

          {/* 👉 CARTÃO BRANCO LISO (O Segredo do visual Clean) */}
          <View style={styles.cardBranco}>
            
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

            <TouchableOpacity style={styles.esqueciSenha}>
              <Text style={styles.textoEsqueciSenha}>Esqueci minha senha</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoAcao} onPress={handleLogin}>
              <Text style={styles.textoBotaoAcao}>Entrar</Text>
            </TouchableOpacity>

            {/* Rodapé Clean */}
            <View style={styles.rodape}>
              <Text style={styles.textoRodape}>Novo por aqui? </Text>
              <TouchableOpacity onPress={() => setTelaAtual('Cadastro')}>
                <Text style={styles.textoLinkRodape}>Crie uma conta</Text>
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

  // Área do topo (Com o fundo do degradê visível)
  areaCabecalho: { paddingHorizontal: 30, paddingTop: 20, paddingBottom: 40 },
  botaoVoltar: { marginBottom: 30, alignSelf: 'flex-start' },
  titulo: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginBottom: 5 },
  subtitulo: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },

  // O cartão branco que sobe na tela
  cardBranco: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 50,
    paddingBottom: 40,
    flex: 1, // Faz o cartão preencher todo o resto da tela para baixo
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

  // Link de esqueci a senha puxando a cor azul da identidade visual
  esqueciSenha: { alignSelf: 'flex-end', marginBottom: 40 },
  textoEsqueciSenha: { color: '#4F7FFF', fontWeight: 'bold', fontSize: 14 },

  // Botão sólido e arredondado
  botaoAcao: {
    backgroundColor: '#F86F03',
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
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