package com.keyboardapp.ime

import android.content.Context

object ImeConfigStore {
  const val PREFS_NAME = "keyboard_ime_config"
  const val KEY_CONFIG_JSON = "config_json"

  fun saveConfig(context: Context, json: String) {
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString(KEY_CONFIG_JSON, json)
      .apply()
  }

  fun readConfig(context: Context): String? {
    return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getString(KEY_CONFIG_JSON, null)
  }
}
