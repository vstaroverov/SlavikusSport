Add-Type -AssemblyName System.Drawing

$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$assetsDir = Join-Path $projectRoot 'vk-assets'
$screensDir = Join-Path $projectRoot 'rustore-assets/screenshots'
New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null

function New-Canvas([int]$width, [int]$height) {
  $bitmap = [System.Drawing.Bitmap]::new($width, $height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function Save-Canvas($canvas, [string]$fileName) {
  $canvas.Graphics.Dispose()
  try {
    $canvas.Bitmap.Save((Join-Path $assetsDir $fileName), [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $canvas.Bitmap.Dispose()
  }
}

$dark = [System.Drawing.ColorTranslator]::FromHtml('#061014')
$lime = [System.Drawing.ColorTranslator]::FromHtml('#D8FF18')
$white = [System.Drawing.ColorTranslator]::FromHtml('#F6FBFF')
$muted = [System.Drawing.ColorTranslator]::FromHtml('#A9BEC4')

# Preserve the full app screenshot instead of cropping text at the sides.
foreach ($item in @(
  @{ Source = '01-main.png'; Target = 'screenshot-01-main-600x1200.png' },
  @{ Source = '02-program.png'; Target = 'screenshot-02-program-600x1200.png' },
  @{ Source = '03-workout.png'; Target = 'screenshot-03-workout-600x1200.png' },
  @{ Source = '05-stats.png'; Target = 'screenshot-04-stats-600x1200.png' }
)) {
  $source = [System.Drawing.Image]::FromFile((Join-Path $screensDir $item.Source))
  $canvas = New-Canvas 600 1200
  try {
    $canvas.Graphics.Clear($dark)
    $scaledHeight = [int][Math]::Round($source.Height * 600 / $source.Width)
    $top = [int][Math]::Floor((1200 - $scaledHeight) / 2)
    $canvas.Graphics.DrawImage($source, [System.Drawing.Rectangle]::new(0, $top, 600, $scaledHeight))
    Save-Canvas $canvas $item.Target
  } finally {
    $source.Dispose()
  }
}

$fontCollection = [System.Drawing.Text.PrivateFontCollection]::new()
$fontCollection.AddFontFile((Join-Path $projectRoot 'design-system-v-star-group/assets/fonts/Manrope-variable.ttf'))
$family = $fontCollection.Families[0]
$canvas = New-Canvas 1120 630
$g = $canvas.Graphics
$rect = [System.Drawing.Rectangle]::new(0, 0, 1120, 630)
$background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
  $rect,
  $dark,
  [System.Drawing.ColorTranslator]::FromHtml('#173525'),
  [single]12
)
$g.FillRectangle($background, $rect)
$background.Dispose()

$gridPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(25, 216, 255, 24), 1)
for ($x = 0; $x -le 1120; $x += 80) { $g.DrawLine($gridPen, $x, 0, $x, 630) }
for ($y = 0; $y -le 630; $y += 80) { $g.DrawLine($gridPen, 0, $y, 1120, $y) }
$gridPen.Dispose()

$glow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(34, 216, 255, 24))
$g.FillEllipse($glow, 630, 55, 480, 480)
$glow.Dispose()

$logo = [System.Drawing.Image]::FromFile((Join-Path $assetsDir 'universal-icon-576.png'))
try { $g.DrawImage($logo, [System.Drawing.Rectangle]::new(58, 50, 68, 68)) } finally { $logo.Dispose() }

function Draw-Text([string]$value, [single]$size, [System.Drawing.Color]$color, [single]$x, [single]$y, [System.Drawing.FontStyle]$style = [System.Drawing.FontStyle]::Regular) {
  $font = [System.Drawing.Font]::new($family, $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
  $brush = [System.Drawing.SolidBrush]::new($color)
  try { $g.DrawString($value, $font, $brush, $x, $y) } finally { $brush.Dispose(); $font.Dispose() }
}

Draw-Text 'Slavikus Sport' 26 $white 141 67 ([System.Drawing.FontStyle]::Bold)
Draw-Text 'ТРЕНИРОВКИ В VK' 17 $lime 60 157 ([System.Drawing.FontStyle]::Bold)
Draw-Text 'Тренируйся' 61 $white 55 205 ([System.Drawing.FontStyle]::Bold)
Draw-Text 'в своём ритме' 58 $lime 56 277 ([System.Drawing.FontStyle]::Bold)
Draw-Text 'Планируй занятия, записывай результаты' 23 $muted 60 380
Draw-Text 'и следи за своим прогрессом.' 23 $muted 60 415

$pillBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#0D252A'))
$pillPen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#3D5D61'), 1)
foreach ($pill in @(
  @{ X = 60; Width = 126; Text = 'План' },
  @{ X = 200; Width = 188; Text = 'Тренировка' },
  @{ X = 402; Width = 160; Text = 'Прогресс' }
)) {
  $pillRect = [System.Drawing.Rectangle]::new($pill.X, 500, $pill.Width, 49)
  $g.FillRectangle($pillBrush, $pillRect)
  $g.DrawRectangle($pillPen, $pillRect)
  Draw-Text $pill.Text 18 $white ([single]($pill.X + 17)) 509 ([System.Drawing.FontStyle]::Bold)
}
$pillBrush.Dispose()
$pillPen.Dispose()

$crop = [System.Drawing.Rectangle]::new(198, 468, 684, 1452)
$stats = [System.Drawing.Image]::FromFile((Join-Path $screensDir '05-stats.png'))
$main = [System.Drawing.Image]::FromFile((Join-Path $screensDir '01-main.png'))
try {
  $g.DrawImage($stats, [System.Drawing.Rectangle]::new(659, 171, 216, 459), $crop, [System.Drawing.GraphicsUnit]::Pixel)
  $g.DrawImage($main, [System.Drawing.Rectangle]::new(816, 79, 257, 546), $crop, [System.Drawing.GraphicsUnit]::Pixel)
} finally {
  $stats.Dispose()
  $main.Dispose()
}

Save-Canvas $canvas 'large-snippet-1120x630.png'
$fontCollection.Dispose()
