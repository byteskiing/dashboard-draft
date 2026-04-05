# Batch-migrate legacy transform scriptFile values to widget-relative paths.
# Converts:
#   "scriptFile": "transform-foo.js"
# to:
#   "scriptFile": "scripts/transform-foo.js"
#
# Usage examples:
#   .\add-scriptfile-prefix.ps1 -DryRun
#   .\add-scriptfile-prefix.ps1
#   .\add-scriptfile-prefix.ps1 -DashboardId 6045 -IncludeRuntimeCache:$false

param(
    [string]$DraftsRoot = $PSScriptRoot,
    [int]$DashboardId = 0,
    [switch]$IncludeUsers = $true,
    [switch]$IncludeRuntimeCache = $true,
    [switch]$DryRun = $false
)

$ErrorActionPreference = 'Stop'

$stats = @{
    FilesScanned   = 0
    FilesUpdated   = 0
    ReferencesSeen = 0
    ReferencesFixed = 0
}

function Test-LegacyScriptFileValue {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $false
    }

    $normalized = $Value.Replace('\', '/').Trim()

    if ($normalized.StartsWith('scripts/', [System.StringComparison]::OrdinalIgnoreCase)) {
        return $false
    }

    return -not $normalized.Contains('/')
}

function Update-ScriptFileProperties {
    param([object]$Node)

    $updated = $false

    if ($null -eq $Node) {
        return $false
    }

    if ($Node -is [System.Collections.IDictionary]) {
        foreach ($key in @($Node.Keys)) {
            $value = $Node[$key]
            if ($key -eq 'scriptFile' -and $value -is [string]) {
                $script:stats.ReferencesSeen++
                if (Test-LegacyScriptFileValue -Value $value) {
                    $Node[$key] = "scripts/$($value.Replace('\', '/').TrimStart('/'))"
                    $script:stats.ReferencesFixed++
                    $updated = $true
                }
                continue
            }

            if (Update-ScriptFileProperties -Node $value) {
                $updated = $true
            }
        }

        return $updated
    }

    if ($Node -is [System.Management.Automation.PSCustomObject]) {
        foreach ($property in $Node.PSObject.Properties) {
            if ($property.Name -eq 'scriptFile' -and $property.Value -is [string]) {
                $script:stats.ReferencesSeen++
                if (Test-LegacyScriptFileValue -Value $property.Value) {
                    $property.Value = "scripts/$($property.Value.Replace('\', '/').TrimStart('/'))"
                    $script:stats.ReferencesFixed++
                    $updated = $true
                }
                continue
            }

            if (Update-ScriptFileProperties -Node $property.Value) {
                $updated = $true
            }
        }

        return $updated
    }

    if ($Node -is [System.Collections.IEnumerable] -and $Node -isnot [string]) {
        foreach ($item in $Node) {
            if (Update-ScriptFileProperties -Node $item) {
                $updated = $true
            }
        }
    }

    return $updated
}

function Get-WidgetConfigFiles {
    $files = New-Object System.Collections.Generic.List[string]

    if ($IncludeUsers) {
        $usersRoot = Join-Path $DraftsRoot 'users'
        if (Test-Path $usersRoot) {
            $userDraftRoots = Get-ChildItem -Path $usersRoot -Directory | ForEach-Object {
                Join-Path $_.FullName 'drafts'
            } | Where-Object { Test-Path $_ }

            foreach ($draftRoot in $userDraftRoots) {
                $dashboardDirs = if ($DashboardId -gt 0) {
                    @(Join-Path $draftRoot $DashboardId)
                } else {
                    @(Get-ChildItem -Path $draftRoot -Directory | Select-Object -ExpandProperty FullName)
                }

                foreach ($dashboardDir in $dashboardDirs) {
                    if (-not (Test-Path $dashboardDir)) { continue }
                    Get-ChildItem -Path $dashboardDir -Recurse -Filter 'widget.config.json' -File |
                        ForEach-Object { $files.Add($_.FullName) }
                }
            }
        }
    }

    if ($IncludeRuntimeCache) {
        $runtimeRoot = Join-Path $DraftsRoot 'runtime-cache'
        if (Test-Path $runtimeRoot) {
            $dashboardDirs = if ($DashboardId -gt 0) {
                @(Join-Path $runtimeRoot $DashboardId)
            } else {
                @(Get-ChildItem -Path $runtimeRoot -Directory | Select-Object -ExpandProperty FullName)
            }

            foreach ($dashboardDir in $dashboardDirs) {
                if (-not (Test-Path $dashboardDir)) { continue }
                Get-ChildItem -Path $dashboardDir -Recurse -Filter 'widget.config.json' -File |
                    ForEach-Object { $files.Add($_.FullName) }
            }
        }
    }

    return $files
}

$widgetConfigFiles = Get-WidgetConfigFiles

Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'scriptFile Prefix Migration' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host "DraftsRoot: $DraftsRoot"
Write-Host "Widget configs found: $($widgetConfigFiles.Count)"
if ($DashboardId -gt 0) {
    Write-Host "Dashboard filter: $DashboardId"
}
if ($DryRun) {
    Write-Host 'DRY RUN MODE - No files will be modified' -ForegroundColor Yellow
}
Write-Host ''

foreach ($file in $widgetConfigFiles) {
    $stats.FilesScanned++
    $rawJson = Get-Content -Path $file -Raw

    try {
        $json = $rawJson | ConvertFrom-Json -Depth 100
    }
    catch {
        Write-Warning "Skipping invalid JSON: $file"
        continue
    }

    if (-not (Update-ScriptFileProperties -Node $json)) {
        continue
    }

    $stats.FilesUpdated++

    if ($DryRun) {
        Write-Host "[DRY RUN] Would update: $file" -ForegroundColor Yellow
        continue
    }

    $json |
        ConvertTo-Json -Depth 100 |
        Set-Content -Path $file -Encoding UTF8

    Write-Host "Updated: $file" -ForegroundColor Green
}

Write-Host ''
Write-Host 'Summary' -ForegroundColor Cyan
Write-Host "Files scanned: $($stats.FilesScanned)"
Write-Host "Files updated: $($stats.FilesUpdated)"
Write-Host "scriptFile refs seen: $($stats.ReferencesSeen)"
Write-Host "Legacy refs fixed: $($stats.ReferencesFixed)"

if ($DryRun) {
    Write-Host ''
    Write-Host 'Run again without -DryRun to apply changes.' -ForegroundColor Yellow
}
