// 画布基本设置
export const configSetting = (Shape) => {
  return {
    autoResize: true,
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
    snapline: true,
    history: {
      enabled: true,
      beforeAddCommand(event, args) {
        return args.options.propertyPath !== "attrs/wrap/stroke";
      },
    },
    clipboard: true,
    keyboard: true,
    mousewheel: {
      enabled: true,
      modifiers: "ctrl",
      minScale: 0.5,
      maxScale: 3,
    },
    selecting: {
      enabled: true,
      rubberband: true,
      showNodeSelectionBox: true,
    },
    rotating: true,
    resizing: {
      enabled: true,
      orthogonal: false,
      restricted: true,
    },
    panning: {
      enabled: true,
      modifiers: "ctrl",
    },
    translating: {
      restrict: true,
    },
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
      connectionPoint: "anchor",
      allowBlank: false,
      snap: {
        radius: 20,
      },
      highlight: true,
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: "#333",
              strokeWidth: 2,
              targetMarker: {
                name: "block",
                width: 12,
                height: 8,
              },
            },
          },
          zIndex: 0,
          tools: {
            name: "segments", // 线段工具
            args: {
              attrs: {
                // fill: "transparent",
                // stroke: "transparent",
              },
            },
          },
        });
      },
      validateConnection({ targetMagnet }) {
        return !!targetMagnet;
      },
    },
    // 当工具项渲染完成时触发的回调
    onToolItemCreated({ name, tool }) {
      if (name === "segments" && tool.container) {
        tool.container.style.visibility = "hidden";
      }
    },
    highlighting: {
      magnetAdsorbed: {
        name: "stroke",
        args: {
          attrs: {
            fill: "#5F95FF",
            stroke: "#5F95FF",
          },
        },
      },
    },
    interacting: {
      magnetConnectable: true,
      edgeMovable: true,
      edgeLabelMovable: true,
    },
    // embedding: {
    //   enabled: true,
    //   findParent({ node }) {
    //     const bbox = node.getBBox();
    //     return this.getNodes().filter((target) => {
    //       const targetBBox = target.getBBox();
    //       // 当容器节点大于当前节点时且容器节点的zIndex小于当前节点时，才可嵌入
    //       if (
    //         targetBBox.width > bbox.width &&
    //         targetBBox.height > bbox.height &&
    //         target.zIndex < node.zIndex
    //       ) {
    //         return bbox.isIntersectWithRect(targetBBox);
    //       }
    //       return false;
    //     });
    //   },
    // },
  };
};

// 节点设置
export const configNodeShape = (type) => {
  const commonOptions = {
    attrs: {
      body: {
        fill: "#fff",
        stroke: "#333",
      },
      label: {
        fontSize: 16,
        fill: "#333",
      },
    },
    ports: configNodePorts(),
  };
  const nodeShapeList = [
    {
      label: "矩形",
      shape: "rect",
      width: 80,
      height: 50,
      data: {
        type: "rect",
      },
      ...commonOptions,
    },
    {
      label: "圆形",
      shape: "circle",
      width: 60,
      height: 60,
      data: {
        type: "circle",
      },
      ...commonOptions,
    },
    {
      label: "椭圆",
      shape: "ellipse",
      width: 80,
      height: 50,
      data: {
        type: "ellipse",
      },
      ...commonOptions,
    },
    {
      label: "菱形",
      shape: "polygon",
      width: 80,
      height: 50,
      data: {
        type: "polygon",
      },
      ...commonOptions,
    },
    {
      label: "平行四边形",
      shape: "polygon",
      width: 110,
      height: 50,
      data: {
        type: "parallelogram",
      },
      ...commonOptions,
    },
    {
      label: " ",
      shape: "image",
      width: 80,
      height: 50,
      imageUrl:
        "https://gw.alipayobjects.com/os/s/prod/antv/assets/image/logo-with-text-73b8a.svg",
      data: {
        type: "image",
      },
      ...commonOptions,
    },
  ];
  if (type) {
    const obj = nodeShapeList.find((item) => {
      return item.data.type === type;
    });
    return obj || nodeShapeList;
  }
  return nodeShapeList;
};

// 连接桩设置
export const configNodePorts = () => {
  return {
    groups: {
      top: {
        position: "top",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
            style: {
              visibility: "hidden",
            },
          },
        },
      },
      right: {
        position: "right",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
            style: {
              visibility: "hidden",
            },
          },
        },
      },
      bottom: {
        position: "bottom",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
            style: {
              visibility: "hidden",
            },
          },
        },
      },
      left: {
        position: "left",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
            style: {
              visibility: "hidden",
            },
          },
        },
      },
    },
    items: [
      {
        group: "top",
      },
      {
        group: "right",
      },
      {
        group: "bottom",
      },
      {
        group: "left",
      },
    ],
  };
};

// 键盘事件
export const graphBindKey = (graph) => {
  graph.bindKey(["meta+c", "ctrl+c"], () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.copy(cells);
    }
    return false;
  });
  graph.bindKey(["meta+x", "ctrl+x"], () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.cut(cells);
    }
    return false;
  });
  graph.bindKey(["meta+v", "ctrl+v"], () => {
    if (!graph.isClipboardEmpty()) {
      const cells = graph.paste({ offset: 32 });
      graph.cleanSelection();
      graph.select(cells);
    }
    return false;
  });
  //undo redo
  graph.bindKey(["meta+z", "ctrl+z"], () => {
    if (graph.history.canUndo()) {
      graph.history.undo();
    }
    return false;
  });
  graph.bindKey(["meta+shift+z", "ctrl+shift+z"], () => {
    if (graph.history.canRedo()) {
      graph.history.redo();
    }
    return false;
  });
  // select all
  graph.bindKey(["meta+a", "ctrl+a"], () => {
    const nodes = graph.getNodes();
    if (nodes) {
      graph.select(nodes);
    }
  });
  // delete
  graph.bindKey(["delete"], () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.removeCells(cells);
    }
  });

  return graph;
};
