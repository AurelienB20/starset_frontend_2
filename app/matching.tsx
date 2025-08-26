import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { LexendDeca_400Regular } from '@expo-google-fonts/lexend-deca';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import config from '../config.json';

type JobResult = { job: string; score: number; picture_url?: string };

const StarSetScreen = () => {
  const [situation, setSituation] = useState<string>('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState<string>('');
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [passions, setPassions] = useState<string[]>([]);
  const [notLiked, setNotLiked] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<JobResult[]>([]);

  let [fontsLoaded] = useFonts({
          LexendDeca : LexendDeca_400Regular,
          BebasNeue: BebasNeue_400Regular,
          LeagueSpartanBold : LeagueSpartan_700Bold
      });

  const toggleSelection = (list: string[], setList: (v: string[]) => void, value: string) => {
    if (list.includes(value)) {
      setList(list.filter(v => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const handleAnalyse = async () => {
    setLoading(true);
    setResults([]);

    try {
      const profil = {
        situation: [situation],
        certifications,
        softskills: softSkills,
        passions,
        nepas: notLiked,
      };

      // ⚠️ exemples — à remplacer par les vraies données de ton backend
      const categories = ['Informatique', 'Agriculture', 'Droit', 'Création'];
      const jobs_by_category: Record<string, string[]> = {
        Informatique: ['Développeur', 'Data Scientist', 'Admin Système'],
        Agriculture: ['Agriculteur', 'Technicien agricole', 'Ingénieur agronome'],
        Droit: ['Avocat', 'Juriste', 'Clerc de notaire'],
        Création: ['Designer', 'Graphiste', 'Photographe'],
      };

      const res = await fetch(`${config.backendUrl}/api/ai/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profil,
          categories,
          jobs_by_category,
          model: 'mistral-small-latest',
          maxJobs: 150,
        }),
      });

      const data = await res.json();

      if (data.error) {
        Alert.alert('Erreur', data.error);
      } else {
        // On normalise et on trie par score décroissant
        const jobs: JobResult[] = (data.jobs || [])
          .map((j: any) => ({ job: j.job, score: Number(j.score) || 0, picture_url: j.picture_url }))
          .sort((a: JobResult, b: JobResult) => b.score - a.score);
        setResults(jobs);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible d’analyser le profil');
    } finally {
      setLoading(false);
    }
  };

  // ——— VUE RESULTAT ———
  const ResultView = () => {
    const top = useMemo(() => results.slice(0, 10), [results]); // on affiche jusqu’à 10 résultats
    if (!fontsLoaded) return null;

    const medal = (rank: number) => {
      if (rank === 1) return { color: '#FFD700', text: '1' }; // or
      if (rank === 2) return { color: '#C0C0C0', text: '2' }; // argent
      if (rank === 3) return { color: '#CD7F32', text: '3' }; // bronze
      return { color: '#E5E5E5', text: String(rank) };
    };

    return (
      <View style={stylesR.container}>
        <Text style={[stylesR.title, { fontFamily: 'BebasNeue' }]}>
          VOICI LE RÉSULTAT 🏆
        </Text>

        <ScrollView contentContainerStyle={stylesR.list}>
          {top.map((item, idx) => {
            const r = idx + 1;
            const m = medal(r);
            return (
              <View key={idx} style={stylesR.card}>
                {/* rang / médaille */}
                <View style={[stylesR.badge, { backgroundColor: m.color }]}>
                  <Text style={stylesR.badgeText}>{m.text}</Text>
                </View>

                {/* icône/metier */}
                {item.picture_url ? (
                  <Image source={{ uri: item.picture_url }} style={stylesR.avatar} />
                ) : (
                  <View style={stylesR.iconWrap}>
                    <Ionicons name="briefcase-outline" size={26} color="#555" />
                  </View>
                )}

                {/* nom métier */}
                <Text style={stylesR.job}>{item.job.toUpperCase()}</Text>

                {/* score */}
                <Text style={stylesR.score}>{item.score}/10</Text>
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={stylesR.nextBtn} onPress={() => setResults([])}>
          <Text style={stylesR.nextTxt}>SUIVANT</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ——— RENDU PRINCIPAL ———
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#006400" />
      </View>
    );
  }

  if (results.length > 0) {
    return <ResultView />;
  }

  // ——— FORMULAIRE D'ANALYSE ———
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>QUELS MÉTIERS VOUS CORRESPONDENT LE MIEUX SUR STARSET ?</Text>

      {/* Situation */}
      <Text style={styles.sectionTitle}>QUELLE EST VOTRE SITUATION ACTUELLE ?</Text>
      <View style={styles.pickerContainer}>
        <Picker style={{ color: 'white' , fontFamily : 'LexendDeca' }} selectedValue={situation} onValueChange={itemValue => setSituation(itemValue)}>
          <Picker.Item label="Choisir..." value="" />
          <Picker.Item label="Étudiant" value="etudiant" />
          <Picker.Item label="Agriculteur" value="agriculteur" />
          <Picker.Item label="Salarié" value="salarie" />
        </Picker>
      </View>

      {/* Certifications */}
      <Text style={styles.sectionTitle}>QUELLES SONT VOS CERTIFICATIONS ?</Text>
      <View style={styles.pickerContainer}>
        <Picker
        style={{ color: 'white' , fontFamily : 'LexendDeca'  }}
          selectedValue={newCertification}
          onValueChange={itemValue => {
            if (itemValue && !certifications.includes(itemValue)) {
              setCertifications([...certifications, itemValue]);
            }
            setNewCertification('');
          }}
        >
          <Picker.Item label="Choisir ici" value="" />
          <Picker.Item label="Licence de droit" value="Licence de droit" />
          <Picker.Item label="CRFPA" value="CRFPA" />
          <Picker.Item label="Master Informatique" value="Master Informatique" />
        </Picker>
      </View>
      <View style={styles.tagsContainer}>
        {certifications.map((cert, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.tag}
            onPress={() => setCertifications(certifications.filter(c => c !== cert))}
          >
            <Text style={styles.whiteText}>{cert} ✕</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Soft skills */}
      <Text style={styles.sectionTitle}>QUELLES SONT VOS QUALITÉS ET SOFT SKILLS ?</Text>
      {['Esprit d’équipe', 'Sociabilité/Aisance relationnelle', 'Communication orale / écrite'].map(
        (skill, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.optionButton, softSkills.includes(skill) ? styles.selected : styles.unselected]}
            onPress={() => toggleSelection(softSkills, setSoftSkills, skill)}
          >
            <Text style={[softSkills.includes(skill) ? styles.whiteText : styles.darkText]}>{skill}</Text>
          </TouchableOpacity>
        ),
      )}

      {/* Passions */}
      <Text style={styles.sectionTitle}>QUELLES SONT VOS PASSIONS ET CENTRES D’INTÉRÊTS ?</Text>
      {[
        'Jeux vidéos / e-sport',
        'Collecte/loisir créatif',
        'Écologie protection de l’environnement',
        'Beauté/Esthétique',
      ].map((passion, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.optionButton, passions.includes(passion) ? styles.selected : styles.unselected]}
          onPress={() => toggleSelection(passions, setPassions, passion)}
        >
          <Text style={[passions.includes(passion) ? styles.whiteText : styles.darkText]}>{passion}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.optionButton, passions.includes('Rien') ? styles.redSelected : styles.redUnselected]}
        onPress={() => toggleSelection(passions, setPassions, 'Rien')}
      >
        <Text style={styles.whiteText}>Rien</Text>
      </TouchableOpacity>

      {/* Ce que vous n’appréciez pas */}
      <Text style={styles.sectionTitle}>CE QUE VOUS N’APPRÉCIEZ PAS ?</Text>
      {['Informatique', 'Bureautique', 'Graphisme', 'Photographie'].map((item, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.optionButton, notLiked.includes(item) ? styles.selected : styles.unselected]}
          onPress={() => toggleSelection(notLiked, setNotLiked, item)}
        >
          <Text style={[notLiked.includes(item) ? styles.whiteText : styles.darkText]}>{item}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.optionButton, notLiked.includes('Rien') ? styles.redSelected : styles.redUnselected]}
        onPress={() => toggleSelection(notLiked, setNotLiked, 'Rien')}
      >
        <Text style={styles.whiteText}>Rien</Text>
      </TouchableOpacity>

      {/* Bouton Analyser */}
      <TouchableOpacity style={styles.analyseButton} onPress={handleAnalyse}>
        <Text style={styles.analyseText}>ANALYSER</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontFamily : 'BebasNeue',
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    color: '#007f00ff',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontFamily : 'BebasNeue',
    color: '#007f00ff',
    fontSize : 22
  },
  whiteText: { color: 'white', fontFamily : 'LexendDeca' },
  darkText: { color: 'white',fontFamily : 'LexendDeca' },
  pickerContainer: { backgroundColor: '#FFD700', borderRadius: 8, marginBottom: 15, color : 'white' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 },
  tag: {
    backgroundColor: '#FFD700',
    padding: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  optionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  selected: { backgroundColor: '#45D188' },
  unselected: { backgroundColor: '#A6A6A6' },
  redSelected: { backgroundColor: '#EF3E3E' },
  redUnselected: { backgroundColor: '#FF6666' },
  analyseButton: {
    backgroundColor: '#006400',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  analyseText: { color: 'white', fontFamily : 'LeagueSpartanBold', fontSize: 16 },
});

// ——— Styles de la vue résultat ———
const stylesR = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
    color: '#0F7B0F',
    letterSpacing: 1,
  },
  list: { paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  badgeText: { fontWeight: 'bold', color: '#000' },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  job: { flex: 1, fontFamily : 'BebasNeue', color: '#000', fontSize : 20 },
  score: { fontWeight: 'bold', color: '#0F7B0F' },
  nextBtn: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    backgroundColor: '#0F7B0F',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default StarSetScreen;
