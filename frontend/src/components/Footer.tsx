import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-gray-500 text-sm text-center py-4 mt-10 shadow-inner">
      <p>
        © {new Date().getFullYear()} <span className="font-semibold text-blue-600">Task Runner</span>.
        All rights reserved.
      </p>
    </footer>
  );
};
