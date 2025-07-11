const UserAuth = {
  KEY_TOKEN: 'authToken',
  KEY_USER_INFO: 'userInfo',

  setToken(token) {
    localStorage.setItem(this.KEY_TOKEN, token);
  },

  getToken() {
    return localStorage.getItem(this.KEY_TOKEN);
  },

  removeToken() {
    localStorage.removeItem(this.KEY_TOKEN);
  },

  setUserInfo(userInfo) {
    localStorage.setItem(this.KEY_USER_INFO, JSON.stringify(userInfo));
  },

  getUserInfo() {
    const userInfo = localStorage.getItem(this.KEY_USER_INFO);
    try {
      return JSON.parse(userInfo);
    } catch (e) {
      localStorage.removeItem(this.KEY_USER_INFO);
      return null;
    }
  },

  removeUserInfo() {
    localStorage.removeItem(this.KEY_USER_INFO);
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  logout() {
    this.removeToken();
    this.removeUserInfo();
  },
};

export default UserAuth;
