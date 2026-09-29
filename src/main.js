import { Navbar } from './components/navbar/Navbar.js';
import { Footer } from './components/footer/Footer.js';
import { Router } from './router/router.js';
import { authService } from './services/authService.js';
import { HomeView } from './views/HomeView.js';
import { NotesView } from './views/NotesView.js';
import { NotFoundView } from './views/NotFoundView.js';

const navbarContainer = document.querySelector('#navbar-container');
const footerContainer = document.querySelector('#footer-container');
const routerOutlet = document.querySelector('#router-view');
const app = document.querySelector('#app');

app.classList.toggle('landing-shell', !authService.getCurrentUser());

navbarContainer.append(Navbar());
footerContainer.append(Footer());

const router = new Router({
  outlet: routerOutlet,
  routes: {
    '/': HomeView,
    '/notes': NotesView,
    '/404': NotFoundView,
  },
});

router.init();

document.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link || link.origin !== window.location.origin || link.target === '_blank') {
    return;
  }

  event.preventDefault();
  router.navigate(link.pathname);
});
