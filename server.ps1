$ErrorActionPreference = "Stop"

$port = 4173
$root = (Get-Location).Path
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $port)
$listener.Start()

Write-Host "Slavikus Sport is running at http://127.0.0.1:$port"

$types = @{
  ".html" = "text/html; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".webmanifest" = "application/manifest+json; charset=utf-8"
  ".svg" = "image/svg+xml"
}

function Send-Response($stream, $status, $contentType, [byte[]] $body) {
  $header = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
  $headerBytes = [Text.Encoding]::ASCII.GetBytes($header)
  $stream.Write($headerBytes, 0, $headerBytes.Length)
  $stream.Write($body, 0, $body.Length)
}

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $stream = $client.GetStream()
    $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 1024, $true)
    $requestLine = $reader.ReadLine()

    if (-not $requestLine) {
      continue
    }

    $parts = $requestLine.Split(" ")
    $requestPath = [Uri]::UnescapeDataString($parts[1])
    if ($requestPath -eq "/") { $requestPath = "/index.html" }
    $requestPath = $requestPath.Split("?")[0]

    $relative = $requestPath.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar)
    $file = [IO.Path]::GetFullPath([IO.Path]::Combine($root, $relative))

    if (-not $file.StartsWith($root)) {
      Send-Response $stream "403 Forbidden" "text/plain; charset=utf-8" ([Text.Encoding]::UTF8.GetBytes("Forbidden"))
    } elseif (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
      Send-Response $stream "404 Not Found" "text/plain; charset=utf-8" ([Text.Encoding]::UTF8.GetBytes("Not found"))
    } else {
      $extension = [IO.Path]::GetExtension($file)
      $contentType = $types[$extension]
      if (-not $contentType) { $contentType = "application/octet-stream" }
      Send-Response $stream "200 OK" $contentType ([IO.File]::ReadAllBytes($file))
    }
  } finally {
    $client.Close()
  }
}
