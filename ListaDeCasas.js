import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

export default function ListaDeCasas({ setTelaAtual, casas, setCasaAtual, usuarioAtual, membros }) {
  
  const minhasCasas = casas.filter(casa => 
    casa.adminId === usuarioAtual?.id || membros.some(m => m.casaId === casa.id && m.id === usuarioAtual?.id)
  );

  return (
    <LinearGradient colors={['#F86F03', '#4F7FFF']} style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* 👉 AS PATINHAS VOLTARAM! Mais visíveis, coloridas e divertidas */}
        <FontAwesome5 name="paw" size={120} color="rgba(255, 255, 255, 0.2)" style={[styles.patinha, { top: -10, right: -20, transform: [{ rotate: '20deg' }] }]} />
        <FontAwesome5 name="paw" size={80} color="rgba(248, 111, 3, 0.4)" style={[styles.patinha, { bottom: 150, right: 30, transform: [{ rotate: '-15deg' }] }]} />
        <FontAwesome5 name="paw" size={60} color="rgba(79, 127, 255, 0.4)" style={[styles.patinha, { bottom: 50, right: 100, transform: [{ rotate: '-10deg' }] }]} />

        {/* 👉 CABEÇALHO ALEGRE */}
        <View style={styles.areaCabecalho}>
          <View>
            <Text style={styles.saudacao}>Olá, {usuarioAtual?.nome.split(' ')}! 🐾</Text>
            <Text style={styles.subSaudacao}>Vamos cuidar dos pets hoje?</Text>
          </View>
          <TouchableOpacity onPress={() => setTelaAtual('Principal')} style={styles.botaoSair}>
            <Feather name="log-out" size={26} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* 👉 CARTÃO PRINCIPAL (Branco, mas repleto de cor por dentro) */}
        <View style={styles.cardAlegre}>
          
          {/* Botões Coloridos e Sólidos (Dá vontade de clicar!) */}
          <View style={styles.areaAcoes}>
            <TouchableOpacity style={styles.cartaoAcao} onPress={() => setTelaAtual('NovaCasa')}>
              <View style={[styles.iconeAcaoFundo, { backgroundColor: '#F86F03', shadowColor: '#F86F03' }]}>
                 <Feather name="plus" size={32} color="#FFF" />
              </View>
              <Text style={styles.textoAcao}>Criar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cartaoAcao} onPress={() => setTelaAtual('EntrarCasa')}>
              <View style={[styles.iconeAcaoFundo, { backgroundColor: '#4F7FFF', shadowColor: '#4F7FFF' }]}>
                 <Feather name="log-in" size={32} color="#FFF" />
              </View>
              <Text style={styles.textoAcao}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cartaoAcao} onPress={() => setTelaAtual('ExcluirCasa')}>
              <View style={[styles.iconeAcaoFundo, { backgroundColor: '#FF4C4C', shadowColor: '#FF4C4C' }]}>
                 <Feather name="trash-2" size={32} color="#FFF" />
              </View>
              <Text style={styles.textoAcao}>Excluir</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.tituloSecao}>Suas Casas 🏡</Text>

          {/* Lista de Casas Vibrante */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {minhasCasas.length > 0 ? (
              minhasCasas.map((casa) => (
                <TouchableOpacity 
                  key={casa.id} 
                  style={styles.cartaoCasa} 
                  onPress={() => { setCasaAtual(casa); setTelaAtual('ListaDePets'); }}
                >
                  <Image source={{ uri: casa.imagem }} style={styles.imagemCasa} />
                  
                  <View style={styles.infoCasa}>
                    <Text style={styles.nomeCasa}>{casa.nome}</Text>
                    {/* Status colorido puxando a sua marca! */}
                    <Text style={styles.statusCasa}>
                      {casa.adminId === usuarioAtual?.id ? '👑 Líder' : '🐶 Convidado'}
                    </Text>
                  </View>

                  {/* Setinha Laranja Sólida */}
                  <View style={styles.botaoSeta}>
                    <Feather name="chevron-right" size={24} color="#FFF" />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              // Tela vazia muito mais fofa!
              <View style={styles.areaVazia}>
                <FontAwesome5 name="bone" size={50} color="#F86F03" style={{ marginBottom: 15 }} />
                <Text style={styles.textoVazio}>Nenhuma casa ainda!</Text>
                <Text style={styles.subTextoVazio}>Crie ou entre em uma para começar a cuidar dos bichinhos.</Text>
              </View>
            )}
          </ScrollView>

        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  patinha: { position: 'absolute', zIndex: 0 },
  
  areaCabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30, paddingTop: 20, paddingBottom: 30 },
  saudacao: { fontSize: 30, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  subSaudacao: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' },
  botaoSair: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },

  cardAlegre: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 35,
    flex: 1, 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 15
  },

  areaAcoes: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35, paddingHorizontal: 5 },
  cartaoAcao: { alignItems: 'center', flex: 1 },
  iconeAcaoFundo: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  textoAcao: { color: '#333', fontSize: 15, fontWeight: '900' },

  tituloSecao: { fontSize: 24, fontWeight: '900', color: '#333', marginBottom: 20, paddingHorizontal: 5 },

  // Estilo super amigável para a casa, com azul bebê
  cartaoCasa: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F0F4FF', // Azul bem clarinho para dar vivacidade
    padding: 15, 
    borderRadius: 25, 
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#E0E8FF' 
  },
  imagemCasa: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#4F7FFF' },
  infoCasa: { flex: 1, marginLeft: 15 },
  nomeCasa: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  statusCasa: { fontSize: 14, color: '#F86F03', fontWeight: 'bold' },

  botaoSeta: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#F86F03', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#F86F03',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4
  },

  // Um estado vazio chamativo e temático
  areaVazia: { 
    alignItems: 'center', 
    marginTop: 40, 
    backgroundColor: '#FFF3E0', 
    padding: 30, 
    borderRadius: 25, 
    borderWidth: 2, 
    borderColor: '#F86F03', 
    borderStyle: 'dashed' 
  },
  textoVazio: { color: '#F86F03', fontSize: 20, fontWeight: '900', textAlign: 'center' },
  subTextoVazio: { color: '#333', fontSize: 16, textAlign: 'center', marginTop: 8, fontWeight: '600' }
});