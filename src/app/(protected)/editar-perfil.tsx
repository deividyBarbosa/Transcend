import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DismissKeyboard from '@/components/DismissKeyboard';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import SelectModal from '@/components/SelectModal';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { Usuario, Genero } from '@/types/auth';
import {
  obterUsuarioAtual,
  atualizarPerfil,
  uploadFotoPerfil,
} from '@/services/auth';
import { supabase } from '@/utils/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

const GENEROS: { valor: Genero; label: string }[] = [
  { valor: 'mulher_trans', label: 'Mulher Trans' },
  { valor: 'homem_trans', label: 'Homem Trans' },
  { valor: 'nao_binario', label: 'Não Binário' },
  { valor: 'outro', label: 'Outro' },
];

const generoParaLabel = (genero: Genero | null): string => {
  const item = GENEROS.find(g => g.valor === genero);
  return item?.label || '';
};

const labelParaGenero = (label: string): Genero | undefined => {
  const item = GENEROS.find(g => g.label === label);
  return item?.valor;
};

export default function EditarPerfilScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  // Campos compartilhados
  const [nome, setNome] = useState('');
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  // Campos pessoa_trans
  const [bio, setBio] = useState('');
  const [genero, setGenero] = useState<Genero>('mulher_trans');
  const [showGeneroModal, setShowGeneroModal] = useState(false);

  // Campos psicologo
  const [crp, setCrp] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [anosExperiencia, setAnosExperiencia] = useState('');
  const [especialidades, setEspecialidades] = useState('');
  const [psicologoData, setPsicologoData] = useState<any | null>(null);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      const usuarioAtual = await obterUsuarioAtual();
      if (usuarioAtual) {
        setUsuario(usuarioAtual);
        setNome(usuarioAtual.nome || '');
        setFotoUrl(usuarioAtual.foto_url);

        // Campos pessoa_trans
        if (usuarioAtual.tipo === 'pessoa_trans') {
          setBio(usuarioAtual.bio || '');
          setGenero(usuarioAtual.genero || 'mulher_trans');
        }

        // Campos psicologo
        if (usuarioAtual.tipo === 'psicologo' && usuarioAtual.psicologo) {
          const psico = usuarioAtual.psicologo;
          setPsicologoData(psico);
          setCrp(psico.crp || '');
          setTitulo(psico.titulo || '');
          setDescricao(psico.descricao || '');
          setAnosExperiencia(psico.anos_experiencia?.toString() || '');
          setEspecialidades(
            Array.isArray(psico.especialidades)
              ? psico.especialidades.join(', ')
              : ''
          );
        }
      }
      setCarregando(false);
    };
    carregar();
  }, []);

  const handleTrocarFoto = useCallback(async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua galeria para trocar a foto.'
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!resultado.canceled && resultado.assets[0] && usuario) {
      const asset = resultado.assets[0];
      setEnviandoFoto(true);

      const resultadoUpload = await uploadFotoPerfil(usuario.id, {
        uri: asset.uri,
        name: asset.fileName || `avatar_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      });

      if (resultadoUpload.sucesso && resultadoUpload.dados) {
        setFotoUrl(resultadoUpload.dados);
      } else {
        Alert.alert('Erro', resultadoUpload.erro || 'Falha ao enviar foto.');
      }

      setEnviandoFoto(false);
    }
  }, [usuario]);

  const handleSalvarPessoaTrans = useCallback(async () => {
    if (!usuario) return;

    if (!nome.trim()) {
      Alert.alert('Erro', 'O nome não pode estar vazio.');
      return;
    }

    const resultado = await atualizarPerfil(usuario.id, {
      nome: nome.trim(),
      bio: bio.trim() || null,
      genero,
    });

    if (resultado.sucesso) {
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Erro', resultado.erro || 'Não foi possível salvar.');
    }
  }, [usuario, nome, bio, genero, router]);

  const handleSalvarPsicologo = useCallback(async () => {
    if (!usuario || !psicologoData) return;

    if (!nome.trim()) {
      Alert.alert('Erro', 'O nome não pode estar vazio.');
      return;
    }

    if (!crp.trim()) {
      Alert.alert('Erro', 'O CRP não pode estar vazio.');
      return;
    }

    setSalvando(true);

    try {
      // Atualizar perfil base
      const resultadoPerfil = await atualizarPerfil(usuario.id, {
        nome: nome.trim(),
      });

      if (!resultadoPerfil.sucesso) {
        Alert.alert('Erro', resultadoPerfil.erro || 'Erro ao atualizar perfil');
        setSalvando(false);
        return;
      }

      // Atualizar dados do psicólogo
      const especialidadesArray = especialidades
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);

      const { error } = await supabase
        .from('psicologos')
        .update({
          crp: crp.trim(),
          titulo: titulo.trim() || null,
          descricao: descricao.trim() || null,
          especialidades: especialidadesArray.length > 0 ? especialidadesArray : null,
          anos_experiencia: anosExperiencia ? parseInt(anosExperiencia, 10) : null,
        })
        .eq('usuario_id', usuario.id);

      setSalvando(false);

      if (error) {
        Alert.alert('Erro', error.message || 'Não foi possível atualizar dados de psicólogo.');
      } else {
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (e) {
      setSalvando(false);
      Alert.alert('Erro', 'Erro inesperado ao salvar.');
      console.error(e);
    }
  }, [usuario, psicologoData, nome, crp, titulo, descricao, especialidades, anosExperiencia, router]);

  const handleSalvar = () => {
    if (usuario?.tipo === 'pessoa_trans') {
      handleSalvarPessoaTrans();
    } else if (usuario?.tipo === 'psicologo') {
      handleSalvarPsicologo();
    }
  };

  const getIniciais = (nomeStr: string) => {
    return nomeStr
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (carregando) {
    return (
      <View style={styles.container}>
        <Header title="Editar Perfil" showBackButton />
        <View style={styles.carregandoContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <DismissKeyboard>
        <View style={styles.container}>
          <Header title="Editar Perfil" showBackButton />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Foto de Perfil */}
            <View style={styles.fotoSection}>
              <TouchableOpacity
                style={styles.fotoContainer}
                onPress={handleTrocarFoto}
                disabled={enviandoFoto}
              >
                {fotoUrl ? (
                  <Image source={{ uri: fotoUrl }} style={styles.foto} />
                ) : (
                  <View style={[styles.foto, styles.fotoPlaceholder]}>
                    <Text style={styles.fotoIniciais}>
                      {getIniciais(nome || 'U')}
                    </Text>
                  </View>
                )}
                <View style={styles.fotoBadge}>
                  {enviandoFoto ? (
                    <ActivityIndicator size={14} color={colors.white} />
                  ) : (
                    <Ionicons name="camera" size={16} color={colors.white} />
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.fotoTexto}>Toque para alterar a foto</Text>
            </View>

            {/* Nome (compartilhado) */}
            <Input
              label="Nome"
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome"
            />

            {/* Campos pessoa_trans */}
            {usuario?.tipo === 'pessoa_trans' && (
              <>
                <View style={styles.campoContainer}>
                  <Text style={styles.campoLabel}>Bio</Text>
                  <TextInput
                    style={styles.bioInput}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Conte um pouco sobre você..."
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={4}
                    maxLength={300}
                    textAlignVertical="top"
                  />
                  <Text style={styles.contadorCaracteres}>{bio.length}/300</Text>
                </View>

                <View style={styles.campoContainer}>
                  <Text style={styles.campoLabel}>Gênero</Text>
                  <TouchableOpacity
                    style={styles.seletorGenero}
                    onPress={() => setShowGeneroModal(true)}
                  >
                    <Text style={styles.seletorGeneroTexto}>
                      {generoParaLabel(genero) || 'Selecionar'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={colors.muted} />
                  </TouchableOpacity>
                </View>

                <SelectModal
                  visible={showGeneroModal}
                  title="Selecionar Gênero"
                  options={GENEROS.map(g => g.label)}
                  selectedValue={generoParaLabel(genero)}
                  onSelect={(label) => {
                    const valor = labelParaGenero(label);
                    if (valor) setGenero(valor);
                    setShowGeneroModal(false);
                  }}
                  onClose={() => setShowGeneroModal(false)}
                  showEmptyOption={false}
                />
              </>
            )}

            {/* Campos psicologo */}
            {usuario?.tipo === 'psicologo' && (
              <>
                <Input
                  label="CRP"
                  value={crp}
                  onChangeText={setCrp}
                  placeholder="Seu número de CRP (ex: 06/12345)"
                />

                <Input
                  label="Título / Especialização"
                  value={titulo}
                  onChangeText={setTitulo}
                  placeholder="Ex: Psicólogo Clínico"
                />

                <View style={styles.campoContainer}>
                  <Text style={styles.campoLabel}>Descrição Profissional</Text>
                  <TextInput
                    style={styles.bioInput}
                    value={descricao}
                    onChangeText={setDescricao}
                    placeholder="Fale sobre sua experiência e abordagem..."
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    textAlignVertical="top"
                  />
                  <Text style={styles.contadorCaracteres}>{descricao.length}/500</Text>
                </View>

                <Input
                  label="Especialidades"
                  value={especialidades}
                  onChangeText={setEspecialidades}
                  placeholder="Ex: Ansiedade, Depressão, Identidade (separadas por vírgula)"
                  multiline
                  numberOfLines={3}
                />

                <Input
                  label="Anos de Experiência"
                  value={anosExperiencia}
                  onChangeText={setAnosExperiencia}
                  placeholder="Ex: 5"
                  keyboardType="numeric"
                />
              </>
            )}

            {/* Botão Salvar */}
            <View style={styles.botaoContainer}>
              <Button
                title="Salvar Alterações"
                onPress={handleSalvar}
                loading={salvando}
                disabled={salvando}
              />
            </View>
          </ScrollView>
        </View>
      </DismissKeyboard>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  carregandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  fotoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  fotoContainer: {
    position: 'relative',
  },
  foto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  fotoPlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fotoIniciais: {
    fontFamily: fonts.bold,
    fontSize: 36,
    color: colors.white,
  },
  fotoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  fotoTexto: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginTop: 8,
  },
  campoContainer: {
    marginBottom: 16,
  },
  campoLabel: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
    marginBottom: 8,
  },
  bioInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
    minHeight: 100,
  },
  contadorCaracteres: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'right',
    marginTop: 4,
  },
  seletorGenero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
  },
  seletorGeneroTexto: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  botaoContainer: {
    marginTop: 24,
  },
});
