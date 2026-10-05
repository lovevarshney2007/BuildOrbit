export async function sendWebhookAlert(message: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    console.warn("No webhook URL configured. Skipping alert.")
    return
  }

  try {
    // Discord handles standard Slack webhook formats if you append /slack to the discord URL,
    // or just accepts {"content": "..."}
    const payload = process.env.DISCORD_WEBHOOK_URL
      ? { content: message }
      : { text: message }

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error("Failed to send webhook alert:", err)
  }
}
