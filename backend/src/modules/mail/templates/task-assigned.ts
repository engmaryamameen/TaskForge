interface TaskAssignedTemplateData {
  recipientName?: string;
  taskTitle: string;
  taskDescription?: string;
  projectName?: string;
  dueDate?: string;
  priority: string;
  assignerName?: string;
  organizationName: string;
  taskUrl: string;
}

const priorityColors: Record<string, string> = {
  urgent: '#E34935',
  high: '#E2540A',
  medium: '#CF9F02',
  low: '#626F86',
};

export function taskAssignedTemplate(data: TaskAssignedTemplateData): { html: string; text: string } {
  const greeting = data.recipientName ? `Hi ${data.recipientName},` : 'Hi there,';
  const assigner = data.assignerName || 'Someone';
  const priorityColor = priorityColors[data.priority] || '#626F86';
  const description = data.taskDescription
    ? `<p style="margin:0 0 16px;color:#44546F;font-size:14px;line-height:1.6;">${data.taskDescription}</p>`
    : '';
  const dueDateRow = data.dueDate
    ? `<tr><td style="padding:8px 0;color:#626F86;font-size:13px;width:100px;">Due Date</td><td style="padding:8px 0;color:#172B4D;font-size:13px;font-weight:500;">${data.dueDate}</td></tr>`
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f7f8f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f8f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color:#0C66E4;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">TaskForge</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;color:#172B4D;font-size:15px;line-height:1.6;">${greeting}</p>
              <p style="margin:0 0 24px;color:#172B4D;font-size:15px;line-height:1.6;">
                ${assigner} assigned you a task in <strong>${data.organizationName}</strong>.
              </p>
              <!-- Task card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f8f9;border-radius:8px;border:1px solid #DCDFE4;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <h2 style="margin:0 0 12px;color:#172B4D;font-size:16px;font-weight:600;">${data.taskTitle}</h2>
                    ${description}
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${data.projectName ? `<tr><td style="padding:8px 0;color:#626F86;font-size:13px;width:100px;">Project</td><td style="padding:8px 0;color:#172B4D;font-size:13px;font-weight:500;">${data.projectName}</td></tr>` : ''}
                      <tr>
                        <td style="padding:8px 0;color:#626F86;font-size:13px;width:100px;">Priority</td>
                        <td style="padding:8px 0;">
                          <span style="display:inline-block;background-color:${priorityColor}15;color:${priorityColor};font-size:12px;font-weight:600;padding:2px 8px;border-radius:4px;text-transform:uppercase;">${data.priority}</span>
                        </td>
                      </tr>
                      ${dueDateRow}
                    </table>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${data.taskUrl}" style="display:inline-block;background-color:#0C66E4;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">
                      View Task
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #DCDFE4;text-align:center;">
              <p style="margin:0;color:#8993A5;font-size:12px;">
                Sent by TaskForge &mdash; Multi-tenant project management
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${greeting}

${assigner} assigned you a task in ${data.organizationName}.

Task: ${data.taskTitle}
${data.taskDescription ? `Description: ${data.taskDescription}\n` : ''}${data.projectName ? `Project: ${data.projectName}\n` : ''}Priority: ${data.priority}
${data.dueDate ? `Due: ${data.dueDate}\n` : ''}
View the task: ${data.taskUrl}

— TaskForge`;

  return { html, text };
}
