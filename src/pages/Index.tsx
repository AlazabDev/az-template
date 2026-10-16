
import React, { useEffect } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Services from "../components/Services";
import PremiumServices from "../components/PremiumServices";
import Projects from "../components/Projects";
import About from "../components/About";
import CompanyVision from "../components/CompanyVision";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { Helmet } from "react-helmet-async";

const Index: React.FC = () => {
  // تحسين scroll animation handler
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const elements = document.querySelectorAll('.fade-in-view, .slide-up-view');
          
          elements.forEach((element) => {
            const position = element.getBoundingClientRect();
            
            if (position.top < window.innerHeight - 100) {
              element.classList.add('animated');
            }
          });
          
          ticking = false;
        });
        ticking = true;
      }
    };
    
    // فحص أولي
    handleScroll();
    
    // إضافة scroll event listener مع passive
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>شركة العزب للمقاولات العامة - خدمات إنشاء وصيانة متميزة</title>
        <meta name="description" content="شركة العزب للمقاولات العامة - رائدة في مجال المقاولات والإنشاءات في جمهورية مصر العربية. نقدم خدمات متميزة في البناء والصيانة والتطوير العقاري." />
        <meta name="keywords" content="مقاولات, إنشاءات, صيانة, مصر, البناء, التطوير العقاري" />
        <meta property="og:title" content="شركة العزب للمقاولات العامة" />
        <meta property="og:description" content="رائدة في مجال المقاولات والإنشاءات في جمهورية مصر العربية" />
        <meta property="og:type" content="website" />
        <meta property="fb:app_id" content="889346333913449" />
        <meta property="og:image" content="https://alazab.com/alazab-icon.png" />
        <meta property="og:url" content="https://alazab.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://alazab.com/alazab-icon.png" />
        <link rel="canonical" href="https://alazab.com" />
      </Helmet>

      <div className="bg-white min-h-screen">
        <Header />
        <main className="space-y-0">
          <Hero />
          
          <PremiumServices />
          <Services />
          <Projects />
          <About />
          <CompanyVision />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
