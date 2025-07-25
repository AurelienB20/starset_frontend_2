import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { LexendDeca_400Regular } from '@expo-google-fonts/lexend-deca';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import ProfileCard from '../../components/ProfileCard';
import config from '../../config.json';

// NEW 👉 importe ton hook de contexte (adapte le chemin si besoin)
import { useUser } from '@/context/userContext';

const AiScreen = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // NEW
  const { user } = useUser(); // supposé retourner null/undefined si non connecté
  const canChat : any= user && Object.keys(user).length > 0;

  const [fontsLoaded] = useFonts({
    BebasNeue: BebasNeue_400Regular,
    LexendDeca : LexendDeca_400Regular,
  });

  const typingOpacity = new Animated.Value(0);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(typingOpacity, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardHeight(event.endCoordinates.height - 50);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const getAccountId = async () => {
    try {
      const account_id = await AsyncStorage.getItem('account_id');
      return account_id || '';
    } catch (e) {
      console.error('Erreur lors de la récupération du type de compte', e);
      return '';
    }
  };

  const initAiContext = async () => {
    try {
      await fetch(`${config.backendUrl}/api/ai/init-ai-context-table`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch (error) {
      console.error("Erreur lors de l'initialisation du contexte IA:", error);
    }
  };

  const handleSendAiMessage = async () => {
    if (!canChat) return; // NEW: sécurité
    if (!newMessage.trim()) return;

    const user_id = await getAccountId();

    const tempMessage = {
      message_text: newMessage,
      sender_id: user_id,
      sended_by_user: true,
    };

    setMessages([...messages, tempMessage]);
    setNewMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${config.backendUrl}/api/ai/send-ai-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, message_text: newMessage }),
      });

      const response_json = await response.json();
      const { response: messageText, workers } = response_json.data;

      setMessages(prev => [
        ...prev,
        {
          message_text: messageText,
          sended_by_user: false,
          workers,
        },
      ]);
    } catch (error) {
      console.error("Erreur lors de l’envoi du message IA:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    initAiContext();
  }, []);

  // NEW : injecte un message “créez un compte” si user est vide
  useEffect(() => {
    if (!canChat) {
      setMessages([
        {
          message_text: "Si vous voulez profiter du chatbot, vous devez créer un compte.",
          sended_by_user: false,
        },
      ]);
    }
  }, [canChat]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#D4F1E3', paddingBottom: keyboardHeight }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={require('../../assets/images/Appel.png')} style={styles.aiAvatar} />
          <Text style={styles.headerName}>MIRA</Text>
        </View>

        {/* Messages */}
        <ScrollView
          style={styles.messageContainer}
          contentContainerStyle={{ paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                message.sended_by_user ? styles.myMessage : styles.otherMessage,
              ]}
            >
              <View
                style={message.sended_by_user ? styles.myTextWrapper : styles.otherTextWrapper}
              >
                <Text style={styles.messageText}>{message.message_text}</Text>
              </View>

              {message.workers?.length > 0 && (
                <View style={{ marginTop: 10, gap: 10 }}>
                  {message.workers.map((worker: any, i: number) => (
                    <ProfileCard key={i} item={worker} />
                  ))}
                </View>
              )}
            </View>
          ))}

          {loading && (
            <View style={[styles.messageBubble, styles.otherMessage]}>
              <Animated.Text style={[styles.typingText, { opacity: typingOpacity }]}>
                taping...
              </Animated.Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => {}} disabled={!canChat}>
            <Ionicons name="camera-outline" size={24} color={canChat ? '#008000' : '#9E9E9E'} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder={canChat ? "Je recherche une babysitter..." : "Connectez-vous pour discuter avec MIRA"}
            placeholderTextColor="#808080"
            multiline
            editable={canChat} // NEW
          />

          <TouchableOpacity
            style={[styles.sendButton, !canChat && styles.sendButtonDisabled]} // NEW
            onPress={handleSendAiMessage}
            disabled={!canChat} // NEW
          >
          <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  aiAvatar: {
    width: 110,
    height: 110,
    marginBottom: 8,
    marginTop: 50,
  },
  headerName: {
    fontSize: 26,
    color: '#333',
    fontFamily: 'BebasNeue',
  },
  messageContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageBubble: {
    borderRadius: 20,
    padding: 10,
    marginVertical: 2,
    width: '100%',
  },
  myTextWrapper: {
    backgroundColor: '#FFEB3B',
    padding: 10,
    borderRadius: 20,
    maxWidth: '70%',
  },
  otherTextWrapper: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    maxWidth: '70%',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0,
    paddingVertical: 10,
    backgroundColor: '#008000',
    paddingBottom: Platform.OS === 'ios' ? 65 : 10,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#000000',
    fontFamily: 'LexendDeca',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#008000',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // NEW
  sendButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  myMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
    marginRight: 10,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  typingText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
    backgroundColor: '#eee',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
});

export default AiScreen;
