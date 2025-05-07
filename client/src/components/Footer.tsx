import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-eco-dark text-white py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <i className="fas fa-leaf text-eco-secondary text-xl mr-2"></i>
              <span className="text-xl font-heading font-bold">EcoTeam Challenge</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Quiz environnemental pour équipes</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} EcoTeam Challenge - Tous droits réservés</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
