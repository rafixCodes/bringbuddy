const Notification = require('../models/Notification');

function normalizeNotification(data) {
  return {
    user: data.user,
    type: data.type || 'general',
    title: String(data.title || 'BringBuddy update')
      .trim()
      .slice(0, 120),
    message: String(data.message || '')
      .trim()
      .slice(0, 500),
    relatedOrder: data.relatedOrder || null,
    actionUrl: data.actionUrl || '/notifications',
  };
}

async function createNotification(
  data,
  session = null
) {
  if (!data?.user || !data?.message) {
    return null;
  }

  try {
    const documents = await Notification.create(
      [normalizeNotification(data)],
      session ? { session } : undefined
    );

    return documents[0];
  } catch (error) {
    console.error(
      'Create notification error:',
      error
    );

    return null;
  }
}

async function createNotifications(
  items,
  session = null
) {
  const validItems = (items || [])
    .filter((item) => item?.user && item?.message)
    .map(normalizeNotification);

  if (validItems.length === 0) {
    return [];
  }

  try {
    return await Notification.insertMany(
      validItems,
      {
        ordered: false,
        ...(session ? { session } : {}),
      }
    );
  } catch (error) {
    console.error(
      'Create notifications error:',
      error
    );

    return [];
  }
}

module.exports = {
  createNotification,
  createNotifications,
};