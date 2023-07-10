<template>
  <div class="draw-content">
    <div id="wrapper" class="draw-wrapper"></div>
  </div>
</template>

<script>
import { Graph, Shape } from "@antv/x6";
import { configSetting, graphBindKey, basicFillColor, basicFontColor } from "@/utils/antvX6Setting.js";
import { mapState, mapMutations } from "vuex";

export default {
  data() {
    return {};
  },
  computed: {
    ...mapState(["toolItem", "graph"]),
  },
  mounted() {
    this.initGraph();
    // 获取上次保存的
    const json = JSON.parse(localStorage.getItem("graphJson") || '{}');
    this.graph.fromJSON(json);
    this.graph.centerContent();
    this.setCells(this.graph.getCells());
  },
  beforeDestroy() {
    this.graph.dispose();
  },
  methods: {
    ...mapMutations([
      "setGraph",
      "setCanUndo",
      "setCanRedo",
      "setCanInitStencil",
      "setSelectedStyle",
      "setSelected",
      "setCells",
    ]),
    // 初始化渲染画布
    initGraph() {
      const graph = new Graph({
        container: document.getElementById("wrapper"),
        ...configSetting(Shape),
      });

      // 画布事件
      graph.on("node:mouseenter", () => {
        this.changePortsShow(true);
      });
      graph.on("node:mouseleave", () => {
        this.changePortsShow(false);
      });

      graph.on("edge:mouseenter", ({ view }) => {
        this.changeVerticesShow(true, view.tools || {});
      });
      graph.on("edge:mouseleave", ({ view }) => {
        this.changeVerticesShow(false, view.tools || {});
      });

      // 双击节点或边进入编辑模式
      graph.on("cell:dblclick", ({ cell, e }) => {
        const name = cell.isEdge() ? "edge-editor" : "node-editor";
        cell.removeTool(name);
        cell.shape !== "edge" && graph.cleanSelection(); // 选中节点的话就清空选区

        // 获取标签的样式，传给tool
        let attrs = {};
        if (cell.isEdge()) {
          attrs =
            cell.labels.length > 0 ? cell.labels[0].attrs.label || {} : {};
        } else {
          attrs = cell.attrs.label || {};
        }
        if (attrs.fill) attrs.color = attrs.fill;
        cell.addTools([
          {
            name: name,
            args: {
              event: e,
              attrs: {
                fill: basicFillColor,
                fontSize: 14,
                lineHeight: 17.5,
                backgroundColor: basicFillColor,
                ...attrs
              },
            },
          },
        ]);

        cell.on("change:labels", ({ cell, current }) => {
          let labels = [];
          const styleAttrs = cell.labels
            ? cell.labels.length > 0
              ? cell.labels[0].attrs
              : {}
            : {};
          current.forEach((origin) => {
            const attrs = origin.attrs || {};
            const label = attrs.label || {};
            const rect = attrs.rect || {};
            // if(origin.position.offset > -10 && origin.position.offset < 10) {
            //   origin.position.offset = 0
            // }
            // if(origin.position.distance > 0.4 && origin.position.distance < 0.6) {
            //   origin.position.distance = 0.5
            // }
            if (label.text) {
              labels.push({
                ...origin,
                attrs: {
                  ...attrs,
                  rect: {
                    ...rect,
                    ...styleAttrs.rect,
                  },
                  label: {
                    ...label,
                    fill: basicFontColor,
                    fontSize: 14,
                    lineHeight: 17.5,
                    ...styleAttrs.label,
                    text: label.text,
                  },
                },
              });
            }
          });
          cell.setLabels(labels, { silent: true });
        });
      });

      // 边、节点、空白处点击事件
      // graph.on("edge:click", ({ edge }) => {
      //   this.resetEdge(); // 清除所有边的wrap样式
      //   edge.zIndex = 1
      //   edge.attr("wrap/stroke", "#b3d7fb"); // 给当前边添加选中wrap样式
      // });
      graph.on("blank:mouseup", () => {
        this.resetEdge();
      })
      graph.on("node:click", () => {
        this.resetEdge();
      });
      graph.on("blank:click", () => {
        this.resetEdge();
      });
      graph.on("node:move", () => {
        this.resetEdge();
      });

      // 选中改变事件
      graph.on("selection:changed", ({ selected }) => {
        this.setSelected(selected);

        selected.forEach(cell => {
          if(cell.isEdge()) {
            cell.zIndex = 1
            cell.attr("wrap/stroke", "#b3d7fb"); // 给当前边添加选中wrap样式
          }
        })
      });

      // 添加节点/边事件
      graph.on("cell:added", () => {
        this.setCells(graph.getCells());
        this.resetEdge()
      });

      // 删除节点/边事件
      graph.on("cell:removed", () => {
        this.setCells(graph.getCells());
      });

      // 节点/边选中事件
      graph.on("cell:selected", ({ cell }) => {
        this.resetEdge(); // 清除所有边的wrap样式

        const labelAttrs = cell.labels
          ? cell.labels.length > 0
            ? cell.labels[0].attrs
            : {}
          : {};
        this.setSelectedStyle({
          isEdge: cell.isEdge(),
          attr: {
            ...cell.attr(),
            ...labelAttrs,
          },
        });
      });

      graph.on("node:added", ({ node }) => {
        if(node.data?.group === 'lane') {
          const size = node.size()
          const position = node.position()
          const sizeWidth = size.width * 3
          const sizeHeight = size.height * 3
          node.size(sizeWidth, sizeHeight)
          const child = graph.createNode({
            size: {
              width: sizeWidth,
              height: 20
            },
            position: {
              ...position
            },
            data: {
              type: 'lane-rect'
            }
          })
          const parent =  document.querySelector(`[data-cell-id="${node.id}"]`)
          const laneRect = parent.getElementsByClassName('lane-rect')
          parent.removeChild(laneRect[0])
          // 移除attrs中的lane-rect
          const attrsArr = Object.entries(node.attrs).filter(([key]) => key !== 'lane-rect')
          const attrs = {}
          attrsArr.forEach(([key, value]) => {
            attrs[key] = value
          })
          node.setAttrs(attrs, {
            overwrite: true
          })
          // 移除markup
          const markup = node.getMarkup().filter(item => item.selector !== 'lane-rect')
          node.setMarkup(markup)

          node.embed(child)
        }
      })

      // 调整节点大小时触发事件
      graph.on('node:resizing', ({ node}) => {
        if(node.data?.group === 'lane') {
          const position = node.position()
          const size = node.size()
          const laneRect = node.children?.find(child => child.data?.type === 'lane-rect')
          const laneWidth = laneRect?.size().width
          const laneX = laneRect?.position().x
          const otherChildren = node.children?.filter(child => child.data?.type === 'lane')
          // 同时改变子元素的大小
          if(otherChildren.length > 0) {
            otherChildren.forEach(child => {
              const childPosition = child.position()
              const childSize = child.size()
              const childLaneRect = child.children?.find(child => child.data?.type === 'lane-rect')
              const childLaneX = childLaneRect?.position().x
              if(laneX > childLaneX) { // child在左边
                if(position.x < childPosition.x) { // 往左拉伸
                  const offset = size.width - laneWidth
                  child.size(offset, size.height)
                  child.position(position.x, childPosition.y)
                  childLaneRect?.size(offset, childLaneRect?.size().height)
                  childLaneRect?.position(position.x, childLaneRect?.position().y)
                } else if(position.x > childPosition.x) {
                  const offset = childSize.width - (laneWidth - (size.width - childSize.width))
                  child.size(offset, size.height)
                  child.position(position.x, position.y)
                  childLaneRect?.size(offset, childLaneRect?.size().height)
                  childLaneRect?.position(position.x, position.y)
                  laneRect?.position(laneRect?.position().x, position.y)
                } else { // 往右拉伸
                  const offset = size.width - childSize.width
                  child.size(childSize.width, size.height)
                  child.position(position.x, position.y)
                  childLaneRect?.position(position.x, position.y)
                  laneRect?.size(offset, laneRect.size().height)
                  laneRect?.position(laneRect?.position().x, position.y)
                }
              } else { // child在右边
                const distance = Math.abs(Math.abs(position.x) - Math.abs(childPosition.x))
                if(distance === laneWidth) { // 往右拉伸
                  const offset = size.width - laneWidth
                  child.size(offset, size.height)
                  child.position(childPosition.x, position.y)
                  childLaneRect?.size(offset, childLaneRect?.size().height)
                  childLaneRect?.position(childLaneRect?.position().x, position.y)
                  laneRect?.position(laneRect?.position().x, position.y)
                } else { // 往左拉伸
                  const offset = Math.abs(Math.abs(position.x) - Math.abs(childPosition.x))
                  laneRect?.size(offset, laneRect.size().height)
                  laneRect?.position(position.x, laneRect?.position().y)
                }
              }

            })
          } else {
            // 只有当前节点
            laneRect?.size(size.width,  laneRect?.size().height)
            laneRect?.position(position.x, position.y)
          }
        }
      })
      
      graph.on('node:embedded', ({ node, currentParent }) => {
        if(node.data?.group === 'lane' && currentParent.data?.group === 'lane') {
          if(node.parent && node.parent.id === currentParent.id) return
          const nodePosition = node.position()
          const size = currentParent.size()
          const position = currentParent.position()
          node.size(size.width,  size.height)
          const isRight =  nodePosition.x > (position.x + size.width / 2)
          let positionX
          const positionY = position.y
          if(isRight) { // 在右边嵌入
            positionX = position.x + size.width
            node.position(positionX, positionY)
          } else { // 在左边嵌入
            positionX = position.x - size.width
            node.position(positionX, positionY)
          }
          if(node.children) {
            node.children[0].position(positionX, positionY)
            node.children[0].size(size.width, node.children[0].size().height)
          }
          node.removePorts()
          currentParent.resize(size.width * 2, size.height, {
            direction: isRight ? 'bottom-right' : 'top-left'
          })
        }
      })
      
     
      graph.on('node:moving', ({ node }) => {
        const position = node.position()
        const size = node.size()
        const parent = node.parent
        if(parent) {
          const parentPosition = parent.position()
          const distance = Math.abs(Math.abs(parentPosition.x) - Math.abs(position.x))
          const offset = parentPosition.x + (distance - size.width)
          parent.position(offset, position.y)
          const laneRect = parent.children?.find(child => child.data?.type === 'lane-rect')
          laneRect?.position(offset, position.y)
        }
      })
      
      

      // 历史队列改变事件
      graph.history.on("change", () => {
        this.setCanUndo(graph.history.canUndo());
        this.setCanRedo(graph.history.canRedo());
      });

      // 画布键盘事件
      graphBindKey(graph);

      this.setGraph(graph);

      // 可以开始初始化拖拽插件
      this.setCanInitStencil(true);
    },
    // 拖拽释放
    // drop(event) {
    //   const nodeItem = {
    //     ...this.toolItem,
    //     x: event.offsetX - this.toolItem.width / 2,
    //     y: event.offsetY - this.toolItem.height / 2,
    //   };
    //   this.graph.addNode(nodeItem);
    // },
    // 链接桩的显示与隐藏，主要是照顾菱形
    changePortsShow(val) {
      const container = document.getElementById("wrapper");
      const ports = container.querySelectorAll(".x6-port-body");
      for (let i = 0, len = ports.length; i < len; i = i + 1) {
        ports[i].style.visibility = val ? "visible" : "hidden";
      }
    },
    // 路径点工具vertices的显示与隐藏
    changeVerticesShow(val, tool) {
      if (tool.svgContainer) {
        const tools = tool.svgContainer.querySelectorAll(
          ".x6-edge-tool-vertex"
        );
        for (let i = 0, len = tools.length; i < len; i = i + 1) {
          tools[i].style.visibility = val ? "visible" : "hidden";
        }
      }
    },
    // 重置边的初始样式
    resetEdge() {
      const edges = this.graph.getEdges();
      edges.forEach((edge) => {
        edge.attr("wrap/stroke", "transparent");
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.draw-content {
  display: flex;
  flex: 1;
  width: calc(100% - 220px);
  .draw-wrapper {
    flex: 1;
    width: 100% !important;
    height: 100% !important;
  }
}
</style>

<style lang="scss">
.draw-content{
  .x6-cell-tool{
    position: relative;
  }
  .x6-cell-tool-editor{
    position: absolute;
  }
  .x6-graph-scroller-pannable{
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
