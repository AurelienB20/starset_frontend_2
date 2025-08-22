import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { LexendDeca_400Regular } from "@expo-google-fonts/lexend-deca";
import { useFonts } from "expo-font";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const exampleArticle = `
[TITLE] Bienvenue sur STARSET [/TITLE]

[TEXT]
Le 11 juillet dernier, STARSET a officiellement pris son envol lors d’une soirée de lancement exceptionnelle au prestigieux Relais Spa de Marne-la-Vallée. 
Un moment fort, à la hauteur de l’ambition de notre application : devenir la plateforme de référence en jobbing, connectant particuliers et professionnels 
pour des missions du quotidien comme du babysitting, du pet-sitting, de l’aide à domicile, et bien plus encore.
[/TEXT]

[SUBTITLE] Une soirée inspirante et pleine de rencontres [/SUBTITLE]

[TEXT]
Parmi les invités d’honneur, STARSET a eu le plaisir d’accueillir des représentants du groupe Orano (ex-Areva), des entrepreneurs, des experts de l’innovation, 
et des personnalités du monde du sport comme Mehdi Marzouki, champion de water-polo et figure influente dans l’univers du sport français.

L’objectif ? Offrir une avant-première exclusive de l’application et présenter notre vision : une plateforme humaine, sécurisée et intuitive, pensée pour valoriser vos compétences, 
simplifier les missions et faire du jobbing un levier d’indépendance et de flexibilité.
[/TEXT]

[BANNER] https://api.starsetfrance.com/media/news/starset_news_1_image_1.png [/BANNER]

[SUBTITLE] L’app STARSET dévoilée en avant-première [/SUBTITLE]

[TEXT]
Les invités ont pu tester l’application avant son ouverture au public. Résultat : de nombreuses inscriptions et des premiers retours enthousiastes sur la simplicité de navigation, 
la clarté des profils, et la mise en relation rapide et ciblée avec des particuliers à la recherche de talents comme vous.
[/TEXT]

[SUBTITLE] Et maintenant… à vous de jouer ! [/SUBTITLE]

[TEXT]
Cette soirée de lancement marque le début d’une aventure collective. STARSET a été conçue pour vous donner les moyens de travailler à votre rythme, selon vos disponibilités, 
et dans les domaines qui vous passionnent.

Vous avez un profil ? Alors activez-le. Complétez-le. Mettez-vous en ligne.

Chaque jour, de nouvelles missions sont proposées par des particuliers à la recherche de talents de confiance.

Ce n’est que le début, et vous faites partie des premiers à pouvoir bâtir votre réseau et votre réputation sur STARSET.
[/TEXT]

[SUBTITLE] STARSET, c’est plus qu’une appli. C’est une communauté [/SUBTITLE]

[TEXT]
Nous sommes fiers de vous avoir parmi nous dès les premiers pas de l’aventure. 
D’autres événements, rencontres, avantages et surprises vous attendent dans les mois à venir…

Alors, prêt(e) à briller avec STARSET ?
[/TEXT]

[ROWIMAGES]
https://api.starsetfrance.com/media/news/starset_news_1_image_2.png
https://api.starsetfrance.com/media/news/starset_news_1_image_3.png
https://api.starsetfrance.com/media/news/starset_news_1_image_4.jpg
[/ROWIMAGES]

[TEXT]
Rédige par 
[/TEXT]

[AUTHOR]
[IMG] https://api.starsetfrance.com/media/news/starset_news_1_image_5.png [/IMG]
[/AUTHOR]

`;


const { width } = Dimensions.get("window");

const ArticleScreen = ({ text = exampleArticle }) => {

    let [fontsLoaded] = useFonts({
        LexendDeca : LexendDeca_400Regular,
        BebasNeue: BebasNeue_400Regular,
        LeagueSpartanBold : LeagueSpartan_700Bold
    });


  const parseArticle = (rawText: string) => {
    const lines = rawText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

    let blocks: any[] = [];
    let currentRowImages: string[] = [];
    let currentText: string[] = [];
    let currentAuthor: { url?: string; name?: string } | null = null;
    let isTextBlock = false;
    let isAuthorBlock = false;

    lines.forEach((line) => {
      if (line.startsWith("[TITLE]")) {
        blocks.push({ type: "title", content: line.replace("[TITLE]", "").replace("[/TITLE]", "").trim() });
      } else if (line.startsWith("[SUBTITLE]")) {
        blocks.push({ type: "subtitle", content: line.replace("[SUBTITLE]", "").replace("[/SUBTITLE]", "").trim() });
      } else if (line.startsWith("[TEXT]")) {
        isTextBlock = true;
        currentText = [];
      } else if (line.startsWith("[/TEXT]")) {
        blocks.push({ type: "text", content: currentText.join("\n") });
        isTextBlock = false;
      } else if (line.startsWith("[BANNER]")) {
        blocks.push({ type: "banner", url: line.replace("[BANNER]", "").replace("[/BANNER]", "").trim() });
      } else if (line.startsWith("[ROWIMAGES]")) {
        currentRowImages = [];
      } else if (line.startsWith("[/ROWIMAGES]")) {
        blocks.push({ type: "rowImages", urls: currentRowImages });
        currentRowImages = [];
      } else if (line.startsWith("[AUTHOR]")) {
        isAuthorBlock = true;
        currentAuthor = {};
      } else if (line.startsWith("[/AUTHOR]")) {
        if (currentAuthor) blocks.push({ type: "author", ...currentAuthor });
        isAuthorBlock = false;
        currentAuthor = null;
      } else if (line.startsWith("[IMG]") && isAuthorBlock) {
        const url = line.replace("[IMG]", "").replace("[/IMG]", "").trim();
        if (currentAuthor) currentAuthor.url = url;
      } else {
        if (isTextBlock) {
          currentText.push(line);
        } else if (currentRowImages.length >= 0) {
          currentRowImages.push(line);
        }
      }
    });

    return blocks;
  };

  const blocks = parseArticle(text);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {blocks.map((block, index) => {
        if (block.type === "title") {
          return <Text key={index} style={styles.title}>{block.content}</Text>;
        }
        if (block.type === "subtitle") {
          return <Text key={index} style={styles.subtitle}>{block.content}</Text>;
        }
        if (block.type === "text") {
          return <Text key={index} style={styles.text}>{block.content}</Text>;
        }
        if (block.type === "banner") {
          return (
            <Image
              key={index}
              source={{ uri: block.url }}
              style={styles.banner}
              resizeMode="cover"
            />
          );
        }
        if (block.type === "rowImages") {
          return (
            <View key={index} style={styles.rowImages}>
              {block.urls.map((url: string, i: number) => (
                <Image
                  key={i}
                  source={{ uri: url }}
                  style={styles.rowImage}
                  resizeMode="cover"
                />
              ))}
            </View>
          );
        }
        if (block.type === "author") {
          return (
            <Image
              key={index}
              source={{ uri: block.url }}
              style={styles.signature}
              resizeMode="cover"
            />
          );
        }
        return null;
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    marginBottom : 30
  },
  title: {
    fontSize: 40,
    fontFamily : 'BebasNeue',
    color: "#222",
    marginBottom: 12,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 24,
    fontFamily : 'LeagueSpartanBold',
    color: "#444",
    marginTop: 20,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
    marginBottom: 10,
    fontFamily : 'LexendDeca'
  },
  banner: {
    width: width - 32,
    height: 200,
    //borderRadius: 10,
    marginVertical: 15,
    backgroundColor: "#eee",
  },
  signature: {
    width: width - 32,
    height: 95,
  },
  rowImages: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  rowImage: {
    flex: 1,
    height: 100,
    marginHorizontal: 4,
    //borderRadius: 8,
    backgroundColor: "#ddd",
  },
});

export default ArticleScreen;
