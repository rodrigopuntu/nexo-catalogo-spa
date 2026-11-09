<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <div><router-link class="brand" to="/">nexo<span class="brand-dot">.</span></router-link><p>Objetos que acompañan tu día.</p></div>
      <nav class="footer-links" aria-label="Enlaces al pie">
        <router-link to="/productos">Catálogo</router-link>
        <router-link to="/cuenta">Mi cuenta</router-link>
        <router-link to="/acerca-de">Sobre Nexo</router-link>
      </nav>
    </div>
    <div class="container footer-note">Nexo · Proyecto académico <span>Precios en pesos argentinos</span></div>
  </footer>
</template>
