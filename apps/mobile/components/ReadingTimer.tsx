import Slider from '@react-native-community/slider';
import {
  CloudRain,
  Coffee,
  Library,
  Pause,
  Play,
  RotateCcw,
  Square,
  Timer as TimerIcon,
  Volume2,
} from 'lucide-react-native';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Tokens';
import { Text, useThemeColor, View } from './Themed';

// Safely import Audio
let Audio: any = null;

try {
  Audio = require('expo-av').Audio;
} catch (e) {
  console.warn('Expo AV not found or not supported in this environment');
}

interface ReadingTimerProps {
  onStop?: (minutes: number) => void;
}

const SOUNDS = {
  rain: 'https://actions.google.com/sounds/v1/water/rain_on_roof.ogg',
  cafe: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
  library: 'https://actions.google.com/sounds/v1/ambiences/office_ambience.ogg',
};

export function ReadingTimer({ onStop }: ReadingTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [soundObject, setSoundObject] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useSharedValue(1);

  const themePrimary = useThemeColor({}, 'primary');
  const themeMuted = useThemeColor({}, 'mutedForeground');
  const themeBorder = useThemeColor({}, 'border');
  const themeDanger = useThemeColor({}, 'danger');

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
      pulseAnim.value = 1;
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (seconds > 0) {
        pulseAnim.value = withRepeat(
          withSequence(
            withTiming(0.8, {
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, seconds, pulseAnim]);

  useEffect(() => {
    const manageSound = async () => {
      if (soundObject) {
        await soundObject.unloadAsync();
        setSoundObject(null);
      }

      if (isActive && currentSound) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: SOUNDS[soundKeyToRef(currentSound)] },
            { shouldPlay: true, isLooping: true, volume }
          );
          setSoundObject(sound);
        } catch (error) {
          console.error('Error playing sound:', error);
        }
      }
    };

    const soundKeyToRef = (key: string): keyof typeof SOUNDS =>
      key as keyof typeof SOUNDS;

    manageSound();

    return () => {
      if (soundObject) {
        soundObject.unloadAsync();
      }
    };
  }, [isActive, currentSound, volume]); // Added volume as dependency to update sound on volume change if needed, but better to use setVolumeAsync below

  useEffect(() => {
    if (soundObject) {
      soundObject.setVolumeAsync(volume);
    }
  }, [volume, soundObject]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);
  const handleStop = () => {
    setIsActive(false);
    const minutes = Math.max(1, Math.round(seconds / 60));
    if (onStop) onStop(minutes);
  };
  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const toggleSound = (soundKey: string) => {
    setCurrentSound(currentSound === soundKey ? null : soundKey);
  };

  const animatedTimerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: isActive ? 1 : 0.8,
  }));

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.timerCard, { borderColor: themeBorder }]}>
        <View style={styles.header}>
          <TimerIcon size={20} color={themePrimary} />
          <Text style={[styles.headerText, { color: themePrimary }]}>
            Timer de Leitura
          </Text>
        </View>

        <Animated.View style={[styles.timerDisplay, animatedTimerStyle]}>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        </Animated.View>

        <View style={styles.controls}>
          {!isActive ? (
            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: themePrimary }]}
              onPress={handleStart}
            >
              <Play size={28} color="#FFF" fill="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.mainButton,
                {
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderColor: themePrimary,
                },
              ]}
              onPress={handlePause}
            >
              <Pause size={28} color={themePrimary} fill={themePrimary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.stopButton, { borderColor: themeDanger + '80' }]}
            onPress={handleStop}
            disabled={seconds === 0}
          >
            <Square size={24} color={themeDanger} fill={themeDanger} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <RotateCcw size={20} color={themeMuted} />
          </TouchableOpacity>
        </View>

        {seconds > 0 && !isActive && (
          <Text style={[styles.pausedHint, { color: themeMuted }]}>
            Pausado. Clique no quadrado para salvar{' '}
            {Math.max(1, Math.round(seconds / 60))} min.
          </Text>
        )}

        <View
          style={[
            styles.divider,
            { backgroundColor: themeBorder, borderStyle: 'dashed' },
          ]}
        />

        <View style={styles.ambientSection}>
          <View style={styles.ambientHeader}>
            <Text style={[styles.sectionTitle, { color: themeMuted }]}>
              AMBIENTE
            </Text>
            <View style={styles.volumeContainer}>
              <Volume2 size={14} color={themeMuted} />
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                step={0.01}
                value={volume}
                onValueChange={setVolume}
                minimumTrackTintColor={themePrimary}
                maximumTrackTintColor={themeBorder}
                thumbTintColor={themePrimary}
              />
            </View>
          </View>

          <View style={styles.soundGrid}>
            <SoundButton
              label="Chuva"
              icon={
                <CloudRain
                  size={20}
                  color={currentSound === 'rain' ? themePrimary : themeMuted}
                />
              }
              active={currentSound === 'rain'}
              onPress={() => toggleSound('rain')}
              themePrimary={themePrimary}
              themeBorder={themeBorder}
            />
            <SoundButton
              label="Café"
              icon={
                <Coffee
                  size={20}
                  color={currentSound === 'cafe' ? themePrimary : themeMuted}
                />
              }
              active={currentSound === 'cafe'}
              onPress={() => toggleSound('cafe')}
              themePrimary={themePrimary}
              themeBorder={themeBorder}
            />
            <SoundButton
              label="Foco"
              icon={
                <Library
                  size={20}
                  color={currentSound === 'library' ? themePrimary : themeMuted}
                />
              }
              active={currentSound === 'library'}
              onPress={() => toggleSound('library')}
              themePrimary={themePrimary}
              themeBorder={themeBorder}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

interface SoundButtonProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
  themePrimary: string;
  themeBorder: string;
}

function SoundButton({
  label,
  icon,
  active,
  onPress,
  themePrimary,
  themeBorder,
}: SoundButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.soundButton,
        {
          borderColor: active ? themePrimary : themeBorder,
          backgroundColor: active ? themePrimary + '1A' : 'transparent',
        },
      ]}
      onPress={onPress}
    >
      {icon}
      <Text
        style={[
          styles.soundLabel,
          { color: active ? themePrimary : Colors.light.mutedForeground },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  timerCard: {
    width: '100%',
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginLeft: Spacing.sm,
  },
  timerDisplay: {
    marginBottom: Spacing.xl,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: -2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  mainButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pausedHint: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: Spacing.lg,
  },
  ambientSection: {
    width: '100%',
  },
  ambientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  slider: {
    width: 100,
    height: 40,
    marginLeft: Spacing.xs,
  },
  soundGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  soundButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  soundLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
