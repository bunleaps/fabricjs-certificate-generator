import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import FileUploader from "./FileUploader";
import ControlsPanel from "./ControlsPanel";
import NameFieldButton from "./NameFieldButton";
import {
  initCanvas,
  addBackgroundImage,
  addTextBox,
} from "../../utils/canvasUtils";
import { generateCertificates } from "../../utils/certificateUtils";

const ChromePicker = dynamic(
  () => import("react-color").then((m) => m.ChromePicker),
  { ssr: false }
);

export default function CertificateGenerator() {
  const [names, setNames] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState("#000000");
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);

  useEffect(() => {
    fabricCanvas.current = initCanvas(canvasRef);
    return () => fabricCanvas.current?.dispose();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      {/* Upload background image */}
      <FileUploader
        onFileChange={(file) => addBackgroundImage(file, fabricCanvas.current)}
      />

      {/* Fabric.js canvas */}
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid #ccc", display: "block" }}
      />

      {/* Button to add a name field */}
      <NameFieldButton
        onClick={() => addTextBox(fabricCanvas.current, fontSize, fontColor)}
      />

      {/* Font, color, names input */}
      <ControlsPanel
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontColor={fontColor}
        setFontColor={setFontColor}
        names={names}
        setNames={setNames}
        ChromePicker={ChromePicker}
      />

      {/* Generate Certificates */}
      <button
        onClick={() =>
          generateCertificates(names, fabricCanvas.current, setLoading)
        }
        className="bg-green-600 text-white px-6 py-3 rounded font-bold w-full disabled:opacity-50"
        disabled={!names.trim() || loading}
      >
        {loading ? "Generating..." : "Generate Certificates"}
      </button>
    </div>
  );
}
