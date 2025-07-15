import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Vibration, Alert } from 'react-native';
import { useState, useCallback, useRef } from 'react';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';

const MAX_MENSAJES = 15;

export default function Charla() {
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState<Array<{texto: string, esUsuario: boolean}>>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleVibration = useCallback(() => {
    Vibration.vibrate([0, 5]); // 5ms de vibración
  }, []);

  const reproducirTexto = useCallback(async (texto: string) => {
    try {
      handleVibration();
      // Detener cualquier reproducción actual
      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
      }
      // Reproducir el nuevo texto
      await Speech.speak(texto, {
        language: 'es-AR',
        pitch: 1.0,
        rate: 1.0,
        onStart: () => console.log('Iniciando reproducción'),
        onDone: () => console.log('Reproducción completada'),
        onError: (error) => {
          console.error('Error en la reproducción:', error);
        }
      });
    } catch (error) {
      console.error('Error al reproducir el texto:', error);
    }
  }, [handleVibration]);

  const enviarMensaje = useCallback(() => {
    if (mensaje.trim()) {
      const nuevoMensaje = { texto: mensaje, esUsuario: true };
      setMensajes(prev => {
        const mensajesActualizados = [...prev, nuevoMensaje];
        // Mantener solo los últimos MAX_MENSAJES mensajes
        return mensajesActualizados.slice(-MAX_MENSAJES);
      });
      setMensaje('');
      reproducirTexto(mensaje);
      // Scroll al final después de enviar mensaje
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [mensaje, reproducirTexto]);

  const handleMensajePress = useCallback((texto: string) => {
    console.log('Reproduciendo mensaje:', texto); // Debug
    reproducirTexto(texto);
  }, [reproducirTexto]);

  const borrarHistorial = useCallback(() => {
    Alert.alert(
      'Borrar historial',
      '¿Estás seguro de que quieres borrar todo el historial?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: () => {
            setMensajes([]);
            Speech.stop();
          }
        }
      ]
    );
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.titulo}>Modo Charla</Text>
        <TouchableOpacity
          style={styles.botonBorrar}
          onPress={borrarHistorial}
          accessibilityLabel="Borrar historial"
          accessibilityHint="Presiona para borrar todo el historial de mensajes"
        >
          <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.mensajesContainer}
        contentContainerStyle={styles.mensajesContent}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {mensajes.map((msg, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.mensajeBurbuja,
              msg.esUsuario ? styles.mensajeUsuario : styles.mensajeApp,
            ]}
            onPress={() => handleMensajePress(msg.texto)}
            activeOpacity={0.7}
            accessibilityLabel={`Mensaje: ${msg.texto}`}
            accessibilityHint="Presiona para escuchar el mensaje"
          >
            <Text
              style={[
                styles.mensajeTexto,
                msg.esUsuario
                  ? styles.mensajeTextoUsuario
                  : styles.mensajeTextoApp,
              ]}
            >
              {msg.texto}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={mensaje}
          onChangeText={setMensaje}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={enviarMensaje}
        />
        <TouchableOpacity
          style={styles.botonEnviar}
          onPress={enviarMensaje}
          disabled={!mensaje.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={mensaje.trim() ? "#FF6B6B" : "#ccc"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  titulo: {
    fontSize: 20,
    color: "#004aad",
    fontWeight: "bold",
  },
  botonBorrar: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  mensajesContainer: {
    flex: 1,
    padding: 16,
  },
  mensajesContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  mensajeBurbuja: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
  },
  mensajeUsuario: {
    backgroundColor: "#FF6B6B",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  mensajeApp: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  mensajeTexto: {
    fontSize: 16,
  },
  mensajeTextoUsuario: {
    color: "#fff",
  },
  mensajeTextoApp: {
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  botonEnviar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
}); 
