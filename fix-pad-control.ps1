# Fix the checkPadCurrentControl method
$file = "cable-route-evaluator\src\utils\v4\flowchartEvaluator.js"
$content = Get-Content $file -Raw -Encoding UTF8

# Replace the method
$oldMethod = @"
    if (this.context.metadata.padCurrentControlled) {
      return { status: 'pass', message: 'Homopolar current control present' };
    }
    return { status: 'fail', message: 'Homopolar current control missing' };
"@

$newMethod = @"
    // Check the new field name first, then fall back to old field
    const hasPadControl = this.context.metadata.hasPadCurrentControl ?? this.context.metadata.padCurrentControlled;
    if (hasPadControl) {
      return { status: 'pass', message: 'Homopolar current control present (single grounded star point) - A.2 complies' };
    }
    return { status: 'fail', message: 'Homopolar current control missing (A.2 requirement: enkel geaard sterpunt)' };
"@

$content = $content.Replace($oldMethod, $newMethod)
$content | Set-Content $file -Encoding UTF8 -NoNewline

Write-Host "✅ Fixed checkPadCurrentControl method"
