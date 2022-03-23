import json from './lang.json'

/**
 * 
 * @param {string} vizId Viz identifier as 'viz-principale-partie-1'
 * @param {string} label Ref to the viz label from the translate file 'lang.yml'
 * @param {'fr'|'en'} lang 
 */

const matchDollarBracket = new RegExp(/\$\{(\w+)\}/g)

export default (vizId, label, lang, args) => {
    let result = json[vizId][label][lang]
    if (result === undefined || result === null) {
        return `pas de traduction disponible (${vizId} | ${label})`;
    }

    if (args === undefined) {
        return result;
    }

    result = result.replace(matchDollarBracket, (match, key) => {
        return args[key]
    })

    return result;
}