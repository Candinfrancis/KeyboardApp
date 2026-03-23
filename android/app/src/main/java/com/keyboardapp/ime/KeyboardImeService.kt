package com.keyboardapp.ime

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.inputmethodservice.InputMethodService
import android.os.Build
import android.util.TypedValue
import android.view.LayoutInflater
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import com.keyboardapp.R
import org.json.JSONArray
import org.json.JSONObject

class KeyboardImeService : InputMethodService() {

  private data class KeyDef(
    val id: String,
    val label: String,
    val actionType: String,
    val payload: String?,
  )

  private data class ThemeDef(
    val backgroundColor: String,
    val textColor: String,
    val keyBackgroundColor: String,
    val keyTextColor: String,
    val keyBorderColor: String,
  )

  private data class ParsedConfig(
    val layoutId: String,
    val defaultMode: String,
    val theme: ThemeDef,
    val modes: Map<String, List<List<KeyDef>>>,
  )

  private var isShiftEnabled = false
  private var isCapsLockEnabled = false
  private var activeLanguageIndex = 0
  private var activeMode = "qwerty"
  private val languages = listOf("EN", "PT", "ES")
  private val modeOrder = listOf("qwerty", "words", "photos", "audio")

  private lateinit var keyboardRoot: LinearLayout
  private lateinit var keyboardRows: LinearLayout
  private lateinit var statusText: TextView

  override fun onCreateInputView(): View {
    val view = LayoutInflater.from(this).inflate(R.layout.ime_keyboard_view, null)
    keyboardRoot = view.findViewById(R.id.imeKeyboardRoot)
    keyboardRows = view.findViewById(R.id.imeRowsContainer)
    statusText = view.findViewById(R.id.imeStatusText)

    renderKeyboardFromConfig()
    return view
  }

  override fun onStartInputView(info: android.view.inputmethod.EditorInfo?, restarting: Boolean) {
    super.onStartInputView(info, restarting)
    renderKeyboardFromConfig()
  }

  private fun renderKeyboardFromConfig() {
    val config = loadConfigOrDefault()
    val availableMode = if (config.modes.containsKey(activeMode)) activeMode else config.defaultMode
    activeMode = availableMode

    val modeRows = config.modes[activeMode] ?: emptyList()

    keyboardRows.removeAllViews()
    keyboardRoot.setBackgroundColor(parseColorOrDefault(config.theme.backgroundColor, 0xFF101418.toInt()))
    statusText.setTextColor(parseColorOrDefault(config.theme.textColor, 0xFFFFFFFF.toInt()))
    statusText.text = "IME ${config.layoutId.uppercase()} | Mode: ${activeMode.uppercase()} | ${languages[activeLanguageIndex]}"

    modeRows.forEach { row ->
      val rowLayout = LinearLayout(this).apply {
        orientation = LinearLayout.HORIZONTAL
        layoutParams = LinearLayout.LayoutParams(
          LinearLayout.LayoutParams.MATCH_PARENT,
          LinearLayout.LayoutParams.WRAP_CONTENT,
        ).apply {
          topMargin = dp(6)
        }
      }

      row.forEach { key ->
        val isActiveModeButton = key.actionType == "switchMode" && key.payload == activeMode
        val button = Button(this).apply {
          text = key.label
          isAllCaps = false
          textSize = 13f
          minHeight = dp(44)
          setTextColor(parseColorOrDefault(config.theme.keyTextColor, 0xFFFFFFFF.toInt()))
          background = createKeyBackground(config.theme, isActiveModeButton)
          setPadding(dp(6), dp(8), dp(6), dp(8))
          layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
            marginStart = dp(3)
            marginEnd = dp(3)
          }
          setOnClickListener {
            onKeyPressed(key)
          }
        }

        rowLayout.addView(button)
      }

      keyboardRows.addView(rowLayout)
    }
  }

  private fun onKeyPressed(key: KeyDef) {
    val inputConnection = currentInputConnection ?: return

    when (key.actionType) {
      "letter" -> {
        val source = key.payload ?: key.label
        val out = if (isShiftEnabled || isCapsLockEnabled) source.uppercase() else source.lowercase()
        inputConnection.commitText(out, 1)
        if (!isCapsLockEnabled) {
          isShiftEnabled = false
        }
      }

      "word" -> {
        val out = key.payload ?: key.label
        inputConnection.commitText(out, 1)
        isShiftEnabled = false
      }

      "space" -> {
        inputConnection.commitText(" ", 1)
        isShiftEnabled = false
      }

      "newline" -> {
        inputConnection.commitText("\n", 1)
        isShiftEnabled = false
      }

      "backspace" -> inputConnection.deleteSurroundingText(1, 0)

      "shift" -> {
        isShiftEnabled = !isShiftEnabled
      }

      "capsLock" -> {
        isCapsLockEnabled = !isCapsLockEnabled
        isShiftEnabled = false
      }

      "switchLanguage" -> {
        activeLanguageIndex = (activeLanguageIndex + 1) % languages.size
      }

      "switchMode" -> {
        val mode = key.payload
        if (!mode.isNullOrBlank() && modeOrder.contains(mode)) {
          activeMode = mode
          isShiftEnabled = false
        }
      }

      "nextKeyboard" -> switchToNextKeyboard()

      "photo" -> {
        val token = key.payload?.let { "[photo:$it]" } ?: "[photo:attach_via_host_app]"
        copyToClipboard(token)
        inputConnection.commitText(token, 1)
        toast("Photo token inserted")
      }

      "audio" -> {
        val token = key.payload?.let { "[audio:$it]" } ?: "[audio:attach_via_host_app]"
        copyToClipboard(token)
        inputConnection.commitText(token, 1)
        toast("Audio token inserted")
      }
    }

    renderKeyboardFromConfig()
  }

  private fun switchToNextKeyboard() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      val switched = switchToNextInputMethod(false)
      if (!switched) {
        showInputMethodPicker()
      }
    } else {
      showInputMethodPicker()
    }
  }

  private fun showInputMethodPicker() {
    val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
    imm.showInputMethodPicker()
  }

  private fun copyToClipboard(value: String) {
    val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    clipboard.setPrimaryClip(ClipData.newPlainText("KeyboardMedia", value))
  }

  private fun toast(message: String) {
    Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
  }

  private fun dp(value: Int): Int {
    return TypedValue.applyDimension(
      TypedValue.COMPLEX_UNIT_DIP,
      value.toFloat(),
      resources.displayMetrics,
    ).toInt()
  }

  private fun createKeyBackground(theme: ThemeDef, isActiveModeButton: Boolean): GradientDrawable {
    val bg = parseColorOrDefault(theme.keyBackgroundColor, 0xFF2B90FF.toInt())
    val border = parseColorOrDefault(theme.keyBorderColor, 0xFF324251.toInt())
    return GradientDrawable().apply {
      shape = GradientDrawable.RECTANGLE
      cornerRadius = dp(8).toFloat()
      setColor(if (isActiveModeButton) darken(bg, 0.85f) else bg)
      setStroke(if (isActiveModeButton) dp(2) else dp(1), border)
    }
  }

  private fun darken(color: Int, factor: Float): Int {
    val r = (Color.red(color) * factor).toInt().coerceIn(0, 255)
    val g = (Color.green(color) * factor).toInt().coerceIn(0, 255)
    val b = (Color.blue(color) * factor).toInt().coerceIn(0, 255)
    return Color.rgb(r, g, b)
  }

  private fun parseColorOrDefault(value: String?, fallback: Int): Int {
    return try {
      if (value.isNullOrBlank()) fallback else Color.parseColor(value)
    } catch (_: Exception) {
      fallback
    }
  }

  private fun parseRows(rowsJson: JSONArray): List<List<KeyDef>> {
    val rows = mutableListOf<List<KeyDef>>()

    for (i in 0 until rowsJson.length()) {
      val rowJson = rowsJson.optJSONArray(i) ?: JSONArray()
      val row = mutableListOf<KeyDef>()

      for (j in 0 until rowJson.length()) {
        val keyJson = rowJson.optJSONObject(j) ?: continue
        row.add(
          KeyDef(
            id = keyJson.optString("id", "key-$i-$j"),
            label = keyJson.optString("label", "?"),
            actionType = keyJson.optString("actionType", "letter"),
            payload = if (keyJson.has("payload") && !keyJson.isNull("payload")) keyJson.optString("payload") else null,
          ),
        )
      }

      if (row.isNotEmpty()) {
        rows.add(row)
      }
    }

    return rows
  }

  private fun loadConfigOrDefault(): ParsedConfig {
    val raw = ImeConfigStore.readConfig(this)

    if (raw.isNullOrBlank()) {
      return fallbackConfig()
    }

    return try {
      val json = JSONObject(raw)

      val themeJson = json.optJSONObject("theme")
      val theme = ThemeDef(
        backgroundColor = themeJson?.optString("backgroundColor") ?: "#101418",
        textColor = themeJson?.optString("textColor") ?: "#FFFFFF",
        keyBackgroundColor = themeJson?.optString("keyBackgroundColor") ?: "#2B90FF",
        keyTextColor = themeJson?.optString("keyTextColor") ?: "#FFFFFF",
        keyBorderColor = themeJson?.optString("keyBorderColor") ?: "#324251",
      )

      val parsedModes = linkedMapOf<String, List<List<KeyDef>>>()
      val modesJson = json.optJSONObject("modes")
      if (modesJson != null) {
        modeOrder.forEach { mode ->
          val modeRowsJson = modesJson.optJSONArray(mode)
          if (modeRowsJson != null) {
            val parsed = parseRows(modeRowsJson)
            if (parsed.isNotEmpty()) {
              parsedModes[mode] = parsed
            }
          }
        }
      }

      if (parsedModes.isEmpty()) {
        val legacyRowsJson = json.optJSONArray("rows")
        if (legacyRowsJson != null) {
          val legacyRows = parseRows(legacyRowsJson)
          if (legacyRows.isNotEmpty()) {
            parsedModes["qwerty"] = legacyRows
          }
        }
      }

      if (parsedModes.isEmpty()) {
        fallbackConfig()
      } else {
        val defaultModeFromJson = json.optString("defaultMode", "qwerty")
        val defaultMode = if (parsedModes.containsKey(defaultModeFromJson)) defaultModeFromJson else parsedModes.keys.first()

        ParsedConfig(
          layoutId = json.optString("layoutId", "multiMode"),
          defaultMode = defaultMode,
          theme = theme,
          modes = parsedModes,
        )
      }
    } catch (_: Exception) {
      fallbackConfig()
    }
  }

  private fun fallbackConfig(): ParsedConfig {
    return ParsedConfig(
      layoutId = "fallback",
      defaultMode = "qwerty",
      theme = ThemeDef(
        backgroundColor = "#101418",
        textColor = "#FFFFFF",
        keyBackgroundColor = "#2B90FF",
        keyTextColor = "#FFFFFF",
        keyBorderColor = "#324251",
      ),
      modes = mapOf(
        "qwerty" to listOf(
          listOf(
            KeyDef("q", "Q", "letter", "q"),
            KeyDef("w", "W", "letter", "w"),
            KeyDef("e", "E", "letter", "e"),
            KeyDef("r", "R", "letter", "r"),
            KeyDef("t", "T", "letter", "t"),
            KeyDef("y", "Y", "letter", "y"),
            KeyDef("u", "U", "letter", "u"),
            KeyDef("i", "I", "letter", "i"),
            KeyDef("o", "O", "letter", "o"),
            KeyDef("p", "P", "letter", "p"),
          ),
          listOf(
            KeyDef("space", "Space", "space", null),
            KeyDef("bksp", "Bksp", "backspace", null),
            KeyDef("enter", "Enter", "newline", null),
          ),
          listOf(
            KeyDef("mode-qwerty", "ABC", "switchMode", "qwerty"),
            KeyDef("mode-words", "Words", "switchMode", "words"),
            KeyDef("mode-photos", "Photos", "switchMode", "photos"),
            KeyDef("mode-audio", "Audio", "switchMode", "audio"),
          ),
        ),
      ),
    )
  }
}
