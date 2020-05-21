import React, { Component } from "react";
import "./App.css";
import { createWorker, createScheduler } from "tesseract.js";
import label from "./matWithLabel.jpg";
import Progress from "react-progressbar";

class App extends Component {
  constructor() {
    super();

    this.state = {
      height: null,
      width: null,
      textConfidence: null,
      progress1: 0,
      progress2: 0,
      progressText: "",
    };

    this.scheduler = createScheduler();
    this.worker1 = createWorker({
      logger: (m) => {
        console.log(m);
        this.setState({
          progress1: m.progress,
          progressText: m.status,
        });
      },
    });
    this.worker2 = createWorker({
      logger: (m) => {
        console.log(m);
        this.setState({
          progress2: m.progress,
          progressText: m.status,
        });
      },
    });
  }

  componentDidMount() {
    // We need to instantiate CameraPhoto inside componentDidMount because we
    // need the refs.video to get the videoElement so the component has to be
    // mounted.
    this.loadResources();
  }

  doOCR = async () => {
    const rectangles = [
      { left: 360, top: 1624, width: 65, height: 46 },
      {
        left: 1864,
        top: 2666,
        width: 63,
        height: 60,
      },
    ];
    const results = await Promise.all(
      rectangles.map((rectangle) =>
        this.scheduler.addJob("recognize", label, {
          rectangle,
        })
      )
    );
    console.log(results.map((r) => r.data.text));
    await this.scheduler.terminate();

    this.setState({
      height: results[0]["data"].text - 1,
      width: results[1]["data"].text - 1,
      textConfidence:
        (results[0]["data"].confidence + results[1]["data"].confidence) / 2,
    });
  };

  loadResources = async () => {
    await this.worker1.load();
    await this.worker2.load();
    await this.worker1.loadLanguage("eng");
    await this.worker2.loadLanguage("eng");
    await this.worker1.initialize("eng");
    await this.worker2.initialize("eng");

    this.scheduler.addWorker(this.worker1);
    this.scheduler.addWorker(this.worker2);
  };

  render() {
    return (
      <div>
        <br />
        <h4>{this.state.progressText}</h4>
        <Progress
          completed={(this.state.progress1 + this.state.progress2) * 50}
        />{" "}
        <br />
        <button onClick={this.doOCR}>Calculate Dimentions</button>
        <h4>Width: {this.state.width}</h4>
        <h4>height: {this.state.height}</h4>
        <h4>Text confidence: {this.state.textConfidence}</h4>
      </div>
    );
  }
}

export default App;
