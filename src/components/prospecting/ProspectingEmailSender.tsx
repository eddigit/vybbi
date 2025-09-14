import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Eye, Send, User, Building, Loader2 } from "lucide-react";

interface Prospect {
  id: string;
  contact_name: string;
  email: string;
  company_name?: string;
  prospect_type: string;
  status: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  html_content: string;
  variables: any; // Using any to match Supabase Json type
}

interface ProspectingEmailSenderProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProspect?: Prospect;
  onEmailSent?: () => void;
}

export default function ProspectingEmailSender({
  isOpen,
  onClose,
  selectedProspect,
  onEmailSent
}: ProspectingEmailSenderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState("select");
  const [agentId, setAgentId] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  // Load templates when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadProspectingTemplates();
    }
  }, [isOpen]);

  // Fetch current user's agent id when dialog opens
  useEffect(() => {
    const fetchAgent = async () => {
      if (!isOpen || !user?.id) return;
      const { data, error } = await supabase
        .from('vybbi_agents')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!error && data) setAgentId(data.id);
    };
    fetchAgent();
  }, [isOpen, user?.id]);

  const loadProspectingTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .or('type.like.%prospect%,type.like.%vybbi%')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error loading templates:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates d'email",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setCustomSubject(template.subject);
    setCustomMessage(""); // Reset custom message when selecting new template
    setActiveTab("customize");
  };

  const replaceVariables = (content: string) => {
    if (!selectedProspect) return content;
    let result = content;
    result = result.replace(/{{contact_name}}/g, selectedProspect.contact_name);
    result = result.replace(/{{company_name}}/g, selectedProspect.company_name || selectedProspect.contact_name);
    result = result.replace(/{{prospect_type}}/g, selectedProspect.prospect_type);
    return result;
  };

  const getPreviewContent = () => {
    if (!selectedTemplate) return "";
    let content = selectedTemplate.html_content;

    // Replace template variables
    content = replaceVariables(content);

    // Add custom message if provided
    if (customMessage.trim()) {
      const customSection = `
        <div style="background: hsl(217.2 32.6% 17.5%); padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid hsl(221.2 83.2% 53.3%);">
          <h3 style="color: hsl(221.2 83.2% 53.3%); margin: 0 0 12px; font-size: 18px;">📝 Message Personnalisé | Personal Message</h3>
          <p style="margin: 0; line-height: 1.6; color: hsl(210 40% 98%); white-space: pre-line;">${customMessage}</p>
        </div>
      `;

      // Insert before the signature section
      const signatureIndex = content.indexOf('<!-- Signature -->');
      if (signatureIndex !== -1) {
        content = content.slice(0, signatureIndex) + customSection + content.slice(signatureIndex);
      } else {
        // Fallback: add before closing content div
        const closingDivIndex = content.lastIndexOf('</div>');
        if (closingDivIndex !== -1) {
          content = content.slice(0, closingDivIndex) + customSection + content.slice(closingDivIndex);
        }
      }
    }
    return content;
  };

  const handleSendEmail = async () => {
    if (!selectedProspect || !selectedTemplate) return;
    setIsSending(true);
    try {
      // Send via internal templates
      const finalSubject = customSubject || selectedTemplate.subject;
      const finalContent = getPreviewContent();

      // Send email via send-notification edge function
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'prospect_email',
          to: selectedProspect.email,
          subject: replaceVariables(finalSubject),
          html: finalContent,
          cc: user?.email ? [user.email] : [],
          bcc: ['coachdigitalparis@gmail.com'],
          replyTo: user?.email || undefined,
          data: {
            contact_name: selectedProspect.contact_name,
            company_name: selectedProspect.company_name,
            prospect_type: selectedProspect.prospect_type,
            template_name: selectedTemplate.name
          }
        }
      });
      if (error) throw error;
      toast({
        title: "Email envoyé",
        description: `Email envoyé avec succès à ${selectedProspect.contact_name}${data?.messageId ? ` (ID: ${data.messageId})` : ''}`
      });

      // Log interaction in prospect_interactions table (best effort)
      if (agentId) {
        const templateName = selectedTemplate?.name;
        const { error: interactionError } = await supabase
          .from('prospect_interactions')
          .insert({
            prospect_id: selectedProspect.id,
            agent_id: agentId,
            interaction_type: 'email',
            subject: customSubject,
            content: customMessage || `Template: ${templateName}`,
            completed_at: new Date().toISOString()
          });
        if (interactionError) {
          console.error('Error logging prospect interaction:', interactionError);
        }
      }

      // Update prospect status
      const templateType = selectedTemplate?.type;
      if (templateType?.includes('first_contact') && selectedProspect.status === 'new') {
        await supabase
          .from('prospects')
          .update({
            status: 'contacted',
            last_contact_at: new Date().toISOString()
          })
          .eq('id', selectedProspect.id);
      } else {
        // Update last contact date
        await supabase
          .from('prospects')
          .update({
            last_contact_at: new Date().toISOString()
          })
          .eq('id', selectedProspect.id);
      }

      onClose();
      onEmailSent?.();
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Erreur d'envoi",
        description: error.message || "Impossible d'envoyer l'email",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setCustomMessage("");
    setCustomSubject("");
    setActiveTab("select");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Envoi d'email de prospection
          </DialogTitle>
        </DialogHeader>

        {selectedProspect && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Destinataire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedProspect.contact_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedProspect.email}</span>
                </div>
                {selectedProspect.company_name && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedProspect.company_name}</span>
                  </div>
                )}
                <Badge variant="outline">{selectedProspect.prospect_type}</Badge>
                <Badge variant={selectedProspect.status === 'new' ? 'destructive' : 'secondary'}>
                  {selectedProspect.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="select">Templates Email</TabsTrigger>
            <TabsTrigger value="customize" disabled={!selectedTemplate}>Personnalisation</TabsTrigger>
            <TabsTrigger value="preview" disabled={!selectedTemplate}>Prévisualisation</TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="space-y-4">
            <div className="grid gap-4">
              <Label className="text-lg">Choisissez un template d'email :</Label>
              {isLoading ? (
                <div className="text-center py-8 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement des templates...
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun template de prospection trouvé
                </div>
              ) : (
                <div className="grid gap-3">
                  {templates.map(template => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {template.type}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {template.subject}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="customize" className="space-y-4">
            {selectedTemplate && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Template sélectionné : {selectedTemplate?.name}
                    </CardTitle>
                    <CardDescription>Personnalisez le contenu de votre email</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Sujet de l'email</Label>
                      <Input
                        id="subject"
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        placeholder="Sujet de l'email..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Les variables {'{{contact_name}}'}, {'{{company_name}}'} seront automatiquement remplacées
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-message">Message personnel (optionnel)</Label>
                      <Textarea
                        id="custom-message"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Ajoutez un message personnel qui sera inséré dans le template..."
                        rows={6}
                      />
                      <p className="text-xs text-muted-foreground">
                        Ce message sera ajouté au template existant avec une mise en forme appropriée
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button onClick={() => setActiveTab("preview")} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Prévisualiser
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {selectedTemplate && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Prévisualisation de l'email
                    </CardTitle>
                    <CardDescription>
                      Sujet : <span className="font-medium">{replaceVariables(customSubject)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="border rounded-md p-4 bg-background max-h-96 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
                    />
                  </CardContent>
                </Card>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setActiveTab("customize")}>
                    Retour à la personnalisation
                  </Button>
                  <Button onClick={handleSendEmail} disabled={isSending} className="flex items-center gap-2">
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isSending ? 'Envoi en cours...' : "Envoyer l'email"}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}