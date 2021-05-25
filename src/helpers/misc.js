import React, { useState, useEffect } from 'react';
import { csvParse } from 'd3-dsv';
import get from 'axios';

// méthodes utilisées dans les notebooks
// toflit_client.get_flows(year=1789, best_guess_region_prodxpart='1') 
// Ancienne méthode : flows = client.get_flows(year=1789, source_subset='Poitou_1789')
// même pas l'impression que get_pointcalls soit tant utilisé que ça ...

// méthode avec callback
// getToflitFlowsByCsv({startYear: 1789}, function(error, result) {
//     // faire des choses avec le résultats
// })

// méthode avec promesse
// getToflitFlowsByCsv({startYear: 1789})
// .then(data => {
//     // préparer les données
//     // setState(data)
// })
// .catch(error => {

// })

// méthode avec async/await
// async function getFlowsByCsv(args) {...}


const _filterData = (data, { startYear, endYear, year, params, ...rest }) => {
    console.group('filters');
    console.time('filters time');
    console.log('input', data);
    /* dans data on a un dict de type : 
    [   {year: "1789", customs_region: "La Rochelle", partner_simplification: "Iles", export_import: ”Import", product_revolutionempire: "...", ...},
        {year: "1782", customs_region: "Bordeaux", ...},
        {...},
        columns: ["year", "customs_region", ...]

    ]
    */
   let filteredData = data.filter(row => {
        let rowYear = row.year ? +row.year.split(".")[0] : undefined;
        if (startYear && endYear) {
            return rowYear >= +startYear && rowYear <= +endYear;
        // @todo : quand on aura rajouté startYear et endYear pour
        // la récupération de portic il s'agira de déduire ce year des données
        } else if (year && rowYear) {
            return year === +rowYear;
        } else return true;
    })
    // console.log('1', filteredData);

    filteredData = filteredData.filter(row => {
        // pour chaque filtre (sauf filtre timespan et filtrage des colomnes) :
        let isValid = true;
        // key --> 'year', filter_value --> 1789
        // kwargs obtenu sous forme de dict : --> { year: 1789, customs_region: 'La Rochelle' }

        // kwargs semble être indiçable mais pas sur qu'on doive pas le mettre dans un format spécial pas comme python
        // sinon suggestion : function.apply(obj, [args])

        // ligne originale : je ne sais pas pourquoi on ne veut prendre en compte les filtres que pour les colonnes qui ne sont pas à garder dans le résultats (colonne données dans l'argument 'params' sous forme de liste)
        // for (let key,filter_value in [param for param in kwargs.items() if param[0] not in ['params']]): 
        // console.log('rest', rest);
        Object.entries(rest)
        .some(([key, inputFilterValue]) => {
            const rowValue = row[key];
            let filterValue = inputFilterValue;
            // console.log('filter value 1', filterValue);
            // si la valeur est une liste : on caste en string ses membres
            if (Array.isArray(filterValue)) {
                filterValue = filterValue.map(x => x + ''); // caster en string
            }
            // sinon c'est un tableau à une valeur qu'on caste en string
            else {
                filterValue = [filterValue + ''];
            }
            // console.log('filter value final', filterValue);
            // à partir de là, filter_value est une liste de strings

            // si la ligne a un attribut qui fait partie des valeurs acceptées par le filtre => on examine les autres filtres 
            if (filterValue.length > 0 && !(rowValue.includes(filterValue))) {
                isValid = false;
                return true;
            }
        })

        return isValid;
    })

    // console.log('2', filteredData);


    const transformedData = filteredData.map(row => {
        let rowFormated = {};

        // on ne garde que les colonnes qui nous intéressent dans le résultat => 
        // console.log("params : ", params);
        // console.log("typeof(params) !== 'undefined' : ", (typeof params !== 'undefined'));
        // console.log("row : ", row);
        // on ne passe jamais ni dans le if ni dans le else, je ne sais pas pourquoi 
        // if (typeof params !== 'undefined') {

        // if (params &&
        // ci-dessous : tester si objet vide
        if (!!params && Object.keys(params).length) {
            // console.log("we are selecting only those columns : ", params);
            for (let [column, value] of Object.entries(row)) {
                if (params.includes(column)) {
                    rowFormated[column] = value;
                }
            }
        }
        // de base c'était else { ... } et on passait jamais dedans apparemment du coup là c'est bizarre
        // else if (typeof params !== 'undefined') {
        else {
            // rowFormated = {...row}; // différencier rowFormated et row (nouvelle ref en unpackant et copiant key / params de row) => en JS differencier input d'output
            // console.log("rowFormated = ", row);
        }
        // console.log("après le if / else");
        return rowFormated;
    })
    // console.log('3', transformedData);
    console.timeEnd('filters time');
    console.groupEnd('filters');
    return transformedData;
}


export const getToflitFlowsByCsv = ({
    startYear = null,
    endYear = null,
    year = null,
    params = null,
    ...rest // https://www.peterbe.com/plog/javascript-destructuring-like-python-kwargs-with-defaults ; 
    // "standard" JavaScript array : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters
}) => {
    // méthode de gestion avec callback
    // let result;
    // trucAsynchrone
    // .then(data => {
    //     callback(null, data);
    // })
    // .catch(error => {
    //     callback(error);
    // })

    // méthode de gestion avec promesse
    // return new Promise((resolve, reject) => {
    //     trucAsynchrone
    //     .then(data => {
    //         // faire des trucs avec data
    //         resolve(data);
    //     })
    //     .catch(error => {
    //         // faire des choses avec l'erreur
    //         reject(error);
    //     })
    // })

    // méthode async/await
    // const result = await trucAsynchrone();
    // return result;

    /*
    Synopsis : récupère les flux toflit18
    ---
    Paramètres :
    * startYear : <int> # année de début
    * endYear : <int> # année de fin
    * params : <arr> # propriétés à renvoyer
    * [tous les noms de colonne des flux] : <arr/string> valeurs à filtrer dans les flux (peut être une ou plusieurs valeurs)
    */

    return new Promise((resolve, reject) => {

        let results = []; // ça sert à quelque chose ?? pour moi c'est pas utilisé, sinon je ne devrais pas avoir l'erreur "t.map is not a function" 
        // => voir https://www.pluralsight.com/guides/typeerror-handling-in-react.js-for-map-function

        let finalStartYear = startYear; // on ne modif pas params en JS
        let finalEndYear = endYear;



        // 1. Test de la validité des paramètres
        if (startYear !== null && endYear === null) {
            return reject("You must put an end year");
        } // pas sure pour les accolades
        else if (endYear !== null && startYear === null) {
            return reject("You must put a start year");
        }

        if ((startYear !== null || endYear !== null) && year !== null) {
            finalStartYear = null; 
            finalEndYear = null;
        }

        /* en l'état ça ne fonctionne pas */
        const URL = `${process.env.PUBLIC_URL || 'localhost:3001'}/data/toflit18_flows_sprint.csv`;
        // console.log("URL '${process.env.PUBLIC_URL}/data/toflit18_flows_sprint.csv' : ", URL)
        get(URL) // get de axios
            .then(({ data: csvString }) => {
                // conversion en js (avec d3-dsv)
                const newData = csvParse(csvString);
                // faire des choses avec les résultats (filtres, ...)
                const finalData = _filterData(newData, { startYear: finalStartYear, endYear: finalEndYear, year, params, ...rest });
                console.log("finalData : ", finalData);
                resolve (finalData);
            })
            .catch((err) => {
                reject(err);
            })

    })

}

export const getToflitFlowsByApi = ({
    startYear = null,
    endYear = null,
    year = null,
    params = null,
    ...rest 
}) => {

    return new Promise((resolve, reject) => {

        let finalStartYear = startYear; // on ne modif pas params en JS
        let finalEndYear = endYear;

        // 1. Test de la validité des paramètres
        if (startYear !== null && endYear === null) {
            return reject("You must put an end year");
        } // pas sure pour les accolades
        else if (endYear !== null && startYear === null) {
            return reject("You must put a start year");
        }

        if ((startYear !== null || endYear !== null) && year !== null) {
            finalStartYear = null;
            finalEndYear = null;
        }

        const URL = `http://data.portic.fr/api/flows/?date=${year}`;
        console.log({URL})
        // équivalent à : const URL = 'http://data.portic.fr/api/flows/?date=' + year;
        get(URL) // get de axios
        // mixed content issue => comme l'API ne fournit pas d'accès HTTPS je me sentais un peu bloquée
            .then(({ data: str }) => {
                // conversion en js (avec d3-dsv)
                // const newData = csvParse(csvString);
                try {
                    const newData = JSON.parse(str);
                    // contraire : JSON.stringify()
                    // faire des choses avec les résultats (filtres, ...)
                    const finalData = _filterData(newData, { startYear: finalStartYear, endYear: finalEndYear, year, params, ...rest })
                    resolve(finalData);
                } catch(e) {
                    reject(e);
                }
                
            })
            .catch((err) => {
                reject(err);
            })

    })

}





export const getPorticPointcallsByApi = ({
    filename,
    spec
}) => {

}

