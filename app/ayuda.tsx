import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Ayuda() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Ayuda</Text>
      </View>
      
      <View style={styles.seccion}>
        <View style={styles.seccionHeader}>
          <Ionicons name="chatbubbles-outline" size={24} color="#FF6B6B" />
          <Text style={styles.subtitulo}>Modo Charla</Text>
        </View>
        <View style={styles.seccionContent}>
          <Text style={styles.texto}>
            En este modo puedes comunicarte de dos formas:
          </Text>
          <View style={styles.paso}>
            <Ionicons name="ellipse" size={20} color="#FF6B6B" />
            <Text style={styles.pasoTexto}>Escribiendo tu mensaje en el campo de texto y presionando "Confirmar"</Text>
          </View>
          <View style={styles.paso}>
            <Ionicons name="ellipse" size={20} color="#FF6B6B" />
            <Text style={styles.pasoTexto}>Presionando el botón "Grabar" para grabar tu voz. El mensaje se transcribirá automáticamente.</Text>
          </View>
        </View>
      </View>

      <View style={styles.seccion}>
        <View style={styles.seccionHeader}>
          <Ionicons name="images-outline" size={24} color="#FF6B6B" />
          <Text style={styles.subtitulo}>Modo Pictogramas</Text>
        </View>
        <View style={styles.seccionContent}>
          <View style={styles.paso}>
            <Ionicons name="arrow-forward" size={20} color="#FF6B6B" />
            <Text style={styles.pasoTexto}>Desliza horizontalmente para ver los pictogramas disponibles.</Text>
          </View>
          <View style={styles.paso}>
            <Ionicons name="arrow-forward" size={20} color="#FF6B6B" />
            <Text style={styles.pasoTexto}>Toca un pictograma para seleccionarlo y comunicar tu mensaje.</Text>
          </View>
        </View>
      </View>

      <View style={styles.seccion}>
        <View style={styles.seccionHeader}>
          <Ionicons name="camera-outline" size={24} color="#FF6B6B" />
          <Text style={styles.subtitulo}>Modo Cámara</Text>
        </View>
        <View style={styles.seccionContent}>
          <Text style={styles.texto}>
            Puedes tomar fotos con la cámara de tu dispositivo o seleccionar una imagen de tu galería.
          </Text>
          <Text style={styles.texto}>
            Las fotos pueden ser útiles para mostrar algo que quieras comunicar.
          </Text>
        </View>
      </View>

      <View style={styles.seccion}>
        <View style={styles.seccionHeader}>
          <Ionicons name="call-outline" size={24} color="#FF6B6B" />
          <Text style={styles.subtitulo}>Contacto</Text>
        </View>
        <View style={styles.seccionContent}>
          <View style={styles.contactoItem}>
            <Ionicons name="mail-outline" size={20} color="#FF6B6B" />
            <Text style={styles.contactoTexto}>soporte@voz-clara.com</Text>
          </View>
          <View style={styles.contactoItem}>
            <Ionicons name="call-outline" size={20} color="#FF6B6B" />
            <Text style={styles.contactoTexto}>+34 123 456 789</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
  seccion: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    overflow: 'hidden',
  },
  seccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subtitulo: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginLeft: 12,
  },
  seccionContent: {
    padding: 16,
  },
  texto: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 12,
  },
  paso: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  pasoTexto: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  contactoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  contactoTexto: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
}); 
