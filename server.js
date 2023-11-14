const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');

const app = express();

const host = 'localhost';
const port = 3000;

const apiKey = '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';
const apiUrl = 'https://api.openai.com/v1/chat/completions';

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/submit', (req, res) => {
    // Récupération des données du formulaire
    const formData = req.body;

    // Préparation des données pour la requête à l'API ChatGPT
    const requestData = {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Vous êtes un assistant qui parle comme Shakespeare.' },
          { role: 'user', content: formData.question },
        ],
    };

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
    };
      
    // Envoi de la requête à l'API ChatGPT
    axios.post(apiUrl, requestData, { headers })
      .then(response => {
        const chatGptResponse = response.data.choices[0].message.content;

        // Enregistrement des données dans un fichier JSON
        const dataToSave = {
          formData,
          chatGptResponse,
          timestamp: new Date().toISOString(), // Ajout d'un horodatage
        };

        const filePath = path.join(__dirname, 'form_responses.json');

        // Lisez les données existantes du fichier (s'il existe)
        let existingData = [];
        try {
          existingData = JSON.parse(fs.readFileSync(filePath));
        } catch (error) {
          // Si le fichier n'existe pas ou ne peut pas être lu, ne faites rien
        }

        // Ajoutez les nouvelles données au tableau existant
        existingData.push(dataToSave);

        // Enregistrez le tableau mis à jour dans le fichier
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

        res.send(`<html>
                    <head>
                      <title>Réponse du formulaire</title>
                    </head>
                    <body>
                      <h1>Réponse du formulaire</h1>
                      <p>Question : ${formData.question}</p>
                      <p>Réponse ChatGPT : ${chatGptResponse}</p>
                    </body>
                  </html>
                `);
      })
      .catch(error => {
        console.error('Erreur lors de la requête à l\'API ChatGPT:', error.response ? error.response.data : error.message);
      });

    
});



app.listen(port, host, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
