import React from "react";
import { Link, useLocation } from "wouter";

const Header: React.FC = () => {
  const [location] = useLocation();
  const isHomePage = location === "/";

  return (
    <header className="bg-eco-primary text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <Link href="/">
            <a className="flex items-center">
              <i className="fas fa-leaf text-eco-secondary text-3xl mr-3"></i>
              <h1 className="text-2xl md:text-3xl font-heading font-bold">EcoTeam Challenge</h1>
            </a>
          </Link>
        </div>
        <div className="text-lg font-heading font-semibold">
          Quiz environnemental en équipe
        </div>
      </div>
    </header>
  );
};

export default Header;
