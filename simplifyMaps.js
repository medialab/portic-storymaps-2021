const simplify = require('simplify-geojson')
const fs = require('fs-extra');
const { features } = require('caniuse-api');

let original = fs.readFileSync('./public/data/cartoweb_france_1789_geojson_original.geojson', 'utf8');

const originalLength = original.length
console.log('length before : ', originalLength);
try {
  original = JSON.parse(original)
} catch(e) {
  console.log('damn')
}
const output = `./public/data/cartoweb_france_1789_geojson.geojson`;

// let simplified = simplify(original, .003); // works
let simplified = {
  ...original,
  features: original.features.map(feature => {
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