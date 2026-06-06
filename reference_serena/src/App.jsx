import { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import EternalLibrary from './components/EternalLibrary';
import CallingTheFuture from './components/CallingTheFuture';
import LayerExperience from './components/LayerExperience';
import CompanionsNote from './components/CompanionsNote';
import Footer from './components/Footer';
import LibraryModal from './components/LibraryModal';
import GreetingModal from './components/GreetingModal';

function App() {
  const [libraryModal, setLibraryModal] = useState({ open: false, layerId: null });
  const [greetingModalOpen, setGreetingModalOpen] = useState(false);

  const openLibraryModal = useCallback((layerId) => {
    setLibraryModal({ open: true, layerId });
  }, []);

  const closeLibraryModal = useCallback(() => {
    setLibraryModal({ open: false, layerId: null });
  }, []);

  const openGreetingModal = useCallback(() => {
    setGreetingModalOpen(true);
  }, []);

  const closeGreetingModal = useCallback(() => {
    setGreetingModalOpen(false);
  }, []);

  return (
    <div className="app">
      <Navbar />

      <main>
        <HeroSection />
        <EternalLibrary onBookClick={openLibraryModal} />
        <CallingTheFuture />
        <LayerExperience />
        <CompanionsNote onGreetingClick={openGreetingModal} />
      </main>

      <Footer />

      <LibraryModal
        isOpen={libraryModal.open}
        layerId={libraryModal.layerId}
        onClose={closeLibraryModal}
      />

      <GreetingModal isOpen={greetingModalOpen} onClose={closeGreetingModal} />
    </div>
  );
}

export default App;
