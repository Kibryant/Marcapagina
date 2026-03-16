import { useRouter } from 'expo-router';
import { BookOpen } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Erro no Login', error.message);
      } else {
        router.replace('/(tabs)');
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
        <FadeInView delay={0} duration={700}>
          <View style={styles.header}>
            <BookOpen size={48} color={theme.primary} />
            <Text style={[styles.title, { color: theme.text }]}>
              Marcapágina
            </Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              Sua jornada de leitura, organizada e minimalista.
            </Text>
          </View>
        </FadeInView>

        <FadeInView delay={200} duration={700}>
          <View style={styles.form}>
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
              title="Entrar"
              onPress={signInWithEmail}
              loading={loading}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.muted }]}>
                Não tem uma conta?
              </Text>
              <Button
                variant="ghost"
                title="Cadastrar"
                onPress={() => router.push('/register')}
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
    justifyContent: 'center',
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
