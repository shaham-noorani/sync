import { supabase } from './supabase';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

type PushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

// Fetch push tokens for a list of user IDs (only non-null tokens)
async function getPushTokens(userIds: string[]): Promise<Record<string, string>> {
  if (userIds.length === 0) return {};

  const { data } = await supabase
    .from('profiles')
    .select('id, push_token')
    .in('id', userIds)
    .not('push_token', 'is', null);

  const map: Record<string, string> = {};
  (data ?? []).forEach((p: any) => {
    if (p.push_token) map[p.id] = p.push_token;
  });
  return map;
}

// Send one or more push messages to the Expo Push API
export async function sendPushNotifications(messages: PushMessage[]) {
  if (messages.length === 0) return;

  try {
    await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });
  } catch {
    // Notification failures are non-fatal — silently ignore
  }
}

// Notify all invitees of a new proposal (excluding creator)
export async function notifyProposalInvitees({
  inviteeIds,
  creatorName,
  proposalTitle,
  proposalId,
}: {
  inviteeIds: string[];
  creatorName: string;
  proposalTitle: string;
  proposalId: string;
}) {
  const tokens = await getPushTokens(inviteeIds);
  const messages: PushMessage[] = Object.entries(tokens).map(([, token]) => ({
    to: token,
    title: `${creatorName} wants to hang 👋`,
    body: proposalTitle,
    data: { screen: 'proposal', id: proposalId },
  }));
  await sendPushNotifications(messages);
}

// Notify proposal creator when someone responds
export async function notifyProposalResponse({
  creatorId,
  responderName,
  proposalTitle,
  response,
  proposalId,
}: {
  creatorId: string;
  responderName: string;
  proposalTitle: string;
  response: string;
  proposalId: string;
}) {
  const tokens = await getPushTokens([creatorId]);
  const token = Object.values(tokens)[0];
  if (!token) return;

  const emoji = response === 'accepted' ? '✅' : response === 'declined' ? '❌' : '🤔';
  await sendPushNotifications([{
    to: token,
    title: `${responderName} responded ${emoji}`,
    body: proposalTitle,
    data: { screen: 'proposal', id: proposalId },
  }]);
}

// Notify hangout attendees when a hangout is logged
export async function notifyHangoutLogged({
  attendeeIds,
  loggerName,
  hangoutTitle,
  hangoutId,
}: {
  attendeeIds: string[];
  loggerName: string;
  hangoutTitle: string;
  hangoutId: string;
}) {
  const tokens = await getPushTokens(attendeeIds);
  const messages: PushMessage[] = Object.entries(tokens).map(([, token]) => ({
    to: token,
    title: `${loggerName} logged a hangout 📸`,
    body: hangoutTitle,
    data: { screen: 'hangout', id: hangoutId },
  }));
  await sendPushNotifications(messages);
}
