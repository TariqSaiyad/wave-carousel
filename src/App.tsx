import React, { createRef, useEffect, useRef, useState } from "react";
import hand from "./hand.png";
import "./App.scss";
import * as handTrack from "handtrackjs";
import Webcam from "webcam-easy";
import Toggle from "./Components/Toggle/Toggle";

function App() {
  const [model, setModel] = useState(null);
  const [running, setRunning] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [midPoint, setMidPoint] = useState({ current: 0, previous: 0 });
  const [direction, setDirection] = useState(0);
  const [roc, setRoc] = useState(0);
  const [maxRoc, setMaxRoc] = useState(0);
  const myTimer = useRef(null);
  const INTERVAL = 100;
  const DETECTION_THRESHOLD = 1.3;
  const ROC_THRESHOLD = 1;
  const UPPER_ROC_THRESHOLD = 2.7;
  const params = {
    flipHorizontal: true, // flip e.g for video
    maxNumBoxes: 3, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.5, // confidence threshold for predictions.
  };

  const webCam = useRef(null);
  const canvas = useRef(null);

  function runDetection() {
    model.detect(webCam.current).then((predictions) => {
      // console.log("Predictions: ", predictions);
      model.renderPredictions(
        predictions,
        canvas.current,
        canvas.current.getContext("2d"),
        webCam.current
      );

      const hand = [...predictions].find((p) => p.label !== "face");

      if (hand) {
        const { bbox } = hand;
        let midval = bbox[0] + bbox[2] / 2;
        let gamex = midval;

        setMidPoint((mid) => {
          const roc = (gamex - mid.current) / INTERVAL;
          setRoc(roc);
          if (Math.abs(roc) > Math.abs(maxRoc)) {
            setMaxRoc(Math.abs(roc));
          }
          if (Math.abs(roc) > ROC_THRESHOLD && Math.abs(roc) < UPPER_ROC_THRESHOLD ) {
            setDirection(roc);
          }

          return { current: gamex, previous: mid.current };
        });
      }
    });
  }

  useEffect(() => {
    function startTimer() {
      myTimer.current = setInterval(() => isVideo && runDetection(), INTERVAL);
    }

    startTimer();
    return () => clearInterval(myTimer.current); // cleanup
  }, [isVideo]);

  useEffect(() => {
    if (!model) {
      handTrack.load(params).then((model) => setModel(model));
    }
    if (running) {
      handTrack.startVideo(webCam.current).then((status) => {
        console.log(status.msg);
        console.log(model);
        setIsVideo(true);
        // if (status) runDetection();
      });
    } else {
      setIsVideo(false);
      handTrack.stopVideo(webCam.current);
    }
  }, [running]);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          {Math.abs(maxRoc)} == {roc} = {direction}
        </p>
        <p>{direction < 0 ? "left <<<<" : "right >>>>"}</p>
        <p>
          Current:{midPoint.current} - prev: {midPoint.previous}
        </p>
        <p>{model ? "Model loaded" : null}</p>
        <p>{running ? "running" : "not running"}</p>
        <Toggle title="Start Video" checked={running} onChange={setRunning} />
        <video
          id="webcam"
          ref={webCam}
          autoPlay
          style={{ display: "none" }}
        ></video>
        <canvas id="canvas" ref={canvas} className="d-none"></canvas>
        {/* <img id="hand" src={hand} ref={modelImg} alt="hand" /> */}
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
