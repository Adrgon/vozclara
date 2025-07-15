# 🗣️ VozClara

**VozClara** es una aplicación móvil de comunicación aumentativa y alternativa (CAA) diseñada para facilitar la comunicación de personas con dificultades del habla. La aplicación combina texto-a-voz, pictogramas y una interfaz intuitiva para ayudar a usuarios a expresarse de manera efectiva.

## 📱 Características Principales

### 🎯 Modo Charla
- **Comunicación por texto**: Escribe mensajes que se convierten automáticamente en voz
- **Historial de mensajes**: Mantiene un registro de las conversaciones recientes
- **Reproducción táctil**: Toca cualquier mensaje para escucharlo nuevamente
- **Síntesis de voz en español argentino**: Voz natural y clara
- **Vibración háptica**: Retroalimentación táctil al reproducir mensajes

### 🖼️ Pictogramas
- **Biblioteca de pictogramas**: Acceso a miles de pictogramas de ARASAAC
- **Búsqueda inteligente**: Encuentra pictogramas por palabras clave
- **Pictogramas predefinidos**: Categorías comunes como emergencias, salud, etc.
- **Reproducción de voz**: Cada pictograma se reproduce con su nombre
- **Interfaz accesible**: Diseñada para usuarios con diferentes capacidades

### 📸 Cámara (Próximamente)
- **Reconocimiento de objetos**: Identifica objetos en tiempo real
- **Descripción por voz**: Narra lo que ve la cámara
- **Accesibilidad visual**: Ayuda a usuarios con discapacidad visual

## 🛠️ Tecnologías Utilizadas

- **React Native** - Framework de desarrollo móvil
- **Expo** - Plataforma de desarrollo y herramientas
- **TypeScript** - Tipado estático para mayor robustez
- **Expo Router** - Navegación entre pantallas
- **Expo Speech** - Síntesis de voz
- **Expo Camera** - Funcionalidad de cámara
- **ARASAAC API** - Base de datos de pictogramas

## 📋 Requisitos del Sistema

- **iOS**: iOS 13.0 o superior
- **Android**: Android 6.0 (API level 23) o superior
- **Node.js**: 18.0 o superior
- **Expo CLI**: Última versión

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/Adrgon/vozclara.git
cd vozclara
```

### 2. Instalar dependencias
```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
VISION_API_KEY=tu_api_key_de_google_vision
```

### 4. Ejecutar la aplicación

#### Desarrollo local
```bash
# Iniciar el servidor de desarrollo
npm start
# o
yarn start
```

#### En dispositivos físicos
```bash
# Para Android
npm run android
# o
yarn android

# Para iOS
npm run ios
# o
yarn ios
```

#### Para web
```bash
npm run web
# o
yarn web
```

## 📱 Uso de la Aplicación

### Modo Charla
1. **Escribir mensaje**: Usa el teclado para escribir tu mensaje
2. **Enviar**: Presiona el botón de enviar o la tecla Enter
3. **Escuchar**: El mensaje se reproduce automáticamente
4. **Repetir**: Toca cualquier mensaje del historial para escucharlo nuevamente
5. **Borrar historial**: Usa el botón de papelera para limpiar la conversación

### Pictogramas
1. **Explorar**: Navega por los pictogramas predefinidos
2. **Buscar**: Usa la barra de búsqueda para encontrar pictogramas específicos
3. **Seleccionar**: Toca un pictograma para escuchar su nombre
4. **Categorías**: Los pictogramas incluyen:
   - 🚑 Emergencias (ambulancia, policía, incendio)
   - 🏥 Salud (doctor, enfermera, dolor)
   - 🆘 Ayuda (necesito ayuda, robo, pelea)

## 🎨 Características de Accesibilidad

- **Navegación por voz**: Compatible con lectores de pantalla
- **Controles táctiles**: Interfaz optimizada para uso táctil
- **Retroalimentación háptica**: Vibración al interactuar
- **Contraste visual**: Colores optimizados para legibilidad
- **Tamaños de fuente**: Texto legible en diferentes dispositivos

## 🔧 Configuración de Desarrollo

### Estructura del Proyecto
```
vozclara/
├── app/                    # Pantallas de la aplicación
│   ├── index.tsx          # Modo Charla
│   ├── pictogramas.tsx    # Pantalla de pictogramas
│   ├── camara.tsx         # Funcionalidad de cámara
│   ├── ayuda.tsx          # Pantalla de ayuda
│   └── _layout.tsx        # Layout principal
├── assets/                # Recursos estáticos
│   ├── pictogramas/       # Pictogramas locales
│   ├── icon.png           # Icono de la app
│   └── splash.png         # Pantalla de carga
├── docs/                  # Documentación (excluida del repo)
└── package.json           # Dependencias del proyecto
```

### Scripts Disponibles
- `npm start` - Inicia el servidor de desarrollo
- `npm run android` - Ejecuta en Android
- `npm run ios` - Ejecuta en iOS
- `npm run web` - Ejecuta en web

## 🤝 Contribuir

1. **Fork** el repositorio
2. Crea una **rama** para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un **Pull Request**

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **ARASAAC** - Por proporcionar la API de pictogramas
- **Expo** - Por las herramientas de desarrollo
- **React Native** - Por el framework de desarrollo móvil
- **Comunidad de desarrolladores** - Por el apoyo y contribuciones

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

- 📧 **Email**: [Tu email]
- 🐛 **Issues**: [GitHub Issues](https://github.com/Adrgon/vozclara/issues)
- 📖 **Documentación**: [Wiki del proyecto](https://github.com/Adrgon/vozclara/wiki)

---

**VozClara** - Haciendo la comunicación más accesible para todos 🗣️✨ 
