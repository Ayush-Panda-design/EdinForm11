$ErrorActionPreference = "Continue"
$API = "http://localhost:8000"
$WEB = "http://localhost:3000"
$csrf = @{ "X-CSRF-Token" = "1" }
$pass = 0
$fail = 0
$warn = 0

function Test-Ok($name, $cond, $detail = "") {
  if ($cond) { Write-Host "[PASS] $name" -ForegroundColor Green; $script:pass++ }
  else { Write-Host "[FAIL] $name $detail" -ForegroundColor Red; $script:fail++ }
}
function Test-Warn($name, $detail = "") {
  Write-Host "[WARN] $name $detail" -ForegroundColor Yellow
  $script:warn++
}

function Get-Status($url, $headers = @{}) {
  try {
    $r = Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing -TimeoutSec 30
    return @{ ok = $true; code = $r.StatusCode }
  } catch {
    $code = $null
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    return @{ ok = $false; code = $code; err = $_.Exception.Message }
  }
}

function Invoke-Api($method, $path, $body = $null, $headers = @{}) {
  $h = $csrf.Clone()
  foreach ($k in $headers.Keys) { $h[$k] = $headers[$k] }
  $params = @{ Uri = "$API$path"; Method = $method; Headers = $h; ContentType = "application/json"; TimeoutSec = 30 }
  if ($body -ne $null) { $params.Body = ($body | ConvertTo-Json -Depth 10 -Compress) }
  try {
    $r = Invoke-RestMethod @params
    return @{ ok = $true; data = $r }
  } catch {
    $code = $null
    $msg = $_.Exception.Message
    if ($_.Exception.Response) {
      $code = [int]$_.Exception.Response.StatusCode
      try {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $msg = $reader.ReadToEnd()
      } catch {}
    }
    return @{ ok = $false; code = $code; err = $msg }
  }
}

Write-Host "`n=== EdinForm E2E Check ===`n" -ForegroundColor Cyan

# --- Infrastructure ---
$h = Get-Status "$API/health"
Test-Ok "API /health" ($h.ok -and $h.code -eq 200) "code=$($h.code)"
$s = Get-Status "$API/status"
Test-Ok "API /status" ($s.ok -and $s.code -eq 200)
$o = Get-Status "$API/openapi.json"
Test-Ok "API /openapi.json" ($o.ok -and $o.code -eq 200)
Test-Ok "Web config points to API :8000/trpc" ($env:NEXT_PUBLIC_API_URL -eq $null -or (Get-Content "C:\Users\panda\Desktop\Edinform-upgraded\EdinForm11\apps\web\.env" -Raw) -match "localhost:8000")

# --- Static web routes ---
$staticRoutes = @(
  "/", "/auth/login", "/auth/register", "/auth/forgot-password",
  "/auth/reset-password", "/auth/verify-email", "/auth/callback",
  "/dashboard", "/dashboard/forms/new", "/dashboard/templates",
  "/dashboard/analytics", "/dashboard/settings", "/dashboard/help",
  "/explore", "/pricing"
)
foreach ($route in $staticRoutes) {
  $r = Get-Status "$WEB$route"
  Test-Ok "Web GET $route" ($r.ok -and $r.code -eq 200) "code=$($r.code)"
}

# --- Auth API ---
$signIn = Invoke-Api POST "/api/auth/sign-in" @{ email = "creator@example.com"; password = "password123" }
Test-Ok "API POST /api/auth/sign-in (creator)" $signIn.ok
$token = $signIn.data.token
$authH = @{ Authorization = "Bearer $token" }

$me = Invoke-Api GET "/api/auth/me" $null $authH
Test-Ok "API GET /api/auth/me" ($me.ok -and $me.data.email -eq "creator@example.com")

$adminIn = Invoke-Api POST "/api/auth/sign-in" @{ email = "admin@example.com"; password = "password123" }
Test-Ok "API POST /api/auth/sign-in (admin)" $adminIn.ok
$adminH = @{ Authorization = "Bearer $($adminIn.data.token)" }

# --- Forms API ---
$forms = Invoke-Api GET "/api/forms?includeArchived=false" $null $authH
Test-Ok "API GET /api/forms" ($forms.ok -and $forms.data.Count -gt 0)
$formId = $forms.data[0].id
$slug = $forms.data[0].slug

$form = Invoke-Api GET "/api/forms/$formId" $null $authH
Test-Ok "API GET /api/forms/{id}" ($form.ok -and $form.data.id -eq $formId)

$patch = Invoke-Api PATCH "/api/forms/$formId" @{ webhookUrl = ""; digestEnabled = $false } $authH
Test-Ok "API PATCH /api/forms/{id} (webhook fields)" ($patch.ok -and $null -eq $patch.data.webhookUrl)

$themes = Invoke-Api GET "/api/themes" $null $authH
Test-Ok "API GET /api/themes" $themes.ok

$templates = Invoke-Api GET "/api/templates" $null $authH
Test-Ok "API GET /api/templates" $templates.ok

# --- Responses API ---
$responses = Invoke-Api GET "/api/responses?formId=$formId&page=1&limit=5" $null $authH
Test-Ok "API GET /api/responses" $responses.ok
$responseId = $null
if ($responses.ok -and $responses.data.data.Count -gt 0) {
  $responseId = $responses.data.data[0].id
  $one = Invoke-Api GET "/api/responses/$responseId" $null $authH
  Test-Ok "API GET /api/responses/{id}" $one.ok
}

# --- Analytics API ---
$dash = Invoke-Api GET "/api/analytics/dashboard" $null $authH
Test-Ok "API GET /api/analytics/dashboard" $dash.ok

$formAnalytics = Invoke-Api GET "/api/analytics/form?formId=$formId" $null $authH
Test-Ok "API GET /api/analytics/form" $formAnalytics.ok

$recent = Invoke-Api GET "/api/analytics/recent-submissions?limit=5" $null $authH
Test-Ok "API GET /api/analytics/recent-submissions" $recent.ok

# --- Public API ---
$explore = Invoke-Api GET "/api/public/explore" $null @{}
Test-Ok "API GET /api/public/explore" $explore.ok

$pubForm = Invoke-Api GET "/api/public/forms/$slug" $null @{}
Test-Ok "API GET /api/public/forms/{slug}" ($pubForm.ok -and $pubForm.data.slug -eq $slug)

# --- tRPC native endpoint ---
$trpcBody = '{"json":{"email":"creator@example.com","password":"password123"}}'
try {
  $trpc = Invoke-RestMethod -Uri "$API/trpc/auth.signIn" -Method POST -Body $trpcBody -ContentType "application/json" -Headers $csrf -TimeoutSec 30
  Test-Ok "tRPC POST /trpc/auth.signIn" ($trpc.result.data.json.token -ne $null)
} catch {
  Test-Ok "tRPC POST /trpc/auth.signIn" $false $_.Exception.Message
}

# --- Dynamic web routes ---
$dynamicRoutes = @(
  "/dashboard/forms/$formId/edit",
  "/dashboard/forms/$formId/responses",
  "/dashboard/forms/$formId/analytics",
  "/forms/$slug"
)
foreach ($route in $dynamicRoutes) {
  $r = Get-Status "$WEB$route"
  Test-Ok "Web GET $route" ($r.ok -and $r.code -eq 200) "code=$($r.code)"
}
if ($responseId) {
  $r = Get-Status "$WEB/dashboard/forms/$formId/responses/$responseId"
  Test-Ok "Web GET /dashboard/forms/{id}/responses/{responseId}" ($r.ok -and $r.code -eq 200) "code=$($r.code)"
}

# --- Admin route (page + API) ---
$adminPage = Get-Status "$WEB/dashboard/admin"
if ($adminIn.ok) {
  Test-Ok "Web GET /dashboard/admin" ($adminPage.ok -and $adminPage.code -eq 200)
  $adminStats = Invoke-Api GET "/api/admin/stats" $null $adminH
  Test-Ok "API GET /api/admin/stats" $adminStats.ok
} else {
  Test-Warn "Admin checks skipped" "admin login failed"
}

# --- DB columns (webhook regression) ---
try {
  $dbCheck = docker exec edinform11-main-postgres-1 psql -U postgres -d formcraft -t -c "SELECT count(*) FROM information_schema.columns WHERE table_name='forms' AND column_name IN ('webhook_url','digest_enabled');" 2>$null
  Test-Ok "DB forms.webhook_url + digest_enabled columns" ([int]$dbCheck.Trim() -eq 2)
} catch {
  Test-Warn "DB column check skipped" "docker/psql unavailable"
}

Write-Host "`n=== Summary: $pass passed, $fail failed, $warn warnings ===`n" -ForegroundColor Cyan
if ($fail -gt 0) { exit 1 }
