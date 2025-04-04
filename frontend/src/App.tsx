import React from 'react';
import {Header} from './components/Header';
import {Footer} from './components/Footer';
import {BrowserRouter, Route, Routes} from "react-router";
import HomePage from "./page/HomePage";
import DetailPage from "./page/DetailPage";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow px-4 sm:px-6 md:px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/:id" element={<DetailPage />} />
            </Routes>
          </BrowserRouter>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
