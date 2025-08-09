import React from "react";

export default function ControlsPanel({
  fontSize,
  setFontSize,
  fontColor,
  setFontColor,
  names,
  setNames,
  ChromePicker,
}) {
  return (
    <div className="mt-4">
      {/* Font Size */}
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

        {/* Font Color */}
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

      {/* Names input */}
      <div className="mb-4">
        <label className="block mb-2">
          Names (one per line):
          <textarea
            value={names}
            onChange={(e) => setNames(e.target.value)}
            rows={10}
            className="border p-2 w-full"
            placeholder={`John Doe\nJane Smith\n...`}
          />
        </label>
      </div>
    </div>
  );
}
