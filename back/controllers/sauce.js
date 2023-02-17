const Sauce = require('../models/Sauce');
//Importation du module FS (files système) pour supprimer les fichiers images
const fs = require('fs');
//----------------Afficher toutes les sauces----------------------------
exports.allSauce=(req,res,next)=>{
  //find retourne toutes les sauces
    Sauce.find()
      .then(toutesLesSauces => res.status(200).json(toutesLesSauces))
      .catch(error => res.status(400).json({ error }));
};
//--------------------Ajouter une sauce---------------------------------
exports.addSauce=(req,res,next)=>{
  //Récupération des informations Formulaire au format JSON
  const sauceObject = JSON.parse(req.body.sauce);
  //On supprime l'Id fourni par le formulaire car il sera automatiquement généré par MongoDb
 delete sauceObject._id;
 //Utilisation du modèle pour créer notre objet
const sauce = new Sauce({
    //Objets provenant du formulaire sans l'Id
   ...sauceObject,
   //on insert le chemin d'accès à l'image dans la Bdd 
   imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
   //Rajout des valeurs par défaut à la création ( like / dislike à 0 pas d'utilisateur like Dislike)
   likes: 0,
   dislikes: 0,
   usersLiked: [],
   usersDisliked: []
 });
 //L'objet étant créé on l'enregistre dans la Bdd
 sauce.save()
  //Un fois fait on renvoi le status 200 avec un message de création
   .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
  //sinon erreur
   .catch(error => res.status(400).json({ error }));
};
//----------------Afficher une sauce par son ID-------------------------
exports.oneSauce=(req,res,next)=>{
  //findById permet de chercher parmis les Id dans la Bdd
    Sauce.findById({_id:req.params.id})
    .then(uneSauce => res.status(200).json(uneSauce)
    )
    .catch(error => res.status(400).json({ error }));
    
};
//***************************************************************************************** */
//Besoin de sécurité pour modifier ou suprimer une sauce : Doit correspondre à son créateur.
//*******************************************************************************************/
//---------------Modifier une sauce par son Id--------------------------
exports.modifySauce=(req,res,next)=>{
const sauceObject = req.file ? {
    ...sauceObject
  } : { ...req.body };

delete sauceObject._userId;
Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
        if (sauce.userId != req.auth.userId) {
            res.status(401).json({ message : 'Not authorized'});
        } else {
            Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
            .then(() => res.status(200).json({message : 'Objet modifié!'}))
            .catch(error => res.status(401).json({ error }));
        }
    })
    .catch((error) => {
        res.status(400).json({ error });
    });
};
//--------------Supprimer une sauce par son Id--------------------------
exports.deleteSauce=(req,res,next)=>{
  Sauce.deleteOne({_id: req.params.id})
Sauce.findOne({ _id: req.params.id})
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
            //récupérer le nom de l image avec split
              const imgName = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${imgName}`, () => {
                  Sauce.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
      
};
exports.likeSauce=(req,res,next)=>{
//retour de quelAppui
  //LIKE = 1
  //DISLIKE = -1
  //Ni l un ni l autre = 0
let quelAppui  = req.body.like;
//Récupération de l'id user
let userId=req.body.userId;
//Récupération de l'id Sauce
let sauceId = req.params.id;
//Informations
console.log("user : "+userId+" like / dislike : "+quelAppui+" La sauce : " + sauceId);

//console.log(req.body);
if(quelAppui===1){
//Si c'est = à 1 on l'ajoute dans la base de donnée usersLiked

    Sauce.updateOne( { _id: sauceId }, { $push: { usersLiked : userId }, $inc: { likes: +1 } } )
    .then(() => res.status(200).json({message:"sauce liké"}),
    console.log("sauce liké")
    )
    .catch((error=> res.status(400).json({message:"pas marché"})));


} else if (quelAppui === -1){
//Si c'est = à -1 on l'ajoute dans la base de donnée usersDisliked 

    Sauce.updateOne( { _id: sauceId }, { $push: { usersDisliked : userId }, $inc: {dislikes: +1 } } )
    .then(() => res.status(200).json({message:"sauce déliké"}),
    console.log("sauce disliké")
    )
    .catch((error=> res.status(400).json({message:"pas marché"})));

} else {
  Sauce.findOne(({_id:sauceId})) 
  .then((sauce)=>{
    if(sauce.usersLiked.includes(req.body.userId)){

      console.log('user trouvé dans les likes');
      Sauce.updateOne( { _id: sauceId }, { $pull: { usersLiked : req.body.userId }, $inc: { likes: -1 }  } )
      .then(res.status(200).json({message:'like supprimé'}), 
      console.log('user supprimé dans les likes'))
      .catch( error => res.status(400).json({message:'erreur de suppression dans Like'}));

    } else if(sauce.usersDisliked.includes(req.body.userId)){

      console.log('user trouvé dans les dislikes');
      Sauce.updateOne( { _id: sauceId }, { $pull: { usersDisliked : req.body.userId }, $inc: { dislikes: -1 } } )
      .then(res.status(200).json({message:'dislike supprimé'}))
      .catch( error => res.status(400).json({message:'erreur de suppression dans dislike'}));

    } else {
      console.log("user non trouvé");
    }
  });
}
};


