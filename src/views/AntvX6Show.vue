<template>
  <div class="antv-x6-show">
    <div class="wrapper-show" id="wrapper"></div>
  </div>
</template>

<script>
import { Graph, Shape } from "@antv/x6";

export default {
  name: "AntVX6Show",
  data() {
    return {};
  },
  mounted() {
    this.initGraph();
  },
  methods: {
    // 初始化渲染画布
    initGraph() {
      const graph = new Graph({
        container: document.getElementById("wrapper"),
        grid: {
          visible: true,
          type: "doubleMesh",
          args: [
            {
              color: "#eee", // 主网格线颜色
              thickness: 1, // 主网格线宽度
            },
            {
              color: "#ddd", // 次网格线颜色
              thickness: 1, // 次网格线宽度
              factor: 4, // 主次网格线间隔
            },
          ],
        },
        autoResize: true,
        interacting: false,
        connecting: {
          router: {
            name: "manhattan",
            args: {
              padding: 1,
            },
          },
          connector: {
            name: "rounded",
            args: {
              radius: 8,
            },
          },
          anchor: "center",
          connectionPoint: "anchor",
          snap: {
            radius: 20,
          },
          createEdge() {
            return new Shape.Edge({
              attrs: {
                line: {
                  stroke: "#333",
                  strokeWidth: 2,
                  sourceMarker: {
                    width: 12,
                    height: 8,
                  },
                  targetMarker: {
                    name: "block",
                    width: 12,
                    height: 8,
                  },
                },
              },
              zIndex: 0,
            });
          },
        },
      });
      const json = JSON.parse(localStorage.getItem("graphJson") || '{}');
      graph.fromJSON(json);
      graph.centerContent();
    },
  },
};
</script>

<style lang="scss" scoped>
.antv-x6-show {
  width: 100%;
  height: 100%;
  .wrapper-show {
    height: 100% !important;
  }
}
</style>
