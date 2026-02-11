import React, { useState, useEffect, useCallback } from "react";
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
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DismissKeyboard from "@/components/DismissKeyboard";
import Header from "@/components/Header";
import Input from "@/components/Input";
import Button from "@/components/Button";
import SelectModal from "@/components/SelectModal";
import { colors } from "@/theme/colors";
import { fonts } from "@/theme/fonts";
import { Usuario, Genero } from "@/types/auth";
import {
  obterUsuarioAtual,
  atualizarPerfil,
} from "@/services/auth";
import { supabase } from "@/utils/supabase";
import { SafeAreaView } from "react-native-safe-area-context";

const GENEROS: { valor: Genero; label: string }[] = [
  { valor: "mulher_trans", label: "Mulher Trans" },
  { valor: "homem_trans", label: "Homem Trans" },
  { valor: "nao_binario", label: "Não Binário" },
  { valor: "outro", label: "Outro" },
];

const generoParaLabel = (genero: Genero | null): string => {
  const item = GENEROS.find((g) => g.valor === genero);
  return item?.label || "";
};

const labelParaGenero = (label: string): Genero | undefined => {
  const item = GENEROS.find((g) => g.label === label);
  return item?.valor;
};

export default function EditarPerfilScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Campos compartilhados
  const [nome, setNome] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  // Campos pessoa_trans
  const [bio, setBio] = useState("");
  const [genero, setGenero] = useState<Genero>("mulher_trans");
  const [showGeneroModal, setShowGeneroModal] = useState(false);

  // Campos psicologo
  const [crp, setCrp] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [anosExperiencia, setAnosExperiencia] = useState("");
  const [especialidadesArray, setEspecialidadesArray] = useState<string[]>([]);
  const [novaEspecialidade, setNovaEspecialidade] = useState("");
  const [showEspecialidadeModal, setShowEspecialidadeModal] = useState(false);
  const [psicologoData, setPsicologoData] = useState<any | null>(null);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      const usuarioAtual = await obterUsuarioAtual();
      if (usuarioAtual) {
        setUsuario(usuarioAtual);
        setNome(usuarioAtual.nome || "");
        setFotoUrl(usuarioAtual.foto_url);

        // Campos pessoa_trans
        if (usuarioAtual.tipo === "pessoa_trans") {
          setBio(usuarioAtual.bio || "");
          setGenero(usuarioAtual.genero || "mulher_trans");
        }

        // Campos psicologo
        if (usuarioAtual.tipo === "psicologo" && usuarioAtual.psicologo) {
          const psico = usuarioAtual.psicologo;
          setPsicologoData(psico);
          setCrp(psico.crp || "");
          setTitulo(psico.titulo || "");
          setDescricao(psico.descricao || "");
          setAnosExperiencia(psico.anos_experiencia?.toString() || "");
          setEspecialidadesArray(
            Array.isArray(psico.especialidades) ? psico.especialidades : [],
          );
        }
      }
      setCarregando(false);
    };
    carregar();
  }, []);

  const incrementarExperiencia = () => {
    const valor = parseInt(anosExperiencia || "0", 10);
    setAnosExperiencia((valor + 1).toString());
  };

  const decrementarExperiencia = () => {
    const valor = parseInt(anosExperiencia || "0", 10);
    if (valor > 0) {
      setAnosExperiencia((valor - 1).toString());
    }
  };

  const adicionarEspecialidade = () => {
    if (novaEspecialidade.trim()) {
      setEspecialidadesArray([
        ...especialidadesArray,
        novaEspecialidade.trim(),
      ]);
      setNovaEspecialidade("");
      setShowEspecialidadeModal(false);
    }
  };

  const removerEspecialidade = (index: number) => {
    setEspecialidadesArray(especialidadesArray.filter((_, i) => i !== index));
  };

  const handleSalvarPessoaTrans = useCallback(async () => {
    if (!usuario) return;

    if (!nome.trim()) {
      Alert.alert("Erro", "O nome não pode estar vazio.");
      return;
    }

    const resultado = await atualizarPerfil(usuario.id, {
      nome: nome.trim(),
      bio: bio.trim() || null,
      genero,
    });

    if (resultado.sucesso) {
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      Alert.alert("Erro", resultado.erro || "Não foi possível salvar.");
    }
  }, [usuario, nome, bio, genero, router]);

  const handleSalvarPsicologo = useCallback(async () => {
    if (!usuario || !psicologoData) return;

    if (!nome.trim()) {
      Alert.alert("Erro", "O nome não pode estar vazio.");
      return;
    }

    if (!crp.trim()) {
      Alert.alert("Erro", "O CRP não pode estar vazio.");
      return;
    }

    setSalvando(true);

    try {
      // Atualizar perfil base
      const resultadoPerfil = await atualizarPerfil(usuario.id, {
        nome: nome.trim(),
      });

      if (!resultadoPerfil.sucesso) {
        Alert.alert("Erro", resultadoPerfil.erro || "Erro ao atualizar perfil");
        setSalvando(false);
        return;
      }

      // Atualizar dados do psicólogo
      const { error } = await supabase
        .from("psicologos")
        .update({
          crp: crp.trim(),
          titulo: titulo.trim() || null,
          descricao: descricao.trim() || null,
          especialidades:
            especialidadesArray.length > 0 ? especialidadesArray : null,
          anos_experiencia: anosExperiencia
            ? parseInt(anosExperiencia, 10)
            : null,
        })
        .eq("usuario_id", usuario.id);

      setSalvando(false);

      if (error) {
        Alert.alert(
          "Erro",
          error.message || "Não foi possível atualizar dados de psicólogo.",
        );
      } else {
        Alert.alert("Sucesso", "Perfil atualizado com sucesso!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (e) {
      setSalvando(false);
      Alert.alert("Erro", "Erro inesperado ao salvar.");
      console.error(e);
    }
  }, [
    usuario,
    psicologoData,
    nome,
    crp,
    titulo,
    descricao,
    especialidadesArray,
    anosExperiencia,
    router,
  ]);

  const handleSalvar = () => {
    if (usuario?.tipo === "pessoa_trans") {
      handleSalvarPessoaTrans();
    } else if (usuario?.tipo === "psicologo") {
      handleSalvarPsicologo();
    }
  };

  const getIniciais = (nomeStr: string) => {
    return nomeStr
      .split(" ")
      .map((n) => n[0])
      .join("")
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
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
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
              <View style={styles.fotoContainer}>
                {fotoUrl ? (
                  <Image source={{ uri: fotoUrl }} style={styles.foto} />
                ) : (
                  <View style={[styles.foto, styles.fotoPlaceholder]}>
                    <Text style={styles.fotoIniciais}>
                      {getIniciais(nome || "U")}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Nome (compartilhado) */}
            <View style={styles.campoContainer}>
              <Text style={styles.campoLabel}>NOME COMPLETO</Text>
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Campos pessoa_trans */}
            {usuario?.tipo === "pessoa_trans" && (
              <>
                <View style={styles.campoContainer}>
                  <Text style={styles.campoLabel}>BIO</Text>
                  <TextInput
                    style={[styles.input, styles.bioInput]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Conte um pouco sobre você..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    maxLength={300}
                    textAlignVertical="top"
                  />
                  <Text style={styles.contadorCaracteres}>
                    {bio.length}/300
                  </Text>
                </View>

                <View style={styles.campoContainer}>
                  <Text style={styles.campoLabel}>GÊNERO</Text>
                  <TouchableOpacity
                    style={styles.seletorGenero}
                    onPress={() => setShowGeneroModal(true)}
                  >
                    <Text style={styles.seletorGeneroTexto}>
                      {generoParaLabel(genero) || "Selecionar"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <SelectModal
                  visible={showGeneroModal}
                  title="Selecionar Gênero"
                  options={GENEROS.map((g) => g.label)}
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
            {usuario?.tipo === "psicologo" && (
              <>
                <View style={styles.campoContainer}>
                  <Text style={styles.campoLabel}>CRP</Text>
                  <TextInput
                    style={styles.input}
                    value={crp}
                    onChangeText={setCrp}
                    placeholder="06/123456"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.campoContainer}>
                  <Text style={styles.campoLabel}>BIO/SOBRE MIM</Text>
                  <TextInput
                    style={[styles.input, styles.bioInput]}
                    value={descricao}
                    onChangeText={setDescricao}
                    placeholder="Fale sobre sua experiência e abordagem..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={6}
                    maxLength={500}
                    textAlignVertical="top"
                  />
                  <Text style={styles.contadorCaracteres}>
                    {descricao.length}/500
                  </Text>
                </View>

                <View style={styles.campoContainer}>
                  <Text style={styles.campoLabel}>ESTATÍSTICAS</Text>
                  <View style={styles.secaoEstatisticas}>
                    <View style={styles.experienciaContainer}>
                      <Text style={styles.experienciaLabel}>
                        Experiência (anos)
                      </Text>
                      <View style={styles.experienciaControles}>
                        <TouchableOpacity
                          style={styles.botaoExperiencia}
                          onPress={decrementarExperiencia}
                        >
                          <Text style={styles.botaoExperienciaTexto}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.experienciaValor}>
                          {anosExperiencia || "0"}
                        </Text>
                        <TouchableOpacity
                          style={styles.botaoExperiencia}
                          onPress={incrementarExperiencia}
                        >
                          <Text style={styles.botaoExperienciaTexto}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.campoContainer}>
                  <View style={styles.especialidadesHeader}>
                    <Text style={styles.campoLabel}>ESPECIALIDADES</Text>
                    <TouchableOpacity
                      onPress={() => setShowEspecialidadeModal(true)}
                    >
                      <Ionicons
                        name="add-circle"
                        size={28}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.tagsContainer}>
                    {especialidadesArray.map((especialidade, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{especialidade}</Text>
                        <TouchableOpacity
                          onPress={() => removerEspecialidade(index)}
                        >
                          <Ionicons
                            name="close-circle"
                            size={18}
                            color={colors.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
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

          {/* Modal de Especialidade */}
          <Modal
            visible={showEspecialidadeModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowEspecialidadeModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitulo}>Adicionar Especialidade</Text>

                <TextInput
                  style={styles.modalInput}
                  value={novaEspecialidade}
                  onChangeText={setNovaEspecialidade}
                  placeholder="Digite a especialidade"
                  placeholderTextColor="#9CA3AF"
                  autoFocus
                />

                <View style={styles.modalBotoes}>
                  <TouchableOpacity
                    style={[styles.modalBotao, styles.modalBotaoCancelar]}
                    onPress={() => {
                      setNovaEspecialidade("");
                      setShowEspecialidadeModal(false);
                    }}
                  >
                    <Text style={styles.modalBotaoCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBotao, styles.modalBotaoAdicionar]}
                    onPress={adicionarEspecialidade}
                  >
                    <Text style={styles.modalBotaoAdicionarTexto}>
                      Adicionar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  fotoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  fotoContainer: {
    position: "relative",
    marginBottom: 12,
  },
  foto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  fotoPlaceholder: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  fotoIniciais: {
    fontFamily: fonts.bold,
    fontSize: 40,
    color: colors.white,
  },
  fotoTexto: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.primary,
  },
  campoContainer: {
    marginBottom: 20,
  },
  campoLabel: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: "#6B7280",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.text,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bioInput: {
    minHeight: 120,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  contadorCaracteres: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 4,
  },
  seletorGenero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  seletorGeneroTexto: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  secaoEstatisticas: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  experienciaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  experienciaLabel: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  experienciaControles: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  botaoExperiencia: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoExperienciaTexto: {
    fontSize: 20,
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
  experienciaValor: {
    fontSize: 18,
    fontFamily: fonts.semibold,
    color: colors.text,
    minWidth: 30,
    textAlign: "center",
  },
  especialidadesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFF5F7",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FECDD3",
  },
  tagText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.primary,
  },
  botaoContainer: {
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitulo: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.text,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  modalBotoes: {
    flexDirection: "row",
    gap: 12,
  },
  modalBotao: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalBotaoCancelar: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalBotaoCancelarTexto: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  modalBotaoAdicionar: {
    backgroundColor: colors.primary,
  },
  modalBotaoAdicionarTexto: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.white,
  },
});


