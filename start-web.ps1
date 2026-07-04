$ErrorActionPreference = "Stop"

$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
  $python = Get-Command py -ErrorAction SilentlyContinue
}

if ($python) {
  & $python.Source server.py
  exit
}

& powershell -ExecutionPolicy Bypass -File .\server.ps1
