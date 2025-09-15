import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Cookie, Settings, BarChart3, Palette, Shield, Clock, Trash2 } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { useState } from "react";

export default function CookiesPage() {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always true, cannot be disabled
    analytics: true,
    preferences: true,
    marketing: false
  });

  const cookieCategories = [
    {
      key: 'essential',
      title: 'Cookies essentiels',
      icon: Shield,
      color: 'from-green-500 to-emerald-500',
      required: true,
      description: 'Nécessaires au fonctionnement de base du site',
      cookies: [
        { name: 'vybbi_session', purpose: 'Maintenir votre session utilisateur', duration: '30 jours' },
        { name: 'csrf_token', purpose: 'Protection contre les attaques CSRF', duration: 'Session' },
        { name: 'auth_token', purpose: 'Authentification sécurisée', duration: '7 jours' },
        { name: 'cookie_consent', purpose: 'Mémoriser vos préférences de cookies', duration: '1 an' }
      ]
    },
    {
      key: 'analytics',
      title: 'Cookies de performance',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      required: false,
      description: 'Nous aident à comprendre comment vous utilisez le site',
      cookies: [
        { name: '_ga', purpose: 'Google Analytics - Identification des visiteurs', duration: '2 ans' },
        { name: '_ga_*', purpose: 'Google Analytics - État de la session', duration: '2 ans' },
        { name: 'vybbi_analytics', purpose: 'Statistiques internes anonymisées', duration: '1 an' }
      ]
    },
    {
      key: 'preferences',
      title: 'Cookies de préférences',
      icon: Palette,
      color: 'from-purple-500 to-pink-500',
      required: false,
      description: 'Mémorisent vos choix pour personnaliser votre expérience',
      cookies: [
        { name: 'theme_preference', purpose: 'Mode sombre/clair', duration: '1 an' },
        { name: 'language_pref', purpose: 'Langue sélectionnée', duration: '1 an' },
        { name: 'notification_settings', purpose: 'Préférences de notifications', duration: '6 mois' }
      ]
    },
    {
      key: 'marketing',
      title: 'Cookies marketing',
      icon: Settings,
      color: 'from-orange-500 to-red-500',
      required: false,
      description: 'Utilisés pour vous proposer du contenu personnalisé',
      cookies: [
        { name: 'fbp', purpose: 'Facebook Pixel - Suivi des conversions', duration: '90 jours' },
        { name: 'affiliate_ref', purpose: 'Suivi des recommandations', duration: '30 jours' }
      ]
    }
  ];

  const handlePreferenceChange = (category: string, enabled: boolean) => {
    if (category === 'essential') return; // Cannot disable essential cookies
    
    setCookiePreferences(prev => ({
      ...prev,
      [category]: enabled
    }));
  };

  const savePreferences = () => {
    // Save preferences to localStorage or send to server
    localStorage.setItem('vybbi_cookie_preferences', JSON.stringify(cookiePreferences));
    console.log('Cookie preferences saved:', cookiePreferences);
    // In a real implementation, you would also apply these preferences
  };

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      preferences: true,
      marketing: true
    };
    setCookiePreferences(allAccepted);
    localStorage.setItem('vybbi_cookie_preferences', JSON.stringify(allAccepted));
  };

  const rejectOptional = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      preferences: false,
      marketing: false
    };
    setCookiePreferences(essentialOnly);
    localStorage.setItem('vybbi_cookie_preferences', JSON.stringify(essentialOnly));
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Politique de cookies" 
        description="Gérez vos préférences de cookies sur Vybbi. Informations détaillées sur les cookies essentiels, analytiques, préférences et marketing utilisés sur notre plateforme."
        canonicalUrl={`${window.location.origin}/cookies`}
      />
      
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6" variant="secondary">
            <Cookie className="w-4 h-4 mr-2" />
            Transparence totale
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Politique de cookies
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez comment Vybbi utilise les cookies pour améliorer votre expérience 
            et gérez vos préférences selon vos besoins.
          </p>
        </div>
      </section>

      {/* What are cookies */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Cookie className="h-6 w-6" />
                Qu'est-ce qu'un cookie ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette, smartphone) 
                lorsque vous visitez un site web. Les cookies permettent au site de mémoriser certaines informations 
                sur votre visite, comme vos préférences ou votre état de connexion.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Cookies de session
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Supprimés automatiquement quand vous fermez votre navigateur. 
                    Utilisés pour maintenir votre session active.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Cookies persistants
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Restent sur votre appareil jusqu'à leur expiration ou suppression manuelle. 
                    Mémorisent vos préférences entre les visites.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Categories */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center mb-8">Gérer vos préférences de cookies</h2>
            
            {cookieCategories.map((category, index) => {
              const IconComponent = category.icon;
              const isEnabled = cookiePreferences[category.key as keyof typeof cookiePreferences];
              
              return (
                <Card key={index} className="group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-3">
                            {category.title}
                            {category.required && (
                              <Badge variant="secondary" className="text-xs">
                                Obligatoire
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => handlePreferenceChange(category.key, checked)}
                        disabled={category.required}
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Cookies utilisés :</h4>
                      <div className="grid gap-4">
                        {category.cookies.map((cookie, cookieIndex) => (
                          <div key={cookieIndex} className="bg-muted/50 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium">{cookie.name}</h5>
                              <Badge variant="outline" className="text-xs">
                                {cookie.duration}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{cookie.purpose}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={savePreferences} size="lg">
              Enregistrer mes préférences
            </Button>
            <Button onClick={acceptAll} variant="outline" size="lg">
              Tout accepter
            </Button>
            <Button onClick={rejectOptional} variant="outline" size="lg">
              Refuser les cookies optionnels
            </Button>
          </div>

          {/* Browser Settings */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Trash2 className="h-6 w-6" />
                Gérer les cookies dans votre navigateur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Vous pouvez également gérer les cookies directement dans les paramètres de votre navigateur :
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Navigateurs de bureau</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>• <strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
                    <li>• <strong>Firefox :</strong> Paramètres → Vie privée et sécurité → Cookies</li>
                    <li>• <strong>Safari :</strong> Préférences → Confidentialité → Cookies</li>
                    <li>• <strong>Edge :</strong> Paramètres → Cookies et autorisations de site</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Navigateurs mobiles</h4>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>• <strong>Chrome mobile :</strong> Menu → Paramètres → Paramètres du site</li>
                    <li>• <strong>Safari iOS :</strong> Réglages → Safari → Bloquer tous les cookies</li>
                    <li>• <strong>Firefox mobile :</strong> Menu → Paramètres → Protection renforcée</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mt-6">
                <p className="text-amber-700 dark:text-amber-400 text-sm">
                  ⚠️ <strong>Attention :</strong> Désactiver tous les cookies peut affecter le fonctionnement normal 
                  de certaines fonctionnalités de Vybbi, notamment la connexion à votre compte et 
                  la sauvegarde de vos préférences.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Questions sur les cookies ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Si vous avez des questions concernant notre utilisation des cookies ou souhaitez 
                exercer vos droits relatifs aux données personnelles, contactez-nous :
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>📧 Email : privacy@vybbi.com</p>
                <p>📍 Adresse : 102 avenue des Champs-Élysées, 75008 Paris, France</p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-12 text-center text-muted-foreground">
            <p>
              Dernière mise à jour de la politique de cookies : 15 septembre 2025<br />
              Cette politique peut être modifiée. Les changements importants vous seront notifiés.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}