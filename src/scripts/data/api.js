import CONFIG from '../config';
import UserAuth from './user-auth';

const API_ENDPOINT = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  GET_ALL_STORIES: `${CONFIG.BASE_URL}/stories`,
  ADD_NEW_STORY: `${CONFIG.BASE_URL}/stories`,
  SUBSCRIBE_NOTIFICATION: `${CONFIG.BASE_URL}/notifications/subscribe`,
  DETAIL_STORY: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
};

async function registerUser({ name, email, password }) {
  const response = await fetch(API_ENDPOINT.REGISTER, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
  const responseJson = await response.json();
  if (responseJson.error) { throw new Error(responseJson.message || 'Registrasi gagal'); }
  return responseJson;
}

async function loginUser({ email, password }) {
  const response = await fetch(API_ENDPOINT.LOGIN, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const responseJson = await response.json();
  if (responseJson.error) { throw new Error(responseJson.message || 'Login gagal'); }
  if (!responseJson.loginResult || !responseJson.loginResult.token) { throw new Error('Login berhasil namun tidak menerima token.'); }
  return responseJson.loginResult;
}

async function getAllStories() {
  const token = UserAuth.getToken();
  if (!token) { throw new Error('Anda belum login atau token tidak ditemukan.'); }
  const response = await fetch(API_ENDPOINT.GET_ALL_STORIES, { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
  const responseJson = await response.json();
  if (responseJson.error) {
    if (response.status === 401) { UserAuth.logout(); throw new Error('Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.'); }
    throw new Error(responseJson.message || 'Gagal mengambil daftar cerita.');
  }
  if (!responseJson.listStory) { throw new Error('Gagal mendapatkan data cerita dari API (format respons tidak sesuai).'); }
  return responseJson.listStory;
}

async function addNewStory({ description, photo, lat, lon }) {
  const token = UserAuth.getToken();
  if (!token) { throw new Error('Anda belum login atau token tidak ditemukan. Silakan login terlebih dahulu.'); }
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat !== null && lat !== undefined && String(lat).trim() !== '') { formData.append('lat', parseFloat(lat)); }
  if (lon !== null && lon !== undefined && String(lon).trim() !== '') { formData.append('lon', parseFloat(lon)); }
  const response = await fetch(API_ENDPOINT.ADD_NEW_STORY, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
  const responseJson = await response.json();
  if (responseJson.error) {
    if (response.status === 401) { UserAuth.logout(); throw new Error('Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.'); }
    throw new Error(responseJson.message || 'Gagal menambahkan cerita baru.');
  }
  return responseJson;
}


async function sendPushSubscription(subscription) {
  const token = UserAuth.getToken();
  if (!token) {
    throw new Error('Anda belum login atau token tidak ditemukan.');
  }

  const newSubscriptionPayload = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.toJSON().keys.p256dh,
      auth: subscription.toJSON().keys.auth,
    },
  };

  const response = await fetch(API_ENDPOINT.SUBSCRIBE_NOTIFICATION, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(newSubscriptionPayload),
  });

  const responseJson = await response.json();
  if (responseJson.error) {
    throw new Error(responseJson.message || 'Gagal mengirim data langganan notifikasi.');
  }
  return responseJson;
}

async function getStoryById(id) {
      const token = UserAuth.getToken();
      if (!token) {
        throw new Error('Anda belum login atau token tidak ditemukan.');
      }

      const response = await fetch(API_ENDPOINT.DETAIL_STORY(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseJson = await response.json();
      if (responseJson.error) {
        throw new Error(responseJson.message || 'Gagal mengambil detail cerita.');
      }
      return responseJson.story;
}

function checkAuth() { 
  return UserAuth.isAuthenticated();
}

function saveAuthData(loginResult) {
  UserAuth.setToken(loginResult.token);
  UserAuth.setUserInfo({ name: loginResult.name, userId: loginResult.userId });
}

function performLogout() {
  UserAuth.logout();
}

function getUserInfo() {
  return UserAuth.getUserInfo();
}

export {
  API_ENDPOINT,
  registerUser,
  loginUser,
  getAllStories,
  addNewStory,
  checkAuth, 
  saveAuthData,
  performLogout,
  sendPushSubscription,
  getStoryById,
  getUserInfo,
};