import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, UserCheck, UserX, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const partners = [
  {
    id: 1,
    name: "DJ Marco",
    email: "marco@example.com",
    type: "Agent DJ",
    status: "Actif",
    commissions: "2,450€",
    joined: "15 Jan 2025"
  },
  {
    id: 2,
    name: "Sound Events",
    email: "contact@soundevents.com",
    type: "Booker",
    status: "Actif",
    commissions: "4,780€",
    joined: "22 Dec 2024"
  },
  {
    id: 3,
    name: "Night Promotions",
    email: "promo@night.com",
    type: "Promoteur",
    status: "En attente",
    commissions: "0€",
    joined: "08 Sep 2025"
  },
];

export default function Partners() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Actif":
        return <Badge className="bg-success/20 text-success border-success/30">Actif</Badge>;
      case "En attente":
        return <Badge className="bg-warning/20 text-warning border-warning/30">En attente</Badge>;
      case "Suspendu":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Suspendu</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      "Agent DJ": "bg-primary/20 text-primary border-primary/30",
      "Booker": "bg-success/20 text-success border-success/30", 
      "Promoteur": "bg-warning/20 text-warning border-warning/30",
      "Venue": "bg-destructive/20 text-destructive border-destructive/30"
    };
    return <Badge className={colors[type as keyof typeof colors] || "bg-muted"}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Partenaires</h1>
          <p className="text-muted-foreground">Gérez vos agents, tourneurs et apporteurs d'affaires</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Partenaire
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Partenaires</CardTitle>
            <div className="text-2xl font-bold text-foreground">156</div>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Partenaires Actifs</CardTitle>
            <div className="text-2xl font-bold text-success">142</div>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">En Attente</CardTitle>
            <div className="text-2xl font-bold text-warning">8</div>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Suspendus</CardTitle>
            <div className="text-2xl font-bold text-destructive">6</div>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un partenaire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Partners Table */}
      <Card className="bg-gradient-card border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Partenaire</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Statut</TableHead>
              <TableHead className="text-muted-foreground">Commissions</TableHead>
              <TableHead className="text-muted-foreground">Inscrit le</TableHead>
              <TableHead className="text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.map((partner) => (
              <TableRow key={partner.id} className="border-border hover:bg-muted/50">
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{partner.name}</div>
                    <div className="text-sm text-muted-foreground">{partner.email}</div>
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(partner.type)}</TableCell>
                <TableCell>{getStatusBadge(partner.status)}</TableCell>
                <TableCell className="font-medium text-foreground">{partner.commissions}</TableCell>
                <TableCell className="text-muted-foreground">{partner.joined}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem className="text-foreground hover:bg-muted">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Voir profil
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-foreground hover:bg-muted">
                        <Mail className="w-4 h-4 mr-2" />
                        Contacter
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive hover:bg-destructive/20">
                        <UserX className="w-4 h-4 mr-2" />
                        Suspendre
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}