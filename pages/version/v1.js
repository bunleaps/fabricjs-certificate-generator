import { useState, useRef, useEffect } from "react";
import * as fabric from "fabric";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { useDropzone } from "react-dropzone";
import dynamic from "next/dynamic";

const ChromePicker = dynamic(
  () => import("react-color").then((mod) => mod.ChromePicker),
  { ssr: false }
);

export default function CertificateGenerator() {
  const [names, setNames] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState("#000000");
  const [canvas, setCanvas] = useState(null);
  const canvasRef = useRef(null);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      selection: false,
      backgroundColor: "#f0f0f0",
    });
    setCanvas(fabricCanvas);

    return () => fabricCanvas.dispose();
  }, []);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        if (canvas) {
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / img.width,
            scaleY: canvas.height / img.height,
          });
        }
      });
    };
    reader.readAsDataURL(file);
  };

  // Add name field to canvas
  const addNameField = () => {
    if (!canvas) return;

    const text = new fabric.Textbox("Full Name", {
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
    });

    canvas.add(text);
    canvas.setActiveObject(text);
  };

  // Generate certificates
  const generateCertificates = async () => {
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
      const tempCanvas = new fabric.StaticCanvas(null, {
        width: canvas.width,
        height: canvas.height,
      });

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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Certificate Generator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Canvas Section */}
        <div>
          <div
            {...getRootProps()}
            className="border-2 border-dashed p-4 mb-4 text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            <p>Drag & drop certificate template here, or click to select</p>
          </div>

          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-gray-300"
          />

          <button
            onClick={addNameField}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Name Field
          </button>
        </div>

        {/* Controls Section */}
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
    </div>
  );
}
