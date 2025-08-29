import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue';
import { LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { LexendDeca_400Regular } from '@expo-google-fonts/lexend-deca';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import config from '../config.json';

type JobResult = { job: string; score: number; picture_url?: string };

const StarSetScreen = () => {
  
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState<string>('');
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [passions, setPassions] = useState<string[]>([]);
  const [notLiked, setNotLiked] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<JobResult[]>([]);
  const [allMandatoryDocs, setAllMandatoryDocs] = useState<string[]>([]);

  const [situation, setSituation] = useState<string>('');
  const [situationModalVisible, setSituationModalVisible] = useState(false);
  const [certificationModalVisible, setCertificationModalVisible] = useState(false);

  const situations = [
    'Étudiant',
    'Agriculteur',
    'Salarié',
    'Artisan',
    'Commerçant',
    'Chef d’entreprise',
    'Auto-entrepreneur / Indépendant',
    'Cadre',
    'Profession intellectuelle supérieure (médecin, avocat, ingénieur, etc.)',
    'Profession intermédiaire (technicien, infirmier, instituteur, contremaître, etc.)',
    'Employé de bureau / administratif',
    'Employé de commerce (vendeur, caissier, etc.)',
    'Employé de service (aide-soignant, assistant maternel, etc.)',
    'Ouvrier qualifié',
    'Ouvrier non qualifié',
    'Demandeur d’emploi / Chômeur',
    'Retraité',
    'Personne au foyer / Inactif',
  ];

  const softSkillsOptions = [
    'Esprit d’équipe',
    'Sociabilité/Aisance relationnelle',
    'Communication orale / écrite',
    'Prise de parole en public',
    'Sens de l’organisation',
    'Rigueur / précision',
    'Autonomie',
    'Capacité d’adaptation / flexibilité',
    'Gestion du stress',
    'Esprit d’initiative',
    'Créativité',
    'Sens des responsabilités',
    'Leadership',
    'Empathie / écoute active',
    'Patience / pédagogie',
    'Résolution de problèmes',
    'Capacité d’analyse / esprit critique',
    'Fiabilité / ponctualité',
    'Motivation / implication',
    'Curiosité / envie d’apprendre',
  ];

  const passionsOptions = [
    'Jeux vidéos / e-sport',
    'Collecte/loisir créatif',
    'Écologie protection de l’environnement',
    'Beauté/Esthétique',
    'Informatique / Programmation / Développement web',
    'Bureautique / Outils numériques',
    'Graphisme / Design / Dessin / Illustration',
    'Photographie / Vidéo / Montage',
    'Musique / Chant / Instrument',
    'Danse / Théâtre / Arts de la scène',
    'Lecture / Écriture / Blog / Journalisme',
    'Langues étrangères / Traduction',
    'Cuisine / Pâtisserie / Gastronomie',
    'Sports / Fitness / Yoga / Arts martiaux',
    'Nature / Jardinage / Agriculture urbaine',
    'Animaux / Soins animaliers / Protection animale',
    'Voyage / Découverte de cultures',
    'Sciences / Mathématiques / Expérimentation',
    'Bricolage / DIY / Artisanat',
    'Développement personnel / Méditation',
    'Engagement associatif / Bénévolat',
  ];

  // identique aux passions
  const notLikedOptions = passionsOptions;

  let [fontsLoaded] = useFonts({
          LexendDeca : LexendDeca_400Regular,
          BebasNeue: BebasNeue_400Regular,
          LeagueSpartanBold : LeagueSpartan_700Bold
      });

      useEffect(() => {
        const fetchMandatoryDocs = async () => {
          try {
            const res = await fetch(`${config.backendUrl}/api/document/get-all-mandatory-document`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (data.success) {
              // Flatten, nettoyage, filtrage et suppression des doublons
              const docs : any = Array.from(
                new Set(
                  data.data
                    .flatMap((d: any) => d.mandatory_documents)
                    .map((doc: string) => doc.trim()) // supprime espaces inutiles
                    .filter((doc: string) => {
                      const lower = doc.toLowerCase();
                      return (
                        doc.length > 0 && // enlève les vides
                        !lower.includes('au moins') &&
                        !lower.includes('avoir')
                      );
                    })
                )
              );
        
              setAllMandatoryDocs(docs);
            }
          } catch (err) {
            console.error('Erreur fetch mandatory docs:', err);
          }
        };
    
        fetchMandatoryDocs();
      }, []);

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
      <TouchableOpacity
        style={styles.pickerContainer}
        onPress={() => setSituationModalVisible(true)}
      >
        <Text style={{ color: 'white', fontFamily: 'LexendDeca', marginHorizontal :10, marginVertical : 20 }}>
          {situation || 'Choisir...'}
        </Text>
      </TouchableOpacity>

      {/* Modal de choix */}
      <Modal
        visible={situationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSituationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {situations.map((sit, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.optionButton,
                    situation === sit ? styles.selected : styles.unselected,
                  ]}
                  onPress={() => {
                    setSituation(sit);
                    setSituationModalVisible(false);
                  }}
                >
                  <Text style={[
    situation === sit ? styles.whiteText : styles.darkText,
    { padding: 8 }
  ]}
>
                    {sit}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Bouton fermer */}
            <TouchableOpacity
              style={[styles.analyseButton, { marginTop: 10 }]}
              onPress={() => setSituationModalVisible(false)}
            >
              <Text style={styles.analyseText}>FERMER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
  visible={certificationModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setCertificationModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <ScrollView>
        {allMandatoryDocs.map((doc, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.optionButton,
              certifications.includes(doc) ? styles.selected : styles.unselected,
            ]}
            onPress={() => {
              if (certifications.includes(doc)) {
                setCertifications(certifications.filter(c => c !== doc));
              } else {
                setCertifications([...certifications, doc]);
              }
            }}
          >
            <Text style={certifications.includes(doc) ? styles.whiteText : styles.darkText}>
              {doc}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bouton fermer */}
      <TouchableOpacity
        style={[styles.analyseButton, { marginTop: 10 }]}
        onPress={() => setCertificationModalVisible(false)}
      >
        <Text style={styles.analyseText}>FERMER</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      {/* Certifications */}
      <Text style={styles.sectionTitle}>QUELLES SONT VOS CERTIFICATIONS ?</Text>
      <View style={styles.pickerContainer}>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setCertificationModalVisible(true)}
        >
          <Text style={{ color: 'white', fontFamily: 'LexendDeca', marginHorizontal: 10, marginVertical: 10 }}>
            Ajouter une certification
          </Text>
        </TouchableOpacity>
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
      {softSkillsOptions.map(
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
      {passionsOptions.map((passion, idx) => (
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
      {notLikedOptions.map((item, idx) => (
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

  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  width: '80%',
  maxHeight: '70%',
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 20,
},

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
