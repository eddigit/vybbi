import { SEOHead } from "@/components/SEOHead";
import ContactForm from "@/components/ContactForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Globe } from "lucide-react";

const offices = [
  {
    city: "Paris",
    country: "France",
    address: "102 avenue des Champs Elysées 75008 Paris",
    phone: null,
    flag: "🇫🇷"
  },
  {
    city: "Ibiza",
    country: "Espagne",
    address: "Calle Cervantes, 48B, 07820, Sant Antoni de Portmany Ibiza, Islas Baleares",
    phone: "+34 682 87 66 73",
    flag: "🇪🇸"
  },
  {
    city: "Miami",
    country: "États-Unis",
    address: "1221 Brickell Avenue, Brickell, Suite 900, Miami, FL, 33131, USA",
    phone: null,
    flag: "🇺🇸"
  },
  {
    city: "Bucarest",
    country: "Roumanie",
    address: "6-8, Corneliu Coposu Boulevard, Building Unirii View, Floors 1-3, Bucharest, 030167, ROU",
    phone: null,
    flag: "🇷🇴"
  },
  {
    city: "Bangkok",
    country: "Thaïlande",
    address: "The Ninth Tower A, 35th floor, Huai Kwang, Bangkok",
    phone: null,
    flag: "🇹🇭"
  }
];

export default function Contact() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Vybbi",
    "url": "https://vybbi.com",
    "logo": "https://vybbi.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+34 682 87 66 73",
      "contactType": "customer service",
      "email": "contact@vybbi.com"
    },
    "address": offices.map(office => ({
      "@type": "PostalAddress",
      "addressLocality": office.city,
      "addressCountry": office.country,
      "streetAddress": office.address
    }))
  };

  return (
    <>
      <SEOHead
        title="Contact - Nous contacter"
        description="Contactez Vybbi dans nos bureaux internationaux : Paris, Ibiza, Miami, Bucarest et Bangkok. Une présence mondiale pour vous accompagner."
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5 py-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Globe className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                Présence Internationale
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-6">
              Contactez-nous
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Vybbi vous accompagne dans le monde entier. Retrouvez-nous dans nos bureaux 
              internationaux ou contactez-nous directement via notre formulaire.
            </p>
          </div>

          {/* Offices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {offices.map((office, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">{office.flag}</span>
                    <div>
                      <div className="font-semibold">{office.city}</div>
                      <div className="text-sm text-muted-foreground font-normal">{office.country}</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {office.address}
                    </p>
                  </div>
                  {office.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-primary" />
                      <a 
                        href={`tel:${office.phone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {office.phone}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form Section */}
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-2">Envoyez-nous un message</CardTitle>
                <p className="text-muted-foreground">
                  Notre équipe vous répondra dans les plus brefs délais
                </p>
              </CardHeader>
              <CardContent>
                <ContactForm 
                  recipientEmail="contact@vybbi.com"
                  recipientName="Équipe Vybbi"
                  title="Formulaire de contact"
                />
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-12 p-6 bg-card/50 rounded-lg border">
            <h3 className="font-semibold mb-2">Horaires de support</h3>
            <p className="text-muted-foreground text-sm">
              Notre équipe est disponible du lundi au vendredi, de 9h à 18h (heure de Paris)
            </p>
          </div>
        </div>
      </div>
    </>
  );
}