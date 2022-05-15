<template>
  <q-page class="">
    <CardReis />
  </q-page>
</template>

<script>
import CardReis from 'src/components/CardReis/CardReis.vue'
import { defineComponent } from 'vue'

export default defineComponent({
	components: { CardReis },
  name: 'IndexPage'
})
</script>
