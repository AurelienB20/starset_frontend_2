import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import config from '../config.json';

const StarSetScreen = () => {
  const [situation, setSituation] = useState<string>('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState<string>('');
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [passions, setPassions] = useState<string[]>([]);
  const [notLiked, setNotLiked] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

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

      // ⚠️ Ici j’ai mis des exemples de catégories et jobs_by_category
      // → tu devras les remplacer par ce que ton backend t’envoie réellement
      const categories = ["Informatique", "Agriculture", "Droit", "Création"];
      const jobs_by_category: Record<string, string[]> = {
        "Informatique": ["Développeur", "Data Scientist", "Admin Système"],
        "Agriculture": ["Agriculteur", "Technicien agricole", "Ingénieur agronome"],
        "Droit": ["Avocat", "Juriste", "Clerc de notaire"],
        "Création": ["Designer", "Graphiste", "Photographe"]
      };

      const res = await fetch(`${config.backendUrl}/api/ai/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profil,
          categories,
          jobs_by_category,
          model: "mistral-small-latest",
          maxJobs: 150,
        }),
      });

      const data = await res.json();

      if (data.error) {
        Alert.alert("Erreur", data.error);
      } else {
        setResults(data.jobs || []);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible d’analyser le profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>QUELS MÉTIERS VOUS CORRESPONDENT LE MIEUX SUR STARSET ?</Text>

      {/* Situation */}
      <Text style={styles.sectionTitle}>QUELLE EST VOTRE SITUATION ACTUELLE ?</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={situation}
          onValueChange={(itemValue) => setSituation(itemValue)}
        >
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
          selectedValue={newCertification}
          onValueChange={(itemValue) => {
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
      {["Esprit d’équipe", "Sociabilité/Aisance relationnelle", "Communication orale / écrite"].map((skill, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.optionButton, softSkills.includes(skill) ? styles.selected : styles.unselected]}
          onPress={() => toggleSelection(softSkills, setSoftSkills, skill)}
        >
          <Text style={[softSkills.includes(skill) ? styles.whiteText : styles.darkText]}>{skill}</Text>
        </TouchableOpacity>
      ))}

      {/* Passions */}
      <Text style={styles.sectionTitle}>QUELLES SONT VOS PASSIONS ET CENTRES D’INTÉRÊTS ?</Text>
      {["Jeux vidéos / e-sport", "Collecte/loisir créatif", "Écologie protection de l’environnement", "Beauté/Esthétique"].map((passion, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.optionButton, passions.includes(passion) ? styles.selected : styles.unselected]}
          onPress={() => toggleSelection(passions, setPassions, passion)}
        >
          <Text style={[passions.includes(passion) ? styles.whiteText : styles.darkText]}>{passion}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.optionButton, passions.includes("Rien") ? styles.redSelected : styles.redUnselected]}
        onPress={() => toggleSelection(passions, setPassions, "Rien")}
      >
        <Text style={styles.whiteText}>Rien</Text>
      </TouchableOpacity>

      {/* Ce que vous n’appréciez pas */}
      <Text style={styles.sectionTitle}>CE QUE VOUS N’APPRÉCIEZ PAS ?</Text>
      {["Informatique", "Bureautique", "Graphisme", "Photographie"].map((item, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.optionButton, notLiked.includes(item) ? styles.selected : styles.unselected]}
          onPress={() => toggleSelection(notLiked, setNotLiked, item)}
        >
          <Text style={[notLiked.includes(item) ? styles.whiteText : styles.darkText]}>{item}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.optionButton, notLiked.includes("Rien") ? styles.redSelected : styles.redUnselected]}
        onPress={() => toggleSelection(notLiked, setNotLiked, "Rien")}
      >
        <Text style={styles.whiteText}>Rien</Text>
      </TouchableOpacity>

      {/* Bouton Analyser */}
      <TouchableOpacity style={styles.analyseButton} onPress={handleAnalyse}>
        <Text style={styles.analyseText}>ANALYSER</Text>
      </TouchableOpacity>

      {/* Résultats */}
      {loading ? (
        <ActivityIndicator size="large" color="#006400" style={{ marginTop: 20 }} />
      ) : (
        results.length > 0 && (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.sectionTitle}>Résultats :</Text>
            {results.map((r, idx) => (
              <Text key={idx} style={{ marginBottom: 5 }}>
                {r.job} — Score : {r.score}
              </Text>
            ))}
          </View>
        )
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { 
      padding: 20, 
      paddingBottom: 40, 
      backgroundColor: '#fff', 
      flexGrow: 1 
    },
  
    title: { 
      fontWeight: 'bold', 
      fontSize: 18, 
      marginBottom: 20, 
      textAlign: 'center', 
      color: '#006400' 
    },
  
    sectionTitle: { 
      marginTop: 20, 
      marginBottom: 10, 
      fontWeight: 'bold', 
      color: '#000' 
    },
  
    whiteText: { 
      color: 'white', 
      fontWeight: 'bold' 
    },
  
    darkText: { 
      color: '#333' 
    },
  
    pickerContainer: { 
      backgroundColor: '#FFD700', 
      borderRadius: 8, 
      marginBottom: 15 
    },
  
    tagsContainer: { 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      marginVertical: 10 
    },
  
    tag: { 
      backgroundColor: '#FFD700', 
      padding: 8, 
      borderRadius: 20, 
      marginRight: 10, 
      marginBottom: 10 
    },
  
    optionButton: { 
      paddingVertical: 12, 
      borderRadius: 8, 
      marginBottom: 12, 
      alignItems: 'center' 
    },
  
    selected: { 
      backgroundColor: '#45D188' 
    },
  
    unselected: { 
      backgroundColor: '#A6A6A6' 
    },
  
    redSelected: { 
      backgroundColor: '#EF3E3E' 
    },
  
    redUnselected: { 
      backgroundColor: '#FF6666' 
    },
  
    analyseButton: { 
      backgroundColor: '#006400', 
      paddingVertical: 15, 
      borderRadius: 10, 
      marginTop: 30, 
      alignItems: 'center' 
    },
  
    analyseText: { 
      color: 'white', 
      fontWeight: 'bold', 
      fontSize: 16 
    },
  });

export default StarSetScreen;
