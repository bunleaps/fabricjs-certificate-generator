import { Canvas, FabricImage, Textbox, StaticCanvas } from "fabric";

export function initCanvas(canvasRef) {
  return new Canvas(canvasRef.current, {
    width: 800,
    height: 500,
    backgroundColor: "#f0f0f0",
    preserveObjectStacking: true,
  });
}

export function addBackgroundImage(file, fabricCanvas) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      fabricCanvas.clear();
      const image = new FabricImage(img, {
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hoverCursor: "default",
        left: 0,
        top: 0,
        originX: "left",
        originY: "top",
      });
      fabricCanvas.setWidth(img.naturalWidth);
      fabricCanvas.setHeight(img.naturalHeight);
      fabricCanvas.add(image);
      fabricCanvas.sendObjectToBack(image);
      fabricCanvas.requestRenderAll();
    };
  };
  reader.readAsDataURL(file);
}

export function addTextBox(canvas, fontSize, fontColor) {
  const text = new Textbox("Full Name", {
    left: canvas.width / 2,
    top: canvas.height / 2,
    fontSize,
    fill: fontColor,
    fontFamily: "Arial",
    textAlign: "center",
    originX: "center",
    originY: "center",
    hasControls: true,
    borderColor: "#4287f5",
    cornerColor: "#4287f5",
    cornerSize: 10,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
  });
  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.requestRenderAll();
}
