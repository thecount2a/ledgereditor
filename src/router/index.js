import Vue from 'vue'
import Router from 'vue-router'
import LedgerEditor from '@/components/LedgerEditor'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'LedgerEditor',
      component: LedgerEditor
    }
  ]
})
