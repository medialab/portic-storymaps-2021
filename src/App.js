
/* import external libraries */
import React from "react";
import {
  HashRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

/* import pages */
import Home from './pages/Home';
import About from './pages/About';
import Topics from './pages/Topics';

/* import components */
import HeaderNav from './components/HeaderNav';

/* import other assets */
import './App.css';


export default function App() {
  return (
    <div className="App">
        <Router>
          <div id="wrapper">
            <header>
              <HeaderNav />
            </header>
            <main>
              <Switch>
                <Route path="/about">
                  <About />
                </Route>
                <Route path="/topics/:axe?">
                  <Topics />
                </Route>
                <Route path="/">
                  <Home />
                </Route>
              </Switch>
            </main>
            <footer></footer>
          </div>
        </Router>
    </div>
  );
}
