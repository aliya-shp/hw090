import React, {Component, createRef} from 'react';

class App extends Component {
  state = {
    username: 'Anonymous',
    drawing: {},
    drawings: [],
    color: 'black',
  };

  componentDidMount() {
    this.websocket = new WebSocket('ws://localhost:8000/chat');

    this.websocket.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);

        if (data.type === 'NEW_DRAWING') {
          const newDrawing = {
            username: data.username,
            drawing: data.drawing,
          };
          this.setState({drawings: [...this.state.drawings, newDrawing]});
        } else if (data.type === 'ALL_DRAWINGS') {
          this.setState({drawings: data.drawings});
        }
      } catch (error) {
        console.log('Something went wrong', error);
      }
    };
  }

  setUsername = event => {
    event.preventDefault();

    const message = {
      type: 'SET_USERNAME',
      username: this.state.username,
    };

    this.websocket.send(JSON.stringify(message));
  };

  canvas = createRef();

  onCanvasClick = event => {
    event.persist();
    const canvas = this.canvas.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.fillStyle = this.state.color;

    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    const drawing = {
      type: 'NEW_DRAWING',
      username: this.state.username,
      drawing: {
        x,
        y,
        color: this.state.color,
      }
    };

    this.websocket.send(JSON.stringify(drawing));
  };

  changeField = (event) => this.setState({[event.target.name]: event.target.value});

  changeColor = event => {
    const id = event.target.id;
    this.setState({color: id});
  };

  clearCanvas = () => {
    const canvas = this.canvas.current;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

    render() {
        return (
            <div width="1100" height="auto" style={{'display': 'flex', 'flexDirection': 'column'}}>
              <form onSubmit={this.setUsername} style={{'alignSelf': 'center', 'marginTop': '20px'}}>
                <input type="text" value={this.state.username} name="username" onChange={this.changeField}/>
                <button type="submit">Set username</button>
              </form>
              <br/>
              <canvas width="800" height="500" ref={this.canvas} onClick={this.onCanvasClick} style={{border:'2px solid black', 'alignSelf': 'center'}}/>
              <form style={{'alignSelf': 'center'}}>
                <button type="button" id="red" onClick={this.changeColor}>Red</button>
                <button type="button" id="green" onClick={this.changeColor}>Green</button>
                <button type="button" id="blue" onClick={this.changeColor}>Blue</button>
                <button type="button" id="yellow" onClick={this.changeColor}>Yellow</button>
                <button onClick={this.clearCanvas}>Clear canvas</button>
              </form>
            </div>
        );
    }
}

export default App;