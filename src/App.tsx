/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { load, startVideo, stopVideo } from "handtrackjs";
import React, { useEffect, useRef, useState } from "react";
import "./App.scss";
import MyCarousel from "./Components/MyCarousel/MyCarousel";
import Visualiser from "./Components/Visualiser/Visualiser";
import Toggle from "./Components/Toggle/Toggle";
import { COLORS } from "./data";

function App() {
  const [model, setModel] = useState(null);
  const [running, setRunning] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [midPoint, setMidPoint] = useState({ val: 0, time: 0 });
  const prevMidPoint = usePrevious(midPoint);
  const [direction, setDirection] = useState(0);
  const [roc, setRoc] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);

  const NUM_ITEMS = 4;
  const INTERVAL = 33;
  const DETECTION_THRESHOLD = 1.2;
  // const DETECTION_THRESHOLD = 2.7;

  const params = {
    flipHorizontal: true, // flip e.g for video
    maxNumBoxes: 2, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.75, // confidence threshold for predictions.
  };

  const myTimer = useRef(null);
  const webCam = useRef(null);
  const canvas = useRef(null);

  function runDetection() {
    model.detect(webCam.current).then((predictions) => {
      model.renderPredictions(
        predictions,
        canvas.current,
        canvas.current.getContext("2d"),
        webCam.current
      );

      const hand = [...predictions].find((p) => p.label === "point");

      if (hand) {
        const { bbox } = hand;
        let midval: number = bbox[0] + bbox[2] / 2;
        setMidPoint({ val: midval, time: new Date().getTime() });
      }
    });
  }

  useEffect(() => {
    if (!midPoint.val) return;
    // calculate rate of change.
    const roc =
      (midPoint.val - prevMidPoint.val) / (midPoint.time - prevMidPoint.time);
    setRoc(roc);
    if (Math.abs(roc) > DETECTION_THRESHOLD) {
      console.log(roc);
      setDirection(roc);
    }
  }, [midPoint]);

  useEffect(() => {
    // goes left or right based on direction value
    setSlideIndex((s) => {
      const n = direction > 0 ? s - 1 : s + 1;
      if (n === NUM_ITEMS) return 0;
      if (n < 0) return NUM_ITEMS - 1;
      return n;
    });
  }, [direction]);

  useEffect(() => {
    // re-runs detection at a specified interval.
    function startTimer() {
      myTimer.current = setInterval(() => isVideo && runDetection(), INTERVAL);
    }

    startTimer();
    return () => clearInterval(myTimer.current); // cleanup
  }, [isVideo]);

  useEffect(() => {
    // start webcam
    if (running) {
      startVideo(webCam.current).then((status) => setIsVideo(true));
    } else {
      setIsVideo(false);
      stopVideo(webCam.current);
    }
  }, [running]);

  useEffect(() => {
    load(params).then((model) => setModel(model));
  }, []);

  return (
    <div className="App">
      <header>
        <h1>Wavy Carousel 🎠</h1>
        <Toggle
          title="Start Video"
          checked={running}
          onChange={setRunning}
          disabled={!model}
        />
      </header>
      <main>
          <Visualiser
            roc={roc}
            midPoint={midPoint.val}
            interval={INTERVAL}
          ></Visualiser>
        <div className="video-container">
          <canvas id="video-canvas" ref={canvas} className="d-none"></canvas>
        </div>

        <MyCarousel slideIndex={slideIndex}>
          {[...Array(NUM_ITEMS).keys()].map((i) => (
            <div
              key={i}
              style={{ background: COLORS[i] }}
              className="carousel-item"
            >
              slide {i}
            </div>
          ))}
        </MyCarousel>
        {/* {slideIndex}
        <p>
          {roc} = {direction}
        </p>
        <p>{direction < 0 ? "left <<<<" : "right >>>>"}</p>
        <p>
          Current:{midPoint?.val} - prev: {prevMidPoint?.val}
        </p>
        <p>{model ? "Model loaded" : null}</p>
        <p>{running ? "running" : "not running"}</p> */}
        <video
          id="webcam"
          ref={webCam}
          autoPlay
          style={{ display: "none" }}
        ></video>
      </main>
    </div>
  );
}

// Hook
function usePrevious<T>(value: T): T {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref: any = useRef<T>();
  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export default App;
