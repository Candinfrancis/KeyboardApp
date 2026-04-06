package com.keyboardapp.ime

import android.content.Intent
import android.net.Uri
import android.content.ClipData
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.inputmethodservice.InputMethodService
import android.util.TypedValue
import android.view.LayoutInflater
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.FileProvider
import androidx.core.view.inputmethod.EditorInfoCompat
import androidx.core.view.inputmethod.InputConnectionCompat
import androidx.core.view.inputmethod.InputContentInfoCompat
import com.keyboardapp.R
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream

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

  private val testPhotoAssetPath = "images/test_image.webp"
  private val testPhotoFileName = "test_image.webp"

  private val testAudioAssetPath = "audios/test_video.mp4"
  private val testAudioFileName = "test_video.mp4"

  private var isShiftEnabled = false
  private var isCapsLockEnabled = false
  private var activeLanguageIndex = 0
  private var activeMode = "qwerty"
  private val languages = listOf("EN", "PT", "ES")
  private val modeOrder = listOf("qwerty", "numbers", "words", "photos", "audio")

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
          setOnClickListener { onKeyPressed(key) }
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

      "shift" -> isShiftEnabled = !isShiftEnabled

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
    val rawPayload = key.payload ?: ""
    if (rawPayload.contains("|")) {
        val parts = rawPayload.split("|")
        val fileName = parts[0]
        val mimeType = parts[1]
        
        val assetPath = "images/$fileName"
        //aqui !!!!!!!
        trySendAssetPhoto("images/test_image.jpg", "test_image.jpg", "image/jpg")
        //good
        //trySendAssetPhoto("images/animated_webp.webp", "animated_webp.webp", "image/webp.wasticker")
        //uncoment to go back
        // trySendAssetPhoto(assetPath, fileName, mimeType)
    } else {
        // Fallback caso te esqueças do pipe |
        val fileName = if (rawPayload.isNotEmpty()) rawPayload else "test_image.jpg"
        trySendAssetPhoto("images/$fileName", fileName, "image/jpeg")
    }
}

      "audio" -> {
        val sent = trySendAudioToSpecificNumber("audios/ocapi.mp3", "ocapi.mp3", "audio/ogg")
        if (!sent) {
          val token = ""
          copyToClipboard(token)
          inputConnection.commitText(token, 1)
        }
      }
      "imeAction" -> {
          val ic = currentInputConnection ?: return
          val editorInfo = currentInputEditorInfo ?: return
          
          // Pega o ID da ação (Send, Search, Go, Next, etc.)
          val actionId = editorInfo.imeOptions and android.view.inputmethod.EditorInfo.IME_MASK_ACTION
          
          if (actionId != android.view.inputmethod.EditorInfo.IME_ACTION_NONE) {
              // Isso simula o clique no botão "Enviar" do teclado
              ic.performEditorAction(actionId)
          } else {
              // Se não houver ação específica (como no Bloco de Notas), apenas pula linha
              ic.commitText("\n", 1)
          }
      }
    }
    renderKeyboardFromConfig()
  }

private fun createSendIntent(
    mimeType: String,
    uri: android.net.Uri,
    targetPackage: String?
): android.content.Intent {
    return android.content.Intent(android.content.Intent.ACTION_SEND).apply {
        type = mimeType
        putExtra(android.content.Intent.EXTRA_STREAM, uri)
        addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
        addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION)

        if (!targetPackage.isNullOrEmpty()) {
            setPackage(targetPackage)
        }
    }
}
private fun getCurrentAppPackage(editorInfo: android.view.inputmethod.EditorInfo?): String? {
    if (editorInfo?.packageName != null) {
        return editorInfo.packageName
    }

    return try {
        val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
        val processes = activityManager.runningAppProcesses

        processes?.firstOrNull {
            it.importance == android.app.ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
        }?.pkgList?.firstOrNull()
    } catch (e: Exception) {
        null
    }
}

private fun trySendAssetPhoto(assetPath: String, fileName: String, mimeType: String): Boolean {
    val inputConnection = currentInputConnection ?: return false
    val editorInfo = currentInputEditorInfo ?: return false

    return try {
        // Verifica se o campo suporta o tipo específico ou imagens em geral
        val supportedMimes = EditorInfoCompat.getContentMimeTypes(editorInfo)
        val isSupported = supportedMimes.any { mime ->
            ClipDescription.compareMimeTypes(mime, mimeType) ||
            mime == "image/*" || mime == "*/*"
        }

        // if (!isSupported) {
        //     toast("O app destino não aceita $mimeType")
        //     return false
        // }

        // Copia o arquivo do assets para cache e pega o URI
        val contentUri = copyAssetToCacheAndGetUri(
    assetPath = assetPath,
    fileName = fileName,
    cacheFolder = "ime_images"
)
this.grantUriPermission(
    editorInfo.packageName, 
    contentUri, 
    Intent.FLAG_GRANT_READ_URI_PERMISSION
)
        // Cria a descrição do conteúdo e envia
        val description = ClipDescription("Keyboard Media", arrayOf(mimeType))
        val contentInfo = InputContentInfoCompat(contentUri, description, null)

        InputConnectionCompat.commitContent(
            inputConnection,
            editorInfo,
            contentInfo,
            InputConnectionCompat.INPUT_CONTENT_GRANT_READ_URI_PERMISSION,
            null
        )

        toast("Imagem enviada")
        true
    } catch (e: Exception) {
        toast("Erro ao enviar: ${e.message ?: "desconhecido"}")
        false
    }
}

private fun trySendAudioToSpecificNumber(assetPath: String, fileName: String, mimeType: String): Boolean {
    return try {
        val contentUri = copyAssetToCacheAndGetUri(assetPath, fileName, "ime_audio")

        // 1. O número deve estar no formato internacional: "5511999999999" (sem o + ou 00)
        // Substitua pelo seu número real abaixo
        val targetNumber = "351966256711" // Exemplo para Portugal ou "55XXXXXXXXXXX" para Brasil

        val intent = Intent(Intent.ACTION_SEND).apply {
            type = mimeType
            putExtra(Intent.EXTRA_STREAM, contentUri)
            
            // Define o pacote do WhatsApp
            setPackage("com.whatsapp")
            
            // O segredo: Adicionar o JID (Job ID) do contato específico
            // Isso "sugere" ao WhatsApp abrir a conversa direta
            putExtra("jid", "$targetNumber@s.whatsapp.net")
            
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        // Concede permissão de leitura
        grantUriPermission("com.whatsapp", contentUri, Intent.FLAG_GRANT_READ_URI_PERMISSION)

        startActivity(intent)
        true
    } catch (e: Exception) {
        toast("Erro: ${e.message}")
        false
    }
}

private fun trySendAssetAudio(assetPath: String, fileName: String, mimeType: String): Boolean {
    return try {
        // 1. Copy and Get URI
        val contentUri = copyAssetToCacheAndGetUri(
            assetPath = assetPath,
            fileName = fileName,
            cacheFolder = "ime_audio"
        )

        // 2. Create the Intent
        val intent = Intent(Intent.ACTION_SEND).apply {
            // Use specific types like "audio/ogg", "audio/mpeg", or "audio/wav"
            type = mimeType 
            putExtra(Intent.EXTRA_STREAM, contentUri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            
            // This forces the "Share to..." screen to jump directly to WhatsApp
            setPackage("com.whatsapp") 
        }

        // 3. Optional: Grant permission explicitly for older API levels
        val resInfoList = packageManager.queryIntentActivities(intent, android.content.pm.PackageManager.MATCH_DEFAULT_ONLY)
        for (resolveInfo in resInfoList) {
            val packageName = resolveInfo.activityInfo.packageName
            grantUriPermission(packageName, contentUri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }

        // 4. Execute
        startActivity(intent)
        true
    } catch (e: Exception) {
        toast("Audio error: ${e.message}")
        false
    }
}

  private fun copyAssetToCacheAndGetUri(
    assetPath: String,
    fileName: String,
    cacheFolder: String,
  ): android.net.Uri {
    val dir = File(cacheDir, cacheFolder)
    if (!dir.exists() && !dir.mkdirs()) {
      throw IllegalStateException("Could not create cache folder '$cacheFolder'")
    }

    val file = File(dir, fileName)

    assets.open(assetPath).use { input ->
      FileOutputStream(file).use { output ->
        input.copyTo(output)
        output.flush()
      }
    }

    return FileProvider.getUriForFile(this, "com.keyboardapp.ime.fileprovider", file)
  }

  private fun switchToNextKeyboard() {
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
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
        val defaultMode =
          if (parsedModes.containsKey(defaultModeFromJson)) defaultModeFromJson
          else parsedModes.keys.first()

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