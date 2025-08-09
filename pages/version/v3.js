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
  // const canvasTempRef = useRef(null);
  // const fabricTempCanvas = useRef(null);
  // const [imageInfo, setImageInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fabricCanvas.current = new Canvas(canvasRef.current, {
      width: 800,
      height: 500,
      backgroundColor: "#f0f0f0",
      preserveObjectStacking: true,
    });

    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose();
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = fabricCanvas.current;
        canvas.clear();

        // Create static background image
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
          id: "background-image", // Add ID for easy reference
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
      padding: 10,
      backgroundColor: "rgba(255,255,255,0.7)",
      id: `text-${Date.now()}`,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  const generateCertificates = async () => {
    setLoading(true);
    const canvas = fabricCanvas.current;

    // Get text objects and background
    const backgroundObject = canvas.getObjects()[0]; // ._element.currentSrc
    const img = new Image();
    img.src = backgroundObject._element.currentSrc;
    const textObject = canvas.getObjects()[1];
    console.log(backgroundObject);

    if (!canvas || !names.trim()) {
      setLoading(false);
      return;
    }

    // Preload the background image once
    const bgImg = new Image();
    bgImg.src = backgroundObject._element.src;

    // Wait for background image to load before processing certificates
    await new Promise((resolve) => {
      bgImg.onload = resolve;
    });

    try {
      const nameList = names.split("\n").filter((name) => name.trim());
      const zip = new JSZip();

      // Make the Export Work

      for (const name of nameList) {
        const tempCanvas = new StaticCanvas(null, {
          width: canvas.width,
          height: canvas.height,
        });

        // console.log(backgroundObject.toObject());

        const addBackground = new FabricImage(img, {
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

        tempCanvas.add(addBackground);
        tempCanvas.sendObjectToBack(addBackground);

        const textClone = new Textbox(name.trim(), {
          left: textObject.left,
          top: textObject.top,
          fontSize: textObject.fontSize,
          fill: textObject.fill,
          fontFamily: textObject.fontFamily,
          textAlign: textObject.textAlign,
          originX: textObject.originX,
          originY: textObject.originY,
          width: textObject.width,
          height: textObject.height,
          scaleX: textObject.scaleX,
          scaleY: textObject.scaleY,
          padding: textObject.padding,
          backgroundColor: textObject.backgroundColor,
        });

        tempCanvas.add(textClone);
        tempCanvas.requestRenderAll();

        // Export as data URL
        const dataURL = tempCanvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2,
        });

        // Convert to blob
        const blob = await fetch(dataURL).then((res) => res.blob());
        zip.file(`${name.replace(/\s+/g, "_")}_certificate.png`, blob);

        // Clean up
        tempCanvas.dispose();

        // console.log(tempCanvas.getObjects());
      }

      // Create and download ZIP
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "certificates.zip");
    } catch (error) {
      console.error("Error generating certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid #ccc", display: "block" }}
      />

      <button
        onClick={addNameField}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Name Field
      </button>

      <div className="mt-4">
        <div className="mb-4">
          <label className="block mb-2">
            Font Size:
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value) || 48)}
              className="border p-2 w-full"
              min="8"
              max="200"
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
          className="bg-green-600 text-white px-6 py-3 rounded font-bold w-full disabled:opacity-50"
          disabled={!names.trim() || loading}
        >
          {loading ? "Generating..." : "Generate Certificates"}
        </button>
      </div>
    </div>
  );
}
