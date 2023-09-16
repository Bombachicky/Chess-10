import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import SelectLobby from './components/SelectLobby';
import './App.css';
import GameOver from './components/GameOver';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={MainMenu} />
        <Route path="/select-lobby" component={SelectLobby} />
        <Route path="/game-over" component={GameOver} />
        {/* Add more routes as needed */}
      </Switch>
    </Router>
  );
}

export default App;
