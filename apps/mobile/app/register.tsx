import { useRouter } from 'expo-router';
import { ArrowLeft, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { Button } from '@/components/ui/Button';
import { FadeInView } from '@/components/ui/FadeInView';
import { Input } from '@/components/ui/Input';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontSize, Spacing } from '@/constants/Tokens';
import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  async function signUpWithEmail() {
    if (!email || !password || !displayName) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        Alert.alert('Erro no Cadastro', error.message);
      } else {
        Alert.alert(
          'Sucesso!',
          'Verifique seu e-mail para confirmar o cadastro.'
        );
        router.replace('/login');
      }
    } catch (e: any) {
      Alert.alert('Erro inesperado', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </Pressable>

        <FadeInView delay={0} duration={700}>
          <View style={styles.header}>
            <UserPlus size={48} color={theme.primary} />
            <Text style={[styles.title, { color: theme.text }]}>
              Nova Conta
            </Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              Comece a registrar sua evolução literária hoje mesmo.
            </Text>
          </View>
        </FadeInView>

        <FadeInView delay={200} duration={700}>
          <View style={styles.form}>
            <Input
              label="Nome"
              placeholder="Como quer ser chamado?"
              value={displayName}
              onChangeText={setDisplayName}
            />

            <Input
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Input
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Button
              title="Criar conta"
              onPress={signUpWithEmail}
              loading={loading}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.muted }]}>
                Já tem uma conta?
              </Text>
              <Button
                variant="ghost"
                title="Entrar"
                onPress={() => router.replace('/login')}
                size="sm"
              />
            </View>
          </View>
        </FadeInView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.lg,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    fontSize: FontSize.md,
  },
});
