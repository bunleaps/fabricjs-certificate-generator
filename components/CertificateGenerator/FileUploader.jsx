import React from "react";

export default function FileUploader({ onFileChange }) {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileChange(file);
  };

  return (
    <div className="mb-4">
      <input type="file" accept="image/*" onChange={handleChange} />
    </div>
  );
}
