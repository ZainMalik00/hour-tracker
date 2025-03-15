import logo from './logo.svg';
import Navbar from './components/navbar/Navbar.js';
import './App.css';
import HourEntryForm from './components/hour-entry-form/hour-entry-form.js';

function App() {
  return (
  <div>
    <Navbar></Navbar>
    <HourEntryForm />
  </div>
  );
}

export default App;
