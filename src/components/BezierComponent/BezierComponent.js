import React, { useState, useEffect } from 'react';
import { csvParse } from 'd3-dsv';
import get from 'axios';


const BezierComponent = ({
    dataFilename,
    totalWidth = 1200,
    rowHeight = 200,
}) => {

    // raw marker data
    const [data, setData] = useState(null);

    const [loadingData, setLoadingData] = useState(true);



    /**
     * Marker data loading
     */
    useEffect(() => {
        if (dataFilename) {
            const dataURL = `${process.env.PUBLIC_URL}/data/${dataFilename}`;
            get(dataURL)
                .then(({ data: csvString }) => {
                    const newData = csvParse(csvString);

                    setData(newData);
                    setLoadingData(false);
                })
                .catch((err) => {
                    setLoadingData(false);
                })
        }

    }, [dataFilename])

    if (loadingData) {
        return (
            <div>Chargement des données ...</div>
        )
    } else if (!data) {
        return (
            <div>Erreur ...</div>
        )
    }
    // a rx ry x-axis-rotation large-arc-flag sweep-flag dx dy
    // ${70} ${140}, ${110} ${140}, ${110} ${110} 
    // a ${R} : aire selon x de l'ellipse, ${R} : aire selon y de l'elipse, 0 : rotation de l'ellipse selon x, 1, 0 : sweep-flag (détermine si l’arc doit commencer son mouvement à un angle négatif ou positif), -(${R} * 2) 0 : coords de l'arrivée

    const R = totalWidth/10

    return (
        <div className="BezierComponent">
            
            <svg width={1200} height={1500} style={{ border: '1px solid lightgrey' }}>
                <path
                    d={`M ${totalWidth/2} ${rowHeight/2} 
                        C ${totalWidth/2} ${rowHeight/2-90}, ${rowHeight/2} ${rowHeight/2+30}, ${rowHeight/2} ${rowHeight/2-90} 
                `       }
                    stroke="black" fill="transparent" />

                <path
                    d={`M ${totalWidth/2} ${rowHeight/2}
                        C ${120} ${80}, ${180} ${80}, ${170} ${60}
                        `}
                    stroke="red" fill="transparent" />
                
                <path
                    d={`M ${totalWidth/2} ${rowHeight/1.5}
                        a ${R} ${R} 0 1 0 ${R*2} 0
                    `}
                    stroke="pink" 
                    fill="transparent"
                />
                <path
                    d={`M ${totalWidth/2} ${rowHeight/1.5}
                        a ${R} ${R} -90 1 0 ${R*2} 0
                    `}
                    stroke="green" 
                    fill="transparent"
                />
            </svg>
        </div>
    );

}

export default BezierComponent;
