package com.keyboardapp.ime

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ImeConfigBridgeModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "ImeConfigBridge"

  @ReactMethod
  fun saveKeyboardConfig(configJson: String, promise: Promise) {
    try {
      ImeConfigStore.saveConfig(reactApplicationContext, configJson)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("IME_CONFIG_SAVE_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun getKeyboardConfig(promise: Promise) {
    try {
      val json = ImeConfigStore.readConfig(reactApplicationContext)
      promise.resolve(json)
    } catch (e: Exception) {
      promise.reject("IME_CONFIG_READ_ERROR", e.message, e)
    }
  }
}
