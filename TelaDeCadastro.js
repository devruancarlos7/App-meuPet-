import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons } from '@expo/vector-icons';

const API_URL = 'http://192.168.12.95:3000';

// 👉 RECEBENDO A VARIÁVEL modoNoturno
export default function TelaDeCadastro({ setTelaAtual, modoNoturno }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const limparNumeros = (valor) => valor.replace(/\D/g, '');

  const validarEmail = (emailDigitado) => {
    const emailLimpo = emailDigitado.trim().toLowerCase();
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return regexEmail.test(emailLimpo);
  };

  const validarSenha = (senhaDigitada) => {
    const temMaisDeSeis = senhaDigitada.length > 6;
    const temLetra = /[A-Za-z]/.test(senhaDigitada);
    const temNumero = /\d/.test(senhaDigitada);
    return temMaisDeSeis && temLetra && temNumero;
  };

  const validarCPF = (cpfDigitado) => {
    const numeros = limparNumeros(cpfDigitado);

    // CPF é opcional. Se estiver vazio, passa na validação.
    if (numeros.length === 0) return true;

    if (numeros.length !== 11) return false;
    if (/^(\d)\1+$/.test(numeros)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(numeros.charAt(i), 10) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.charAt(9), 10)) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(numeros.charAt(i), 10) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;

    return resto === parseInt(numeros.charAt(10), 10);
  };

  const validarTelefone = (telefoneDigitado) => {
    const numeros = limparNumeros(telefoneDigitado);

    // Telefone é opcional. Se estiver vazio, passa na validação.
    if (numeros.length === 0) return true;

    // Aceita telefone com DDD: 10 dígitos fixo ou 11 dígitos celular.
    return numeros.length === 10 || numeros.length === 11;
  };

  const formatarCPF = (valor) => {
    const numeros = limparNumeros(valor).slice(0, 11);

    return numeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatarTelefone = (valor) => {
    const numeros = limparNumeros(valor).slice(0, 11);

    if (numeros.length <= 10) {
      return numeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }

    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleCadastro = async () => {
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();
    const cpfLimpo = limparNumeros(cpf);
    const telefoneLimpo = limparNumeros(telefone);

    // 👉 PRIORIDADES DE VALIDAÇÃO
    if (nomeLimpo === '') {
      alert('Informe seu nome para continuar.');
      return;
    }

    if (emailLimpo === '') {
      alert('Informe seu e-mail para continuar.');
      return;
    }

    if (!validarEmail(emailLimpo)) {
      alert('Digite um e-mail válido. Exemplo: nome@email.com');
      return;
    }

    if (senha.trim() === '') {
      alert('Informe sua senha para continuar.');
      return;
    }

    if (!validarSenha(senha)) {
      alert('A senha precisa ter mais de 6 caracteres e conter letras e números.');
      return;
    }

    if (confirmarSenha.trim() === '') {
      alert('Confirme sua senha para continuar.');
      return;
    }

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    if (!validarCPF(cpf)) {
      alert('CPF inválido. Corrija ou deixe o campo vazio.');
      return;
    }

    if (!validarTelefone(telefone)) {
      alert('Telefone inválido. Use DDD + número ou deixe o campo vazio.');
      return;
    }

    try {
      // ⚠️ ATENÇÃO: Troque o IP acima pelo IP atual do seu notebook! (ex: 192.168.1.XXX)
      const resposta = await fetch(`${API_URL}/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeLimpo,
          email: emailLimpo,
          senha: senha,
          cpf: cpfLimpo || null,
          telefone: telefoneLimpo || null
        })
      });

      const dados = await resposta.json();

      if (dados.sucesso) {
        alert('🎉 Usuário cadastrado com sucesso!');
        setTelaAtual('Login');
      } else {
        alert('Ops: ' + (dados.mensagem || 'Erro ao cadastrar.'));
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao conectar com o servidor! Verifique se o servidor está ligado e se o IP está correto.');
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.teclado}>
          {/* ScrollView garante que a tela role se o teclado cobrir algo */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>

            <View style={styles.areaCabecalho}>
              <TouchableOpacity onPress={() => setTelaAtual('Principal')} style={styles.botaoVoltar}>
                <Ionicons name="arrow-back" size={28} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.titulo}>Criar Conta</Text>
              <Text style={styles.subtitulo}>Junte-se a nós e cuide dos seus pets</Text>
            </View>

            <View style={[styles.cardBranco, { backgroundColor: corCartao }]}>

              <View style={[styles.areaInput, { backgroundColor: corInputFundo }]}>
                <Feather name="user" size={20} color={corTextoSecundario} style={styles.iconeInput} />
                <TextInput
                  style={[styles.input, { color: corTextoPrincipal }]}
                  placeholder="Seu nome"
                  placeholderTextColor={corTextoSecundario}
                  value={nome}
                  onChangeText={setNome}
                />
              </View>

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
                <Feather name="credit-card" size={20} color={corTextoSecundario} style={styles.iconeInput} />
                <TextInput
                  style={[styles.input, { color: corTextoPrincipal }]}
                  placeholder="CPF (opcional)"
                  placeholderTextColor={corTextoSecundario}
                  keyboardType="numeric"
                  value={cpf}
                  onChangeText={(texto) => setCpf(formatarCPF(texto))}
                />
              </View>

              <View style={[styles.areaInput, { backgroundColor: corInputFundo }]}>
                <Feather name="phone" size={20} color={corTextoSecundario} style={styles.iconeInput} />
                <TextInput
                  style={[styles.input, { color: corTextoPrincipal }]}
                  placeholder="Telefone (opcional)"
                  placeholderTextColor={corTextoSecundario}
                  keyboardType="phone-pad"
                  value={telefone}
                  onChangeText={(texto) => setTelefone(formatarTelefone(texto))}
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

              <View style={[styles.areaInput, { backgroundColor: corInputFundo }]}>
                <Feather name="check-circle" size={20} color={corTextoSecundario} style={styles.iconeInput} />
                <TextInput
                  style={[styles.input, { color: corTextoPrincipal }]}
                  placeholder="Confirme sua senha"
                  placeholderTextColor={corTextoSecundario}
                  secureTextEntry={true}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                />
              </View>

              <TouchableOpacity style={styles.botaoAcao} onPress={handleCadastro}>
                <Text style={styles.textoBotaoAcao}>Cadastrar</Text>
              </TouchableOpacity>

              <View style={styles.rodape}>
                <Text style={[styles.textoRodape, { color: corTextoSecundario }]}>Já tem uma conta? </Text>
                <TouchableOpacity onPress={() => setTelaAtual('Login')}>
                  <Text style={styles.textoLinkRodape}>Faça Login!</Text>
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
