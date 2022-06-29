import json from './lang.json'

/**
 * 
 * @param {string} vizId Viz identifier as 'viz-principale-partie-1'
 * @param {string} label Ref to the viz label from the translate file 'lang.yml'
 * @param {'fr'|'en'} lang 
 */

const matchDollarBracket = new RegExp(/\$\{(\w+)\}/g)

export default function translate (vizId, label, lang = 'fr', args) {
    if (label === 'other_product') {
      console.log(vizId, label, json[vizId][label], 'lang : ', lang)
    }
    if (json[vizId] === undefined || json[vizId][label] === undefined || json[vizId][label][lang] === undefined) {
        return `pas de traduction disponible (${vizId} | ${label})`;
    }
    if (label === 'other_product') {
      console.log('ok')
    }

    let result = json[vizId][label][lang];

    if (!!result === false) {
        return `pas de traduction disponible (${vizId} | ${label})`;
    }

    if (args === undefined) {
        return result;
    }

    result = result.replace(matchDollarBracket, (match, key) => {
        return args[key] || key
    })

    return result;
}