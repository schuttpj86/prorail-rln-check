# Fix the checkSinglePhaseFaultRisk method messages
$file = "cable-route-evaluator\src\utils\v4\flowchartEvaluator.js"
$content = Get-Content $file -Raw -Encoding UTF8

# Replace the success message
$content = $content.Replace(
    "return { status: 'pass', message: ``Nearest joint/earth point is `${jointDistance.toFixed(2)} m away (>31 m)`` };",
    "return { status: 'pass', message: ``Nearest joint/earth point is `${jointDistance.toFixed(2)} m away (>31 m) - A.3 complies`` };"
)

# Replace the failure message
$content = $content.Replace(
    "return { status: 'fail', message: ``Joint/earth point only `${jointDistance.toFixed(2)} m away (≤31 m)`` };",
    "return { status: 'fail', message: ``Joint/earth point only `${jointDistance.toFixed(2)} m away (≤31 m) - A.3 violation`` };"
)

$content | Set-Content $file -Encoding UTF8 -NoNewline

Write-Host "✅ Fixed checkSinglePhaseFaultRisk messages"
