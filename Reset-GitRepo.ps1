# Exit on error
$ErrorActionPreference = "Stop"

# Hardcoded branch name
$BranchName = "latest_branch"

# Create an orphan branch
Write-Host "Creating orphan branch: $BranchName"
git checkout --orphan $BranchName

# Add and commit all files
Write-Host "Adding and committing files to $BranchName"
git add -A
git commit -am "Initial commit for $BranchName"

# Delete the current main branch
if (git branch --list main) {
    Write-Host "Deleting main branch"
    git branch -D main
}

# Rename orphan branch to main
Write-Host "Renaming branch $BranchName to main"
git branch -m main

# Force push to remote
Write-Host "Force pushing changes to remote"
git push -f origin main

Write-Host "Git repository has been reset successfully!"
