// Email helper using Resend API (Native fetch - no extra heavy dependencies)

const sendGoalReminderEmail = async ({ to, userName, goalTitle, category, deadline, daysLeft, progress }) => {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.log(`[Resend Mock/Skipped] No RESEND_API_KEY set. Would send email to: ${to} for goal: "${goalTitle}" (${daysLeft} days left)`);
        return { success: false, reason: 'RESEND_API_KEY_NOT_CONFIGURED' };
    }

    const urgencyColor = daysLeft <= 1 ? '#ef4444' : '#f59e0b';
    const urgencyLabel = daysLeft === 0 
        ? '⚠️ FINAL DAY — DUE TODAY!' 
        : daysLeft === 1 
            ? '🔥 DUE TOMORROW!' 
            : `⏳ ${daysLeft} DAYS REMAINING`;

    const appUrl = process.env.FRONTEND_URL || 'https://goalstracker.harekrishn.me';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Goal Reminder - GoalsTracker</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
            <!-- Header -->
            <tr>
                <td style="padding: 28px 32px; background: linear-gradient(135deg, #16a34a, #2563eb); text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">GoalsTracker 🎯</h1>
                    <p style="color: #dcfce7; margin: 6px 0 0; font-size: 14px;">Stay accountable to your future self</p>
                </td>
            </tr>

            <!-- Body -->
            <tr>
                <td style="padding: 32px;">
                    <p style="font-size: 16px; color: #374151; margin: 0 0 16px;">Hi <strong>${userName || 'Achiever'}</strong>,</p>
                    <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 24px;">
                        This is a friendly heads-up about your target goal coming up soon:
                    </p>

                    <!-- Goal Card -->
                    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; border-left: 5px solid ${urgencyColor}; margin-bottom: 24px;">
                        <div style="display: inline-block; font-size: 11px; font-weight: bold; color: ${urgencyColor}; letter-spacing: 0.5px; margin-bottom: 6px;">
                            ${urgencyLabel}
                        </div>
                        <h2 style="font-size: 20px; color: #111827; margin: 0 0 8px; font-weight: bold;">
                            ${goalTitle}
                        </h2>
                        <div style="font-size: 13px; color: #6b7280; margin-bottom: 16px;">
                            Category: <strong>${category}</strong> &bull; Deadline: <strong>${deadline}</strong>
                        </div>

                        <!-- Progress Bar -->
                        <div style="margin-top: 12px;">
                            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #374151; font-weight: 600; margin-bottom: 6px;">
                                <span>Current Progress</span>
                                <span>${progress}%</span>
                            </div>
                            <div style="background-color: #e5e7eb; border-radius: 9999px; height: 10px; overflow: hidden; width: 100%;">
                                <div style="background-color: ${progress >= 80 ? '#16a34a' : '#3b82f6'}; height: 10px; width: ${progress}%; border-radius: 9999px;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Call To Action -->
                    <div style="text-align: center; margin: 32px 0 20px;">
                        <a href="${appUrl}" style="background-color: #16a34a; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 15px; box-shadow: 0 2px 4px rgba(22, 163, 74, 0.3);">
                            Update Goal Progress &rarr;
                        </a>
                    </div>

                    <p style="font-size: 13px; color: #9ca3af; text-align: center; margin: 24px 0 0;">
                        "Discipline is the bridge between goals and accomplishment."
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="padding: 20px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af;">
                    You received this email because email reminders are enabled for this goal in GoalsTracker.
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: process.env.RESEND_FROM || 'GoalsTracker <onboarding@resend.dev>',
                to: [to],
                subject: `${urgencyLabel} - "${goalTitle}" is due on ${deadline}`,
                html: html
            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Resend API Error:', data);
            return { success: false, error: data };
        }

        console.log(`[Resend Success] Email sent to ${to} (ID: ${data.id})`);
        return { success: true, data };
    } catch (err) {
        console.error('Failed to send email via Resend:', err.message);
        return { success: false, error: err.message };
    }
};

module.exports = { sendGoalReminderEmail };
