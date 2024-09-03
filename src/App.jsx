import { initSpireKey } from '@kadena/spirekey-sdk';
import DoThings from './components/DoThings';
import './App.css';

initSpireKey();

function App() {
  return (
    <div className="App min-h-screen flex flex-col justify-center items-center  bg-gray-50">
      <h1 className="text-bold text-2xl text-center mb-12">Spirekey Testing</h1>
      <DoThings />
    </div>
  );
}

export default App;
