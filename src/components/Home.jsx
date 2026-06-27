import { useEffect } from "react";
import Header from "./Header";
import Hero from "./Hero";
import CardSlider from "./cardSlider";
import AOS from "aos";
import Feature from "./Features";
import Scoring from "./Scoring";
import HowItWorks from "./HowItWorks";
import Footer from "./Footer";
import "aos/dist/aos.css";

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <div className="app">
      <Header />
      <Hero />

      <Feature />
      <CardSlider />
      <HowItWorks />
      <Scoring />
      <Footer />
    </div>
  );
}
