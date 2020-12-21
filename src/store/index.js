import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    baseLang: ""
  },
  mutations: {
    SETLANG(state, r) {
      state.baseLang = r;
    }
  },
  actions: {
  },
  modules: {
  }
})
