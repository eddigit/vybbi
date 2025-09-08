import { Euro, Download, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const commissions = [
  {
    id: 1,
    partner: "DJ Marco",
    campaign: "Festival d'Été 2025",
    amount: "450€",
    status: "Payée",
    date: "15 Aoû 2025",
    type: "CPS"
  },
  {
    id: 2,
    partner: "Sound Events",
    campaign: "Tournée Club Automne",
    amount: "780€",
    status: "En attente",
    date: "20 Aoû 2025",
    type: "CPA"
  },
  {
    id: 3,
    partner: "Night Promotions",
    campaign: "Résidence DJ Hiver",
    amount: "320€",
    status: "Validée",
    date: "22 Aoû 2025",
    type: "CPL"
  }
];

export default function Commissions() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Payée":
        return <Badge className="bg-success/20 text-success border-success/30">Payée</Badge>;
      case "En attente":
        return <Badge className="bg-warning/20 text-warning border-warning/30">En attente</Badge>;
      case "Validée":
        return <Badge className="bg-primary/20 text-primary border-primary/30">Validée</Badge>;
      case "Refusée":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Refusée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Commissions</h1>
          <p className="text-muted-foreground">Suivez et gérez les paiements de commissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Période
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Commissions</CardTitle>
            <div className="text-2xl font-bold text-foreground">12,450€</div>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Payées ce mois</CardTitle>
            <div className="text-2xl font-bold text-success">8,750€</div>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">En attente</CardTitle>
            <div className="text-2xl font-bold text-warning">2,100€</div>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">À valider</CardTitle>
            <div className="text-2xl font-bold text-primary">1,600€</div>
          </CardHeader>
        </Card>
      </div>

      {/* Commissions Table */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Historique des Commissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Partenaire</TableHead>
                <TableHead className="text-muted-foreground">Campagne</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Montant</TableHead>
                <TableHead className="text-muted-foreground">Statut</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground">{commission.partner}</TableCell>
                  <TableCell className="text-muted-foreground">{commission.campaign}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{commission.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{commission.amount}</TableCell>
                  <TableCell>{getStatusBadge(commission.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{commission.date}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}