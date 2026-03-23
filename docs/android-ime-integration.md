# Android IME Integration Guide

## 1) Build and install
- Run `yarn android`.

## 2) Enable keyboard
1. Open Android Settings.
2. Go to **System > Languages & input > On-screen keyboard > Manage keyboards**.
3. Enable **KeyboardApp IME**.

## 3) Select keyboard in apps (WhatsApp, Gmail, etc.)
1. Open a text field.
2. Tap keyboard-switch key (or long-press spacebar) and choose **KeyboardApp IME**.

## 4) How dynamic config works
- React Native saves JSON config to AsyncStorage and native IME shared prefs.
- IME reads this JSON on open and renders buttons dynamically.
- If config is missing/corrupt, IME uses fallback keys.

## 5) Media keys behavior
- `Photo` and `Audio` insert helper tokens and copy them to clipboard.
- This is fallback behavior for apps/fields where direct media insert is unsupported.
