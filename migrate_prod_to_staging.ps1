# Script pour migrer la production vers staging
Write-Host "🚀 Migration Production -> Staging" -ForegroundColor Green

# 1. Vérifier qu'on est sur staging
Write-Host "1. Vérification environnement..." -ForegroundColor Yellow
$projects = supabase projects list
if ($projects -match "● .*zckjtuenlpcfbwcgplaw.*STAGING") {
    Write-Host "✅ Connecté sur STAGING (zckj...)" -ForegroundColor Green
} else {
    Write-Host "❌ ERREUR: Pas connecté sur staging!" -ForegroundColor Red
    exit 1
}

# 2. Reset de staging
Write-Host "2. Reset de la base staging..." -ForegroundColor Yellow
$resetInput = "y"
$resetInput | supabase db reset --linked

# 3. Supprimer toutes les migrations existantes
Write-Host "3. Nettoyage des migrations..." -ForegroundColor Yellow
Get-ChildItem supabase\migrations\*.sql | Remove-Item -Force

# 4. Appliquer le schéma de production
Write-Host "4. Application du schéma de production..." -ForegroundColor Yellow
Copy-Item production_schema_export.sql "supabase\migrations\20251007000000_production_import.sql"
supabase db push --linked

Write-Host "🎉 Migration terminée!" -ForegroundColor Green