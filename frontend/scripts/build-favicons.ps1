param(
  [string]$Source = (Join-Path $PSScriptRoot '..\public\logo-512.png'),
  [string]$PublicRoot = (Join-Path $PSScriptRoot '..\public')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$sourcePath = [System.IO.Path]::GetFullPath($Source)
$publicPath = [System.IO.Path]::GetFullPath($PublicRoot)
if (-not (Test-Path -LiteralPath $sourcePath)) { throw "Favicon source not found: $sourcePath" }
if (-not (Test-Path -LiteralPath $publicPath)) { throw "Public directory not found: $publicPath" }

function Save-SquarePng([System.Drawing.Image]$image, [int]$size, [string]$fileName) {
  $outputPath = [System.IO.Path]::GetFullPath((Join-Path $publicPath $fileName))
  if (-not $outputPath.StartsWith($publicPath, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'Favicon output escaped the frontend public directory.'
  }

  $bitmap = [System.Drawing.Bitmap]::new($size, $size)
  $bitmap.SetResolution(96, 96)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.Clear([System.Drawing.Color]::FromArgb(255, 255, 250, 242))
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.DrawImage($image, 0, 0, $size, $size)
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $graphics.Dispose()
    $bitmap.Dispose()
  }
  return $outputPath
}

function Save-PngIco([string]$pngPath, [string]$fileName, [int]$size) {
  $outputPath = [System.IO.Path]::GetFullPath((Join-Path $publicPath $fileName))
  $pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
  $stream = [System.IO.File]::Create($outputPath)
  $writer = [System.IO.BinaryWriter]::new($stream)
  try {
    $writer.Write([uint16]0)
    $writer.Write([uint16]1)
    $writer.Write([uint16]1)
    $writer.Write([byte]$size)
    $writer.Write([byte]$size)
    $writer.Write([byte]0)
    $writer.Write([byte]0)
    $writer.Write([uint16]1)
    $writer.Write([uint16]32)
    $writer.Write([uint32]$pngBytes.Length)
    $writer.Write([uint32]22)
    $writer.Write($pngBytes)
  } finally {
    $writer.Dispose()
    $stream.Dispose()
  }
}

$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)
try {
  $favicon48 = Save-SquarePng $sourceImage 48 'favicon-48.png'
  $favicon96 = Save-SquarePng $sourceImage 96 'favicon-96.png'
  Save-SquarePng $sourceImage 180 'apple-touch-icon.png' | Out-Null
  Save-SquarePng $sourceImage 192 'icon-192.png' | Out-Null
  Save-SquarePng $sourceImage 512 'icon-512.png' | Out-Null
  Save-PngIco $favicon48 'favicon.ico' 48
} finally {
  $sourceImage.Dispose()
}

Get-ChildItem -LiteralPath (
  $favicon48,
  $favicon96,
  (Join-Path $publicPath 'favicon.ico'),
  (Join-Path $publicPath 'apple-touch-icon.png'),
  (Join-Path $publicPath 'icon-192.png'),
  (Join-Path $publicPath 'icon-512.png')
) | Select-Object Name, Length
