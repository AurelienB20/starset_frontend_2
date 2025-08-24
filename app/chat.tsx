import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Menu, Provider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import config from '../config.json';
import socket from './socket';

const ChatScreen = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<any>([]);
  const navigation = useNavigation();
  const route = useRoute() as any;
  const { conversation_id, sender_id, sender_type, contact_profile_picture_url, contact_firstname } = route.params || {};
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [otherId, setOtherId] = useState<string | null>(null);
  const screenHeight = Dimensions.get('window').height;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);

  const getConversationDetails = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/conversation/get-conversation-with-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id }),
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération de la conversation');
      const data = await response.json();

      if (data.success && data.conversation) {
        const { person1_id, person2_id } = data.conversation;
        const other = person1_id === sender_id ? person2_id : person1_id;
        setOtherId(other);
      }
    } catch (error) {
      console.error("Erreur dans getConversationDetails:", error);
    }
  };

  const getAllMessages = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/conversation/get-all-messages-by-conversation-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id }),
      });

      if (!response.ok) throw new Error('Erreur réseau');
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('An error occurred while fetching messages:', error);
    }
  };

  const getLocalTime = () => {
    const now = new Date();
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now);
  };

  const handleSelectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission refusée", "Autorisez l'accès à la galerie.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      setSelectedImage(`data:image/jpeg;base64,${image.base64}`);
    }
  };

  const handleDeleteMessage = async (message_id: string) => {
    try {
      const res = await fetch(`${config.backendUrl}/api/conversation/delete-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id }),
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression');
      setMessages((prev: any[]) =>
        prev.map((msg) =>
          msg.id === message_id
            ? { ...msg, message_text: 'Ce message a été supprimé', picture_url: null }
            : msg
        )
      );
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de supprimer le message.');
    }
  };

  const fetchPrestationIdByWorker = async (workerId: any) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/get-any`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: workerId }),
      });

      const data = await response.json();
      if (data.success && data.prestation_id) {
        navigation.navigate({ name: 'prestationView', params: { id: data.prestation_id } } as never);
      } else {
        Alert.alert("Erreur", "Impossible de récupérer la prestation.");
      }
    } catch (err) {
      Alert.alert("Erreur", "Impossible de naviguer vers la prestation.");
    }
  };

  const handleSendMessage = async () => {
    const message_time = getLocalTime();
    const trimmedMessage = newMessage.trim();

    setNewMessage('');
    setSelectedImage(null);

    const newMessageObject = {
      conversation_id,
      sender_id,
      sender_type,
      message_text: trimmedMessage,
      timestamp: message_time,
    };

    if (selectedImage) {
      const payload = {
        ...newMessageObject,
        file: {
          filename: `image-${Date.now()}.jpg`,
          mimetype: 'image/jpeg',
          data: selectedImage,
        },
      };
      try {
        const response = await fetch(`${config.backendUrl}/api/conversation/send-image-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Erreur réseau');
        const data = await response.json();
        socket.emit('newMessage', { ...data.message, conversation_id });
      } catch (error) {
        Alert.alert('Erreur', "Impossible d'envoyer le message.");
      }
    } else {
      try {
        const response = await fetch(`${config.backendUrl}/api/conversation/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newMessageObject }),
        });
        if (!response.ok) throw new Error('Erreur réseau');
        const data = await response.json();
        socket.emit('newMessage', { ...data.message, conversation_id });
      } catch (error) {
        console.error('Erreur envoi message texte :', error);
      }
    }
  };

  useEffect(() => {
    getAllMessages();
    const showSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardHeight(event.endCoordinates.height + 10);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!conversation_id) return;
    socket.emit('joinRoom', conversation_id);
    socket.on('newMessage', (message) => {
      setMessages((prev: any[]) => {
        const alreadyExists = prev.some((m) => m.timestamp === message.timestamp);
        if (!alreadyExists) {
          return [...prev, message];
        } else {
          return prev;
        }
      });
    });
    return () => {
      socket.off('newMessage');
    };
  }, [conversation_id]);

  return (
    <Provider>
      <View style={[styles.container, { paddingBottom: keyboardHeight + (Platform.OS === 'android' ? insets.bottom : 0) }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                if (sender_type === 'user' && otherId) {
                  fetchPrestationIdByWorker(otherId);
                }
              }}
            >
              <Image source={{ uri: contact_profile_picture_url }} style={styles.headerImage} />
            </TouchableOpacity>
            <Text style={styles.headerName}>{contact_firstname}</Text>
          </View>

          {/* Liste des messages */}
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
            
            renderItem={({ item }) => (
              <TouchableOpacity
                onLongPress={() => {
                  if (item.sender_id === sender_id) {
                    setSelectedMessageId(item.id);
                    setMenuVisible(true);
                  }
                }}
                activeOpacity={0.8}
                delayLongPress={300}
              >
                <View
                  style={[
                    styles.messageBubble,
                    item.sender_id === sender_id ? styles.myMessage : styles.otherMessage,
                  ]}
                >
                  <View style={item.sender_id === sender_id ? styles.myTextWrapper : styles.otherTextWrapper}>
                    <Text style={styles.messageText}>{item.message_text}</Text>
                    {item.picture_url ? (
                      <Image
                        source={{ uri: item.picture_url }}
                        style={{ width: 200, height: 200, borderRadius: 10, marginTop: 5 }}
                        resizeMode="cover"
                      />
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            contentContainerStyle={{ paddingHorizontal: 20}}
          />

          <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)} anchor={{ x: 200, y: 400 }}>
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                if (selectedMessageId) {
                  Alert.alert("Confirmation", "Voulez-vous vraiment supprimer ce message ?", [
                    { text: "Annuler", style: "cancel" },
                    { text: "Supprimer", style: "destructive", onPress: () => handleDeleteMessage(selectedMessageId) },
                  ]);
                }
              }}
              title="Supprimer"
              leadingIcon="delete"
            />
          </Menu>

          {/* Barre d'entrée */}
          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={handleSelectImage}>
              <Ionicons name="camera-outline" size={24} color="#008000" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Ajouter un message..."
              placeholderTextColor="#808080"
            />
            {selectedImage && (
              <TouchableOpacity onPress={() => setSelectedImage(null)}>
                <Image source={{ uri: selectedImage }} style={{ width: 40, height: 40, marginRight: 8, borderRadius: 5 }} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.sendButton, !(newMessage.trim() || selectedImage) && { backgroundColor: '#cccccc' }]}
              disabled={!(newMessage.trim() || selectedImage)}
              onPress={handleSendMessage}
            >
              <Ionicons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 10 },
  headerImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  headerName: { marginTop: 8, fontSize: 18, fontWeight: 'bold', color: '#333' },
  messageBubble: { flexDirection: 'row', marginVertical: 5, width: '100%' },
  myMessage: { alignSelf: 'flex-end', flexDirection: 'row-reverse', marginRight: 10 },
  otherMessage: { alignSelf: 'flex-start', marginLeft: 10 },
  myTextWrapper: { backgroundColor: '#FFEB3B', padding: 10, borderRadius: 20, maxWidth: '70%' },
  otherTextWrapper: { backgroundColor: '#E0E0E0', padding: 10, borderRadius: 20, maxWidth: '70%' },
  messageText: { fontSize: 16, color: '#000000' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    marginHorizontal: 10,
    color: 'black',
  },
  sendButton: { backgroundColor: '#008000', padding: 10, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});

export default ChatScreen;
