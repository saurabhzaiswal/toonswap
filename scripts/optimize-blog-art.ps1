param(
  [string]$SourceDirectory = (Join-Path $PSScriptRoot '..\frontend\public\art\blog')
)

Add-Type -AssemblyName System.Drawing
$resolvedDirectory = (Resolve-Path -LiteralPath $SourceDirectory).Path

Get-ChildItem -LiteralPath $resolvedDirectory -Filter '*.png' | ForEach-Object {
  $sourceImage = [System.Drawing.Image]::FromFile($_.FullName)
  try {
    $targetWidth = [Math]::Min(1400, $sourceImage.Width)
    $targetHeight = [int][Math]::Round($sourceImage.Height * ($targetWidth / $sourceImage.Width))
    $canvas = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($canvas)
      try {
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage($sourceImage, 0, 0, $targetWidth, $targetHeight)
      } finally {
        $graphics.Dispose()
      }

      $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
      $quality = New-Object System.Drawing.Imaging.EncoderParameters(1)
      $quality.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]84)
      $targetPath = [System.IO.Path]::ChangeExtension($_.FullName, '.jpg')
      $canvas.Save($targetPath, $codec, $quality)
    } finally {
      $canvas.Dispose()
    }
  } finally {
    $sourceImage.Dispose()
  }
}
