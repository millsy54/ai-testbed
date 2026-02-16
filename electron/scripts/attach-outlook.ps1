param(
  [Parameter(Mandatory = $true)]
  [string]$AttachmentPath
)

try {
  if (-not (Test-Path -LiteralPath $AttachmentPath)) {
    throw "Attachment file not found."
  }

  try {
    $outlook = [Runtime.InteropServices.Marshal]::GetActiveObject("Outlook.Application")
  } catch {
    throw "Outlook is not running."
  }

  $inspector = $outlook.ActiveInspector()
  if ($null -eq $inspector) {
    throw "No active Outlook compose window found."
  }

  $mail = $inspector.CurrentItem
  # 43 = olMail
  if ($null -eq $mail -or $mail.Class -ne 43) {
    throw "Active Outlook window is not an email draft."
  }

  $mail.Attachments.Add($AttachmentPath) | Out-Null
  $mail.Save() | Out-Null

  Write-Output "OK"
  exit 0
} catch {
  Write-Error $_.Exception.Message
  exit 1
}

