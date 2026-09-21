$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
Set-Location $project
$local = Join-Path $project '.local'
$version = '8.4.11'
$archive = Join-Path $local "mysql-$version-winx64.zip"
$base = Join-Path $local "mysql-$version-winx64"
$data = Join-Path $local 'data'
$server = Join-Path $base 'bin/mysqld.exe'
$client = Join-Path $base 'bin/mysql.exe'
$marker = Join-Path $local 'database-ready.txt'

function Test-MySqlPort {
  try {
    $tcp = [System.Net.Sockets.TcpClient]::new()
    $result = $tcp.BeginConnect('127.0.0.1', 3306, $null, $null)
    $connected = $result.AsyncWaitHandle.WaitOne(500)
    if ($connected) { $tcp.EndConnect($result) }
    $tcp.Dispose()
    return $connected
  } catch { return $false }
}

New-Item -ItemType Directory -Force -Path $local | Out-Null
if (-not (Test-Path '.env')) { Copy-Item '.env.example' '.env' }

if (-not (Test-MySqlPort)) {
  if (-not (Test-Path $server)) {
    if (-not (Test-Path $archive)) {
      Write-Host 'Baixando MySQL Community Server para Windows (aprox. 281 MB)...'
      Invoke-WebRequest -Uri "https://cdn.mysql.com/Downloads/MySQL-8.4/mysql-$version-winx64.zip" -OutFile $archive
    }
    Write-Host 'Extraindo MySQL...'
    Expand-Archive -LiteralPath $archive -DestinationPath $local -Force
  }
  if (-not (Test-Path $server)) { throw 'O executável mysqld.exe não foi encontrado após a extração.' }
  if (-not (Test-Path $data)) {
    Write-Host 'Inicializando o banco de dados local...'
    & $server '--no-defaults' '--initialize-insecure' "--basedir=$base" "--datadir=$data"
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao inicializar o MySQL.' }
  }
  Write-Host 'Iniciando MySQL em 127.0.0.1:3306...'
  $process = Start-Process -FilePath $server -ArgumentList @('--no-defaults', "--basedir=$base", "--datadir=$data", '--port=3306', '--bind-address=127.0.0.1', '--console') -PassThru -WindowStyle Hidden -RedirectStandardOutput (Join-Path $local 'mysql-out.log') -RedirectStandardError (Join-Path $local 'mysql-error.log')
  $ready = $false
  for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Milliseconds 500
    if (Test-MySqlPort) { $ready = $true; break }
    if ($process.HasExited) { break }
  }
  if (-not $ready) { throw "MySQL não iniciou. Veja .local/mysql-error.log" }
}

if (-not (Test-Path $marker)) {
  if (-not (Test-Path $client)) { throw 'O cliente mysql.exe não está disponível para preparar o banco.' }
  $sql = "CREATE DATABASE IF NOT EXISTS boxing_platform; CREATE USER IF NOT EXISTS 'boxing'@'localhost' IDENTIFIED BY 'boxing_dev'; CREATE USER IF NOT EXISTS 'boxing'@'127.0.0.1' IDENTIFIED BY 'boxing_dev'; GRANT ALL PRIVILEGES ON boxing_platform.* TO 'boxing'@'localhost'; GRANT ALL PRIVILEGES ON boxing_platform.* TO 'boxing'@'127.0.0.1'; FLUSH PRIVILEGES;"
  & $client '--protocol=tcp' '-h' '127.0.0.1' '-P' '3306' '-u' 'root' '-e' $sql 2>$null
  if ($LASTEXITCODE -eq 0) {
    & $client '--protocol=tcp' '-h' '127.0.0.1' '-P' '3306' '-u' 'root' '-e' "ALTER USER 'root'@'localhost' IDENTIFIED BY 'local_root_dev';"
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível proteger o usuário root.' }
  } else {
    & $client '--protocol=tcp' '-h' '127.0.0.1' '-P' '3306' '-u' 'root' '-plocal_root_dev' '-e' $sql
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível preparar o banco local.' }
  }
  Set-Content -LiteralPath $marker -Value 'boxing_platform pronta' -Encoding UTF8
}

Write-Host 'Aplicando migração e cadastrando exercícios...'
$generatedClient = Join-Path $project 'node_modules/.prisma/client/index.js'
$schemaFile = Join-Path $project 'prisma/schema.prisma'
if (-not (Test-Path $generatedClient) -or (Get-Item $schemaFile).LastWriteTimeUtc -gt (Get-Item $generatedClient).LastWriteTimeUtc) {
  npx prisma generate
  if ($LASTEXITCODE -ne 0) { throw 'Falha ao gerar o Prisma Client.' }
}
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) { throw 'Falha ao aplicar a migração.' }
npm run db:seed
if ($LASTEXITCODE -ne 0) { throw 'Falha ao cadastrar os exercícios.' }
Write-Host 'Banco pronto.'
