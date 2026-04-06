// src/screens/KeyboardScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  errorCodes,
  isErrorWithCode,
  pick,
  types as documentTypes,
} from '@react-native-documents/picker';
import { KeyboardButton } from '../components/KeyboardButton';
import { useThemeManager } from '../theme/ThemeManager';
import {
  buildAndroidKeyboardConfig,
  loadAndroidKeyboardConfig,
  saveAndroidKeyboardConfig,
  type AndroidKeyboardConfig,
  type AndroidKeyboardKeyConfig,
  type AndroidKeyboardModeId,
} from '../keyboardConfig';
import {
  applyKeyboardAction,
  defaultRuntimeState,
  type KeyboardRuntimeState,
} from '../keyboardCore';
import {
  appendSnippet,
  buildAudioSnippet,
  buildPhotoSnippet,
  detectMediaCapabilities,
  MEDIA_CONSENT_KEY,
  type FieldType,
  type TargetApp,
} from '../mediaFlow';

const SUPPORTED_LANGUAGES = ['EN', 'PT', 'ES'] as const;
const TARGET_APPS: TargetApp[] = ['whatsapp', 'gmail', 'notes', 'browser'];
const FIELD_TYPES: FieldType[] = ['plainText', 'richContent'];
const MODE_LABELS: Record<AndroidKeyboardModeId, string> = {
  qwerty: 'QWERTY',
  numbers: '123',
  words: 'Words',
  photos: 'Photos',
  audio: 'Audio',
};

export default function KeyboardScreen() {
  const { theme, themeName, toggleTheme } = useThemeManager();

  const [previewConfig, setPreviewConfig] = useState<AndroidKeyboardConfig | null>(null);
  const [runtimeState, setRuntimeState] = useState<KeyboardRuntimeState>(
    defaultRuntimeState,
  );
  const [saveState, setSaveState] = useState('Syncing Android config...');
  const [lastKeyLatencyMs, setLastKeyLatencyMs] = useState(0);
  const [mediaConsent, setMediaConsent] = useState(false);
  const [targetAppIndex, setTargetAppIndex] = useState(0);
  const [fieldTypeIndex, setFieldTypeIndex] = useState(0);

  const currentConfig = useMemo(
    () =>
      buildAndroidKeyboardConfig({
        themeName,
        layoutId: 'multiMode',
      }),
    [themeName],
  );

  const activeTargetApp = TARGET_APPS[targetAppIndex];
  const activeFieldType = FIELD_TYPES[fieldTypeIndex];
  const platformId = Platform.OS === 'ios' ? 'ios' : 'android';

  const capabilities = useMemo(
    () => detectMediaCapabilities(platformId, activeTargetApp, activeFieldType),
    [activeFieldType, activeTargetApp, platformId],
  );

  const syncAndroidConfig = useCallback(async () => {
    try {
      await saveAndroidKeyboardConfig(currentConfig);
      setSaveState('Android config synced from TSX.');
    } catch {
      setSaveState('Failed to save Android config.');
    }
  }, [currentConfig]);

  const loadAndroidPreview = useCallback(async () => {
    try {
      const { config, usedFallback } = await loadAndroidKeyboardConfig();
      setPreviewConfig(config);
      setRuntimeState(current => ({
        ...current,
        activeMode: config.defaultMode,
      }));

      if (usedFallback) {
        Alert.alert(
          'Fallback carregado',
          'A configuração armazenada estava ausente ou corrompida.',
        );
      }
    } catch {
      Alert.alert('Read error', 'Could not load Android keyboard config.');
    }
  }, []);

  useEffect(() => {
    void syncAndroidConfig();
  }, [syncAndroidConfig]);

  useEffect(() => {
    void loadAndroidPreview();
  }, [loadAndroidPreview]);

  useEffect(() => {
    const loadConsent = async () => {
      const value = await AsyncStorage.getItem(MEDIA_CONSENT_KEY);
      setMediaConsent(value === 'granted');
    };

    void loadConsent();
  }, []);

  const toggleTargetApp = () => {
    setTargetAppIndex(current => (current + 1) % TARGET_APPS.length);
  };

  const toggleFieldType = () => {
    setFieldTypeIndex(current => (current + 1) % FIELD_TYPES.length);
  };

  const insertMediaSnippet = (snippet: string) => {
    setRuntimeState(current => ({
      ...current,
      textBuffer: appendSnippet(current.textBuffer, snippet),
      isShiftEnabled: false,
    }));
  };

  const ensureMediaConsent = (): boolean => {
    if (mediaConsent) {
      return true;
    }

    Alert.alert(
      'Media consent required',
      'Enable media helper consent first. Media is sent as text snippets, not direct files.',
    );
    return false;
  };

  const pickPhotoFromLibrary = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (result.didCancel || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    const snippet = buildPhotoSnippet(asset.fileName ?? asset.uri ?? 'photo');
    insertMediaSnippet(snippet);

    const guidance = capabilities.canDirectImage
      ? 'Target may support direct image insertion; snippet fallback inserted for reliability.'
      : capabilities.fallbackReason;

    Alert.alert('Photo helper', guidance);
  };

  const capturePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      saveToPhotos: false,
    });

    if (result.didCancel || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    const snippet = buildPhotoSnippet(asset.fileName ?? asset.uri ?? 'captured-photo');
    insertMediaSnippet(snippet);

    Alert.alert('Photo helper', capabilities.fallbackReason);
  };

  const handlePhotoFlow = async () => {
    if (!ensureMediaConsent()) {
      return;
    }

    Alert.alert('Photo helper', 'Choose photo source', [
      {
        text: 'Gallery',
        onPress: () => {
          void pickPhotoFromLibrary();
        },
      },
      {
        text: 'Camera',
        onPress: () => {
          void capturePhoto();
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const pickAudioFile = async () => {
    try {
      const files = await pick({ type: [documentTypes.audio] });
      const selected = files[0];
      const snippet = buildAudioSnippet(selected.name ?? selected.uri);
      insertMediaSnippet(snippet);
      Alert.alert('Audio helper', capabilities.fallbackReason);
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
        return;
      }

      Alert.alert('Audio helper', 'Unable to pick audio file.');
    }
  };

  const simulateAudioRecording = () => {
    const fakeUri =
      Platform.OS === 'ios'
        ? `file:///tmp/record-${Date.now()}.m4a`
        : `file:///storage/emulated/0/Recordings/record-${Date.now()}.m4a`;

    const snippet = buildAudioSnippet(fakeUri);
    insertMediaSnippet(snippet);
    Alert.alert('Audio helper', capabilities.fallbackReason);
  };

  const handleAudioFlow = () => {
    if (!ensureMediaConsent()) {
      return;
    }

    Alert.alert('Audio helper', 'Choose audio source', [
      {
        text: 'Pick file',
        onPress: () => {
          void pickAudioFile();
        },
      },
      {
        text: 'Simulate record',
        onPress: simulateAudioRecording,
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleKeyPress = (key: AndroidKeyboardKeyConfig) => {
    const started = Date.now();
    const result = applyKeyboardAction(runtimeState, key, SUPPORTED_LANGUAGES.length);
    setRuntimeState(result.state);

    if (result.sideEffect === 'photo') {
      void handlePhotoFlow();
    }

    if (result.sideEffect === 'audio') {
      handleAudioFlow();
    }

    const ended = Date.now();
    setLastKeyLatencyMs(Math.round(ended - started));
  };

  const grantMediaConsent = async () => {
    await AsyncStorage.setItem(MEDIA_CONSENT_KEY, 'granted');
    setMediaConsent(true);
  };

  const revokeMediaConsent = async () => {
    await AsyncStorage.setItem(MEDIA_CONSENT_KEY, 'denied');
    setMediaConsent(false);
  };

  const resetTextBuffer = () => {
    setRuntimeState(current => ({
      ...current,
      textBuffer: '',
      isShiftEnabled: false,
      isCapsLockEnabled: false,
    }));
  };

  const activeLanguage = SUPPORTED_LANGUAGES[runtimeState.activeLanguageIndex] ?? 'EN';
  const activeModeLabel = MODE_LABELS[runtimeState.activeMode] ?? 'QWERTY';
  const visibleRows =
    previewConfig?.modes[runtimeState.activeMode] ??
    previewConfig?.modes[previewConfig.defaultMode] ??
    [];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}> 
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={theme.secondaryButtonStyle}
          onPress={toggleTheme}
          accessibilityRole="button"
          accessibilityLabel="Toggle theme"
        >
          <Text style={theme.secondaryButtonTextStyle}>
            Theme: {themeName} (switch to {themeName === 'light' ? 'dark' : 'light'})
          </Text>
        </TouchableOpacity>

        <KeyboardButton
          label={`Target app: ${activeTargetApp}`}
          onPress={toggleTargetApp}
          buttonStyle={theme.buttonStyle}
          textStyle={theme.buttonTextStyle}
        />

        <KeyboardButton
          label={`Field: ${activeFieldType}`}
          onPress={toggleFieldType}
          buttonStyle={theme.buttonStyle}
          textStyle={theme.buttonTextStyle}
        />

        <KeyboardButton
          label="Reload Parsed Config"
          onPress={() => {
            void loadAndroidPreview();
          }}
          buttonStyle={theme.buttonStyle}
          textStyle={theme.buttonTextStyle}
        />

        <View
          style={[
            styles.guidanceContainer,
            {
              borderColor: previewConfig?.theme.keyBorderColor ?? '#6B7280',
              backgroundColor: previewConfig?.theme.backgroundColor ?? theme.backgroundColor,
            },
          ]}
        >
        <Text style={[styles.guidanceTitle, { color: previewConfig?.theme.textColor ?? theme.textColor }]}> 
          Keyboard mode: {activeModeLabel}
        </Text>
        <Text style={[styles.statusText, { color: previewConfig?.theme.textColor ?? theme.textColor }]}> 
          Tap ABC, Words, Photos, or Audio in the bottom row to switch instantly.
        </Text>
        <Text style={[styles.statusText, { color: previewConfig?.theme.textColor ?? theme.textColor }]}> 
          Direct image support: {capabilities.canDirectImage ? 'Maybe' : 'No'} | Direct audio support: {capabilities.canDirectAudio ? 'Yes' : 'No'}
        </Text>
        <Text style={[styles.statusText, { color: previewConfig?.theme.textColor ?? theme.textColor }]}> 
          {capabilities.fallbackReason}
        </Text>

        {!mediaConsent ? (
          <>
            <Text style={[styles.statusText, { color: previewConfig?.theme.textColor ?? theme.textColor }]}> 
              Consent required: media keys will open helper flows and insert text snippets only.
            </Text>
            {Platform.OS === 'ios' ? (
              <Text style={[styles.statusText, { color: previewConfig?.theme.textColor ?? theme.textColor }]}> 
                iOS note: Full Access may be needed for advanced helper flows. Never use direct media insert assumptions.
              </Text>
            ) : null}
            <KeyboardButton
              label="Grant Media Consent"
              onPress={() => {
                void grantMediaConsent();
              }}
              buttonStyle={theme.buttonStyle}
              textStyle={theme.buttonTextStyle}
            />
          </>
        ) : (
          <KeyboardButton
            label="Revoke Media Consent"
            onPress={() => {
              void revokeMediaConsent();
            }}
            buttonStyle={theme.buttonStyle}
            textStyle={theme.buttonTextStyle}
          />
        )}
        </View>

        <View
          style={[
            styles.textBufferContainer,
            {
              borderColor: previewConfig?.theme.keyBorderColor ?? '#6B7280',
              backgroundColor: previewConfig?.theme.backgroundColor ?? theme.backgroundColor,
            },
          ]}
        >
        <Text style={[styles.textBufferTitle, { color: previewConfig?.theme.textColor ?? theme.textColor }]}> 
          Input buffer preview
        </Text>
        <Text style={[styles.textBufferValue, { color: previewConfig?.theme.textColor ?? theme.textColor }]}> 
          {runtimeState.textBuffer || '<empty>'}
        </Text>

        <View style={styles.statusRow}>
          <Text style={[styles.statusText, { color: previewConfig?.theme.textColor ?? theme.textColor }]}> 
            Mode: {activeModeLabel}
          </Text>
          <Text style={[styles.statusText, { color: previewConfig?.theme.textColor ?? theme.textColor }]}> 
            Shift: {runtimeState.isShiftEnabled ? 'ON' : 'OFF'}
          </Text>
          <Text style={[styles.statusText, { color: previewConfig?.theme.textColor ?? theme.textColor }]}> 
            Caps: {runtimeState.isCapsLockEnabled ? 'ON' : 'OFF'}
          </Text>
          <Text style={[styles.statusText, { color: previewConfig?.theme.textColor ?? theme.textColor }]}> 
            Lang: {activeLanguage}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={[styles.statusText, { color: previewConfig?.theme.textColor ?? theme.textColor }]}> 
            Save: {saveState} | Last key latency: {lastKeyLatencyMs}ms
          </Text>
        </View>

        <KeyboardButton
          label="Clear Text"
          onPress={resetTextBuffer}
          buttonStyle={theme.buttonStyle}
          textStyle={theme.buttonTextStyle}
        />
        </View>

        <View
          style={[
            styles.previewContainer,
            {
              backgroundColor: previewConfig?.theme.backgroundColor ?? theme.backgroundColor,
              borderColor: previewConfig?.theme.keyBorderColor ?? '#6B7280',
            },
          ]}
        >
        <Text style={[styles.previewTitle, { color: previewConfig?.theme.textColor ?? theme.textColor }]}> 
          Dynamic keys ({activeModeLabel} mode)
        </Text>

        {previewConfig ? (
          visibleRows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map(key => {
                const isShiftKey = key.actionType === 'shift' && runtimeState.isShiftEnabled;
                const isCapsKey =
                  key.actionType === 'capsLock' && runtimeState.isCapsLockEnabled;
                const isModeKey =
                  key.actionType === 'switchMode' && key.payload === runtimeState.activeMode;

                return (
                  <KeyboardButton
                    key={key.id}
                    label={key.label}
                    onPress={() => handleKeyPress(key)}
                    buttonStyle={[
                      styles.dynamicKey,
                      {
                        backgroundColor: previewConfig.theme.keyBackgroundColor,
                        borderColor: previewConfig.theme.keyBorderColor,
                      },
                      (isShiftKey || isCapsKey) && styles.activeToggleKey,
                      isModeKey && styles.activeModeKey,
                    ]}
                    textStyle={{ color: previewConfig.theme.keyTextColor }}
                  />
                );
              })}
            </View>
          ))
        ) : (
          <Text style={[styles.statusText, { color: theme.textColor }]}>No parsed Android config yet.</Text>
        )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 32,
    justifyContent: 'flex-start',
  },
  guidanceContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  guidanceTitle: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  textBufferContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  textBufferTitle: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
  textBufferValue: {
    marginTop: 8,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 15,
    minHeight: 40,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  statusText: {
    fontSize: 12,
    marginHorizontal: 6,
    marginBottom: 6,
    textAlign: 'center',
  },
  previewContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  previewTitle: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  dynamicKey: {
    minWidth: 72,
    marginHorizontal: 4,
    marginVertical: 4,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  activeToggleKey: {
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },
  activeModeKey: {
    borderWidth: 3,
    transform: [{ scale: 1.03 }],
  },
});

