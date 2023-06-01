<template>
  <div class="left-tools" id="leftTools">
    <!-- <div
      v-for="(item, index) in tools"
      :key="index"
      class="tool-item"
      draggable="true"
      @drag="(e) => toolDrag(e, item.shape)"
    >
      <i v-if="item.shape === 'image'" class="el-icon-picture"></i>
      <i v-else :class="`icon-${item.shape}`"></i>
      <span class="tool-name">{{ item.name }}</span>
    </div> -->
  </div>
</template>

<script>
import { configNodeShape } from "@/utils/antvX6Setting.js";
import { mapState, mapMutations } from "vuex";
import { Addon, Shape } from "@antv/x6";

export default {
  data() {
    return {
      stencilContainer: null,
      tools: [
        {
          name: "矩形",
          shape: "rect",
        },
        {
          name: "圆形",
          shape: "circle",
        },
        {
          name: "椭圆",
          shape: "ellipse",
        },
        {
          name: "多边形",
          shape: "polygon",
        },
      ],
    };
  },
  computed: {
    ...mapState(["dnd", "graph", "canInitStencil"]),
  },
  watch: {
    canInitStencil(val) {
      if (val) {
        this.initStencil();
        this.setCanInitStencil(false);
      }
    },
  },
  mounted() {
    this.stencilContainer = document.getElementById("leftTools");
  },
  methods: {
    ...mapMutations(["setToolItem", "setCanInitStencil"]),
    toolDrag(e, shape) {
      this.setToolItem(configNodeShape(shape));
    },
    // 初始化Stencil
    initStencil() {
      const graph = this.graph;
      const stencil = new Addon.Stencil({
        title: "流程图",
        target: graph,
        placeholder: "输入关键字搜索图形",
        notFoundText: "未匹配到搜索结果",
        stencilGraphWidth: 220,
        stencilGraphHeight: 400,
        groups: [
          {
            name: "basic",
            title: "基础流程图",
            collapsable: false,
          },
        ],
        // search: (cell, keyword) => {
        //   if (keyword) {
        //     return cell.label.includes(keyword);
        //   }
        //   return true;
        // },
        // collapsable: true,
      });
      this.stencilContainer.appendChild(stencil.container);

      const components = configNodeShape().map((component) => {
        const name =
          component.shape.slice(0, 1).toUpperCase() + component.shape.slice(1);
        let kind = Shape[name];

        switch (component.data.type) {
          case 'custom-text':
            break
          case "custom-rect-start":
            component.attrs.body.rx = 20
            component.attrs.body.ry = 26
            break
          case 'custom-rect-optional':
            component.attrs.body.rx = 6
            component.attrs.body.ry = 6
            break  
          case 'rect':
            component.attrs.body.rx = 0
            component.attrs.body.ry = 0
            break  
          case "polygon":
            component.attrs.body.refPoints = "0, 10 10, 0 20, 10 10, 20";
            break;
          case "parallelogram":
            component.attrs.body.refPoints = "10,0 40,0 30,20 0,20";
            break;
        }
        return kind ? new kind(component) : graph.createNode(component);
      });
      stencil.load(components, "basic");
    },
  },
};
</script>

<style lang="scss" scoped>
.left-tools {
  position: relative;
  width: 220px;
  height: 100%;
  background: #f6f7f8;
  .tool-item {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 16px;
    cursor: pointer;
    &:hover {
      background: #2d5afa;
      color: #fff;
      i {
        border-color: #fff;
      }
    }
    i {
      margin-right: 8px;
    }
  }
  .tool-name {
    user-select: none !important;
  }

  ::v-deep {
    .x6-widget-stencil.not-found.searchable::after {
      top: 80px;
    }
    .x6-widget-stencil{
      top: 16px;
    }
    .x6-widget-stencil-group > .x6-widget-stencil-group-title{
      background: #f6f7f8;
      font-size: 16px;
    }
  }

  i.icon-rect {
    display: inline-block;
    width: 16px;
    height: 10px;
    border: 2px solid #555;
  }
  i.icon-circle {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 16px;
    border: 2px solid #555;
  }
  i.icon-ellipse {
    display: inline-block;
    width: 16px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid #555;
  }
  i.icon-polygon {
    display: inline-block;
    width: 10px;
    height: 10px;
    border: 2px solid #555;
    transform: rotate(45deg);
  }
  i.icon-polyline {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-left: 2px solid #555;
    transform: translate(6px, 6px) rotateZ(45deg);
  }

  // 圆角矩形
  i.icon-ysquare {
    display: inline-block;
    width: 16px;
    height: 10px;
    border-radius: 4px;
    border: 2px solid #555;
  }
  // 平行四边形
  i.icon-rhomboid {
    display: inline-block;
    width: 10px;
    height: 10px;
    border: 2px solid #555;
    transform: skew(-30deg);
  }
}
</style>
