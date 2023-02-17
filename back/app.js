//Utilisation d'express
const express = require('express');
//Utilisation de mongoose
const mongoose = require('mongoose');
//body-parser permet d'extraire l'objet JSON des requêtes POST
const bodyParser = require('body-parser'); 
// On donne accès au chemin de notre système de fichier avec qui sert dans l'upload des images et permet de travailler avec les répertoires et chemin de fichier
const path = require('path');

//Les fichiers routes
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

//creation de l app express
const app = express();
//Connexion à la base de donnée
mongoose.set('strictQuery', false);
mongoose.connect('URL BASE DE DONNEE',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports=app;

