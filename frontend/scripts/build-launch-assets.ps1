param(
  [string]$FrontendRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$publicRoot = Join-Path $FrontendRoot 'public'
$artRoot = Join-Path $publicRoot 'art'
$launchRoot = Join-Path $artRoot 'launch'
$backgroundSourcePath = Join-Path $launchRoot '00-brand-background.png'
$backgroundPath = Join-Path $launchRoot '00-brand-background.jpg'
$atlasPath = Join-Path $artRoot 'character-atlas.png'
$journeyPath = Join-Path $artRoot 'video-journey.png'
$logoPath = Join-Path $publicRoot 'logo-512.png'

New-Item -ItemType Directory -Path $launchRoot -Force | Out-Null

function Set-RenderQuality([System.Drawing.Graphics]$graphics) {
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
}

function New-RoundedPath([System.Drawing.RectangleF]$rectangle, [float]$radius) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $radius * 2
  $path.AddArc($rectangle.X, $rectangle.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($rectangle.Right - $diameter, $rectangle.Y, $diameter, $diameter, 270, 90)
  $path.AddArc(
    $rectangle.Right - $diameter,
    $rectangle.Bottom - $diameter,
    $diameter,
    $diameter,
    0,
    90
  )
  $path.AddArc($rectangle.X, $rectangle.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-LaunchCanvas {
  $canvas = [System.Drawing.Bitmap]::new(1200, 630)
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  Set-RenderQuality $graphics
  $background = [System.Drawing.Image]::FromFile($backgroundPath)
  try {
    $graphics.DrawImage($background, [System.Drawing.Rectangle]::new(0, 0, 1200, 630))
  } finally {
    $background.Dispose()
    $graphics.Dispose()
  }
  return $canvas
}

function Save-Jpeg(
  [System.Drawing.Bitmap]$bitmap,
  [string]$path,
  [long]$quality = 86
) {
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' } |
    Select-Object -First 1
  $parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
  $parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new(
    [System.Drawing.Imaging.Encoder]::Quality,
    $quality
  )
  try {
    $bitmap.Save($path, $codec, $parameters)
  } finally {
    $parameters.Dispose()
  }
}

if (-not (Test-Path -LiteralPath $backgroundPath)) {
  $sourceBackground = [System.Drawing.Image]::FromFile($backgroundSourcePath)
  $webBackground = [System.Drawing.Bitmap]::new(1200, 630)
  $backgroundGraphics = [System.Drawing.Graphics]::FromImage($webBackground)
  Set-RenderQuality $backgroundGraphics
  try {
    $backgroundGraphics.DrawImage(
      $sourceBackground,
      [System.Drawing.Rectangle]::new(0, 0, 1200, 630)
    )
    Save-Jpeg $webBackground $backgroundPath 84
  } finally {
    $backgroundGraphics.Dispose()
    $webBackground.Dispose()
    $sourceBackground.Dispose()
  }
}

function Draw-RoundedCrop(
  [System.Drawing.Graphics]$graphics,
  [System.Drawing.Image]$source,
  [System.Drawing.Rectangle]$sourceRectangle,
  [System.Drawing.Rectangle]$destination,
  [float]$radius = 22
) {
  $destinationFloat = [System.Drawing.RectangleF]::new(
    $destination.X,
    $destination.Y,
    $destination.Width,
    $destination.Height
  )
  $path = New-RoundedPath $destinationFloat $radius
  $state = $graphics.Save()
  try {
    $graphics.SetClip($path)
    $graphics.DrawImage(
      $source,
      $destination,
      $sourceRectangle.X,
      $sourceRectangle.Y,
      $sourceRectangle.Width,
      $sourceRectangle.Height,
      [System.Drawing.GraphicsUnit]::Pixel
    )
  } finally {
    $graphics.Restore($state)
  }
  $border = [System.Drawing.Pen]::new([System.Drawing.Color]::White, 6)
  try {
    $graphics.DrawPath($border, $path)
  } finally {
    $border.Dispose()
    $path.Dispose()
  }
}

function Draw-Brand([System.Drawing.Graphics]$graphics, [int]$x, [int]$y) {
  $logo = [System.Drawing.Image]::FromFile($logoPath)
  $titleFont = [System.Drawing.Font]::new('Segoe UI', 18, [System.Drawing.FontStyle]::Bold)
  $ink = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(24, 20, 31))
  try {
    $graphics.DrawImage($logo, [System.Drawing.Rectangle]::new($x, $y, 42, 42))
    $graphics.DrawString('ToonSwap', $titleFont, $ink, $x + 53, $y + 7)
  } finally {
    $logo.Dispose()
    $titleFont.Dispose()
    $ink.Dispose()
  }
}

function Draw-FlowCopy(
  [System.Drawing.Graphics]$graphics,
  [string]$step,
  [string]$title,
  [string]$description
) {
  $panelPath = New-RoundedPath ([System.Drawing.RectangleF]::new(38, 38, 340, 554)) 30
  $panelBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(238, 255, 252, 246))
  $eyebrowFont = [System.Drawing.Font]::new('Segoe UI', 13, [System.Drawing.FontStyle]::Bold)
  $stepFont = [System.Drawing.Font]::new('Segoe UI', 50, [System.Drawing.FontStyle]::Bold)
  $titleFont = [System.Drawing.Font]::new('Segoe UI', 29, [System.Drawing.FontStyle]::Bold)
  $bodyFont = [System.Drawing.Font]::new('Segoe UI', 16, [System.Drawing.FontStyle]::Regular)
  $smallFont = [System.Drawing.Font]::new('Segoe UI', 11, [System.Drawing.FontStyle]::Bold)
  $ink = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(24, 20, 31))
  $muted = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(96, 86, 102))
  $coral = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 98, 77))
  try {
    $graphics.FillPath($panelBrush, $panelPath)
    $graphics.DrawString('TOONSWAP WORKFLOW', $eyebrowFont, $coral, 72, 74)
    $graphics.DrawString($step, $stepFont, $ink, 70, 112)
    $graphics.DrawString(
      $title,
      $titleFont,
      $ink,
      [System.Drawing.RectangleF]::new(70, 192, 276, 150)
    )
    $graphics.DrawString(
      $description,
      $bodyFont,
      $muted,
      [System.Drawing.RectangleF]::new(72, 365, 270, 130)
    )
    $graphics.DrawString('Illustrated product journey', $smallFont, $muted, 72, 548)
  } finally {
    $panelPath.Dispose()
    $panelBrush.Dispose()
    $eyebrowFont.Dispose()
    $stepFont.Dispose()
    $titleFont.Dispose()
    $bodyFont.Dispose()
    $smallFont.Dispose()
    $ink.Dispose()
    $muted.Dispose()
    $coral.Dispose()
  }
}

Copy-Item -LiteralPath (Join-Path $publicRoot 'og-social.jpg') -Destination (
  Join-Path $launchRoot '01-hero-social.jpg'
) -Force

$atlas = [System.Drawing.Image]::FromFile($atlasPath)
try {
  $canvas = New-LaunchCanvas
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  Set-RenderQuality $graphics
  $titleFont = [System.Drawing.Font]::new('Segoe UI', 34, [System.Drawing.FontStyle]::Bold)
  $bodyFont = [System.Drawing.Font]::new('Segoe UI', 15, [System.Drawing.FontStyle]::Regular)
  $ink = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(24, 20, 31))
  $muted = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(92, 78, 96))
  try {
    $graphics.DrawString('Meet the ToonSwap cast', $titleFont, $ink, 56, 32)
    $graphics.DrawString(
      'Eight illustrated originals from the approved 24-character launch set',
      $bodyFont,
      $muted,
      58,
      82
    )
    Draw-Brand $graphics 1000 34

    $indices = @(0, 1, 4, 8, 9, 14, 15, 17)
    for ($index = 0; $index -lt $indices.Count; $index++) {
      $sourceIndex = $indices[$index]
      $sourceColumn = $sourceIndex % 6
      $sourceRow = [Math]::Floor($sourceIndex / 6)
      $column = $index % 4
      $row = [Math]::Floor($index / 4)
      $destination = [System.Drawing.Rectangle]::new(
        56 + ($column * 272),
        126 + ($row * 224),
        252,
        204
      )
      Draw-RoundedCrop $graphics $atlas (
        [System.Drawing.Rectangle]::new($sourceColumn * 256, $sourceRow * 256, 256, 256)
      ) $destination 24
    }
    Save-Jpeg $canvas (Join-Path $launchRoot '02-character-showcase.jpg') 86
  } finally {
    $graphics.Dispose()
    $canvas.Dispose()
    $titleFont.Dispose()
    $bodyFont.Dispose()
    $ink.Dispose()
    $muted.Dispose()
  }
} finally {
  $atlas.Dispose()
}

$journey = [System.Drawing.Image]::FromFile($journeyPath)
try {
  $flowAssets = @(
    @{
      File = '03-flow-01-pick-your-cast.jpg'
      Step = '01'
      Title = 'Pick a world and cast'
      Description = 'Start visually. Choose a setting and a friendly illustrated character before adding details.'
      Cells = @(1)
    },
    @{
      File = '03-flow-02-build-scenes-and-voices.jpg'
      Step = '02'
      Title = 'Build scenes and voices'
      Description = 'Describe the story beat, then choose language and performance direction for each moment.'
      Cells = @(2, 3)
    },
    @{
      File = '03-flow-03-edit-and-preview.jpg'
      Step = '03'
      Title = 'Arrange, tune, preview'
      Description = 'Review the timeline, adjust each scene, and preview the planned story before generation.'
      Cells = @(4, 5)
    }
  )

  foreach ($asset in $flowAssets) {
    $canvas = New-LaunchCanvas
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    Set-RenderQuality $graphics
    try {
      Draw-FlowCopy $graphics $asset.Step $asset.Title $asset.Description
      if ($asset.Cells.Count -eq 1) {
        $cell = $asset.Cells[0]
        Draw-RoundedCrop $graphics $journey (
          [System.Drawing.Rectangle]::new(($cell % 3) * 512, [Math]::Floor($cell / 3) * 512, 512, 512)
        ) ([System.Drawing.Rectangle]::new(410, 48, 742, 542)) 32
      } else {
        for ($cellIndex = 0; $cellIndex -lt $asset.Cells.Count; $cellIndex++) {
          $cell = $asset.Cells[$cellIndex]
          Draw-RoundedCrop $graphics $journey (
            [System.Drawing.Rectangle]::new(($cell % 3) * 512, [Math]::Floor($cell / 3) * 512, 512, 512)
          ) ([System.Drawing.Rectangle]::new(410 + ($cellIndex * 375), 48, 360, 542)) 28
        }
      }
      Save-Jpeg $canvas (Join-Path $launchRoot $asset.File) 86
    } finally {
      $graphics.Dispose()
      $canvas.Dispose()
    }
  }

  $canvas = New-LaunchCanvas
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  Set-RenderQuality $graphics
  try {
    Draw-FlowCopy $graphics 'CONCEPT' 'Storyboard preview' (
      'A launch-safe illustration of the planned preview. No private selfie, voice, or user media.'
    )
    Draw-RoundedCrop $graphics $journey (
      [System.Drawing.Rectangle]::new(1024, 512, 512, 512)
    ) ([System.Drawing.Rectangle]::new(410, 48, 742, 542)) 32
    Save-Jpeg $canvas (Join-Path $launchRoot '04-storyboard-concept-preview.jpg') 86
  } finally {
    $graphics.Dispose()
    $canvas.Dispose()
  }
} finally {
  $journey.Dispose()
}

Copy-Item -LiteralPath (Join-Path $artRoot 'video-journey.gif') -Destination (
  Join-Path $launchRoot '05-workflow-loop.gif'
) -Force

if (Test-Path -LiteralPath $backgroundSourcePath) {
  Remove-Item -LiteralPath $backgroundSourcePath -Force
}

Get-ChildItem $launchRoot -File | Sort-Object Name | Select-Object Name, Length
