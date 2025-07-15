import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image, 
  Alert, 
  Share, 
  Clipboard, 
  ImageBackground,
  Animated,
  Vibration,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import { theme } from './theme';

const VISION_API_KEY = Constants.expoConfig?.extra?.visionApiKey;
const CACHE_DIR = `${FileSystem.cacheDirectory}image_cache/`;
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
const IMAGE_QUALITY = 0.7; // Calidad de compresión

// Configuración de compresión de imágenes
const COMPRESSION_CONFIG = {
  resize: { width: 800 },
  compress: IMAGE_QUALITY,
  format: ImageManipulator.SaveFormat.JPEG
};

interface DetectedText {
  text: string;
  language: string;
}

// Función para limpiar la caché
async function limpiarCache() {
  try {
    const cacheInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (cacheInfo.exists) {
      const cacheSize = await FileSystem.getInfoAsync(CACHE_DIR, { size: true });
      if (cacheSize.exists && cacheSize.size && cacheSize.size > MAX_CACHE_SIZE) {
        await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      }
    }
  } catch (error) {
    console.error('Error al limpiar caché:', error);
  }
}

// Función para procesar y cachear imágenes
async function procesarYCachearImagen(uri: string): Promise<string> {
  try {
    const filename = uri.split('/').pop() || 'image.jpg';
    const cachePath = `${CACHE_DIR}${filename}`;
    
    // Verificar si la imagen ya está en caché
    const cacheInfo = await FileSystem.getInfoAsync(cachePath);
    if (cacheInfo.exists) {
      return cachePath;
    }

    // Procesar y comprimir la imagen
    const processedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: COMPRESSION_CONFIG.resize }],
      {
        compress: COMPRESSION_CONFIG.compress,
        format: COMPRESSION_CONFIG.format
      }
    );

    // Guardar en caché
    await FileSystem.copyAsync({
      from: processedImage.uri,
      to: cachePath
    });

    return cachePath;
  } catch (error) {
    console.error('Error al procesar imagen:', error);
    return uri;
  }
}

async function detectText(imageUri: string): Promise<DetectedText> {
  if (!VISION_API_KEY) {
    throw new Error('API key no configurada');
  }

  try {
    // Procesar y cachear la imagen antes de la detección
    const processedUri = await procesarYCachearImagen(imageUri);
    
    // Convertir la imagen a base64
    const base64Image = await FileSystem.readAsStringAsync(processedUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Preparar la solicitud a la API de Vision
    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
          ],
          imageContext: {
            languageHints: ['es', 'en', 'fr', 'de', 'it', 'pt']
          }
        },
      ],
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error de la API: ${response.status}`);
    }

    const data = await response.json();

    if (data.responses && data.responses[0] && data.responses[0].fullTextAnnotation) {
      const text = data.responses[0].fullTextAnnotation.text;
      const language = data.responses[0].textAnnotations?.[0]?.locale || 'es';
      return { text, language };
    }

    return { text: 'No se detectó texto en la imagen', language: 'es' };
  } catch (error) {
    console.error('Error al detectar texto:', error);
    throw error;
  }
}

export default function Camara() {
  const [state, setState] = useState({
    isProcessing: false,
    detectedText: '',
    detectedLanguage: 'es',
    imageUri: null as string | null,
    error: null as string | null,
    isImageLoaded: false,
    showFlash: false
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  // Efecto de fade in para la imagen
  useEffect(() => {
    if (state.imageUri) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [state.imageUri]);

  // Feedback táctil
  const handleButtonPress = useCallback(() => {
    Vibration.vibrate(50);
  }, []);

  const showError = useCallback((message: string) => {
    setState(prev => ({ ...prev, error: message }));
    Alert.alert('Error', message, [
      { text: 'OK', onPress: () => setState(prev => ({ ...prev, error: null })) }
    ]);
  }, []);

  const reproducirTexto = useCallback(async (texto: string, idioma: string) => {
    try {
      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
      }
      await Speech.speak(texto, {
        language: idioma,
        pitch: 1.0,
        rate: 1.0,
        onStart: () => console.log('Iniciando reproducción'),
        onDone: () => console.log('Reproducción completada'),
        onError: (error) => {
          console.error('Error en la reproducción:', error);
          showError('Error al reproducir el texto');
        }
      });
    } catch (error) {
      showError('Error al reproducir el texto');
    }
  }, [showError]);

  // Efecto de flash al tomar foto
  const triggerFlash = useCallback(() => {
    setState(prev => ({ ...prev, showFlash: true }));
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setState(prev => ({ ...prev, showFlash: false }));
    });
  }, []);

  const takePicture = useCallback(async () => {
    try {
      handleButtonPress();
      triggerFlash();
      
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showError('Se necesita permiso para acceder a la cámara');
        return;
      }

      // Animación de escala al presionar el botón
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: IMAGE_QUALITY,
      });

      if (!result.canceled) {
        setState(prev => ({ ...prev, isProcessing: true, error: null, isImageLoaded: false }));
        
        if (state.imageUri) {
          await FileSystem.deleteAsync(state.imageUri, { idempotent: true });
        }

        const newImageUri = result.assets[0].uri;
        setState(prev => ({ ...prev, imageUri: newImageUri }));

        const processedImage = await ImageManipulator.manipulateAsync(
          newImageUri,
          [{ resize: COMPRESSION_CONFIG.resize }],
          {
            compress: COMPRESSION_CONFIG.compress,
            format: COMPRESSION_CONFIG.format
          }
        );

        const { text, language } = await detectText(processedImage.uri);
        setState(prev => ({ 
          ...prev, 
          detectedText: text,
          detectedLanguage: language
        }));
        
        await reproducirTexto(text, language);
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      showError('Error al procesar la imagen. Por favor, inténtalo de nuevo.');
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [state.imageUri, showError, reproducirTexto, handleButtonPress, triggerFlash]);

  const handleImageLoad = useCallback(() => {
    setState(prev => ({ ...prev, isImageLoaded: true }));
  }, []);

  const handleImageLoadError = useCallback(() => {
    showError('Error al cargar la imagen');
    setState(prev => ({ ...prev, imageUri: null }));
  }, [showError]);

  const limpiar = useCallback(() => {
    if (state.imageUri) {
      FileSystem.deleteAsync(state.imageUri, { idempotent: true })
        .catch(console.error);
    }
    setState({
      isProcessing: false,
      detectedText: '',
      detectedLanguage: 'es',
      imageUri: null,
      error: null,
      isImageLoaded: false,
      showFlash: false
    });
  }, [state.imageUri]);

  const compartirTexto = useCallback(async () => {
    try {
      await Share.share({
        message: `Texto detectado (${state.detectedLanguage}): ${state.detectedText}`,
      });
    } catch (error) {
      showError('Error al compartir el texto');
    }
  }, [state.detectedText, state.detectedLanguage, showError]);

  const copiarAlPortapapeles = useCallback(async () => {
    try {
      await Clipboard.setString(state.detectedText);
      Alert.alert('Éxito', 'Texto copiado al portapapeles');
    } catch (error) {
      showError('Error al copiar el texto');
    }
  }, [state.detectedText, showError]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Modo Cámara</Text>
        <Text style={styles.subtitulo}>Toma una foto para detectar texto</Text>
      </View>

      <View style={styles.previewContainer}>
        {state.imageUri ? (
          <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
            <ImageBackground
              source={{ uri: state.imageUri }}
              style={styles.preview}
              onLoad={handleImageLoad}
              onError={handleImageLoadError}
              accessibilityLabel="Vista previa de la imagen capturada"
              accessibilityRole="image"
            >
              {!state.isImageLoaded && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
              )}
            </ImageBackground>
          </Animated.View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="camera-outline" size={64} color="#ccc" />
            <Text style={styles.placeholderText}>
              Toca el botón de la cámara para tomar una foto
            </Text>
          </View>
        )}

        {state.showFlash && (
          <Animated.View 
            style={[
              styles.flashOverlay,
              { opacity: flashAnim }
            ]}
          />
        )}
      </View>

      {state.error && (
        <Animated.View 
          style={[styles.errorContainer, { opacity: fadeAnim }]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <Ionicons name="alert-circle" size={24} color="white" />
          <Text style={styles.errorText}>{state.error}</Text>
        </Animated.View>
      )}

      {state.detectedText ? (
        <Animated.View 
          style={[styles.textCard, { opacity: fadeAnim }]}
          accessibilityRole="text"
          accessibilityLabel="Texto detectado"
        >
          <View style={styles.textCardHeader}>
            <View style={styles.languageBadge}>
              <Text style={styles.languageText}>
                {state.detectedLanguage.toUpperCase()}
              </Text>
            </View>
            <View style={styles.textCardActions}>
              <TouchableOpacity
                style={styles.textCardButton}
                onPress={() => {
                  handleButtonPress();
                  compartirTexto();
                }}
                accessibilityLabel="Compartir texto"
                accessibilityHint="Presiona para compartir el texto detectado"
              >
                <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.textCardButton}
                onPress={() => {
                  handleButtonPress();
                  copiarAlPortapapeles();
                }}
                accessibilityLabel="Copiar texto"
                accessibilityHint="Presiona para copiar el texto al portapapeles"
              >
                <Ionicons name="copy-outline" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.textCardButton}
                onPress={() => {
                  handleButtonPress();
                  reproducirTexto(state.detectedText, state.detectedLanguage);
                }}
                accessibilityLabel="Reproducir texto"
                accessibilityHint="Presiona para escuchar el texto detectado"
              >
                <Ionicons name="volume-high" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.detectedText}>{state.detectedText}</Text>
        </Animated.View>
      ) : null}

      <View style={styles.buttonContainer}>
        {state.imageUri && (
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={() => {
              handleButtonPress();
              limpiar();
            }}
            accessibilityLabel="Limpiar foto"
            accessibilityHint="Presiona para eliminar la foto y el texto detectado"
          >
            <Ionicons name="trash-outline" size={32} color="white" />
          </TouchableOpacity>
        )}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.captureButton,
              state.isProcessing && styles.captureButtonDisabled
            ]}
            onPress={takePicture}
            disabled={state.isProcessing}
            accessibilityLabel="Tomar foto"
            accessibilityHint="Presiona para capturar una imagen con la cámara"
          >
            {state.isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="camera" size={32} color="white" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {state.isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.processingText}>Procesando imagen...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  previewContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  imageContainer: {
    flex: 1,
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 20,
    marginBottom: 20,
  },
  actionButton: {
    padding: 15,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  captureButton: {
    backgroundColor: '#FF6B6B',
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#666',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  textCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  textCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  languageBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  languageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textCardActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  textCardButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.gray[100],
  },
  detectedText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    lineHeight: 24,
  },
  errorContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    marginLeft: 8,
    flex: 1,
  },
  processingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  processingText: {
    color: theme.colors.white,
    fontSize: theme.typography.body.fontSize,
    marginTop: theme.spacing.md,
    fontWeight: '500',
  },
}); 
