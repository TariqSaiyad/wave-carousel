import { LineChart, LineSeriesOption } from "echarts/charts";
import {
  GridComponent,
  GridComponentOption,
  TitleComponent,
  TitleComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  VisualMapComponent,
  VisualMapComponentOption,
} from "echarts/components";
import * as echarts from "echarts/core";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import React, { useEffect, useRef, useState } from "react";
import "./Visualiser.scss";
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  VisualMapComponent,
  CanvasRenderer,
  UniversalTransition,
]);

type EChartsOption = echarts.ComposeOption<
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LineSeriesOption
  | VisualMapComponentOption
>;

interface DataItem {
  name: string;
  value: [number, number];
}

function Visualiser(props) {
  const ONE_DAY = 1000;

  const option: EChartsOption = {
    visualMap: [
      {
        seriesIndex: 1,
        show: false,
        pieces: [
          {
            lte: 1.1,
            gt: 0,
            color: "#93CE07",
          },
          {
            lte: 0,
            gt: -1.1,
            color: "#93CE07",
          },
        ],
        outOfRange: {
          color: "red",
        },
      },
    ],
    title: [
      {
        left: "center",
        text: "Positional",
      },
      {
        top: "55%",
        left: "center",
        text: "Rate of change",
      },
    ],

    xAxis: [
      {
        type: "time",
        axisLabel: {
          show: false,
        },
        interval: 1000,
        splitLine: {
          show: false,
        },
      },
      {
        type: "time",
        gridIndex: 1,
        axisLabel: {
          show: false,
        },
        interval: 1000,
        splitLine: {
          show: false,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        boundaryGap: [0, "100%"],
        splitLine: {
          show: false,
        },
      },
      {
        type: "value",
        gridIndex: 1,
        boundaryGap: [0, "100%"],
        interval: 0.5,
        max: 2.5,
        min: -2.5,
      },
    ],
    grid: [
      {
        bottom: "60%",
        left: 0,
        right: 0,
      },
      {
        top: "60%",
        left: 0,
        right: 0,
      },
    ],
    series: [
      {
        name: "Positional",
        type: "line",
        showSymbol: false,
        smooth: true,
        data: [],
      },
      {
        name: "ROC",
        type: "line",
        showSymbol: false,
        smooth: true,
        data: [],
        xAxisIndex: 1,
        yAxisIndex: 1,
      },
    ],
  };

  const chartDom = useRef(null);
  const myTimer = useRef(null);

  const [myChart, setMyChart] = useState(null);
  const [data, setData] = useState<DataItem[]>([]);
  const [positional, setPositional] = useState<DataItem[]>([]);

  useEffect(() => {
    const handleResize = () => {
      if (myChart != null && myChart !== undefined) myChart.resize();
    };

    window.addEventListener("resize", handleResize);
  });

  useEffect(() => {
    const chart = echarts.init(chartDom.current, null, {
      renderer: "canvas",
      useDirtyRect: false,
    });

    setMyChart(chart);
  }, []);

  useEffect(() => {
    myChart && myChart.setOption(option);
    let now = new Date();
    let d: DataItem[] = [{ name: now.toString(), value: [now.getTime(), 0] }];
    let p: DataItem[] = [{ name: now.toString(), value: [now.getTime(), 0] }];

    setData([...d]);
    setPositional([...p]);

    myChart && myChart.setOption({ series: [{ data: p }, { data: d }] });
  }, [myChart]);

  useEffect(() => {
    function startTimer() {
      myTimer.current = setInterval(() => {
        if (data.length) {
          let d = data;
          let p = positional;

          let now = new Date(+new Date(data[data.length - 1].name) + ONE_DAY);

          let i: DataItem = {
            name: now.toString(),
            value: [now.getTime(), props.roc],
          };
          let ip: DataItem = {
            name: now.toString(),
            value: [now.getTime(), props.midPoint],
          };
          d.push(i);
          p.push(ip);

          if (d.length >= 100) d.shift();
          if (p.length >= 100) p.shift();

          setData([...d]);
          setPositional([...p]);
          myChart && myChart.setOption({ series: [{ data: p }, { data: d }] });
        }
      }, props.interval);
    }

    startTimer();
    return () => clearInterval(myTimer.current); // cleanup
  }, [data]);

  return <div ref={chartDom} id="chart-container"></div>;
}
export default Visualiser;
