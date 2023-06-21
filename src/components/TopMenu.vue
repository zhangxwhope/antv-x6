<template>
  <div class="menu-container">
    <div class="menu-content" id="menuContent">
      <i 
        v-show="showLeft"
        class="turn-page left el-icon-arrow-left" 
        @click="handleTurnPage('left')"
      ></i>
      <i 
        v-show="showRight"
        class="turn-page right el-icon-arrow-right"
        @click="handleTurnPage('right')"
      ></i>
      <div class="top-menu" id="topMenu" :style="{ left: left + 'px' }">
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
            <el-select
              v-model="lineHeight"
              size="small"
              title="文本行高"
              placeholder="文本行高"
              class="setting-item w80"
              :disabled="isEdge"
              @change="(val) => handleChange(val, 'lineHeight')"
            >
              <el-option
                v-for="item in lineHeightDict"
                :key="item"
                :label="item"
                :value="Number(item)"
              ></el-option>
            </el-select>
            <el-dropdown 
              placement="bottom" 
              :disabled="isEdge"
              @command="val => handleChange(val, 'textAlign')"
            >
              <span class="el-dropdown-link">
                <div class="setting-item">
                  <i
                    class="menu-icon el-icon-s-operation"
                    title="文本对齐"
                  ></i>
                </div>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item 
                  v-for="(item, index) in textAlignDict"
                  :key="index"
                  :command="item.value"
                >{{ item.label }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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
            <el-select
              v-model="edgeType"
              size="small"
              title="连线类型"
              placeholder="连线类型"
              class="setting-item w80"
              :disabled="!isEdge"
              @change="(val) => handleChange(val, 'edgeType')"
            >
              <el-option
                v-for="item in edgeTypeDict"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
            <el-select
              v-model="sourceMarker"
              size="small"
              title="开始箭头"
              placeholder="开始箭头"
              class="setting-item w80"
              :disabled="!isEdge"
              @change="(val) => handleChange(val, 'sourceMarker')"
            >
              <el-option
                v-for="item in sourceMarkerDict"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
            <el-select
              v-model="targetMarker"
              size="small"
              title="结束箭头"
              placeholder="结束箭头"
              class="setting-item w80"
              :disabled="!isEdge"
              @change="(val) => handleChange(val, 'targetMarker')"
            >
              <el-option
                v-for="item in sourceMarkerDict"
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
          <!-- 分布对齐 -->
          <div class="setting-group set-top">
            <el-dropdown 
              placement="bottom" 
              @command="val => handleChange(val, 'layoutAlign')"
            >
              <span class="el-dropdown-link">
                <div class="setting-item">
                  <i
                    class="menu-icon el-icon-s-grid"
                    title="分布对齐"
                  ></i>
                </div>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item 
                  v-for="(item, index) in layoutAlignDict"
                  :key="index"
                  :command="item.value"
                >{{ item.label }}</el-dropdown-item>
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
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { DataUri } from "@antv/x6";
import { basicFillColor, basicStrokeColor, basicFontColor } from "@/utils/antvX6Setting.js"

export default {
  data() {
    return {
      left: 0,
      menuContentWidth: 0,
      topMenuWidth: 0,
      style: {
        label: {
          fontSize: 14,
          lineHeight: 17.5,
          fill: basicFontColor,
          fontWeight: "normal",
        },
        body: {
          fill: basicFillColor,
          stroke: basicStrokeColor,
          strokeWidth: 2,
        },
        rect: {
          fill: basicFillColor,
        },
        line: {
          stroke: basicStrokeColor,
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
      ],
      textAlignDict: [
        {
          label: '左对齐',
          value: 'start'
        },
        {
          label: '水平居中',
          value: 'middle'
        },
        {
          label: '右对齐',
          value: 'end'
        },
        {
          label: '顶端对齐',
          value: 'top'
        },
        {
          label: '垂直居中对齐',
          value: 'verticalMiddle'
        },
        {
          label: '底端对齐',
          value: 'bottom'
        }
      ],
      lineHeightDict: ['1.0', '1.25', '1.5', '2.0', '2.5', '3.0'],
      edgeTypeDict: [
        {
          label: '简单',
          value: 'normal'
        },
        {
          label: '平滑',
          value: 'smooth'
        },
        {
          label: '圆角',
          value: 'rounded'
        },
        {
          label: '跳线',
          value: 'jumpover'
        }
      ],
      sourceMarkerDict: [
        {
          label: '无',
          value: ''
        },
        {
          label: '实心',
          value: 'block'
        },
        {
          label: '经典',
          value: 'classic'
        },
        {
          label: '菱形',
          value: 'diamond'
        },
        {
          label: '交叉',
          value: 'cross'
        },
        {
          label: '非封闭半箭头',
          value: 'async'
        },
        {
          label: '圆形',
          value: 'circle'
        },
        {
          label: '圆形和加号',
          value: 'circlePlus'
        },
        {
          label: '椭圆',
          value: 'ellipse'
        }
      ],
      layoutAlignDict: [
        {
          label: '左对齐',
          value: 'left'
        },
        {
          label: '居中对齐',
          value: 'middle'
        },
        {
          label: '右对齐',
          value: 'right'
        },
        {
          label: '顶端对齐',
          value: 'top'
        },
        {
          label: '垂直居中对齐',
          value: 'verticalMiddle'
        },
        {
          label: '底端对齐',
          value: 'bottom'
        },
        {
          label: '水平平均分布',
          value: 'horizontal'
        },
        {
          label: '垂直平均分布',
          value: 'vertical'
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
    // 是否显示左箭头
    showLeft() {
      return this.left < 0
    },
    // 是否显示右箭头
    showRight() {
      return this.topMenuWidth > this.menuContentWidth 
        && this.topMenuWidth - this.menuContentWidth > Math.abs(this.left)
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
    },
    // 文本行高
    lineHeight: {
      get () {
        return this.isEdge ? '' : this.style.label.lineHeight / this.style.label.fontSize
      },
      set (val) {
        this.style.label.lineHeight = val * this.style.label.fontSize
      }
    },
    // 连线类型
    edgeType: {
      get () {
        const connector = this.selected.find(item => item.isEdge())?.getConnector() || {}
        return this.isEdge ? connector.name || 'normal' : ''
      },
      set (val) {
        this.selected.forEach(item => item.isEdge() && item.setConnector(val))
      }
    },
    // 开始箭头
    sourceMarker: {
      get () {
        return this.isEdge ? this.style.line.sourceMarker?.name || '' : ''
      },
      set (val) {
        this.style.line.sourceMarker = {
          width: 12,
          height: 8,
          ...this.style.line.sourceMarker,
          name: val
        }
      }
    },
    // 结束箭头
    targetMarker: {
      get () {
        return this.isEdge ? this.style.line.targetMarker?.name || '' : ''
      },
      set (val) {
        this.style.line.targetMarker = {
          ...this.style.line.targetMarker,
          name: val
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
  mounted() {
    this.getToolWidth()
    window.onresize = () => {
      this.left = 0
      this.getToolWidth()
    }
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
      switch (type) {
        case 'fontWeight':
          this.style.label.fontWeight =
              this.style.label.fontWeight === 'bold' ? 'normal' : 'bold'
          break
        case 'fontStyle':
          this.style.label.fontStyle =
              this.style.label.fontStyle === 'italic' ? 'normal' : 'italic'
          break
        case 'textDecoration':
          this.style.label.textDecoration =
              this.style.label.textDecoration === 'underline' ? 'none' : 'underline'
          break
      }

      selectedCells.forEach((item) => {
        const isEdge = item.isEdge();
        const markerObj = { 
          name: val,
          open: val === 'async', // 非封闭半箭头
          rx: val === 'ellipse' ? 8 : 5 // 椭圆
        }
        switch (type) {
          case "fontSize":
            if (isEdge) {
              this.setLabels(item, { fontSize: val });
            } else {
              item.attr("label/fontSize", val);
            }
            break;
          case "fontWeight":
            if (isEdge) {
              this.setLabels(item, { fontWeight: this.style.label.fontWeight });
            } else {
              item.attr("label/fontWeight", this.style.label.fontWeight);
            }
            break;
          case "fontStyle":
            if (isEdge) {
              this.setLabels(item, { fontStyle: this.style.label.fontStyle });
            } else {
              item.attr("label/fontStyle", this.style.label.fontStyle);
            }
            break
          case "textDecoration":
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
          case 'textAlign':
            if(['start', 'middle', 'end'].includes(val)) {
              switch (val) {
                case 'start':
                  item.attr('label/refX', 0.1)
                  break
                case 'middle':
                  item.attr('label/refX', 0.5)
                  break
                case 'end':
                  item.attr('label/refX', 0.9)
                  break  
              }
              item.attr('label/textAnchor', val)
            } else if(['top', 'verticalMiddle', 'bottom'].includes(val)) {
              switch (val) {
                case 'top':
                  item.attr('label/refY', 0.1)
                  break
                case 'verticalMiddle':
                  item.attr('label/refY', 0.5)
                  break
                case 'bottom':
                  item.attr('label/refY', 0.9)
                  break  
              }
              item.attr('label/textVerticalAnchor', val === 'verticalMiddle' ? 'middle' : val)
            }
            break  
          case 'lineHeight':
            item.attr('label/lineHeight', this.style.label.fontSize * val)
            break
          case 'sourceMarker':
            item.attr('line/sourceMarker', {
              ...item.attrs.line.sourceMarker || {},
              width: 12,
              height: 8,
              ...markerObj
            })
            break
          case 'targetMarker':
            item.attr('line/targetMarker', {
              ...item.attrs.line.targetMarker || {},
              ...markerObj
            })
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

      // 分布对齐
      if(type === 'layoutAlign') {
        switch (val) {
          case 'left':
          case 'right':  
            this.setLayoutAlignOther('x', selectedCells, val)
            break
          case 'middle':
            this.setLayoutAlignMiddle('x', selectedCells)
            break
          case 'top':
          case 'bottom':  
            this.setLayoutAlignOther('y', selectedCells, val)
            break
          case 'verticalMiddle':
            this.setLayoutAlignMiddle('y', selectedCells)
            break
          case 'horizontal': // 水平平均分布
            this.setSameDistance('x', selectedCells)
            break
          case 'vertical': // 垂直平均分布
            this.setSameDistance('y', selectedCells)
            break  
        }
      }

      popper && show && this.handlePopperHide(popper, show);
    },
    // 设置分布对齐【左对齐、右对齐、顶端对齐、底端对齐】
    setLayoutAlignOther(prop, selectedCells, val) {
      const selectedNodes = selectedCells.filter(cell => cell.isNode())
      const positions = selectedNodes.map(cell => cell.position()[prop]).sort((a, b) => a - b)
      const max = Math.max.apply(this, positions)
      const min = Math.min.apply(this, positions)

      selectedNodes.forEach(cell => {
        if(prop === 'y') {
          cell.position(cell.position().x, val === 'top' ? min : max)
        } else {
          cell.position(val === 'left' ? min : max, cell.position().y)
        }
      })
    },
    // 设置分布对齐【居中对齐、垂直居中对齐】
    setLayoutAlignMiddle(prop, selectedCells) {
      const selectedNodes = selectedCells.filter(cell => cell.isNode())
      const positions = selectedNodes.map(cell => cell.position()[prop]).sort((a, b) => a - b)
      const max = Math.max.apply(this, positions)
      const min = Math.min.apply(this, positions)
      if (max === min) return
      let middlePos
      if(max < 0 && min < 0) {
        middlePos = min - max
      } else if(max >= 0 && min >= 0) {
        middlePos = max - min
      } else {
        middlePos = Math.abs(max) + Math.abs(min)
      }
      
      const newPosition = middlePos > 0 ? max - middlePos / 2 : min - middlePos / 2
      selectedNodes.forEach(cell => {
        if(prop === 'y') {
          cell.position(cell.position().x, newPosition)
        } else {
          cell.position(newPosition, cell.position().y)
        }
      })
    },
    // 设置水平或者垂直等距
    setSameDistance(prop, selectedCells) {
      const selectedNodes = selectedCells.filter(cell => cell.isNode())
      const positions = selectedNodes.map(cell => cell.position()[prop]).sort((a, b) => a - b)

      let distance = 0
      for(let i = 0; i < positions.length - 1; i++) {
        const prev = positions[i]
        const curr = positions[i + 1]
        if((prev <= 0 && curr <= 0) || (prev >= 0 && curr >= 0)) {
          distance += Math.abs(prev - curr)
        } else {
          distance += Math.abs(prev) + Math.abs(curr)
        }
      }
      
      for(let i in selectedNodes) {
        if(i > 0 && i < selectedNodes.length - 1) {
          const cell = selectedNodes[i]
          const prev = selectedNodes[i - 1]
          if(prop === 'y') {
            cell.position(cell.position().x, prev.position()[prop] + distance / (selectedNodes.length - 1))
          } else {
            cell.position(prev.position()[prop] + distance / (selectedNodes.length - 1), cell.position().y)
          }
          
        }
      }
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
    // 获取工具栏相关元素宽度
    getToolWidth() {
      this.menuContentWidth = document.getElementById('menuContent').offsetWidth
      setTimeout(() => {
        this.topMenuWidth = document.getElementById('topMenu').offsetWidth
      }, 100)
    },
    // 翻页
    handleTurnPage(type) {
      const step = this.topMenuWidth - this.menuContentWidth + 16
      switch (type) {
        case 'left':
          this.left < 0 && (this.left += step)
          break
        case 'right':
          (this.menuContentWidth + Math.abs(this.left) < this.topMenuWidth)
            && (this.left -= step)
          break  
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.menu-container{
  position: relative;
  height: 40px;
  background: #f6f7f8;
  border-top: 1px solid #dfe2e5;
  border-bottom: 1px solid #dfe2e5;
  .turn-page{
    position: absolute;
    width: 32px;
    text-align: center;
    font-size: 24px;
    height: 100%;
    line-height: 40px;
    z-index: 3;
    background: #f6f7f8;
    cursor: pointer;
    &.left{
      left: 0;
    }
    &.right{
      right: 0;
    }
  }
  .menu-content{
    width: 100%;
    height: 100%;
    position: absolute;
    overflow: hidden;
  }
}
.top-menu {
  position: absolute;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 16px;
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
