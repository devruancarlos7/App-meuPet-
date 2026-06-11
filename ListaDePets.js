import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  LayoutAnimation,
  UIManager
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000'
  : 'http://10.141.52.10:3000';

const normalizarTexto = (texto = '') => {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const RACAS_POPULARES = [
  {
    id: 'pastor-alemao',
    nome: 'Pastor Alemão',
    tipo: 'Cachorro',
    termos: ['pastor', 'pastor alemao', 'pastor alemão', 'alemao', 'alemão', 'german shepherd'],
    descricao: 'Inteligente, leal, protetor e muito usado em guarda, companhia e trabalho.',
    expectativa: '9 a 13 anos',
    problemas: 'Pode ter tendência a displasia coxofemoral e problemas articulares.',
    dica: 'Precisa de exercícios, treino e estímulos mentais frequentes.'
  },
  {
    id: 'pastor-belga-malinois',
    nome: 'Pastor Belga Malinois',
    tipo: 'Cachorro',
    termos: ['pastor', 'pastor belga', 'malinois', 'belga malinois'],
    descricao: 'Muito ativo, obediente, ágil e usado em esportes, guarda e trabalho policial.',
    expectativa: '12 a 14 anos',
    problemas: 'Pode desenvolver ansiedade se ficar sem atividade.',
    dica: 'Ideal para tutores com rotina ativa e tempo para treinos.'
  },
  {
    id: 'pastor-belga-groenendael',
    nome: 'Pastor Belga Groenendael',
    tipo: 'Cachorro',
    termos: ['pastor', 'pastor belga', 'groenendael'],
    descricao: 'Elegante, inteligente, protetor e muito ligado à família.',
    expectativa: '12 a 14 anos',
    problemas: 'Pode precisar de escovação frequente por causa da pelagem longa.',
    dica: 'Faça escovação semanal e ofereça bastante atividade física.'
  },
  {
    id: 'pastor-belga-tervuren',
    nome: 'Pastor Belga Tervuren',
    tipo: 'Cachorro',
    termos: ['pastor', 'pastor belga', 'tervuren'],
    descricao: 'Ativo, atento, inteligente e bastante companheiro.',
    expectativa: '12 a 14 anos',
    problemas: 'Pode ficar agitado se não gastar energia.',
    dica: 'Passeios longos e brincadeiras de obediência ajudam bastante.'
  },
  {
    id: 'pastor-belga-laekenois',
    nome: 'Pastor Belga Laekenois',
    tipo: 'Cachorro',
    termos: ['pastor', 'pastor belga', 'laekenois'],
    descricao: 'Raro, protetor, inteligente e com pelagem mais áspera.',
    expectativa: '10 a 14 anos',
    problemas: 'Pode exigir cuidados específicos com a pelagem.',
    dica: 'Socialização desde filhote é muito importante.'
  },
  {
    id: 'pastor-suico',
    nome: 'Pastor Suíço Branco',
    tipo: 'Cachorro',
    termos: ['pastor', 'pastor suico', 'pastor suíço', 'suico branco', 'suiço branco'],
    descricao: 'Leal, dócil, inteligente e muito parecido com o Pastor Alemão, mas com pelagem branca.',
    expectativa: '12 a 14 anos',
    problemas: 'Pode ter sensibilidade articular e precisar de controle de peso.',
    dica: 'Combine passeios, treino e alimentação equilibrada.'
  },
  {
    id: 'pastor-australiano',
    nome: 'Pastor Australiano',
    tipo: 'Cachorro',
    termos: ['pastor', 'pastor australiano', 'australian shepherd', 'aussie'],
    descricao: 'Muito inteligente, ativo, brincalhão e excelente para famílias ativas.',
    expectativa: '12 a 15 anos',
    problemas: 'Pode ter problemas oculares hereditários.',
    dica: 'Precisa de atividades diárias e brincadeiras inteligentes.'
  },
  {
    id: 'border-collie',
    nome: 'Border Collie',
    tipo: 'Cachorro',
    termos: ['pastor', 'border', 'border collie', 'collie'],
    descricao: 'Uma das raças mais inteligentes do mundo, muito ativa e obediente.',
    expectativa: '12 a 15 anos',
    problemas: 'Pode ficar ansioso se não tiver estímulo físico e mental.',
    dica: 'Ensine comandos, truques e brincadeiras com desafios.'
  },
  {
    id: 'collie',
    nome: 'Collie',
    tipo: 'Cachorro',
    termos: ['pastor', 'collie', 'lassie'],
    descricao: 'Dócil, elegante, protetor e bastante ligado à família.',
    expectativa: '12 a 14 anos',
    problemas: 'Pode precisar de escovação frequente.',
    dica: 'Cuide bem da pelagem e mantenha uma rotina de passeios.'
  },
  {
    id: 'pastor-shetland',
    nome: 'Pastor de Shetland',
    tipo: 'Cachorro',
    termos: ['pastor', 'shetland', 'sheltie', 'pastor de shetland'],
    descricao: 'Pequeno, inteligente, atento e muito carinhoso.',
    expectativa: '12 a 14 anos',
    problemas: 'Pode latir bastante se não for bem treinado.',
    dica: 'Treino positivo ajuda a controlar latidos e ansiedade.'
  },
  {
    id: 'golden',
    nome: 'Golden Retriever',
    tipo: 'Cachorro',
    termos: ['golden', 'retriever', 'golden retriever'],
    descricao: 'Amigável, brincalhão, paciente e ótimo cão de família.',
    expectativa: '10 a 12 anos',
    problemas: 'Pode ter tendência a obesidade e problemas articulares.',
    dica: 'Controle alimentação e mantenha passeios regulares.'
  },
  {
    id: 'labrador',
    nome: 'Labrador Retriever',
    tipo: 'Cachorro',
    termos: ['labrador', 'retriever', 'labrador retriever'],
    descricao: 'Companheiro, brincalhão, sociável e muito apegado à família.',
    expectativa: '10 a 12 anos',
    problemas: 'Pode engordar com facilidade.',
    dica: 'Evite excesso de petiscos e mantenha atividades diárias.'
  },
  {
    id: 'lulu',
    nome: 'Lulu da Pomerânia',
    tipo: 'Cachorro',
    termos: ['lulu', 'pomerania', 'pomerânia', 'spitz', 'spitz alemao', 'spitz alemão'],
    descricao: 'Pequeno, esperto, alerta e cheio de energia.',
    expectativa: '12 a 16 anos',
    problemas: 'Pode ter sensibilidade dentária e luxação de patela.',
    dica: 'Escovação, cuidado dental e passeios leves ajudam bastante.'
  },
  {
    id: 'shih-tzu',
    nome: 'Shih Tzu',
    tipo: 'Cachorro',
    termos: ['shih', 'shitzu', 'shih tzu'],
    descricao: 'Carinhoso, calmo, sociável e ótimo para ambientes internos.',
    expectativa: '10 a 16 anos',
    problemas: 'Pode ter problemas respiratórios e oculares.',
    dica: 'Limpe os olhos com frequência e evite calor excessivo.'
  },
  {
    id: 'poodle',
    nome: 'Poodle',
    tipo: 'Cachorro',
    termos: ['poodle', 'pudel'],
    descricao: 'Inteligente, carinhoso e fácil de treinar.',
    expectativa: '12 a 15 anos',
    problemas: 'Pode precisar de tosa e cuidados com ouvidos.',
    dica: 'Mantenha a pelagem cuidada e os ouvidos limpos.'
  },
  {
    id: 'yorkshire',
    nome: 'Yorkshire Terrier',
    tipo: 'Cachorro',
    termos: ['yorkshire', 'york', 'yorkie'],
    descricao: 'Pequeno, corajoso, esperto e muito companheiro.',
    expectativa: '13 a 16 anos',
    problemas: 'Pode ter problemas dentários e sensibilidade digestiva.',
    dica: 'Cuide da higiene bucal e da alimentação.'
  },
  {
    id: 'bulldog-frances',
    nome: 'Bulldog Francês',
    tipo: 'Cachorro',
    termos: ['bulldog frances', 'bulldog francês', 'french bulldog'],
    descricao: 'Divertido, carinhoso, tranquilo e muito apegado ao tutor.',
    expectativa: '10 a 12 anos',
    problemas: 'Pode ter problemas respiratórios por ser braquicefálico.',
    dica: 'Evite calor forte e exercícios muito intensos.'
  },
  {
    id: 'pinscher',
    nome: 'Pinscher',
    tipo: 'Cachorro',
    termos: ['pinscher', 'pincher'],
    descricao: 'Pequeno, alerta, energético e muito corajoso.',
    expectativa: '12 a 16 anos',
    problemas: 'Pode ser sensível ao frio e ter tendência a latir.',
    dica: 'Treino e rotina ajudam a controlar ansiedade e latidos.'
  },
  {
    id: 'dachshund',
    nome: 'Dachshund / Salsicha',
    tipo: 'Cachorro',
    termos: ['dachshund', 'salsicha', 'teckel'],
    descricao: 'Corajoso, curioso, companheiro e com corpo alongado.',
    expectativa: '12 a 16 anos',
    problemas: 'Pode ter problemas de coluna.',
    dica: 'Evite pulos de sofá e escadas em excesso.'
  },
  {
    id: 'beagle',
    nome: 'Beagle',
    tipo: 'Cachorro',
    termos: ['beagle'],
    descricao: 'Alegre, farejador, brincalhão e sociável.',
    expectativa: '12 a 15 anos',
    problemas: 'Pode engordar e seguir cheiros sem obedecer.',
    dica: 'Passeios com guia e controle alimentar são importantes.'
  },
  {
    id: 'rottweiler',
    nome: 'Rottweiler',
    tipo: 'Cachorro',
    termos: ['rottweiler', 'rotweiler'],
    descricao: 'Forte, leal, protetor e muito inteligente.',
    expectativa: '8 a 10 anos',
    problemas: 'Pode ter problemas articulares.',
    dica: 'Socialização e treino positivo desde cedo são essenciais.'
  },
  {
    id: 'husky',
    nome: 'Husky Siberiano',
    tipo: 'Cachorro',
    termos: ['husky', 'siberiano', 'husky siberiano'],
    descricao: 'Ativo, independente, sociável e resistente.',
    expectativa: '12 a 14 anos',
    problemas: 'Pode fugir se não tiver ambiente seguro.',
    dica: 'Precisa de exercícios e locais bem fechados.'
  },
  {
    id: 'srd-cachorro',
    nome: 'Vira-lata / SRD',
    tipo: 'Cachorro',
    termos: ['vira lata', 'viralata', 'srd', 'sem raça definida', 'sem raca definida'],
    descricao: 'Único, especial, geralmente resistente e cheio de personalidade.',
    expectativa: '12 a 16 anos',
    problemas: 'A saúde varia conforme porte, histórico e cuidados.',
    dica: 'Vacinas, vermífugo e check-ups são essenciais.'
  },
  {
    id: 'persa',
    nome: 'Persa',
    tipo: 'Gato',
    termos: ['persa', 'gato persa'],
    descricao: 'Calmo, elegante, dócil e muito apegado ao ambiente.',
    expectativa: '12 a 17 anos',
    problemas: 'Pode ter problemas respiratórios e lacrimejamento.',
    dica: 'Escove a pelagem e limpe a região dos olhos.'
  },
  {
    id: 'siames',
    nome: 'Siamês',
    tipo: 'Gato',
    termos: ['siames', 'siamês', 'gato siames'],
    descricao: 'Comunicativo, curioso, inteligente e muito ligado ao tutor.',
    expectativa: '12 a 15 anos',
    problemas: 'Pode miar bastante e exigir atenção.',
    dica: 'Brinquedos interativos ajudam a gastar energia.'
  },
  {
    id: 'maine-coon',
    nome: 'Maine Coon',
    tipo: 'Gato',
    termos: ['maine', 'maine coon'],
    descricao: 'Grande, dócil, sociável e muito companheiro.',
    expectativa: '12 a 15 anos',
    problemas: 'Pode ter tendência a problemas cardíacos.',
    dica: 'Check-ups regulares são importantes.'
  },
  {
    id: 'ragdoll',
    nome: 'Ragdoll',
    tipo: 'Gato',
    termos: ['ragdoll'],
    descricao: 'Calmo, carinhoso, dócil e conhecido por relaxar no colo.',
    expectativa: '12 a 17 anos',
    problemas: 'Pode precisar de escovação frequente.',
    dica: 'Escove a pelagem e ofereça enriquecimento ambiental.'
  },
  {
    id: 'sphynx',
    nome: 'Sphynx',
    tipo: 'Gato',
    termos: ['sphynx', 'gato sem pelo', 'sem pelo'],
    descricao: 'Carinhoso, curioso e muito apegado ao tutor.',
    expectativa: '8 a 14 anos',
    problemas: 'Precisa de cuidados com pele e temperatura.',
    dica: 'Proteja do frio e limpe a pele conforme orientação veterinária.'
  },
  {
    id: 'gato-srd',
    nome: 'Gato SRD',
    tipo: 'Gato',
    termos: ['gato srd', 'sem raca', 'sem raça', 'vira lata gato'],
    descricao: 'Único, esperto, independente e cheio de personalidade.',
    expectativa: '12 a 18 anos',
    problemas: 'A saúde varia conforme histórico e ambiente.',
    dica: 'Vacinação, castração e telas de proteção são muito importantes.'
  },
  {
    id: 'calopsita',
    nome: 'Calopsita',
    tipo: 'Ave',
    termos: ['calopsita', 'calopsitas'],
    descricao: 'Ave dócil, sociável, curiosa e muito apegada ao tutor.',
    expectativa: '10 a 15 anos',
    problemas: 'Pode sofrer com alimentação inadequada e estresse.',
    dica: 'Ofereça alimentação correta, brinquedos e tempo fora da gaiola com segurança.'
  },
  {
    id: 'periquito',
    nome: 'Periquito Australiano',
    tipo: 'Ave',
    termos: ['periquito', 'periquito australiano'],
    descricao: 'Pequeno, ativo, sociável e muito brincalhão.',
    expectativa: '5 a 10 anos',
    problemas: 'Pode ficar estressado sem estímulos.',
    dica: 'Brinquedos, poleiros e companhia ajudam bastante.'
  },
  {
    id: 'canario',
    nome: 'Canário',
    tipo: 'Ave',
    termos: ['canario', 'canário'],
    descricao: 'Ave conhecida pelo canto, delicada e muito popular.',
    expectativa: '8 a 12 anos',
    problemas: 'Pode ser sensível a correntes de ar e mudanças bruscas.',
    dica: 'Mantenha a gaiola em local seguro, limpo e sem vento direto.'
  }
];

const montarResultadoLocal = (raca) => ({
  nome: raca.nome,
  descricao: raca.descricao,
  expectativa: raca.expectativa,
  problemas: raca.problemas,
  dica: raca.dica
});

const buscarNaListaLocal = (texto) => {
  const termo = normalizarTexto(texto);

  if (!termo) return null;

  const resultadoExato = RACAS_POPULARES.find((raca) => {
    const nome = normalizarTexto(raca.nome);
    const termos = raca.termos?.map(normalizarTexto) || [];

    return nome === termo || termos.includes(termo);
  });

  if (resultadoExato) return resultadoExato;

  return RACAS_POPULARES.find((raca) => {
    const nome = normalizarTexto(raca.nome);
    const termos = raca.termos?.map(normalizarTexto) || [];

    return nome.includes(termo) || termos.some(t => t.includes(termo));
  });
};

export default function ListaDePets({
  setTelaAtual,
  pets,
  setPets,
  casaAtual,
  setPetAtual,
  usuarioAtual,
  modoNoturno
}) {
  const [pesquisa, setPesquisa] = useState('');
  const [carregandoBusca, setCarregandoBusca] = useState(false);
  const [carregandoPets, setCarregandoPets] = useState(false);
  const [resultado, setResultado] = useState(null);

  const imagemUsuarioLogado =
    usuarioAtual?.imagem ||
    usuarioAtual?.foto ||
    usuarioAtual?.avatar ||
    '';

  useEffect(() => {
    const buscarPets = async () => {
      if (!casaAtual?.id || !setPets) return;

      try {
        setCarregandoPets(true);

        const resposta = await fetch(`${API_URL}/casas/${casaAtual.id}/pets`);

        if (resposta.ok) {
          const dadosPets = await resposta.json();

          if (Array.isArray(dadosPets)) {
            setPets(dadosPets);
          } else if (Array.isArray(dadosPets.pets)) {
            setPets(dadosPets.pets);
          }
        }
      } catch (erro) {
        console.error('Erro ao buscar pets da casa:', erro);
      } finally {
        setCarregandoPets(false);
      }
    };

    buscarPets();
  }, [casaAtual?.id]);

  const isAdmin =
    String(casaAtual?.adminId ?? casaAtual?.admin_id) === String(usuarioAtual?.id);

  const petsDestaCasa =
    pets?.filter((pet) => String(pet.casaId ?? pet.casa_id) === String(casaAtual?.id)) || [];

  const sugestoes = useMemo(() => {
    const termo = normalizarTexto(pesquisa);

    if (termo.length < 2 || carregandoBusca || resultado) {
      return [];
    }

    return RACAS_POPULARES.filter((raca) => {
      const nome = normalizarTexto(raca.nome);
      const termos = raca.termos?.map(normalizarTexto) || [];

      return nome.includes(termo) || termos.some(t => t.includes(termo));
    }).slice(0, 8);
  }, [pesquisa, carregandoBusca, resultado]);

  const navegarComAnimacao = (tela) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTelaAtual(tela);
  };

  const abrirPerfilPet = (pet) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPetAtual(pet);
    setTelaAtual('MetasCuidados');
  };

  const selecionarSugestao = (raca) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPesquisa(raca.nome);
    setResultado(montarResultadoLocal(raca));
  };

  const buscarManual = async () => {
    const textoPesquisado = pesquisa.trim();

    if (textoPesquisado === '') return;

    setResultado(null);
    setCarregandoBusca(true);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    try {
      const racaLocal = buscarNaListaLocal(textoPesquisado);

      if (racaLocal) {
        setResultado(montarResultadoLocal(racaLocal));
        return;
      }

      const termoApi = encodeURIComponent(textoPesquisado);

      let resposta = await fetch(`https://api.thedogapi.com/v1/breeds/search?q=${termoApi}`);
      let dados = await resposta.json();

      if (Array.isArray(dados) && dados.length > 0) {
        const raca = dados[0];

        setResultado({
          nome: raca.name || textoPesquisado,
          descricao: raca.temperament || 'Raça com energia e personalidade marcante.',
          expectativa: raca.life_span || 'Varia de acordo com o porte.',
          problemas: raca.breed_group ? `Grupo Canino: ${raca.breed_group}` : 'Sem histórico genético mapeado.',
          dica: 'Manter a vacinação e a rotina de exercícios em dia é essencial!'
        });

        return;
      }

      resposta = await fetch(`https://api.thecatapi.com/v1/breeds/search?q=${termoApi}`);
      dados = await resposta.json();

      if (Array.isArray(dados) && dados.length > 0) {
        const raca = dados[0];

        setResultado({
          nome: raca.name || textoPesquisado,
          descricao: raca.temperament || 'Felino elegante, curioso e independente.',
          expectativa: raca.life_span ? `${raca.life_span} anos` : '12 a 15 anos',
          problemas: raca.origin ? `Origem Mapeada: ${raca.origin}` : 'Sem histórico mapeado.',
          dica: 'Gatos amam caixas de papelão, arranhadores e prateleiras altas!'
        });

        return;
      }

      setResultado({
        nome: textoPesquisado,
        descricao: 'Informação não encontrada na enciclopédia agora.',
        expectativa: 'N/A',
        problemas: 'N/A',
        dica: 'Consulte um veterinário para informações mais precisas sobre essa raça.'
      });

    } catch (erro) {
      setResultado({
        nome: textoPesquisado,
        descricao: 'Não conseguimos conectar à enciclopédia agora.',
        expectativa: 'N/A',
        problemas: 'N/A',
        dica: 'Verifique sua conexão com a internet.'
      });
    } finally {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCarregandoBusca(false);
    }
  };

  const fecharPesquisa = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPesquisa('');
    setResultado(null);
  };

  const coresFundo = modoNoturno ? ['#121212', '#2C3E50'] : ['#F86F03', '#4F7FFF'];
  const corCartao = modoNoturno ? '#1E1E1E' : '#FFF';
  const corTextoPrincipal = modoNoturno ? '#FFF' : '#333';
  const corTextoSecundario = modoNoturno ? '#AAA' : '#666';
  const corBuscaFundo = modoNoturno ? '#2A2A2A' : '#F4F5F7';
  const corBuscaBorda = modoNoturno ? '#444' : '#EAEAEA';

  const corCartaoPet = modoNoturno ? '#232D3F' : '#F0F4FF';
  const corBordaPet = modoNoturno ? '#1A2333' : '#E0E8FF';

  const corAdicionarFundo = modoNoturno ? '#331E0B' : '#FFF3E0';
  const corAdicionarBorda = modoNoturno ? '#663C16' : '#FFD1A3';
  const corAdicionarFundoInterno = modoNoturno ? '#4A2E12' : '#FFF';

  return (
    <LinearGradient colors={coresFundo} style={styles.container}>
      <StatusBar style={modoNoturno ? 'light' : 'auto'} />

      <SafeAreaView style={{ flex: 1 }}>
        <FontAwesome5
          name="paw"
          size={120}
          color="rgba(255, 255, 255, 0.2)"
          style={[
            styles.patinha,
            {
              top: -10,
              right: -20,
              transform: [{ rotate: '20deg' }]
            }
          ]}
        />

        <FontAwesome5
          name="paw"
          size={60}
          color="rgba(79, 127, 255, 0.4)"
          style={[
            styles.patinha,
            {
              bottom: 50,
              right: 100,
              transform: [{ rotate: '-10deg' }]
            }
          ]}
        />

        <View style={styles.areaCabecalho}>
          <TouchableOpacity
            onPress={() => navegarComAnimacao('Casas')}
            style={styles.botaoVoltar}
          >
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.infoCasaHeader}>
            <Text style={styles.tituloHeader} numberOfLines={1}>
              Pets da Casa
            </Text>

            <Text style={styles.subTituloHeader} numberOfLines={1}>
              📍 {casaAtual?.nome || 'Nenhuma casa selecionada'}
            </Text>
          </View>

          <View style={styles.botoesDireita}>
            <TouchableOpacity
              style={styles.botaoIconeTop}
              onPress={() => navegarComAnimacao('PerfilUsuario')}
            >
              {imagemUsuarioLogado ? (
                <Image
                  source={{ uri: imagemUsuarioLogado }}
                  style={styles.fotoUsuarioHeader}
                />
              ) : (
                <Feather name="user" size={22} color="#FFF" />
              )}
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity
                style={styles.botaoIconeTop}
                onPress={() => navegarComAnimacao('ConfigurarCasa')}
              >
                <Feather name="settings" size={22} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          style={[styles.cardAlegre, { backgroundColor: corCartao }]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >

          <View style={styles.areaBuscaInteligente}>
            <View
              style={[
                styles.barraPesquisa,
                {
                  backgroundColor: corBuscaFundo,
                  borderColor: corBuscaBorda
                }
              ]}
            >
              <Feather
                name="search"
                size={20}
                color={corTextoSecundario}
                style={styles.iconeInput}
              />

              <TextInput
                style={[styles.inputPesquisa, { color: corTextoPrincipal }]}
                placeholder="Pesquisar raça..."
                placeholderTextColor={modoNoturno ? '#888' : '#A0A0A0'}
                value={pesquisa}
                onChangeText={(texto) => {
                  setPesquisa(texto);
                  setResultado(null);
                }}
                onSubmitEditing={buscarManual}
                returnKeyType="search"
                autoCapitalize="words"
              />

              {pesquisa.length > 0 && (
                <TouchableOpacity
                  onPress={fecharPesquisa}
                  style={{ padding: 5, marginRight: 5 }}
                >
                  <Feather name="x" size={20} color={corTextoSecundario} />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.botaoBuscarAction} onPress={buscarManual}>
                <Feather name="search" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            {sugestoes.length > 0 && (
              <View
                style={[
                  styles.areaSugestoes,
                  {
                    backgroundColor: corCartao,
                    borderColor: corBuscaBorda
                  }
                ]}
              >
                {sugestoes.map((item, index) => (
                  <TouchableOpacity
                    key={`${item.id}-${index}`}
                    style={[
                      styles.itemSugestao,
                      {
                        borderBottomColor: corBuscaFundo
                      },
                      index === sugestoes.length - 1 && {
                        borderBottomWidth: 0
                      }
                    ]}
                    onPress={() => selecionarSugestao(item)}
                  >
                    <View style={styles.iconeSugestao}>
                      <FontAwesome5
                        name={item.tipo === 'Gato' ? 'cat' : item.tipo === 'Ave' ? 'dove' : 'dog'}
                        size={14}
                        color="#F86F03"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.textoSugestao, { color: corTextoPrincipal }]}>
                        {item.nome}
                      </Text>

                      <Text style={[styles.tipoSugestao, { color: corTextoSecundario }]}>
                        {item.tipo}
                      </Text>
                    </View>

                    <Feather name="chevron-right" size={20} color={corTextoSecundario} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {carregandoBusca && (
            <View
              style={[
                styles.cartaoIACarregando,
                {
                  backgroundColor: corAdicionarFundo,
                  borderColor: corAdicionarBorda
                }
              ]}
            >
              <ActivityIndicator size="large" color="#F86F03" />
              <Text style={styles.textoCarregando}>Buscando informações...</Text>
            </View>
          )}

          {resultado && !carregandoBusca && (
            <View
              style={[
                styles.cartaoIAResultado,
                {
                  backgroundColor: corCartao,
                  borderColor: '#F86F03'
                }
              ]}
            >
              <TouchableOpacity
                style={[styles.botaoFecharIA, { backgroundColor: corBuscaFundo }]}
                onPress={fecharPesquisa}
              >
                <Feather name="x" size={16} color={modoNoturno ? '#FFF' : '#888'} />
              </TouchableOpacity>

              <View style={[styles.topoCartaoIA, { borderBottomColor: corBuscaBorda }]}>
                <FontAwesome5 name="info-circle" size={24} color="#F86F03" />
                <Text style={styles.tituloRaca} numberOfLines={1}>
                  {resultado.nome}
                </Text>
              </View>

              <Text style={[styles.textoInfoIA, { color: modoNoturno ? '#CCC' : '#555' }]}>
                <Text style={[styles.labelIA, { color: corTextoPrincipal }]}>Descrição: </Text>
                {resultado.descricao}
              </Text>

              <Text style={[styles.textoInfoIA, { color: modoNoturno ? '#CCC' : '#555' }]}>
                <Text style={[styles.labelIA, { color: corTextoPrincipal }]}>Expectativa: </Text>
                {resultado.expectativa}
              </Text>

              <Text style={[styles.textoInfoIA, { color: modoNoturno ? '#CCC' : '#555' }]}>
                <Text style={[styles.labelIA, { color: corTextoPrincipal }]}>Saúde: </Text>
                {resultado.problemas}
              </Text>

              <View style={[styles.dicaIA, { backgroundColor: modoNoturno ? '#1A2333' : '#E3F2FD' }]}>
                <Text style={styles.textoDicaIA}>💡 {resultado.dica}</Text>
              </View>
            </View>
          )}

          <View style={styles.cabecalhoPets}>
            <Text style={[styles.tituloSecao, { color: corTextoPrincipal }]}>
              Moradores Peludos 🐾
            </Text>
          </View>

          {carregandoPets ? (
            <View style={styles.areaCarregandoPets}>
              <ActivityIndicator size="large" color="#F86F03" />
              <Text style={styles.textoCarregando}>Carregando pets da casa...</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingBottom: 20 }}>
              {petsDestaCasa.length > 0 ? (
                petsDestaCasa.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={[
                      styles.cartaoPet,
                      {
                        backgroundColor: corCartaoPet,
                        borderColor: corBordaPet
                      }
                    ]}
                    onPress={() => abrirPerfilPet(pet)}
                  >
                    <Image
                      source={{
                        uri:
                          pet.imagem ||
                          'https://via.placeholder.com/150'
                      }}
                      style={styles.imagemPet}
                    />

                    <Text
                      style={[styles.nomePet, { color: corTextoPrincipal }]}
                      numberOfLines={1}
                    >
                      {pet.nome}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.areaVaziaPets}>
                  <Text style={styles.textoVazioPets}>Nenhum pet cadastrado.</Text>
                </View>
              )}

              {isAdmin && (
                <TouchableOpacity
                  style={[
                    styles.cartaoAdicionarPet,
                    {
                      backgroundColor: corAdicionarFundo,
                      borderColor: corAdicionarBorda
                    }
                  ]}
                  onPress={() => navegarComAnimacao('NovoPet')}
                >
                  <View
                    style={[
                      styles.iconeAdicionarFundo,
                      {
                        backgroundColor: corAdicionarFundoInterno
                      }
                    ]}
                  >
                    <Feather name="plus" size={24} color="#F86F03" />
                  </View>

                  <Text style={styles.textoAdicionarPet}>Novo Pet</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </ScrollView>

        <TouchableOpacity
          style={styles.botaoEmergencia}
          onPress={() => navegarComAnimacao('Emergencia')}
        >
          <FontAwesome5 name="ambulance" size={24} color="#FFF" />
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  patinha: {
    position: 'absolute',
    zIndex: 0
  },

  areaCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 60,
    zIndex: 1
  },

  botaoVoltar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },

  infoCasaHeader: {
    flex: 1
  },

  tituloHeader: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {
      width: 1,
      height: 1
    },
    textShadowRadius: 3
  },

  subTituloHeader: {
    fontSize: 16,
    color: '#FFD1A3',
    fontWeight: 'bold'
  },

  botoesDireita: {
    flexDirection: 'row',
    gap: 10
  },

  botaoIconeTop: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },

  fotoUsuarioHeader: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: '#DDD'
  },

  cardAlegre: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 35,
    flex: 1,
    marginTop: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    zIndex: 2
  },

  tituloSecao: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 15,
    paddingHorizontal: 5
  },

  areaBuscaInteligente: {
    position: 'relative',
    marginBottom: 30,
    zIndex: 10
  },

  barraPesquisa: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 1
  },

  iconeInput: {
    marginRight: 10
  },

  inputPesquisa: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold'
  },

  botaoBuscarAction: {
    backgroundColor: '#F86F03',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },

  areaSugestoes: {
    position: 'absolute',
    top: 65,
    left: 0,
    right: 0,
    borderRadius: 15,
    padding: 8,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    zIndex: 20
  },

  itemSugestao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1
  },

  iconeSugestao: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },

  textoSugestao: {
    fontSize: 16,
    fontWeight: 'bold'
  },

  tipoSugestao: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2
  },

  cartaoIACarregando: {
    marginTop: 15,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2
  },

  textoCarregando: {
    color: '#F86F03',
    fontWeight: 'bold',
    marginTop: 10
  },

  cartaoIAResultado: {
    marginTop: 15,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    elevation: 3
  },

  botaoFecharIA: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },

  topoCartaoIA: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    paddingBottom: 10,
    paddingRight: 35
  },

  tituloRaca: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F86F03',
    marginLeft: 10,
    flex: 1
  },

  textoInfoIA: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8
  },

  labelIA: {
    fontWeight: 'bold'
  },

  dicaIA: {
    padding: 12,
    borderRadius: 12,
    marginTop: 10
  },

  textoDicaIA: {
    color: '#4F7FFF',
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: 'bold'
  },

  cabecalhoPets: {
    marginTop: 10,
    marginBottom: 10
  },

  areaCarregandoPets: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25
  },

  cartaoAdicionarPet: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    padding: 15,
    marginRight: 15,
    borderWidth: 2,
    width: 110,
    height: 140,
    borderStyle: 'dashed'
  },

  iconeAdicionarFundo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },

  textoAdicionarPet: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F86F03',
    textAlign: 'center'
  },

  cartaoPet: {
    alignItems: 'center',
    borderRadius: 25,
    padding: 15,
    marginRight: 15,
    borderWidth: 2,
    width: 110,
    height: 140
  },

  imagemPet: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#4F7FFF',
    marginBottom: 10
  },

  nomePet: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center'
  },

  areaVaziaPets: {
    justifyContent: 'center',
    paddingHorizontal: 20
  },

  textoVazioPets: {
    color: '#AAA',
    fontStyle: 'italic',
    fontSize: 16
  },

  botaoEmergencia: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    backgroundColor: '#D32F2F',
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#D32F2F',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    zIndex: 15
  }
});