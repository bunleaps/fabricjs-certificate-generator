import React, { useState, useRef, useEffect } from "react";
import { Canvas, FabricImage, Textbox, StaticCanvas } from "fabric";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import dynamic from "next/dynamic";

const ChromePicker = dynamic(
  () => import("react-color").then((mod) => mod.ChromePicker),
  { ssr: false }
);

export default function FabricBackgroundUploader() {
  const [names, setNames] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState("#000000");
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);
  const [imageInfo, setImageInfo] = useState(null);

  useEffect(() => {
    fabricCanvas.current = new Canvas(canvasRef.current, {
      width: 800,
      height: 500,
      backgroundColor: "#f0f0f0",
    });

    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (!imageInfo || !fabricCanvas.current) return;
    console.log("Setting background:", imageInfo);
  }, [imageInfo]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        setImageInfo({
          src: event.target.result,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });

        const canvas = fabricCanvas.current;
        const image = new FabricImage(img, {
          // Lock all interactions
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
          lockSkewingX: true,
          lockSkewingY: true,
          hoverCursor: "default",
          // Positioning
          left: 0,
          top: 0,
          originX: "left",
          originY: "top",
        });

        canvas.setWidth(img.naturalWidth);
        canvas.setHeight(img.naturalHeight);
        canvas.add(image);
        canvas.sendObjectToBack(image);
        canvas.requestRenderAll();
      };
    };
    reader.readAsDataURL(file);
  };

  const addNameField = () => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

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
      isEditing: false,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const generateCertificates = async () => {
    const canvas = fabricCanvas.current;
    if (!canvas || !names.trim()) return;

    const nameList = names.split("\n").filter((name) => name.trim());
    const zip = new JSZip();
    const templateJSON = canvas.toJSON();
    const textObjectIndices = [];
    canvas.getObjects().forEach((obj, index) => {
      if (obj.type === "textbox") {
        textObjectIndices.push(index);
      }
    });

    for (const name of nameList) {
      const tempCanvas = new StaticCanvas();
      tempCanvas.setWidth = canvas.width;
      tempCanvas.setHeight = canvas.height;

      await new Promise((resolve) =>
        tempCanvas.loadFromJSON(templateJSON, resolve)
      );

      textObjectIndices.forEach((index) => {
        const textObj = tempCanvas.getObjects()[index];
        if (textObj) {
          textObj.set("text", name.trim());
        }
      });

      tempCanvas.renderAll();

      // Add to ZIP
      const blob = await new Promise((resolve) => {
        const dataUrl = tempCanvas.toDataURL({ format: "png" });
        const base64 = dataUrl.split(",")[1];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        resolve(new Blob([byteArray], { type: "image/png" }));
      });
      zip.file(`${name.replace(/\s+/g, "_")}_certificate.png`, blob);
      tempCanvas.dispose();
    }

    // Download ZIP
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "certificates.zip");
  };

  return (
    <div style={{ padding: "20px" }}>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <canvas ref={canvasRef} />
      <button
        onClick={addNameField}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Name Field
      </button>

      <div>
        <div className="mb-4">
          <label className="block mb-2">
            Font Size:
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="border p-2 w-full"
            />
          </label>

          <label className="block mb-2">
            Font Color:
            <ChromePicker
              color={fontColor}
              onChangeComplete={(color) => setFontColor(color.hex)}
              disableAlpha
              className="mt-2"
            />
          </label>
        </div>

        <div className="mb-4">
          <label className="block mb-2">
            Names (one per line):
            <textarea
              value={names}
              onChange={(e) => setNames(e.target.value)}
              rows={10}
              className="border p-2 w-full"
              placeholder="John Doe&#10;Jane Smith&#10;..."
            />
          </label>
        </div>

        <button
          onClick={generateCertificates}
          className="bg-green-600 text-white px-6 py-3 rounded font-bold w-full"
        >
          Generate Certificates
        </button>
      </div>
    </div>
  );
}
