param(
    [string]$FrontendProject = "kg-rag-frontend",
    [string]$BackendProject = "kg-rag-api"
)

$ErrorActionPreference = "Stop"

function Get-VercelCli {
    $command = Get-Command vercel.cmd -ErrorAction SilentlyContinue
    if (-not $command) {
        throw "vercel.cmd not found. Install the Vercel CLI first with 'npm install -g vercel'."
    }
    return $command.Source
}

function Read-DotEnv {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Missing env file: $Path"
    }

    $values = @{}
    foreach ($line in Get-Content -LiteralPath $Path) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith("#")) {
            continue
        }

        $parts = $trimmed -split "=", 2
        if ($parts.Count -ne 2) {
            continue
        }

        $key = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"').Trim("'")
        $values[$key] = $value
    }

    return $values
}

function Get-RequiredValue {
    param(
        [hashtable]$Map,
        [string]$Key
    )

    if (-not $Map.ContainsKey($Key) -or [string]::IsNullOrWhiteSpace($Map[$Key])) {
        throw "Required env key '$Key' is missing or empty."
    }

    return $Map[$Key]
}

function Ensure-Project {
    param(
        [string]$Vercel,
        [string]$Name
    )

    try {
        & $Vercel project inspect $Name | Out-Null
    } catch {
        & $Vercel project add $Name | Out-Null
    }
}

function Link-Project {
    param(
        [string]$Vercel,
        [string]$Directory,
        [string]$Name
    )

    & $Vercel link --yes --project $Name --cwd $Directory | Out-Null
}

function Deploy-Project {
    param(
        [string]$Vercel,
        [string]$Directory,
        [string[]]$BuildEnvArgs,
        [string[]]$RuntimeEnvArgs
    )

    $args = @("deploy", "--prod", "--yes", "--cwd", $Directory)
    $args += $BuildEnvArgs
    $args += $RuntimeEnvArgs
    $args += "--logs"

    & $Vercel @args
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $root "frontend"
$backendDir = Join-Path $root "backend"
$vercel = Get-VercelCli

$frontendEnv = Read-DotEnv -Path (Join-Path $frontendDir ".env.local")
$backendEnv = Read-DotEnv -Path (Join-Path $backendDir ".env")

$frontendUrl = "https://$FrontendProject.vercel.app"
$backendUrl = "https://$BackendProject.vercel.app"
$allowedOrigins = "http://localhost:5173,$frontendUrl"

$backendRuntimeArgs = @(
    "-e", "GEMINI_API_KEY=$(Get-RequiredValue $backendEnv 'GEMINI_API_KEY')",
    "-e", "NEO4J_URI=$(Get-RequiredValue $backendEnv 'NEO4J_URI')",
    "-e", "NEO4J_USER=$(Get-RequiredValue $backendEnv 'NEO4J_USER')",
    "-e", "NEO4J_PASSWORD=$(Get-RequiredValue $backendEnv 'NEO4J_PASSWORD')",
    "-e", "SUPABASE_URL=$(Get-RequiredValue $backendEnv 'SUPABASE_URL')",
    "-e", "SUPABASE_KEY=$(Get-RequiredValue $backendEnv 'SUPABASE_KEY')",
    "-e", "SUPABASE_DB_URL=$(Get-RequiredValue $backendEnv 'SUPABASE_DB_URL')",
    "-e", "ALLOWED_ORIGINS=$allowedOrigins",
    "-e", "MAX_FILE_SIZE_MB=$((Get-RequiredValue $backendEnv 'MAX_FILE_SIZE_MB'))",
    "-e", "MAX_CHUNKS_PER_DOC=$((Get-RequiredValue $backendEnv 'MAX_CHUNKS_PER_DOC'))",
    "-e", "GEMINI_RPM_LIMIT=$((Get-RequiredValue $backendEnv 'GEMINI_RPM_LIMIT'))",
    "-e", "ENVIRONMENT=production"
)

$frontendBuildArgs = @(
    "-b", "VITE_API_URL=$backendUrl",
    "-b", "VITE_SUPABASE_URL=$(Get-RequiredValue $frontendEnv 'VITE_SUPABASE_URL')",
    "-b", "VITE_SUPABASE_ANON_KEY=$(Get-RequiredValue $frontendEnv 'VITE_SUPABASE_ANON_KEY')"
)

Write-Host "Ensuring Vercel projects exist..."
Ensure-Project -Vercel $vercel -Name $BackendProject
Ensure-Project -Vercel $vercel -Name $FrontendProject

Write-Host "Linking backend project..."
Link-Project -Vercel $vercel -Directory $backendDir -Name $BackendProject

Write-Host "Deploying backend to $backendUrl ..."
Deploy-Project -Vercel $vercel -Directory $backendDir -BuildEnvArgs @() -RuntimeEnvArgs $backendRuntimeArgs

Write-Host "Linking frontend project..."
Link-Project -Vercel $vercel -Directory $frontendDir -Name $FrontendProject

Write-Host "Deploying frontend to $frontendUrl ..."
Deploy-Project -Vercel $vercel -Directory $frontendDir -BuildEnvArgs $frontendBuildArgs -RuntimeEnvArgs @()

Write-Host ""
Write-Host "Expected production URLs:"
Write-Host "Frontend: $frontendUrl"
Write-Host "Backend:  $backendUrl"
