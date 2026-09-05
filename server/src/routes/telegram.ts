import { Router } from 'express';
import { db } from '../db.js';
import { TelegramMessage } from '../types.js';

const router = Router();

// Helper to generate 6-digit numeric PIN
const generatePin = () => Math.floor(100000 + Math.random() * 900000).toString();

// Get all Telegram PIN assignments
router.get('/pins', (req, res) => {
  const users = db.get().users;
  const pins = users.map(u => ({
    userId: u.id,
    userName: u.name,
    role: u.role,
    email: u.email,
    phone: u.phone,
    telegramPin: u.telegramPin || null,
    isPaired: !!u.telegramChatId,
    telegramChatId: u.telegramChatId || null
  }));
  res.json(pins);
});

// Generate or regenerate PIN for a user
router.post('/pins/generate', (req, res) => {
  const { userId } = req.body;
  let newPin = generatePin();

  db.update(data => {
    const user = data.users.find(u => u.id === userId);
    if (user) {
      user.telegramPin = newPin;
      user.telegramChatId = undefined; // reset pairing until linked

      data.activityLogs.unshift({
        id: `act-${Date.now()}`,
        action: 'TELEGRAM',
        title: 'Telegram PIN generated',
        details: `New PIN generated for ${user.name}`,
        timestamp: new Date().toISOString(),
        entityType: 'system'
      });
    }
  });

  res.json({ success: true, userId, pin: newPin });
});

// Revoke PIN / unlink user
router.post('/pins/revoke', (req, res) => {
  const { userId } = req.body;
  db.update(data => {
    const user = data.users.find(u => u.id === userId);
    if (user) {
      user.telegramPin = undefined;
      user.telegramChatId = undefined;
    }
  });
  res.json({ success: true });
});

// Get Telegram simulator chat messages
router.get('/messages', (req, res) => {
  res.json(db.get().telegramMessages);
});

// Send message in simulator or simulate bot reply
router.post('/simulate', (req, res) => {
  const { text, sender = 'user', mediaUrl } = req.body;
  if (!text && !mediaUrl) return res.status(400).json({ error: 'Text or media required' });

  const userMsg: TelegramMessage = {
    id: `tg-${Date.now()}-user`,
    sender: sender as 'user' | 'bot',
    text: text || '',
    timestamp: new Date().toISOString(),
    mediaUrl
  };

  const botResponses: TelegramMessage[] = [];

  // Bot logic engine
  const trimmed = text.trim();

  if (trimmed.startsWith('/start')) {
    botResponses.push({
      id: `tg-${Date.now()}-1`,
      sender: 'bot',
      text: `👋 *Welcome to PropFlow Operations Bot!*\n\nTo link your cleaner/technician account, please send:\n\`/link <YOUR-6-DIGIT-PIN>\`\n\n_Example: \`/link 482910\`_`,
      timestamp: new Date(Date.now() + 500).toISOString()
    });
  } else if (trimmed.startsWith('/link')) {
    const parts = trimmed.split(/\s+/);
    const pin = parts[1];
    const user = db.get().users.find(u => u.telegramPin === pin);

    if (user) {
      db.update(data => {
        const u = data.users.find(x => x.id === user.id);
        if (u) u.telegramChatId = 'chat_simulated_active';
      });

      botResponses.push({
        id: `tg-${Date.now()}-1`,
        sender: 'bot',
        text: `🎉 *Account Successfully Linked!*\n\nHello *${user.name}* (${user.role.toUpperCase()})!\nYou will now receive live turnover notifications, schedule updates, and urgent alerts directly here.\n\n*Available Commands:*\n• /tasks - View your upcoming cleaning/maintenance jobs\n• /linen - Check linen stock availability\n• /report_lost - Report an item found in an apartment\n• /report_maintenance - Flag an apartment maintenance defect`,
        timestamp: new Date(Date.now() + 600).toISOString()
      });
    } else {
      botResponses.push({
        id: `tg-${Date.now()}-1`,
        sender: 'bot',
        text: `❌ *Invalid PIN*\nCould not find a staff account with PIN "${pin || ''}". Please check with your Operations Manager or regenerate your PIN in the PropFlow dashboard.`,
        timestamp: new Date(Date.now() + 500).toISOString()
      });
    }
  } else if (trimmed.startsWith('/tasks') || trimmed.startsWith('/cleanings')) {
    const cleanings = db.get().cleanings.slice(0, 3);
    const taskList = cleanings.map((c, i) =>
      `*${i + 1}. ${c.apartmentName}* (${c.timeWindow})\nStatus: _${c.status.toUpperCase()}_\nLinen: ${c.linenUsed.bathTowels} Bath towels\n/accept_${c.id}`
    ).join('\n\n');

    botResponses.push({
      id: `tg-${Date.now()}-1`,
      sender: 'bot',
      text: `📋 *Your Current Turnovers:*\n\n${taskList || 'No pending cleaning tasks!'}`,
      timestamp: new Date(Date.now() + 500).toISOString(),
      buttons: cleanings.map(c => ({ text: `Done: ${c.apartmentName}`, callback_data: `complete_${c.id}` }))
    });
  } else if (trimmed.startsWith('/accept_') || trimmed.includes('accept_cln')) {
    const jobId = trimmed.replace('/accept_', '').trim();
    db.update(data => {
      const job = data.cleanings.find(c => c.id === jobId || jobId.includes(c.id));
      if (job) {
        job.status = 'in_progress';
        job.startedAt = new Date().toISOString();
      }
    });

    botResponses.push({
      id: `tg-${Date.now()}-1`,
      sender: 'bot',
      text: `✅ *Task Accepted!*\nTurnover is now marked as *IN PROGRESS*. When finished, upload a completion photo or send \`/complete_${jobId}\`.`,
      timestamp: new Date(Date.now() + 500).toISOString()
    });
  } else if (trimmed.startsWith('/complete_') || trimmed.includes('complete_cln')) {
    const jobId = trimmed.replace('/complete_', '').trim();
    let jobName = 'Apartment';
    db.update(data => {
      const job = data.cleanings.find(c => c.id === jobId || jobId.includes(c.id));
      if (job) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        jobName = job.apartmentName;
      }
    });

    botResponses.push({
      id: `tg-${Date.now()}-1`,
      sender: 'bot',
      text: `🏆 *Turnover Completed!*\nGreat job! *${jobName}* marked as COMPLETED. Fresh linen sets have been deducted from inventory. Admin notified for final inspection.`,
      timestamp: new Date(Date.now() + 500).toISOString()
    });
  } else if (trimmed.startsWith('/report_lost')) {
    botResponses.push({
      id: `tg-${Date.now()}-1`,
      sender: 'bot',
      text: `📦 *Lost Item Form*\nPlease reply with:\n\n*Format:* \`<Apartment Name> | <Item description> | <Found in room>\`\n_Example: test 1 | Gold watch | Master bedroom under bed_`,
      timestamp: new Date(Date.now() + 500).toISOString()
    });
  } else if (trimmed.includes('|') && trimmed.toLowerCase().includes('test')) {
    // Form submission simulation
    const parts = trimmed.split('|').map((s: string) => s.trim());
    const aptName = parts[0] || 'test 1';
    const itemDesc = parts[1] || 'Forgotten item';
    const room = parts[2] || 'Living area';

    const apt = db.get().apartments.find(a => a.name.toLowerCase().includes(aptName.toLowerCase())) || db.get().apartments[0];

    db.update(data => {
      data.lostItems.unshift({
        id: `lost-${Date.now()}`,
        apartmentId: apt.id,
        apartmentName: apt.name,
        itemName: itemDesc,
        category: 'Accessories',
        description: `Found in ${room} via Telegram submission`,
        foundDate: new Date().toISOString().split('T')[0],
        foundBy: 'Elena Volkova (via Telegram)',
        storageLocation: 'Operations Safe Box',
        status: 'reported'
      });
    });

    botResponses.push({
      id: `tg-${Date.now()}-1`,
      sender: 'bot',
      text: `✅ *Lost Item Logged & Alert Dispatched!*\n"${itemDesc}" at *${apt.name}* registered. High-priority alert sent to Operations Manager dashboard.`,
      timestamp: new Date(Date.now() + 600).toISOString()
    });
  } else {
    // Default helpful echo
    botResponses.push({
      id: `tg-${Date.now()}-1`,
      sender: 'bot',
      text: `🤖 I received: "${text}"\nType /tasks to view your cleanings, /link <PIN> to connect your account, or /report_lost to log items.`,
      timestamp: new Date(Date.now() + 500).toISOString()
    });
  }

  db.update(data => {
    data.telegramMessages.push(userMsg);
    data.telegramMessages.push(...botResponses);
  });

  res.json({
    userMessage: userMsg,
    botResponses,
    allMessages: db.get().telegramMessages
  });
});

export default router;
