import React, {Component, createRef} from 'react';

class App extends Component {
  state = {
    username: 'Anonymous',
    drawing: {},
    drawings: [],
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

    ctx.fillStyle = 'green';
    ctx.fillRect(x - 5, y - 5, 10, 10);

    const drawing = {x, y};

    this.setState({drawing});
  };

  changeField = (event) => this.setState({[event.target.name]: event.target.value});

    render() {
        return (
            <>
              <form onSubmit={this.setUsername}>
                <input type="text" value={this.state.username} name="username" onChange={this.changeField}/>
                <button type="submit">Set username</button>
              </form>

              <canvas width="1000" height="800" ref={this.canvas} onClick={this.onCanvasClick}/>
            </>
        );
    }
}

export default App;