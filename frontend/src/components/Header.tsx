import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow px-4 py-4 sm:px-6">
      <div className="max-w-6xl mx-auto text-center sm:text-left">
        <h1 className="text-2xl font-bold text-blue-600">
          Task Runner
        </h1>
      </div>
    </header>
  );
};
