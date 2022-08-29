import React from "react";
import styled from "styled-components";

const HOVER_COLOR = '#ee2cee';
const SELECTED_COLOR = '#1d58cd'
const NODE_COLOR = '#ff7f50';
const LINE_COLOR = '#000';


class Coordinate {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class GraphNode {
  constructor() {
    this.isSelected = false;
  }

  drawHighlight(canvasContext) {
    this.draw(canvasContext, HOVER_COLOR, 4);
  }

  drawSelected(canvasContext) {
    this.draw(canvasContext, SELECTED_COLOR, 4);
  }

  drawAndCheckCoordinate(canvasContext, otherCoordinate) {
    if (this.isPointWithin(otherCoordinate)) {
      this.drawHighlight(canvasContext);
    } else if (this.isSelected) {
      this.drawSelected(canvasContext);
    }
    this.draw(canvasContext, NODE_COLOR, 0);
  }

  select() {
    this.isSelected = true;
  }

  deSelect() {
    this.isSelected = false;
  }
}

class CircleNode extends GraphNode {

  constructor(x, y, radius) {
    super();
    this.center = new Coordinate(x, y);
    this.radius = radius;
  }

  isPointWithin(otherCoordinate) {
    const { x, y } = otherCoordinate;
    const diffX = x - this.center.x;
    const diffY = y - this.center.y;
    return this.radius >= Math.sqrt(diffX*diffX + diffY*diffY);
  }

  draw(canvasContext, color, buffer = 0) {
    canvasContext.beginPath();
    canvasContext.fillStyle = color;
    canvasContext.arc(this.center.x, this.center.y, this.radius + buffer, 0, Math.PI * 2, true);
    canvasContext.fill();
    canvasContext.fillStyle = '#000';
    canvasContext.closePath();
  }

}

class RectangleNode extends GraphNode {
  constructor(x, y, height, width) {
    super();
    this.topLeft = new Coordinate(x, y);
    this.bottomRight = new Coordinate(x + width, y + height);
    this.width = width;
    this.height = height;
  }
  
  isPointWithin(otherCoordinate) {
    const { x, y } = otherCoordinate;
    return (
      x > this.topLeft.x &&
      x < this.bottomRight.x &&
      y > this.topLeft.y &&
      y < this.bottomRight.y
    );
  }

  draw(canvasContext, color, buffer = 0) {
    canvasContext.fillStyle = color;
    canvasContext.fillRect(this.topLeft.x - buffer, this.topLeft.y - buffer, this.width + buffer * 2, this.height + buffer * 2);
  }

  
}

class Line extends GraphNode {
  constructor(startX, startY, endX, endY, thickness) {
    super();
    this.start = new Coordinate(startX, startY);
    this.end = new Coordinate(endX, endY);
    this.thickness = thickness;
    this.slope = (startY - endY) / (startX - endX);
    this.b = endY - (this.slope * endX);
  }
  
  isPointWithin(otherCoordinate) {
    const { x, y } = otherCoordinate;
    const diffY = Math.abs((this.slope * x) + this.b - y);
    return  diffY < this.thickness;
  }

  draw(canvasContext, color, buffer = 0) {
    canvasContext.beginPath();
    canvasContext.moveTo(this.start.x - buffer, this.start.y - buffer);
    canvasContext.strokeStyle = color;
    canvasContext.lineTo(this.end.x + buffer, this.end.y + buffer);
    canvasContext.lineWidth = this.thickness + buffer;
    canvasContext.stroke();
    canvasContext.closePath();
  }

}




const StyledApp = styled.div`
  height: 100vh;
`;

export default function App() {
  return (
    <StyledApp>
      <h2>Interactable Graph Nodes</h2>

      <div>
        <Canvas />
      </div>
    </StyledApp>
  );
}

const Canvas2dContext = React.createContext();



function Canvas2dContextProvider({ items, children }) {
  const [canvasContext, setContext] = React.useState(null);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current) return;
    const canvasContext = canvasRef.current.getContext('2d');

    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    canvasRef.current.addEventListener('mousedown', handleMouseDown);
    canvasRef.current.addEventListener('mouseup', handleMouseUp);

    if (canvasContext) {
      setContext(canvasContext);
    }

    return () => {
      canvasRef.current.removeEventListener('mousemove', handleMouseMove);
      canvasRef.current.removeEventListener('mousedown', handleMouseDown);
      canvasRef.current.removeEventListener('mouseup', handleMouseUp);
    }
  }, [] );

  function handleMouseMove(event) {
    setMousePosition({
      x: event.clientX - canvasRef.current.offsetLeft,
      y: event.clientY - canvasRef.current.offsetTop,
    });
  }

  function handleMouseDown(event) {
    const downPosition = new Coordinate(event.clientX - canvasRef.current.offsetLeft, event.clientY - canvasRef.current.offsetTop);
    const validItems = items.filter(item => item.isPointWithin(downPosition));

    if (validItems.length === 0) {
      items.forEach(item => {
        item.deSelect();
      });
    } else {
      validItems.forEach(item => {
        item.select();
      });
    }
  }

  function handleMouseUp(event) {

  }

  React.useEffect(() => {
    if (canvasContext) {
      canvasContext.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      items.forEach(element => {
        element.drawAndCheckCoordinate(canvasContext, mousePosition);
      });
      
      canvasContext.beginPath();
      canvasContext.fillStyle = HOVER_COLOR;
      canvasContext.arc(mousePosition.x, mousePosition.y, 5, 0, Math.PI * 2, true);
      canvasContext.fill();
      canvasContext.fillStyle = '#000';
      canvasContext.closePath();
    }
  });

  return (
    <Canvas2dContext.Provider value={[{ canvasContext, mousePosition }]}>
      <canvas
        id="canvas"
        ref={canvasRef}
        height={500}
        width={500}
        style={{
          border: '2px solid #000',
        }}
      >
        {children}
      </canvas>
    </Canvas2dContext.Provider>
  );
}

function useCanvas2dContext() {
  return React.useContext(Canvas2dContext);
}


const items = [
  new CircleNode(440, 60, 50),
  new RectangleNode(5, 5, 200, 100),
  new Line(120, 50, 305, 225, 4),
];
function Canvas({  }) {

  return (
    <Canvas2dContextProvider items={items} />
  );
}
