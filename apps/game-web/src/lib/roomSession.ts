import type { RoomMemberSessionResponse } from '@couchrush/api-client';

const ROOM_SESSION_STORAGE_KEY = 'couchrush.game.room_session';
const ROOM_CSRF_COOKIE_NAME = 'couchrush_room_csrf';

function hasWindow() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadStoredRoomSession(): RoomMemberSessionResponse | null {
  if (!hasWindow()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(ROOM_SESSION_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<RoomMemberSessionResponse>;
    if (
      typeof parsed.room_id !== 'string' ||
      typeof parsed.room_code !== 'string' ||
      typeof parsed.member_id !== 'string' ||
      typeof parsed.is_host !== 'boolean' ||
      typeof parsed.is_player !== 'boolean' ||
      typeof parsed.csrf_token !== 'string'
    ) {
      return null;
    }

    return parsed as RoomMemberSessionResponse;
  } catch {
    return null;
  }
}

export function saveStoredRoomSession(session: RoomMemberSessionResponse) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(ROOM_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredRoomSession() {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(ROOM_SESSION_STORAGE_KEY);
}

export function loadStoredRoomSessionForCode(roomCode: string) {
  const session = loadStoredRoomSession();
  if (!session) {
    return null;
  }

  return session.room_code.toUpperCase() === roomCode.toUpperCase() ? session : null;
}

export function loadRoomCsrfToken(fallback: string) {
  if (typeof document === 'undefined') {
    return fallback;
  }

  const csrfCookie = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${ROOM_CSRF_COOKIE_NAME}=`));

  return csrfCookie ? decodeURIComponent(csrfCookie.split('=').slice(1).join('=')) : fallback;
}
