const simplify = require('simplify-geojson')
const fs = require('fs-extra');
const { filter } = require('lodash');

// let original = fs.readFileSync('./public/data/cartoweb_france_1789_geojson_original.geojson', 'utf8');
let output = `./public/data/map_france_1789.geojson`;
let original = fs.readFileSync('./public/data/map_cartoweb_world_1789_29juillet2021_mixte4326_geojson_UTF8.geojson', 'utf8');

let originalLength = original.length
console.log('length before : ', originalLength);
try {
  original = JSON.parse(original)
} catch(e) {
  console.log('damn')
}

const acceptedProvinces = [
  'Espagne', 
  'Grande-Bretagne', 
  'Isles de Corse',
  'Sardaigne',
  'Royaume de Piémont-Sardaigne',
  'République de Gènes',
  'Duché de Massa et Carrare',
  'Toscane',
  'Pays-Bas autrichiens',
  'Liège',
  'Swiss Cantons',
  "Autriche",
  'Small States',
  'Württemberg',
  'Nassau',
  'Trier',
  'Wittelsbach',
  'Cologne',
  'Hesse-Darmstadt',
  'Prusse',
  'Hanover',
  'République de Lucques',
  'Etats pontificaux',
  'République de Venise',
  'Bavaria',
  'Saxony-Poland-Lithuania',
  'Portugal',
  'Parma Piacenza',
  'Modena',
  'Hesse-Kassel',
  'Brandenburg-Bayreuth',
  'Salzburg',
  'Meiningen',
  'Eisenach',
  'Brandenburg-Ansbach',
  'Nuremberg',
  'Porrentruy',
  'Baden',
  'Mainz',
  'Andorra',
  'Brunswick-Wolfenbuttel',
  'Coburg',
  'Saxe-Hildburghausen',
  'Altenburg',
  'Waldeck',
  'Lippe',
  'Zerbst',
  'Dessau',
  'Köthen',
  'Bernburg',
  'Schwabisches Hall',
  'Rothenburg',
  'Sulzbach',
  'Weimar',
  'Mühlhausen',
  'Rottweil',
  'Sigmaringen',
  'Zweibrücken',
  'Überlingen',
  'Hechingen',
  'Orange'

]
const acceptedDominants = [
  'France',
  'Royaume de Piémont-Sardaigne',
  'Provinces-Unies'
]
// let simplified = simplify(original, .003); // works
let simplified = {
  ...original,
  features: original.features
  .filter(feature => acceptedDominants.includes(feature.properties.dominant) || acceptedProvinces.includes(feature.properties.shortname))
  .map(feature => {
    // handling a weird bug
    if (feature.properties.shortname === 'Normandie') {
      return simplify(feature, .03);
    // no simplification
    } else if (['Poitou', 'Aunis', 'Saintonge', 'Bretagne', 'Anjou', 'Saumurois'].includes(feature.properties.shortname)) {
      return feature;
    }
    // simplification maximum
    return simplify(feature, .01); // works
  })
}


simplified = JSON.stringify(simplified);

console.log('length after : ', simplified.length, ', gain : ', -parseInt((1 - simplified.length / originalLength) * 100) + '%' );

fs.writeFileSync(output, simplified, 'utf8')

/**
 * WORLD MAP
 */

// original = fs.readFileSync('./public/data/cartoweb_world_1789_29juillet2021_mixte4326_geojson_UTF8.geojson', 'utf8')
// output = `./public/data/world_1789_map.geojson`;
// originalLength = original.length
// console.log('length before : ', originalLength);
// try {
//   original = JSON.parse(original)
// } catch(e) {
//   console.log('damn')
// }
// simplified = {
//   ...original,
//   features: original.features.map(feature => {
//     // handling a weird bug
//     if (feature.properties.shortname === 'Normandie') {
//       return simplify(feature, .03);
//     // no simplification
//     }/* else if (['Poitou', 'Aunis', 'Saintonge', 'Bretagne', 'Anjou', 'Saumurois'].includes(feature.properties.shortname)) {
//       return feature;
//     } else {
//       console.log(feature.properties.shortname)
//     }*/
//     // simplification maximum
//     return simplify(feature, .001); // works
//   })
// }


// simplified = JSON.stringify(simplified);

// console.log('length after : ', simplified.length, ', gain : ', -parseInt((1 - simplified.length / originalLength) * 100) + '%' );

// fs.writeFileSync(output, simplified, 'utf8')
