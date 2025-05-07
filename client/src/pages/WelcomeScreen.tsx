import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const WelcomeScreen: React.FC = () => {
  return (
    <section id="welcome-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div 
          className="h-48 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400')" }}
        ></div>
        <div className="p-8">
          <h2 className="text-3xl font-heading font-bold text-eco-dark mb-6">Bienvenue sur EcoTeam Challenge</h2>
          <p className="text-lg text-gray-700 mb-8">
            Prêt à tester vos connaissances tout en nettoyant la planète ? 🌍
            <br />
            Jouez à un quiz écologique à difficulté progressive et à un démineur revisité façon éco-responsable.
            <br />
            Apprenez, jouez et devenez un vrai défenseur de la nature !
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-eco-light rounded-lg p-6 border border-gray-200">
              <h3 className="font-heading font-semibold text-xl mb-3 text-eco-primary">Contenu de l’application</h3>
              <ul className="list-disc pl-5 text-left space-y-2 text-gray-700">
                <li>🌿 Un démineur écolo où vous évitez les déchets toxiques</li>
                <li>📚 Un quiz écologique avec 3 niveaux de difficulté</li>
                <li>🕒 Un timer pour suivre vos performances</li>
                <li>♻️ Des thèmes environnementaux variés</li>
              </ul>
            </div>
            
            <div className="bg-eco-light rounded-lg p-6 border border-gray-200">
              <h3 className="font-heading font-semibold text-xl mb-3 text-eco-primary">Thèmes abordés</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded p-3 text-center shadow-sm">
                  <i className="fas fa-tree text-eco-primary text-xl mb-1"></i>
                  <p className="text-sm">Écologie</p>
                </div>
                <div className="bg-white rounded p-3 text-center shadow-sm">
                  <i className="fas fa-recycle text-eco-primary text-xl mb-1"></i>
                  <p className="text-sm">Recyclage</p>
                </div>
                <div className="bg-white rounded p-3 text-center shadow-sm">
                  <i className="fas fa-water text-eco-primary text-xl mb-1"></i>
                  <p className="text-sm">Ressources</p>
                </div>
                <div className="bg-white rounded p-3 text-center shadow-sm">
                  <i className="fas fa-lightbulb text-eco-primary text-xl mb-1"></i>
                  <p className="text-sm">Énergie</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Link href="/game">
              <Button variant="customRounded" size="xl">
                Commencer l'aventure
                <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            </Link>
          </div>
          <div className="flex justify-center mt-4">
            <Link href="/facts">
              <Button variant="secondary" size="lg">
                🌍 Anecdotes écologiques
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeScreen;
