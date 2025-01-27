# This script creates a test file in the current directory and writes some text to it.
Write-Host "Creating a test file in the scripts folder..."
$jokes = @(
"Why don't scientists trust atoms? Because they make up everything!",
"Why did the scarecrow win an award? Because he was outstanding in his field!",
"Why don't skeletons fight each other? They don't have the guts.")
$randomJoke = Get-Random -InputObject $jokes
Set-Content -Path "$PSScriptRoot\test.txt" -Value $randomJoke
Write-Host $randomJoke