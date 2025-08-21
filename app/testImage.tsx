import { useNavigation } from '@react-navigation/native';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const PrestationViewScreen = () => {
  const navigation = useNavigation();
  const profilePictureUrl = 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQHwYWVZIpxmpjpWnXE5lRRf8emOQ-xBVoYihRCt6gDCyGpbtUzyCoabQ09e2KnsGEJYRby1cwHlnEX8P7gBHiRIw';
  const scrollY = useRef(new Animated.Value(0)).current;

  const profileImageSize = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [120, 80],
    extrapolate: 'clamp',
  });//test

  return (
    <View style={styles.container}>
      {/* Profil (fixé en haut) */}
      <Animated.View style={[styles.profileContainer]}>
        <Animated.Image
          source={{ uri: profilePictureUrl }}
          style={[styles.profilePicture, { width: profileImageSize, height: profileImageSize }]}
        />
      </Animated.View>

      {/* Contenu avec ScrollView */}
      <Animated.ScrollView
        style={styles.scrollContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          <Text style={styles.profileName}>Alicia</Text>
          <Text style={styles.profileDescription}>Professionnelle de la garde d'enfants</Text>
        </View>

        {/* Blocs de test */}
        <View style={styles.testBlockRed} />
        <View style={styles.testBlockBlue} />
        <View style={styles.testBlockGreen} />
        <View style={styles.testBlockYellow} />
        <View style={styles.testBlockRed} />
        <View style={styles.testBlockBlue} />
        <View style={styles.testBlockGreen} />
        <View style={styles.testBlockYellow} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  profilePicture: {
    borderRadius: 60,
  },
  scrollContainer: {
    marginTop: 150,
  },
  content: {
    padding: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color : 'black'
  },
  profileDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
  testBlockRed: {
    height: 200,
    backgroundColor: 'red',
    marginVertical: 10,
  },
  testBlockBlue: {
    height: 200,
    backgroundColor: 'blue',
    marginVertical: 10,
  },
  testBlockGreen: {
    height: 200,
    backgroundColor: 'green',
    marginVertical: 10,
  },
  testBlockYellow: {
    height: 200,
    backgroundColor: 'yellow',
    marginVertical: 10,
  },
});

export default PrestationViewScreen;
