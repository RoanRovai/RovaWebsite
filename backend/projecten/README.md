# Projectkennis voor de chatbot

Deze map is de bron voor alle projectinformatie die de Rovai-chatbot mag gebruiken. `backend/main.py` laadt bij het opstarten automatisch ieder niet-leeg `.txt`-bestand in alfabetische volgorde.

De chatbot gebruikt twee lagen:

- Bij een gewone vraag ziet het model geen projectcatalogus. Dat spaart tokens, ook wanneer deze map later veel projecten bevat.
- Bij een algemene projectvraag ziet het model maximaal twaalf projecten, met alleen `PROJECT`, `BEDRIJF` en `SAMENVATTING`.
- `TREFWOORDEN` blijft intern in de backend en bepaalt welk volledig projectbestand bij een specifieke vraag wordt toegevoegd.
- Bij een specifieke vraag worden alleen de relevante publieke projectdetails meegestuurd, met een maximum van vier dossiers tegelijk.
- Vraagt een bezoeker naar een type oplossing ("hebben jullie chatbots gebouwd?"), dan filtert `CATEGORIE` de lijst tot alleen dat type. Heeft Rovai daar nog geen project, dan krijgt het model de opdracht dat eerlijk te zeggen in plaats van een ander project als vergelijkbaar te presenteren.
- Zijn er meer projecten dan in de index passen, dan kiest de backend een spreiding over de verschillende bedrijven. Zo toont een algemene vraag een staal van verschillende klanten, niet tien projecten van dezelfde klant.

## Een project toevoegen

1. Kopieer een bestaand `.txt`-bestand.
2. Geef het bestand een oplopend nummer en een duidelijke naam, bijvoorbeeld `04-bedrijf-chatbot.txt`.
3. Vul alleen controleerbare, publieke feiten in onder dezelfde rubrieken.
4. Zet namen die niet gedeeld mogen worden nooit in deze map. Schrijf onder `PUBLIEKE COMMUNICATIEREGELS` wel duidelijk welke omschrijving de chatbot publiek moet gebruiken.
5. Herstart de backend zodat het nieuwe bestand in de systeemprompt wordt geladen.

Ieder `.txt`-bestand telt als één project of automatisering. Horen twee projecten inhoudelijk samen, laat dat dan uit de projectnamen en samenvattingen blijken; de chatbot leidt het verband daaruit af. De indeling van de website staat los van deze map en wordt met de hand in de HTML bepaald.

De onderdelen `PROJECT:`, `BEDRIJF:`, `STATUS:`, `CATEGORIE:`, `SAMENVATTING:`, `TREFWOORDEN:` en `PUBLIEKE COMMUNICATIEREGELS` zijn verplicht. Een onvolledig of niet-UTF-8-bestand wordt voor de veiligheid niet ingeladen.

Alleen de vaste publieke velden en rubrieken uit de voorbeeldbestanden kunnen naar het AI-model worden gestuurd. Een onbekende rubriek, zoals interne notities, wordt genegeerd. Bewaar hier desondanks nooit wachtwoorden, API-sleutels, persoonsgegevens of andere geheimen.

Zet in `TREFWOORDEN` ook de herkenbare bedrijfsnaam en woorden die een bezoeker waarschijnlijk gebruikt. Gedeelde trefwoorden mogen in meerdere projecten staan; zo kan de backend bij een vergelijking meerdere relevante dossiers selecteren.

## Het verschil tussen CATEGORIE en TREFWOORDEN

`CATEGORIE` is het *type* oplossing en bepaalt wat er gebeurt bij een vraag als "doen jullie ook dashboards?". Gebruik een korte lijst uit de vaste woordenlijst in `CATEGORY_ALIASES` in `backend/main.py`: `chatbot`, `procesautomatisering`, `webautomatisering`, `dashboard`, `documentverwerking`, `dataintegratie` en `maatwerk`. Een project mag meerdere categorieën hebben.

Een nieuwe categorie mag je gewoon invullen; ze werkt dan op haar eigen naam. Wil je dat bezoekers ze ook met synoniemen vinden, voeg de categorie dan toe aan `CATEGORY_ALIASES`. De backend logt bij het opstarten welke categorieën nog geen synoniemen hebben.

`TREFWOORDEN` is het *herkenningsmateriaal* van dit ene project: bedrijfsnaam, projectnaam en de woorden waarmee een bezoeker precies dit project zoekt. Dat veld gaat nooit naar het AI-model.
