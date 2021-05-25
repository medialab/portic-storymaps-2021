import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import keplerGlReducer from 'kepler.gl/reducers';
import {enhanceReduxMiddleware} from 'kepler.gl/middleware';

const initialState = {};
const reducer = combineReducers({
  // <-- mount kepler.gl reducer in your app
  keplerGl: keplerGlReducer,
});

// using createStore
export default createStore(
  reducer,
  initialState/*,
  applyMiddleware(
    enhanceReduxMiddleware([
    ])
  )*/
);