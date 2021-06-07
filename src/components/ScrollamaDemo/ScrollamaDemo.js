import React, { useState, useRef } from 'react';
import { Scrollama, Step } from 'react-scrollama';

const ScrollamaDemo = ({ContentComponent}) => {
  const shadowRef = useRef(null); // acceder contenu html composants : on change logique declarative React
  // const ContentComponent = props.ContentComponent;
  // const {ContentComponent} = props;

  const [currentStepIndex, setCurrentStepIndex] = useState(null);

  // This callback fires when a Step hits the offset threshold. It receives the
  // data prop of the step, which in this demo stores the index of the step.
  const onStepEnter = ({ data }) => {
    setCurrentStepIndex(data);
    console.log("onStepEnter : ", data);
  };
  let steps;
  setTimeout(() => {
    console.log('shadow ref current', shadowRef.current);
    if (shadowRef.current) {
      // acces liste composants enfants = divs html (repérées par class="step")
      // si c'est bien le cas on render component "Step", sinon on ne rend rien
      steps = Array.prototype.map.call(shadowRef.current.children, child => {
        // récupérer la class de l'élément DOM
        const className = child.className;
        console.log('className', className);
        // si la classe est "step" -> on va remplacer par un élément scrollama
        if (className === 'step') {
          // récupération de l'id pour le donner en data à la step
          const id = child.id;
          console.log('inner html', child);
          return (key) => (
            <Step
              data={{id}}
              key={key}
            >
              <>
                <h1>Test {id}</h1>
                {/* <div
                  dangerouslySetInnerHTML={{
                    __html: child.innerHTML
                  }}
                /> */}
              </>
            </Step>
          )
        }
        return null;
      }).filter(el => el !== null) // garder tous les éléments non-nuls
      console.log(steps);
    }
  })
  
  return (
    <div style={{ margin: '50vh 0', border: '2px dashed skyblue' }}>
      <div style={{ position: 'sticky', top: 0, border: '1px solid orchid' }}>
        I'm sticky. The current triggered step index is: {currentStepIndex}
      </div>
      <div className="shadow" ref={shadowRef}>
        <ContentComponent />
      </div>
      
      <Scrollama onStepEnter={onStepEnter} debug>
        {
          steps ? steps.map((fn, index) => fn(index)) : []
        }
        
        {/* {[1, 2, 3, 4].map((_, stepIndex) => (
          <Step data={stepIndex + 1} key={stepIndex}>
            <div
              style={{
                margin: '50vh 0',
                border: '1px solid gray',
                opacity: currentStepIndex === stepIndex ? 1 : 0.2,
              }}
            >
              I'm a Scrollama Step of index {stepIndex}
            </div>
          </Step>
        ))}  */}
      </Scrollama>
    </div>
  );
};

export default ScrollamaDemo;