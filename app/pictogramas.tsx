import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, FlatList, Modal, Animated, Vibration } from 'react-native';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Pictograma {
  id: number;
  nombre: string;
  url: string;
}

const PALABRAS_CLAVE = [
  'ayuda',
  'ciego',
  'sordo',
  'ambulancia',
  'borracho',
  'choque',
  'doctor',
  'dolor de brazo',
  'dolor de cabeza',
  'dolor de espalda',
  'dolor de estomago',
  'dolor de garganta',
  'dolor de muela',
  'enfermera',
  'fiebre',
  'incendio',
  'lastimadura',
  'pelea',
  'inyeccion',
  'policia',
  'resfrio',
  'robo'
].sort();

export default function Pictogramas() {
  const [busqueda, setBusqueda] = useState('');
  const [pictogramas, setPictogramas] = useState<Pictograma[]>([]);
  const [cargando, setCargando] = useState(false);
  const [pictogramasIniciales, setPictogramasIniciales] = useState<Pictograma[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [errorVoz, setErrorVoz] = useState<string | null>(null);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleVibration = useCallback(() => {
    Vibration.vibrate([0, 5]); // 0ms de espera, 5ms de vibración
  }, []);

  const buscarPictogramas = useCallback(async (texto: string) => {
    if (texto.length < 2) {
      setPictogramas([]);
      return;
    }
    
    setCargando(true);
    try {
      const response = await fetch(`https://api.arasaac.org/api/pictograms/es/search/${texto}`);
      const data = await response.json();
      
      const pictogramasFiltrados = data.map((item: any) => ({
        id: item._id,
        nombre: item.keywords[0].keyword,
        url: `https://api.arasaac.org/api/pictograms/${item._id}?download=false`
      }));
      
      setPictogramas(pictogramasFiltrados);
    } catch (error) {
      console.error('Error al buscar pictogramas:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarPictogramasIniciales = async () => {
    setCargando(true);
    try {
      const pictogramasPromises = PALABRAS_CLAVE.map(async (palabra) => {
        const response = await fetch(`https://api.arasaac.org/api/pictograms/es/search/${palabra}`);
        const data = await response.json();
        if (data.length > 0) {
          return {
            id: data[0]._id,
            nombre: palabra,
            url: `https://api.arasaac.org/api/pictograms/${data[0]._id}?download=false`
          };
        }
        return null;
      });

      const resultados = await Promise.all(pictogramasPromises);
      setPictogramasIniciales(resultados.filter((p): p is Pictograma => p !== null));
    } catch (error) {
      console.error('Error al cargar pictogramas iniciales:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPictogramasIniciales();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      buscarPictogramas(busqueda);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [busqueda, buscarPictogramas]);

  const decir = useCallback(async (texto: string) => {
    try {
      setErrorVoz(null);
      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
      }
      await Speech.speak(texto, {
        language: 'es-AR',
        pitch: 1.0,
        rate: 1.0,
        onStart: () => console.log('Iniciando reproducción'),
        onDone: () => console.log('Reproducción completada'),
        onError: (error) => {
          console.error('Error en la reproducción:', error);
          setErrorVoz('Error al reproducir el texto');
        }
      });
    } catch (error) {
      console.error('Error al reproducir el texto:', error);
      setErrorVoz('Error al reproducir el texto');
    }
  }, []);

  const limpiarBusqueda = () => {
    setBusqueda('');
    setPictogramas([]);
  };

  const renderPictograma = useCallback(({ item }: { item: Pictograma }) => (
    <TouchableOpacity 
      style={styles.pictogramaContainer}
      onPress={() => {
        handleVibration();
        decir(item.nombre);
      }}
      accessibilityLabel={`Pictograma de ${item.nombre}`}
      accessibilityHint="Presiona para escuchar el nombre del pictograma"
      accessibilityRole="button"
      accessibilityState={{ disabled: cargando }}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.url }}
        style={styles.pictograma}
        accessibilityLabel={`Imagen de ${item.nombre}`}
        accessibilityRole="image"
        fadeDuration={0}
      />
      <Text 
        style={styles.pictogramaNombre}
        accessibilityRole="text"
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {item.nombre}
      </Text>
    </TouchableOpacity>
  ), [decir, cargando, handleVibration]);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 120, // altura del item
    offset: 120 * index,
    index,
  }), []);

  const keyExtractor = useCallback((item: Pictograma) => item.id.toString(), []);

  const pictogramasData = useMemo(() => 
    busqueda ? pictogramas : pictogramasIniciales,
    [busqueda, pictogramas, pictogramasIniciales]
  );

  return (
    <View 
      style={styles.container}
      accessibilityRole="none"
    >
       <Text style={styles.titulo}>Modo Pictogramas</Text>
      
      {errorVoz && (
        <View 
          style={styles.errorContainer}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          accessibilityViewIsModal={true}
        >
          <Ionicons name="alert-circle" size={24} color="white" />
          <Text style={styles.errorText}>{errorVoz}</Text>
        </View>
      )}

      <View style={styles.busquedaContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons 
            name="search" 
            size={20} 
            color="#666" 
            style={styles.searchIcon}
            accessibilityElementsHidden={true}
            importantForAccessibility="no"
          />
          <TextInput
            style={styles.busqueda}
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar pictogramas..."
            placeholderTextColor="#999"
            accessibilityLabel="Buscar pictogramas"
            accessibilityHint="Escribe para buscar pictogramas"
            accessibilityRole="search"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {busqueda.length > 0 && (
            <TouchableOpacity 
              style={styles.botonLimpiar}
              onPress={() => {
                handleVibration();
                limpiarBusqueda();
              }}
              accessibilityLabel="Limpiar búsqueda"
              accessibilityHint="Presiona para borrar el texto de búsqueda"
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={24} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View 
        style={styles.contentContainer}
        accessibilityRole="list"
        accessibilityLabel="Lista de pictogramas"
      >
        {cargando ? (
          <View 
            style={styles.cargandoContainer}
            accessibilityRole="progressbar"
            accessibilityLabel="Cargando pictogramas"
          >
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.cargandoTexto}>Cargando pictogramas...</Text>
          </View>
        ) : (
          <FlatList
            data={pictogramasData}
            renderItem={renderPictograma}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            numColumns={3}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={5}
            accessibilityRole="list"
            accessibilityLabel="Lista de pictogramas"
            initialNumToRender={12}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>

      <LinearGradient
        colors={['#FF6B6B', '#FF8E8E']}
        style={styles.footerContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        accessibilityElementsHidden={true}
        importantForAccessibility="no"
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity 
            style={styles.botonLegal}
            onPress={() => {
              handleVibration();
              setModalVisible(true);
            }}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityLabel="Aviso Legal"
            accessibilityHint="Presiona para ver la información legal de los pictogramas"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={24} color="white" />
            <Text style={styles.botonLegalTexto}>Aviso Legal</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        accessibilityViewIsModal={true}
        statusBarTranslucent
      >
        <View 
          style={styles.modalContainer}
          accessibilityRole="none"
          accessibilityLabel="Aviso Legal"
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text 
                style={styles.modalTitulo}
                accessibilityRole="header"
              >
                Aviso Legal
              </Text>
              <TouchableOpacity 
                style={styles.modalCerrar}
                onPress={() => {
                  handleVibration();
                  setModalVisible(false);
                }}
                accessibilityLabel="Cerrar aviso legal"
                accessibilityHint="Presiona para cerrar el aviso legal"
                accessibilityRole="button"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalScroll}
              accessibilityRole="text"
              showsVerticalScrollIndicator={true}
              bounces={true}
            >
              <Text style={styles.modalTexto}>
                The pictographic symbols used are the property of the Government of Aragón and have been created by Sergio Palao for ARASAAC (http://www.arasaac.org), that distributes them under Creative Commons License BY-NC-SA.
                {'\n\n'}Pictograms author: Sergio Palao
                {'\n'}Origin: ARASAAC (http://www.arasaac.org)
                {'\n'}License: CC (BY-NC-SA)
                {'\n'}Owner: Government of Aragon (Spain)
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    color: '#004aad',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  busquedaContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  searchIcon: {
    marginRight: 8,
  },
  busqueda: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  botonLimpiar: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    marginBottom: 60,
  },
  gridContainer: {
    paddingBottom: 16,
  },
  pictogramaContainer: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
    maxWidth: '33%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  pictograma: {
    width: 100,
    height: 100,
    marginBottom: 8,
    borderRadius: 8,
  },
  pictogramaNombre: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    color: '#333',
    textAlign: 'center',
    fontSize: 12,
    borderRadius: 6,
    width: '100%',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  botonLegal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonLegalTexto: {
    marginLeft: 8,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004aad',
  },
  modalCerrar: {
    padding: 4,
  },
  modalScroll: {
    padding: 16,
  },
  modalTexto: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  cargandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cargandoTexto: {
    marginTop: 16,
    fontSize: 16,
    color: '#004aad',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: 'white',
    marginLeft: 8,
    flex: 1,
  },
}); 
