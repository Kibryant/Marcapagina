import type { Profile } from '@marcapagina/shared';
import { useRouter } from 'expo-router';
import { Bell, LogOut, User } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useThemeContext } from '@/components/AppThemeProvider';
import { Text, View } from '@/components/Themed';
import { AnimatedHeaderPage } from '@/components/ui/AnimatedHeaderPage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Tokens';
import { supabase } from '@/lib/supabase';

export default function ConfigScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [goalPages, setGoalPages] = useState('20');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const { colorScheme } = useThemeContext();
  const theme = Colors[colorScheme];
  const { themePreference, setThemePreference, syncThemeWithSupabase } =
    useThemeContext();

  const fetchProfile = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
        setGoalPages(data.goal_pages_per_day?.toString() || '20');

        if (data.theme) {
          syncThemeWithSupabase(data.theme);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [syncThemeWithSupabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setSaving(true);

    try {
      const parsedGoal = parseInt(goalPages, 10);
      if (Number.isNaN(parsedGoal) || parsedGoal <= 0) {
        throw new Error(
          'A meta de páginas deve ser um número válido maior que zero.'
        );
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          goal_pages_per_day: parsedGoal,
        })
        .eq('id', profile.id);

      if (error) throw error;
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <AnimatedHeaderPage
        title="Configurações"
        subtitle="Gerencie sua conta e preferências"
      >
        <View
          style={[
            styles.section,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <User size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Perfil
            </Text>
          </View>

          <Input
            label="Nome de Exibição"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Seu nome"
          />

          <Input
            label="Meta Diária de Leitura (Páginas)"
            value={goalPages}
            onChangeText={setGoalPages}
            keyboardType="numeric"
            placeholder="Ex: 20"
          />

          <Button
            title="Salvar Alterações"
            onPress={handleUpdateProfile}
            loading={saving}
            style={styles.saveButton}
          />
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Bell size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Preferências
            </Text>
          </View>
          <Text style={[styles.label, { color: theme.text }]}>
            Tema do Aplicativo
          </Text>
          <View style={styles.themeRow}>
            <Button
              title="Sistema"
              variant={themePreference === 'system' ? 'primary' : 'outline'}
              onPress={() => setThemePreference('system')}
              style={styles.themeButton}
              size="sm"
            />
            <Button
              title="Claro"
              variant={themePreference === 'light' ? 'primary' : 'outline'}
              onPress={() => setThemePreference('light')}
              style={styles.themeButton}
              size="sm"
            />
            <Button
              title="Escuro"
              variant={themePreference === 'dark' ? 'primary' : 'outline'}
              onPress={() => setThemePreference('dark')}
              style={styles.themeButton}
              size="sm"
            />
          </View>
        </View>

        <View style={styles.dangerZone}>
          <Button
            title="Sair da Conta"
            variant="danger"
            icon={<LogOut size={20} color={theme.text} />}
            onPress={handleSignOut}
          />
        </View>
      </AnimatedHeaderPage>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: FontSize.lg,
    marginTop: 4,
  },
  section: {
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  saveButton: {
    marginTop: Spacing.sm,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  themeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  themeButton: {
    flex: 1,
  },
  placeholderText: {
    fontSize: FontSize.md,
    fontStyle: 'italic',
  },
  dangerZone: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
});
