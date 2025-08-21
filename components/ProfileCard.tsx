import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileCardProps {
  item: any;
}

const ProfileCard = ({ item }: ProfileCardProps) => {
  const navigation = useNavigation();

  const goToPrestationViewWithId = (id: any) => {
    console.log(item)
    console.log("item")
    console.log('Navigating to prestationView with id:', id);
    navigation.navigate({
      name: 'prestationView',
      params: { id },
    } as never);
  };

  const fullStars = Math.floor(item.average_rating);
  const emptyStars = 5 - fullStars;
  const showStars = item.average_rating !== null && item.average_rating !== undefined && item.average_rating > 0;

  return (
    <TouchableOpacity style={styles.profileContainerList} onPress={() => goToPrestationViewWithId(item.metiers[0]?.id)}>
      <Image
        source={{
          uri:
            item.profile_picture_url ||
            'https://static.vecteezy.com/ti/vecteur-libre/p1/7033146-icone-de-profil-login-head-icon-vectoriel.jpg',
        }}
        style={styles.profileImage}
      />

      <View style={styles.profileInfo}>
        <View style={styles.nameAndRating}>
          <View>
            <Text style={styles.profileName}>{item.firstname}</Text>
            <Text style={styles.pseudo}>@{item.pseudo}</Text>
          </View>

          {showStars && (
            <View style={styles.ratingContainer}>
              {[...Array(fullStars)].map((_, index) => (
                <Ionicons key={`full-${index}`} name="star" size={16} color="gold" />
              ))}
              {[...Array(emptyStars)].map((_, index) => (
                <Ionicons key={`empty-${index}`} name="star-outline" size={16} color="gray" />
              ))}
            </View>
          )}
        </View>

        <View style={styles.profileDescriptionContainer}>
          <Text style={styles.profileDescription}>{item.description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  profileContainerList: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 10,
    
    backgroundColor : 'white',
    borderRadius : 10
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginRight: 10,
  },
  profileInfo: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-between',
  },
  profileName: {
    fontSize: 19,
    fontFamily: 'Glacial-Bold',
    color : 'black'
  },
  pseudo: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'LexendDeca',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  profileDescriptionContainer: {
    marginVertical: 5,
  },
  profileDescription: {
    fontSize: 14,
    marginVertical: 5,
    textAlign: 'center',
    fontFamily: 'BebasNeue',
    color : 'black'
  },
  nameAndRating: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});

export default ProfileCard;
