<template>
  <div id="parcel"></div>
</template>

<script>
import { mountParcel } from './main'

export default {
  name: 'parcelPage',
  mounted() {
    this.loadParcel()
  },
  methods: {
    loadScript (src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    },
    async loadParcel () {
      await this.loadScript('http://localhost:3002/runtime-main.js')
      await this.loadScript('http://localhost:3002/vendors~main.js')
      await this.loadScript('http://localhost:3002/main.js')
      let domElement = document.getElementById('parcel')
      console.log('domElement:', domElement)
      mountParcel(() => Promise.resolve(window.reactParcel), { domElement })
    }
  }
}
</script>