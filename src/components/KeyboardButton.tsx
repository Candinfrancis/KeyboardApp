// src/components/KeyboardButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const KeyboardButton: React.FC<Props> = ({
  label,
  onPress,
  buttonStyle,
  textStyle,
}) => (
  <TouchableOpacity style={[styles.button, buttonStyle]} onPress={onPress}>
    <Text style={[styles.text, textStyle]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    padding: 20,
    margin: 10,
    borderRadius: 10,
  },
  text: {
    fontWeight: 'bold',
  },
});
