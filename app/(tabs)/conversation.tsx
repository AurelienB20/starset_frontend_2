import { LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { LexendDeca_400Regular } from '@expo-google-fonts/lexend-deca';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import config from '../../config.json';
import socket from '../socket'; // ✅ Import du socket global

const SCREEN_WIDTH = Dimensions.get('window').width;

const SkeletonMessage = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, SCREEN_WIDTH],
  });

  return (
    <View style={styles.messageContainer}>
      <View style={[styles.profileImage, { backgroundColor: '#DDD' }]} />
      <View style={styles.skeletonTextWrapper}>
        <View style={styles.skeletonText} />
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </View>
  );
};

// ...imports inchangés

const ConversationScreen = () => {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  let [fontsLoaded] = useFonts({
      
      LexendDeca : LexendDeca_400Regular,
      LeagueSpartanBold : LeagueSpartan_700Bold
    });

  const getAccountId = async () => {
    try {
      const account_id = await AsyncStorage.getItem('account_id');
      return account_id;
    } catch (e) {
      console.error('Erreur lors de la récupération de l\'ID utilisateur', e);
    }
  };

  const getFormattedTime = (timestamp: string) => {
    const date = new Date(timestamp);

    date.setHours(date.getHours() + 6);
    const now = new Date();
  
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
  
    if (isToday) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  };
  

  const gotoChat = async (conversationId: string, contactProfilePictureUrl: string, contactFirstname: string) => {
    const sender_id = await getAccountId();
    navigation.navigate({
      name: 'chat',
      params: {
        conversation_id: conversationId,
        sender_id,
        sender_type: 'user',
        contact_profile_picture_url: contactProfilePictureUrl,
        contact_firstname: contactFirstname,
      },
    } as never);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.messageContainer}
      onPress={() => gotoChat(item.id, item.profile_picture_url, item.firstname)}
    >
      <Image
        source={{ uri: item.profile_picture_url || "https://static.vecteezy.com/ti/vecteur-libre/p1/7033146-icone-de-profil-login-head-icon-vectoriel.jpg" }}
        style={styles.profileImage}
      />
      <View style={styles.messageContent}>
        <Text style={styles.name}>
          {item.firstname}
          {!item.accepted && <Text style={styles.notAccepted}> (non acceptée)</Text>}
        </Text>
        <Text style={styles.message}>{item.message_text}</Text>
      </View>
      <Text style={styles.time}>{getFormattedTime(item.timestamp)}</Text>
    </TouchableOpacity>
  );

  const getAllConversation = async () => {
    try {
      const worker_id = await getAccountId();
      if (!worker_id) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${config.backendUrl}/api/conversation/get-all-worker-conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id }),
      });

      const data = await response.json();

      if (data) {
        // ⬇️ Tri du plus récent au plus ancien
        const sorted = [...data.conversations].sort(
          (a: any, b: any) =>
            new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()
        );

        setConversations(sorted);

        // Rejoindre les rooms socket
        const conversationIds = sorted.map((conv: any) => conv.id);
        socket.emit('joinUserConversations', conversationIds);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllConversation();

    socket.on('newMessage', (message: any) => {
      setConversations((prev: any) => {
        const updated = prev.map((conv: any) =>
          conv.id === message.conversation_id
            ? { ...conv, message_text: message.message_text, timestamp: message.timestamp }
            : conv
        );

        // On re-trie pour garder la plus récente en haut
        updated.sort(
          (a: any, b: any) =>
            new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()
        );

        return updated;
      });
    });

    return () => {
      socket.off('newMessage');
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.messagerieContainer}>
        <Image
          source={ require('../../assets/images/Messagerie.png') }
          style={styles.messagerie}
        />
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher"
        placeholderTextColor="#666"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {isLoading ? (
        Array.from({ length: 6 }).map((_, index) => <SkeletonMessage key={index} />)
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};





const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  searchBar: {
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  messageContent: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 16,
    fontFamily : 'LeagueSpartanBold'
  },
  message: {
    fontSize: 14,
    color: '#666',
    fontFamily : 'LexendDeca'
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  messagerie: {
    height: 80,
    width: '70%',
  },
  messagerieContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonTextWrapper: {
    flex: 1,
    height: 20,
    backgroundColor: '#DDD',
    marginLeft: 10,
    borderRadius: 4,
    overflow: 'hidden',
  },
  skeletonText: {
    width: '100%',
    height: '100%',
    backgroundColor: '#DDD',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  notAccepted: {
  color: '#FF5E5E',
  fontSize: 12,
  fontStyle: 'italic',
},
});

export default ConversationScreen;


