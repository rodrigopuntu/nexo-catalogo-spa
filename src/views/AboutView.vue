<template>
  <section class="container page-space about-page">
    <p class="eyebrow accent">DETRÁS DEL PROYECTO</p>
    <h1>Un catálogo, paso a paso.</h1>
    <p class="intro">Nexo es una SPA académica de catálogo de productos, desarrollada para Práctica Profesionalizante Desarrollo Web y Mobile.</p>
    <div class="about-panel"><h2>Qué podés probar hoy</h2><p>Explorar 15 productos de muestra, buscar por nombre, filtrar por categoría, ordenar por precio y consultar una ficha de detalle.</p></div>
    <div class="about-panel"><h2>Cómo está construida</h2><p>Vue 3 con Vue CLI, Vue Router, componentes reutilizables, props, eventos y propiedades computadas. La navegación funciona dentro de una única aplicación.</p></div>
    <div class="about-panel"><h2>Consulta a una API</h2><p>La sección API externa obtiene productos de DummyJSON mediante Fetch y muestra carga, resultados y errores. Necesita conexión a Internet.</p><router-link class="text-link" to="/api">Probar consulta ↗</router-link></div>
    <div class="about-panel"><h2>Cuenta y catálogo</h2><p>Podés ingresar con Google desde Mi cuenta. El catálogo está abierto a visitantes y consulta Supabase cuando hay conexión.</p></div>
    <div class="about-panel"><h2>Administración</h2><p>Las cuentas autorizadas pueden crear, editar y eliminar productos desde Mi cuenta.</p></div>
    <p class="muted">Los productos y precios son ilustrativos.</p>
  </section>
</template>
