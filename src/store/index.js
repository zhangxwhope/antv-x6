import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    graph: null, // 画布
    toolItem: {}, // 当前正在拖拽添加的
    canUndo: false, // 是否可以撤销
    canRedo: false, // 是否可以重做
    canInitStencil: false, // 是否可以初始化拖拽插件
    selectedStyle: {}, // 选中的样式
    selected: [],
    cells: [], // 画布上的所有节点和边
  },
  mutations: {
    setToolItem(state, item) {
      state.toolItem = item;
    },
    setGraph(state, item) {
      state.graph = item;
    },
    setCanUndo(state, item) {
      state.canUndo = item;
    },
    setCanRedo(state, item) {
      state.canRedo = item;
    },
    setCanInitStencil(state, item) {
      state.canInitStencil = item;
    },
    setSelectedStyle(state, item) {
      state.selectedStyle = item;
    },
    setSelected(state, item) {
      state.selected = item;
    },
    setCells(state, item) {
      state.cells = item;
    },
  },
  actions: {},
  modules: {},
});
