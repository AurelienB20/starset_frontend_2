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
Le 11 juillet dernier, STARSET a officiellement pris son envol lors d’une soirée de lancement exceptionnelle.
Un moment fort, à la hauteur de l’ambition de notre application.
[/TEXT]

[SUBTITLE] Une soirée inspirante et pleine de rencontres [/SUBTITLE]

[TEXT]
Le 11 juillet dernier, STARSET a officiellement pris son envol lors d’une soirée de lancement exceptionnelle.
Un moment fort, à la hauteur de l’ambition de notre application.
[/TEXT]

[BANNER] https://tse2.mm.bing.net/th/id/OIP.aMudBA3q3prJFT7wkjbq_gHaDe?rs=1&pid=ImgDetMain&o=7&rm=3 [/BANNER]

[TEXT]
Parmi les invités d’honneur, STARSET a accueilli des entrepreneurs, des experts de l’innovation,
et des personnalités du sport.
[/TEXT]

[SUBTITLE] L’app STARSET dévoilée en avant-première [/SUBTITLE]

[TEXT]
Les invités ont pu tester l’application avant son ouverture au public. Résultat :
de nombreuses inscriptions et des premiers retours enthousiastes.
[/TEXT]

[ROWIMAGES]
https://www.photo-paysage.com/albums/userpics/10001/thumb_Reflets-lac_Vallon-montagne-alpes-foret-IMG_1831.jpeg
https://www.photo-paysage.com/albums/userpics/10001/thumb_Reflets-lac_Vallon-montagne-alpes-foret-IMG_1831.jpeg
https://www.photo-paysage.com/albums/userpics/10001/thumb_Reflets-lac_Vallon-montagne-alpes-foret-IMG_1831.jpeg
[/ROWIMAGES]

[TEXT]
Chaque jour, de nouvelles missions seront proposées par des particuliers à la recherche de talents de confiance.
[/TEXT]

[BANNER] https://tse2.mm.bing.net/th/id/OIP.aMudBA3q3prJFT7wkjbq_gHaDe?rs=1&pid=ImgDetMain&o=7&rm=3 [/BANNER]

[TEXT]
Alors, prêt(e) à briller avec STARSET ?
[/TEXT]
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
    let isTextBlock = false;

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
  },
  banner: {
    width: width - 32,
    height: 200,
    //borderRadius: 10,
    marginVertical: 15,
    backgroundColor: "#eee",
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
