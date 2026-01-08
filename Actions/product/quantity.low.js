/**
 *  this function is executed on "product.quantity.low" action triggered by Salla .
 *
 * Action Body received from Salla
 * @param {Object} eventBody
 * { 
 *  event: 'product.quantity.low',
    merchant: 472944967,
    created_at: '2021-11-22 13:51:57',
    data:
 *    {
 *      "id":1911645512,
 *      "app_name":"app name",
 *      "app_description":"desc",
 *      "app_type":"app",
 *      "app_scopes":[ 
 *        'settings.read',
 *        'customers.read_write',
 *        'orders.read_write',
 *        'carts.read',
 *        ...
 *      ],
 *      "installation_date":"2021-11-21 11:07:13"
 *    }
 * }
 * Arguments passed by you:
 * @param {Object} userArgs
 * { key:"val" }
 * @api public
 */
const axios = require("axios");

module.exports = async (eventBody, userArgs) => {
  const { data, merchant } = eventBody;
  const { SallaDatabase } = userArgs;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN missing in .env");
    return;
  }

  // Fetch the merchant's telegram_chat_id from the database
  const oauth = await SallaDatabase.retrieveOauth({ merchant });
  const chatId = oauth?.telegram_chat_id;

  if (!chatId) {
    console.log(`No Telegram chat ID found for merchant: ${merchant}. Skipping alert.`);
    return;
  }

  const message = `⚠️ *تنبيه نقص كمية*
📦 المنتج: ${data.name}
🔢 الكمية الحالية: ${data.quantity}
🏪 التاجر: ${merchant}
🔗 رابط المنتج: https://salla.sa/p/${data.id}`;

  try {
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    });
    console.log(`Telegram alert sent for merchant ${merchant}, product: ${data.name}`);
  } catch (error) {
    console.error("Error sending Telegram message:", error.response?.data || error.message);
  }
};
