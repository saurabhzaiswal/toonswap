param(
  [string]$Source = (Join-Path $PSScriptRoot '..\public\art\video-journey.png'),
  [string]$Output = (Join-Path $PSScriptRoot '..\public\art\video-journey.gif')
)

Add-Type -AssemblyName System.Drawing

function New-PropertyItem([int]$Id, [int]$Type, [byte[]]$Value) {
  $item = [System.Runtime.Serialization.FormatterServices]::GetUninitializedObject([System.Drawing.Imaging.PropertyItem])
  $item.Id = $Id
  $item.Type = $Type
  $item.Len = $Value.Length
  $item.Value = $Value
  return $item
}

$sourcePath = [System.IO.Path]::GetFullPath($Source)
$outputPath = [System.IO.Path]::GetFullPath($Output)
if (-not (Test-Path -LiteralPath $sourcePath)) { throw "Roadmap source image not found: $sourcePath" }
if (-not $outputPath.StartsWith([System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\public\art')), [System.StringComparison]::OrdinalIgnoreCase)) { throw 'Output must stay inside frontend/public/art.' }

$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)
$frames = [System.Collections.Generic.List[System.Drawing.Bitmap]]::new()
try {
  $cellWidth = [int]($sourceImage.Width / 3)
  $cellHeight = [int]($sourceImage.Height / 2)
  for ($row = 0; $row -lt 2; $row++) {
    for ($column = 0; $column -lt 3; $column++) {
      $frame = [System.Drawing.Bitmap]::new(640, 640)
      $graphics = [System.Drawing.Graphics]::FromImage($frame)
      try {
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $sourceRect = [System.Drawing.Rectangle]::new($column * $cellWidth, $row * $cellHeight, $cellWidth, $cellHeight)
        $targetRect = [System.Drawing.Rectangle]::new(0, 0, 640, 640)
        $graphics.DrawImage($sourceImage, $targetRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
      } finally { $graphics.Dispose() }
      $frames.Add($frame)
    }
  }

  $delayBytes = [byte[]]::new($frames.Count * 4)
  for ($index = 0; $index -lt $frames.Count; $index++) { [BitConverter]::GetBytes([int]120).CopyTo($delayBytes, $index * 4) }
  $frames[0].SetPropertyItem((New-PropertyItem 0x5100 4 $delayBytes))
  $frames[0].SetPropertyItem((New-PropertyItem 0x5101 3 ([BitConverter]::GetBytes([uint16]0))))

  $gifCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/gif'
  $parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
  $parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::SaveFlag, [long][System.Drawing.Imaging.EncoderValue]::MultiFrame)
  $frames[0].Save($outputPath, $gifCodec, $parameters)
  for ($index = 1; $index -lt $frames.Count; $index++) {
    $parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::SaveFlag, [long][System.Drawing.Imaging.EncoderValue]::FrameDimensionTime)
    $frames[0].SaveAdd($frames[$index], $parameters)
  }
  $parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::SaveFlag, [long][System.Drawing.Imaging.EncoderValue]::Flush)
  $frames[0].SaveAdd($parameters)
} finally {
  foreach ($frame in $frames) { $frame.Dispose() }
  $sourceImage.Dispose()
}

Get-Item -LiteralPath $outputPath | Select-Object FullName, Length
