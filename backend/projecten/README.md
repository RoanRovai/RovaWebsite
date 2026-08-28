# Projectkennis voor de chatbot

Deze map is de bron voor alle projectinformatie die de Rovai-chatbot mag gebruiken. `backend/main.py` laadt bij het opstarten automatisch ieder niet-leeg `.txt`-bestand in alfabetische volgorde.

De chatbot gebruikt twee lagen:

- Bij een gewone vraag ziet het model geen projectcatalogus. Dat spaart tokens, ook wanneer deze map later veel projecten bevat.
- Bij een algemene projectvraag ziet het model maximaal twaalf projecten, met alleen `PROJECT`, `BEDRIJF`, `WEBSITEGROEPERING` en `SAMENVATTING`.
- `TREFWOORDEN` blijft intern in de backend en bepaalt welk volledig projectbestand bij een specifieke vraag wordt toegevoegd.
- Bij een specifieke vraag worden alleen de relevante publieke projectdetails meegestuurd, met een maximum van vier dossiers tegelijk.

## Een project toevoegen

1. Kopieer een bestaand `.txt`-bestand.
2. Geef het bestand een oplopend nummer en een duidelijke naam, bijvoorbeeld `04-bedrijf-chatbot.txt`.
3. Vul alleen controleerbare, publieke feiten in onder dezelfde rubrieken.
4. Zet namen die niet gedeeld mogen worden nooit in deze map. Schrijf onder `PUBLIEKE COMMUNICATIEREGELS` wel duidelijk welke omschrijving de chatbot publiek moet gebruiken.
5. Herstart de backend zodat het nieuwe bestand in de systeemprompt wordt geladen.

Ieder `.txt`-bestand telt als één project of automatisering. Projecten die samen als één case op de website verschijnen, krijgen dezelfde waarde bij `WEBSITEGROEPERING`.

De onderdelen `PROJECT:`, `BEDRIJF:`, `STATUS:`, `WEBSITEGROEPERING:`, `SAMENVATTING:`, `TREFWOORDEN:` en `PUBLIEKE COMMUNICATIEREGELS` zijn verplicht. Een onvolledig of niet-UTF-8-bestand wordt voor de veiligheid niet ingeladen.

Alleen de vaste publieke velden en rubrieken uit de voorbeeldbestanden kunnen naar het AI-model worden gestuurd. Een onbekende rubriek, zoals interne notities, wordt genegeerd. Bewaar hier desondanks nooit wachtwoorden, API-sleutels, persoonsgegevens of andere geheimen.

Zet in `TREFWOORDEN` ook de herkenbare bedrijfsnaam en woorden die een bezoeker waarschijnlijk gebruikt. Gedeelde trefwoorden mogen in meerdere projecten staan; zo kan de backend bij een vergelijking meerdere relevante dossiers selecteren.
