import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import RegisterPage from '../pages/register/register-page';
import LoginPage from '../pages/login/login-page';
import ListStoriesPage from '../pages/stories/list-stories-page';
import AddStoryPage from '../pages/stories/add-story-page';
import FavoriteStoriesPage from '../pages/stories/favorite-stories-page.js';
import DetailStoryPage from '../pages/stories/detail-story-page.js'; 

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/register': new RegisterPage(),
  '/login': new LoginPage(),
  '/stories': new ListStoriesPage(),
  '/stories/add': new AddStoryPage(),
  '/favorites': new FavoriteStoriesPage(),
  '/stories/:id': new DetailStoryPage(),
  
};

export default routes;
