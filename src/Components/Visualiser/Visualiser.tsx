import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts/core";
import {
  TitleComponent,
  TitleComponentOption,
  TooltipComponent,
  VisualMapComponent,
  VisualMapComponentOption,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
} from "echarts/components";
import { LineChart, LineSeriesOption } from "echarts/charts";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
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
    // visualMap: {
    //     pieces: [
    //       {
    //         gt: 120,
    //         color: '#93CE07'
    //       },
    //     ],
    //     outOfRange: {
    //       color: '#999'
    //     }
    //   },
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
      },
      {
        top: "60%",
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

  //   var chartDom = document.getElementById("chart-container");
  const chartDom = useRef(null);
  const myTimer = useRef(null);

  const [myChart, setMyChart] = useState(null);

  //   let data: DataItem[] = [];
  const [data, setData] = useState<DataItem[]>([]);
  const [positional, setPositional] = useState<DataItem[]>([]);

  //   let now = new Date(1997, 9, 3);

  useEffect(() => {
    //   var myChart = echarts.init(chartDom, null, {
    //     renderer: "canvas",
    //     useDirtyRect: false,
    //   });
    const chart = echarts.init(chartDom.current, null, {
      renderer: "canvas",
      useDirtyRect: false,
    });

    setMyChart(chart);
  }, []);

  useEffect(() => {
    myChart && myChart.setOption(option);
    let now = new Date();
    let d: DataItem[] = [
      {
        name: now.toString(),
        value: [now.getTime(), 0],
      },
    ];
    let p: DataItem[] = [
      {
        name: now.toString(),
        value: [now.getTime(), 0],
      },
    ];
    let value = Math.random() * 10;
    // for (var i = 0; i < 300; i++) {
    //   now = new Date(+now + ONE_DAY);

    //   value = value + Math.random() * 21 - 10;
    //   let i: DataItem = {
    //     name: 'now.toString()',
    //     value: [now.getTime(), Math.round(value)],
    //   };
    //   d.push(i);
    // }
    setData([...d]);
    setPositional([...p]);

    myChart &&
      myChart.setOption({
        series: [
          {
            data: p,
          },
          {
            data: d,
          },
        ],
      });
  }, [myChart]);

  useEffect(() => {
    // re-runs detection at a specified interval.
    function startTimer() {
      myTimer.current = setInterval(() => {
        if (data.length) {
          let d = data;
          let p = positional;

          let now = new Date(+new Date(data[data.length - 1].name) + ONE_DAY);

          //   let value = data[data.length - 1].value[1] + Math.random() * 21 - 10;

          let i: DataItem = {
            name: now.toString(),
            value: [now.getTime(), props.roc],
            // value: [now.getTime(), Math.round(value)],
          };
          let ip: DataItem = {
            name: now.toString(),
            value: [now.getTime(), props.midPoint],
            // value: [now.getTime(), Math.round(value)],
          };
          d.push(i);
          p.push(ip);

          if (d.length >= 100) {
            d.shift();
          }
          if (p.length >= 100) {
            p.shift();
          }

          setData([...d]);
          setPositional([...p]);
          myChart &&
            myChart.setOption({
              series: [
                {
                  data: p,
                },
                {
                  data: d,
                },
              ],
            });
        }
      }, props.interval);
    }

    startTimer();
    return () => clearInterval(myTimer.current); // cleanup
  }, [data]);

  //   function randomData(): DataItem {
  //     setNow((n) => new Date(+n + ONE_DAY));
  //     // now = new Date(+now + ONE_DAY);
  //     value = value + Math.random() * 21 - 10;
  //     return {
  //       name: now.toString(),
  //       value: [
  //         [now.getFullYear(), now.getMonth() + 1, now.getDate()].join("/"),
  //         Math.round(value),
  //       ],
  //     };
  //   }

  //   setInterval(() => {
  //     let d = data;
  //     for (var i = 0; i < 5; i++) {
  //       d.shift();
  //       d.push(randomData());
  //     }
  //     setData(d);

  //     myChart && myChart.setOption({
  //       series: [
  //         {
  //           data: d,
  //         },
  //       ],
  //     });
  //   }, 1000);

  return <div ref={chartDom} id="chart-container"></div>;
}
export default Visualiser;
