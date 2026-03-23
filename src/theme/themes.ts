import { TextStyle, ViewStyle } from 'react-native';

export type ThemeName = 'light' | 'dark';

export interface KeyboardTheme {
  name: ThemeName;
  backgroundColor: string;
  textColor: string;
  buttonStyle: ViewStyle;
  buttonTextStyle: TextStyle;
  secondaryButtonStyle: ViewStyle;
  secondaryButtonTextStyle: TextStyle;
}

export const lightTheme: KeyboardTheme = {
  name: 'light',
  backgroundColor: '#F4F6F8',
  textColor: '#14213D',
  buttonStyle: {
    backgroundColor: '#0F6EDE',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 22,
    minWidth: 160,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButtonStyle: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C8D1DB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 24,
    alignSelf: 'flex-end',
  },
  secondaryButtonTextStyle: {
    color: '#14213D',
    fontWeight: '600',
  },
};

export const darkTheme: KeyboardTheme = {
  name: 'dark',
  backgroundColor: '#101418',
  textColor: '#E6EDF3',
  buttonStyle: {
    backgroundColor: '#2B90FF',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 22,
    minWidth: 160,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonTextStyle: {
    color: '#09111A',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButtonStyle: {
    backgroundColor: '#1A222C',
    borderWidth: 1,
    borderColor: '#324251',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 24,
    alignSelf: 'flex-end',
  },
  secondaryButtonTextStyle: {
    color: '#E6EDF3',
    fontWeight: '600',
  },
};

export const themes: Record<ThemeName, KeyboardTheme> = {
  light: lightTheme,
  dark: darkTheme,
};
