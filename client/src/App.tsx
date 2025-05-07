import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WelcomeScreen from "@/pages/WelcomeScreen";
import SessionSetup from "@/pages/SessionSetup";
import WaitingRoom from "@/pages/WaitingRoom";
import QuizScreen from "@/pages/QuizScreen";
import AnswerResults from "@/pages/AnswerResults";
import FinalResults from "@/pages/FinalResults";
import PlayerJoin from "@/pages/PlayerJoin";
import GameScreen from "@/pages/GameScreen";
import EcoFunFacts from "@/pages/EcoFunFacts";

function Router() {
  return (
    <Switch>
      <Route path="/" component={WelcomeScreen} />
      <Route path="/create" component={SessionSetup} />
      <Route path="/waiting/:sessionId" component={WaitingRoom} />
      <Route path="/quiz/:sessionId" component={QuizScreen} />
      <Route path="/results/:sessionId/:questionId" component={AnswerResults} />
      <Route path="/final/:sessionId" component={FinalResults} />
      <Route path="/join/:sessionId" component={PlayerJoin} />
      <Route path="/game" component={GameScreen} />
      <Route path="/facts" component={EcoFunFacts} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Router />
      </main>
      <Footer />
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
