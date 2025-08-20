import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const AboutScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Logo Starset */}
      <View style={styles.header}>
        <Text style={styles.logo}>Starset</Text>
        <Text style={styles.subtitle}>Trouvez des professionnels qualifiés près de chez vous</Text>
      </View>

      {/* À propos */}
      <View style={styles.section}>
        <Text style={styles.title}>À propos de nous</Text>
        <Text style={styles.text}>
          Starset est une application de mise en relation entre particuliers et professionnels
          pour des missions de courtes durées. Notre plateforme vous permet de trouver rapidement
          des prestataires compétents et disponibles dans votre région.
        </Text>
      </View>

      {/* Nos services */}
      <View style={styles.section}>
        <Text style={styles.title}>Nos services</Text>
        <Text style={styles.text}>Trouvez des professionnels pour :</Text>
        <View style={styles.serviceList}>
          <Text style={styles.bullet}>• Ménage</Text>
          <Text style={styles.bullet}>• Jardinage</Text>
          <Text style={styles.bullet}>• Bricolage</Text>
          <Text style={styles.bullet}>• Déménagement</Text>
          <Text style={styles.bullet}>• Cours particuliers</Text>
          <Text style={styles.bullet}>• Et bien plus encore...</Text>
        </View>
      </View>

      {/* Contact */}
      <View style={styles.section}>
        <Text style={styles.title}>Contactez-nous</Text>
        <Text style={styles.text}><FontAwesome name="envelope" /> contact@starset.com</Text>
        <Text style={styles.text}><FontAwesome name="phone" /> 01 23 45 67 89</Text>
      </View>

      {/* Réseaux sociaux */}
      <View style={styles.section}>
        <Text style={styles.title}>Suivez-nous</Text>
        <View style={styles.socialIcons}>
          <FontAwesome name="facebook" size={24} color="#3b5998" style={styles.icon} />
          <FontAwesome name="instagram" size={24} color="#C13584" style={styles.icon} />
          <FontAwesome name="twitter" size={24} color="#1DA1F2" style={styles.icon} />
        </View>
      </View>
    </ScrollView>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00cc66',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  section: {
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color : 'black'
  },
  text: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  serviceList: {
    marginTop: 10,
  },
  bullet: {
    fontSize: 16,
    marginLeft: 10,
    marginVertical: 2,
    color: 'black'
  },
  socialIcons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  icon: {
    marginRight: 15,
  },
});
