<template>
  <div class="product-art" :class="product.color" aria-hidden="true">
    <svg v-if="product.symbol === '🎧'" class="headphone-art" viewBox="0 0 256 240" fill="none">
      <path d="M56 143v-24a72 72 0 0 1 144 0v24" stroke="#1b272b" stroke-width="22" stroke-linecap="round" />
      <path d="M56 139v-20a72 72 0 0 1 144 0v20" stroke="#617170" stroke-width="10" stroke-linecap="round" />
      <path d="M72 84a65 65 0 0 1 112 0" stroke="#1b272b" stroke-width="18" stroke-linecap="round" />
      <path d="M75 78a66 66 0 0 1 106 0" stroke="#859389" stroke-width="3" stroke-linecap="round" />
      <g transform="rotate(-14 70 160)">
        <rect x="46" y="119" width="42" height="87" rx="18" fill="#182329" />
        <rect x="48" y="123" width="29" height="77" rx="14" fill="#455a58" />
        <rect x="69" y="122" width="26" height="81" rx="11" fill="#212e34" />
        <path d="M57 138v30" stroke="#789087" stroke-width="3" stroke-linecap="round" />
        <path d="M78 134v57" stroke="#45545a" stroke-width="2" stroke-linecap="round" />
      </g>
      <g transform="rotate(14 186 160)">
        <rect x="168" y="119" width="42" height="87" rx="18" fill="#182329" />
        <rect x="179" y="123" width="29" height="77" rx="14" fill="#455a58" />
        <rect x="161" y="122" width="26" height="81" rx="11" fill="#212e34" />
        <path d="M198 138v30" stroke="#789087" stroke-width="3" stroke-linecap="round" />
        <path d="M178 134v57" stroke="#45545a" stroke-width="2" stroke-linecap="round" />
      </g>
    </svg>
    <span v-else class="product-symbol">{{ product.symbol }}</span>
    <span class="art-circle"></span>
  </div>
</template>

<script>
export default {
  name: 'ProductArtwork',
  props: { product: { type: Object, required: true } }
}
</script>
