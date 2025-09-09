export function Footer() {
  const currentYear = new Date().getFullYear();
  const version = "v1.2.0"; // Update this version number for important changes

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border">
      <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div>© {currentYear} Vybbi</div>
        <div className="flex items-center gap-4">
          <span>{version}</span>
          <span>Créé par Gilles Korzec</span>
        </div>
      </div>
    </footer>
  );
}