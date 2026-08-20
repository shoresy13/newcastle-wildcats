import { useEffect } from 'react';
import { checkConnection } from './utils/api';

function App() {
  useEffect(() => {
    checkConnection()
        .then((data) => console.log('Success:', data))
        .catch((err) => console.error('Error:', err));
  }, []);

  return (
      <>
      </>
  );
}

export default App;