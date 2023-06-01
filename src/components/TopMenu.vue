<template>
  <div class="top-menu">
    <i
      class="menu-icon el-icon-refresh-left"
      :class="{ disabled: !canUndo }"
      title="撤销(Ctrl+Z)"
      @click="handleUndo"
    ></i>
    <i
      class="menu-icon el-icon-refresh-right"
      :class="{ disabled: !canRedo }"
      title="重做(Ctrl+Shift+Z)"
      @click="handleRedo"
    ></i>
    <div class="style-setting" :class="{ disabled: !hasSelected }">
      <!-- label相关设置 -->
      <div class="setting-group style-font">
        <div
          class="setting-item interacting font-letter"
          :class="{
            checked: style.label.fontWeight === 'bold',
          }"
          title="粗体"
          @click="handleChange('', 'fontWeight')"
        >
          B
        </div>
        <div
          class="setting-item interacting font-letter italic"
          :class="{
            checked: style.label.fontStyle === 'italic',
          }"
          title="斜体"
          @click="handleChange('', 'fontStyle')"
        >
          I
        </div>
        <div
          class="setting-item interacting font-letter underline"
          :class="{
            checked: style.label.textDecoration === 'underline',
          }"
          title="下划线"
          @click="handleChange('', 'textDecoration')"
        >
          U
        </div>
        <el-input-number
          v-model="style.label.fontSize"
          class="setting-item"
          step-strictly
          controls-position="right"
          size="small"
          placeholder="字号"
          title="字号"
          :min="12"
          :max="100"
          @change="(val) => handleChange(val, 'fontSize')"
        ></el-input-number>
        px
        <el-popover
          placement="bottom"
          width="320"
          trigger="click"
          ref="labelColorPopper"
          popper-class="fill-color-popper"
          :visible-arrow="false"
          @show="handlePopperShow('labelColorPicker', 'labelFillShow')"
          @hide="handlePopperHide('labelColorPopper', 'labelFillShow')"
        >
          <el-color-picker
            v-model="style.label.fill"
            ref="labelColorPicker"
            size="small"
            @change="
              (val) =>
                handleChange(val, 'color', 'labelColorPopper', 'labelFillShow')
            "
          ></el-color-picker>
          <div slot="reference" class="setting-item">
            <div
              class="interacting font-letter"
              :class="{ checked: labelFillShow }"
              title="文本颜色"
            >
              A
            </div>
            <div
              class="color-bar"
              :style="{
                background: style.label.fill,
              }"
            ></div>
          </div>
        </el-popover>
      </div>
      <!-- body相关设置 -->
      <div class="setting-group">
        <el-popover
          placement="bottom"
          width="320"
          trigger="click"
          ref="bodyColorPopper"
          popper-class="fill-color-popper"
          :visible-arrow="false"
          @show="handlePopperShow('bodyColorPicker', 'bodyFillShow')"
          @hide="handlePopperHide('bodyColorPopper', 'bodyFillShow')"
        >
          <el-color-picker
            v-model="fill"
            ref="bodyColorPicker"
            size="small"
            @change="
              (val) =>
                handleChange(val, 'fill', 'bodyColorPopper', 'bodyFillShow')
            "
          ></el-color-picker>
          <div slot="reference" class="setting-item">
            <div
              class="interacting font-letter"
              :class="{ checked: bodyFillShow }"
              title="填充样式"
            >
              <i class="el-icon-box"></i>
            </div>
            <div
              class="color-bar"
              :style="{
                background: isEdge ? style.rect.fill : style.body.fill,
              }"
            ></div>
          </div>
        </el-popover>
        <el-popover
          placement="bottom"
          width="320"
          trigger="click"
          ref="bodyStrokePopper"
          popper-class="fill-color-popper"
          :visible-arrow="false"
          @show="handlePopperShow('bodyStrokePicker', 'bodyStrokeShow')"
          @hide="handlePopperHide('bodyStrokePopper', 'bodyStrokeShow')"
        >
          <el-color-picker
            v-model="stroke"
            ref="bodyStrokePicker"
            size="small"
            @change="
              (val) =>
                handleChange(
                  val,
                  'stroke',
                  'bodyStrokePopper',
                  'bodyStrokeShow'
                )
            "
          ></el-color-picker>
          <div slot="reference" class="setting-item">
            <div
              class="interacting font-letter"
              :class="{ checked: bodyStrokeShow }"
              title="线条颜色"
            >
              <i class="el-icon-edit"></i>
            </div>
            <div
              class="color-bar"
              :style="{
                background: isEdge ? style.line.stroke : style.body.stroke,
              }"
            ></div>
          </div>
        </el-popover>
        <el-select
          v-model="strokeWidth"
          size="small"
          title="线宽"
          class="setting-item w80"
          @change="(val) => handleChange(val, 'strokeWidth')"
        >
          <el-option
            v-for="item in 10"
            :key="item"
            :label="`${item}px`"
            :value="item"
          ></el-option>
        </el-select>
        <el-select
          v-model="strokeDasharray"
          size="small"
          title="线条样式"
          placeholder="线条样式"
          class="setting-item w80"
          @change="(val) => handleChange(val, 'strokeDasharray')"
        >
          <el-option
            v-for="item in lineStyleDict"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
       <!-- 图层排列 -->
      <div class="setting-group set-top">
        <el-dropdown 
          placement="bottom" 
          @command="val => handleChange(val, 'zIndex')"
        >
          <span class="el-dropdown-link">
            <div class="setting-item">
              <i
                class="menu-icon el-icon-coin"
                title="图层排列"
              ></i>
            </div>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="front">置于顶层</el-dropdown-item>
            <el-dropdown-item command="back">置于底层</el-dropdown-item>
            <el-dropdown-item command="1">上移一层</el-dropdown-item>
            <el-dropdown-item command="-1">下移一层</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="style-setting">
      <!-- 缩放操作 -->
      <div class="setting-group set-top">
        <div class="setting-item">
          <i
            class="menu-icon el-icon-zoom-in"
            title="放大"
            @click="handleZoom(0.2)"
          ></i>
        </div>
        <div class="setting-item">
          <i
            class="menu-icon el-icon-zoom-out"
            title="缩小"
            @click="handleZoom(-0.2)"
          ></i>
        </div>
        <div class="setting-item">
          <i
            class="menu-icon el-icon-rank"
            title="重置缩放"
            @click="handleZoom(0)"
          ></i>
        </div>
        <div class="setting-item">
          <i
            class="menu-icon el-icon-more"
            :class="{ disabled: !hasCells }"
            title="居中"
            @click="handleCenter"
          ></i>
        </div>
      </div>
      <!-- 导出、保存操作 -->
      <div class="setting-group set-top">
        <div class="setting-item">
          <i
            class="menu-icon el-icon-download"
            :class="{ disabled: !hasCells }"
            title="导出为图片"
            @click="handleExport"
          ></i>
        </div>
        <div class="setting-item">
          <i
            class="menu-icon el-icon-finished"
            :class="{ disabled: !hasCells }"
            title="保存"
            @click="handleSave"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { DataUri } from "@antv/x6";

export default {
  data() {
    return {
      style: {
        label: {
          fontSize: 14,
          fill: "#333",
          fontWeight: "normal",
        },
        body: {
          fill: "#fff",
          stroke: "#333",
          strokeWidth: 2,
        },
        rect: {
          fill: "#fff",
        },
        line: {
          stroke: "#333",
          strokeWidth: 2,
        },
      }, // 默认的工具栏样式
      initStyle: {}, // 保存一份初始默认样式
      labelFillShow: false,
      bodyFillShow: false,
      bodyStrokeShow: false,
      lineStyleDict: [
        {
          label: '实线',
          value: '0,0'
        },
        {
          label: '虚线',
          value: '10,2'
        }
      ]
    };
  },
  computed: {
    ...mapState([
      "graph",
      "canUndo",
      "canRedo",
      "selectedStyle",
      "selected",
      "cells",
    ]),
    // 画布上是否有元素
    hasCells() {
      return this.cells.length > 0;
    },
    // 是否有选中元素
    hasSelected() {
      return this.selected.length > 0;
    },
    // 当前选中的是否为【边】
    isEdge() {
      return this.selectedStyle.isEdge;
    },
    // 填充颜色
    fill: {
      get() {
        return this.isEdge ? this.style.rect.fill : this.style.body.fill;
      },
      set(val) {
        if (this.isEdge) {
          this.style.rect.fill = val;
        } else {
          this.style.body.fill = val;
        }
      },
    },
    // 线条颜色
    stroke: {
      get() {
        return this.isEdge ? this.style.line.stroke : this.style.body.stroke;
      },
      set(val) {
        if (this.isEdge) {
          this.style.line.stroke = val;
        } else {
          this.style.body.stroke = val;
        }
      },
    },
    // 线条宽度
    strokeWidth: {
      get() {
        return this.isEdge
          ? this.style.line.strokeWidth
          : this.style.body.strokeWidth;
      },
      set(val) {
        if (this.isEdge) {
          this.style.line.strokeWidth = val;
        } else {
          this.style.body.strokeWidth = val;
        }
      },
    },
    // 线条样式
    strokeDasharray: {
      get () {
        return this.isEdge
          ? this.style.line.strokeDasharray || '0,0'
          : this.style.body.strokeDasharray || '0,0'
      },
      set (val) {
        if (this.isEdge) {
          this.style.line.strokeDasharray = val
        } else {
          this.style.body.strokeDasharray = val
        }
      }
    }
  },
  watch: {
    selectedStyle: {
      deep: true,
      handler(val) {
        this.setStyle(val.attr);
      },
    },
  },
  created() {
    this.initStyle = JSON.parse(JSON.stringify(this.style));
  },
  methods: {
    // 工具栏设置对应选中的节点/边的相关数据
    setStyle(obj) {
      for (let k in this.initStyle) {
        this.style[k] = { ...this.initStyle[k], ...obj[k] };
      }
    },
    // 保存
    handleSave() {
      if (!this.hasCells) return;
      // 清除所有边的wrap选中样式
      this.resetEdge();
      const json = this.graph.toJSON();
      localStorage.setItem("graphJson", JSON.stringify(json));
      this.$message.success("保存成功");
    },
    // 撤销
    handleUndo() {
      if (!this.canUndo) return;
      if (this.graph.history.canUndo()) {
        this.graph.history.undo();
      }
    },
    // 重做
    handleRedo() {
      if (!this.canRedo) return;
      if (this.graph.history.canRedo()) {
        this.graph.history.redo();
      }
    },
    // 缩放
    handleZoom(factor) {
      if(factor === 0) { // 重置缩放
        this.graph.zoomTo(1)
        return
      }
      this.graph.zoom(factor, {
        minScale: 0.5,
        maxScale: 3
      })
    },
    // 居中
    handleCenter() {
      this.graph.centerContent()
    },
    // 导出
    handleExport() {
      if (!this.hasCells) return;
      // 清除所有边的wrap选中样式
      this.resetEdge();
      this.graph.toPNG(
        (dataUri) => {
          // 下载
          DataUri.downloadDataUri(dataUri, "chart.png");
        },
        {
          padding: 20,
        }
      );
    },
    // 重置边的初始样式
    resetEdge() {
      const edges = this.graph.getEdges();
      edges.forEach((edge) => {
        edge.attr("wrap/stroke", "transparent");
        this.graph.unselect(edge); // 取消选中边
      });
    },
    // 设置标签样式
    setLabels(item = {}, label = {}, rect = {}) {
      let labels = [];
      item.labels.forEach((origin) => {
        labels.push({
          ...origin,
          attrs: {
            ...origin.attrs,
            label: {
              ...(origin.attrs.label || {}),
              ...label,
            },
            rect: {
              ...(origin.attrs.rect || {}),
              ...rect,
            },
          },
        });
      });
      item.setLabels(labels);
    },
    // 工具栏设置发生改变
    handleChange(val, type, popper, show) {
      const selectedCells = this.graph.getSelectedCells();

      selectedCells.forEach((item) => {
        const isEdge = item.isEdge();
        switch (type) {
          case "fontSize":
            if (isEdge) {
              this.setLabels(item, { fontSize: val });
            } else {
              item.attr("label/fontSize", val);
            }
            break;
          case "fontWeight":
            this.style.label.fontWeight =
              this.style.label.fontWeight === "bold" ? "normal" : "bold";
            if (isEdge) {
              this.setLabels(item, { fontWeight: this.style.label.fontWeight });
            } else {
              item.attr("label/fontWeight", this.style.label.fontWeight);
            }
            break;
          case "fontStyle":
            this.style.label.fontStyle =
              this.style.label.fontStyle === "italic" ? "normal" : "italic";
            if (isEdge) {
              this.setLabels(item, { fontStyle: this.style.label.fontStyle });
            } else {
              item.attr("label/fontStyle", this.style.label.fontStyle);
            }
            break
          case "textDecoration":
            this.style.label.textDecoration =
              this.style.label.textDecoration === "underline" ? "none" : "underline";
            if (isEdge) {
              this.setLabels(item, { textDecoration: this.style.label.textDecoration });
            } else {
              item.attr("label/textDecoration", this.style.label.textDecoration);
            }
            break  
          case "color":
            if (isEdge) {
              this.setLabels(item, { fill: val });
            } else {
              item.attr("label/fill", val);
            }
            break;
          case "fill":
            if (isEdge) {
              this.setLabels(item, {}, { fill: val });
            } else {
              item.attr("body/fill", val);
            }
            break;
          case "stroke":
            item.attr(isEdge ? "line/stroke" : "body/stroke", val);
            break;
          case "strokeWidth":
            item.attr(isEdge ? "line/strokeWidth" : "body/strokeWidth", val);
            break;
          case 'strokeDasharray':
            item.attr(isEdge ? 'line/strokeDasharray' : 'body/strokeDasharray', val)
            break
          case 'zIndex':
            switch (val) {
              case 'front':
                item.toFront()
                break
              case 'back':
                item.toBack()
                break
              case '1':
                item.zIndex = item.zIndex + 1
                break
              case '-1':
                item.zIndex = item.zIndex - 1
                break      
            }
            break  
        }
      });

      popper && show && this.handlePopperHide(popper, show);
    },
    // popper显示事件
    handlePopperShow(picker, show) {
      this[show] = true;
      this.$refs[picker].showPicker = true;
    },
    // popper隐藏事件
    handlePopperHide(popper, show) {
      this[show] = false;
      this.$refs[popper].showPopper = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.top-menu {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  padding: 0 16px;
  background: #f6f7f8;
  border-top: 1px solid #dfe2e5;
  border-bottom: 1px solid #dfe2e5;
  .menu-icon {
    font-size: 26px;
    cursor: pointer;
    &.disabled {
      position: relative;
      &:after {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(238, 238, 238, 0.4);
        cursor: default;
        z-index: 2;
      }
    }
    & + i {
      margin-left: 16px;
    }
  }
  .style-setting {
    display: flex;
    align-items: center;
    ::v-deep {
      .el-input-number--small {
        width: 90px;
      }
    }
    &.disabled {
      position: relative;
      &:after {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(238, 238, 238, 0.4);
        z-index: 2;
      }
    }
  }
  .setting-group {
    position: relative;
    display: flex;
    align-items: center;
    margin-left: 16px;
    .setting-item {
      position: relative;
      margin-left: 16px;
    }
    .font-letter {
      // padding: 7px 11px;
      width: 26px;
      height: 26px;
      line-height: 26px;
      text-align: center;
      font-size: 18px;
      &.checked {
        background: #dfe2e5;
      }
      &:not(.checked):hover {
        background: #eaecee;
      }
      &.italic{
        font-style: italic;
      }
      &.underline{
        &:after{
          content: '';
          width: 11px;
          position: absolute;
          left: 8px;
          bottom: 0;
          border-bottom: 2px solid #333;
        }
      }
    }
    &:before {
      content: "";
      position: absolute;
      top: 6px;
      left: 0;
      width: 1px;
      height: 20px;
      background: #999;
    }
    &.set-top{
      &:before {
        top: 4px;
      }
    }
    .w80 {
      width: 80px;
    }
  }
  .interacting {
    cursor: pointer;
  }
  .color-bar {
    width: 16px;
    height: 2px;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>

<style lang="scss">
.el-popper.fill-color-popper {
  border: none;
  padding: 0;
  box-shadow: none;
  background: transparent;
  text-align: right;
  height: 0;
  margin-top: 0 !important;
  .el-color-picker {
    height: 0;
    opacity: 0;
  }
}
</style>
