import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LANGUAGES = [
  { code: 'fr', name: 'Français' },
 /* { code: 'en', name: 'Anglais'},
  { code: 'zh', name: 'China' },
  { code: 'ar', name: 'Arabe' },
  { code: 'es', name: 'Espagnol'},
  { code: 'hi', name: 'Hindi'},
  { code: 'km', name: 'Khmer'},
  { code: 'he', name: 'Hébreu'},
  { code: 'de', name: 'Allemand'},
  { code: 'ru', name: 'Russe'},*/
];

const LanguageScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('fr');

  const renderItem = ({ item } : any) => (
    <TouchableOpacity
      style={styles.languageRow}
      onPress={() => setSelectedLanguage(item.code)}
    >
      <View style={styles.languageInfo}>
        
        <Text style={styles.languageText}>{item.name}</Text>
      </View>
      {selectedLanguage === item.code && (
        <Text style={styles.check}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={LANGUAGES}
        keyExtractor={item => item.code}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    paddingTop: 50
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center'
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  flag: {
    width: 24,
    height: 18,
    resizeMode: 'cover',
    marginRight: 15
  },
  languageText: {
    fontSize: 16,
    color : 'black'
  },
  check: {
    fontSize: 18,
    color: '#999'
  }
});

export default LanguageScreen;
