# PowerShell script to initialize Git and push to GitHub
# Run this script in PowerShell: .\setup-git.ps1

Write-Host "GitHub Setup Script" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""

# Get GitHub details
$githubUsername = Read-Host "Enter your GitHub username"
$repoName = Read-Host "Enter your repository name"

Write-Host ""
Write-Host "Initializing Git repository..." -ForegroundColor Yellow

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Inventory Management System with full CRUD functionality"

# Add remote
$remoteUrl = "https://github.com/$githubUsername/$repoName.git"
git remote add origin $remoteUrl

# Rename branch to main
git branch -M main

Write-Host ""
Write-Host "Ready to push!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure your GitHub repository exists at: $remoteUrl" -ForegroundColor White
Write-Host "2. Run: git push -u origin main" -ForegroundColor White
Write-Host ""

$pushNow = Read-Host "Push now? (y/n)"
if ($pushNow -eq "y" -or $pushNow -eq "Y") {
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push -u origin main
    Write-Host ""
    Write-Host "Success! Your code is now on GitHub." -ForegroundColor Green
} else {
    Write-Host "Run 'git push -u origin main' when ready." -ForegroundColor Yellow
}
