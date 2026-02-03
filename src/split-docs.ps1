# powershell -File split-file.ps1
$inputFile = "docs.txt"
$linesPerFile = 250
$outputDirectory = "../docs"

# Create output directory if it doesn't exist
if (!(Test-Path $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory
}

# Read all lines from the input file
$lines = Get-Content $inputFile

# Calculate total number of files needed
$totalFiles = [math]::Ceiling($lines.Count / $linesPerFile)

# Split the file
for ($i = 0; $i -lt $totalFiles; $i++) {
    $start = $i * $linesPerFile
    $end = [math]::Min(($i + 1) * $linesPerFile, $lines.Count)
    $outputFile = Join-Path $outputDirectory "part-$($i+1).txt"

    $lines[$start..($end - 1)] | Set-Content $outputFile
    Write-Host "Created $outputFile"
}

Write-Host "Split complete! Created $totalFiles files in $outputDirectory"