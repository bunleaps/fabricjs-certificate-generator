import React from "react";

export default function NameFieldButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
    >
      Add Name Field
    </button>
  );
}
