import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import { AndroidKeyboardConfig } from './types';
import {
  getDefaultAndroidKeyboardConfig,
  parseAndroidKeyboardConfig,
} from './validateConfig';

export const ANDROID_IME_CONFIG_STORAGE_KEY =
  'android_ime_keyboard_config_v1';

interface ImeConfigBridgeNativeModule {
  saveKeyboardConfig: (configJson: string) => Promise<boolean>;
  getKeyboardConfig?: () => Promise<string | null>;
}

const imeConfigBridge =
  NativeModules.ImeConfigBridge as ImeConfigBridgeNativeModule | undefined;

const saveToNativeImeStore = async (json: string): Promise<void> => {
  if (Platform.OS !== 'android') {
    return;
  }

  if (!imeConfigBridge?.saveKeyboardConfig) {
    return;
  }

  await imeConfigBridge.saveKeyboardConfig(json);
};

export const saveAndroidKeyboardConfig = async (
  config: AndroidKeyboardConfig,
): Promise<void> => {
  const json = JSON.stringify(config);

  await AsyncStorage.setItem(ANDROID_IME_CONFIG_STORAGE_KEY, json);
  await saveToNativeImeStore(json);
};

export const loadAndroidKeyboardConfig = async (): Promise<{
  config: AndroidKeyboardConfig;
  usedFallback: boolean;
}> => {
  const raw = await AsyncStorage.getItem(ANDROID_IME_CONFIG_STORAGE_KEY);
  return parseAndroidKeyboardConfig(raw);
};

export const resetAndroidKeyboardConfigToDefault = async (): Promise<AndroidKeyboardConfig> => {
  const fallback = getDefaultAndroidKeyboardConfig();
  await saveAndroidKeyboardConfig(fallback);
  return fallback;
};
