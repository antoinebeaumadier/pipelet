import React from 'react';
import BlockEditor from './components/BlockEditor';
import Footer from './components/common/Footer';

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh' 
    }}>
      <div style={{ flex: 1 }}>
        <BlockEditor />
      </div>
      <Footer />
    </div>
  );
}

export default App;