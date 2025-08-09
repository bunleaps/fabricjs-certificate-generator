# Certificate Generator

A React + Fabric.js web application built as a **self-learned and self-taught project**.  
This project helped me explore front-end development, canvas manipulation, and batch processing of images — all from scratch through independent learning.

This is a simple web application that allows you to:

- Upload a certificate template
- Add a customizable name field
- Input multiple recipient names
- Generate individual certificate images for each name
- Download all certificates as a ZIP file

---

## ✨ Features

- **Template Upload** – Upload any PNG/JPEG certificate background.
- **Drag & Drop Name Field** – Position and resize the text box directly on the template.
- **Font Customization** – Change font size and color with a live preview.
- **Batch Processing** – Enter a list of names (one per line) to generate all certificates in one go.
- **ZIP Download** – Automatically download all generated certificates in a single `.zip` file.

---

## 🛠 Tech Stack

- **React** – UI components
- **Fabric.js** – Canvas rendering & object manipulation
- **react-color** – Color picker for font customization
- **JSZip** – Creating ZIP archives for download
- **file-saver** – Saving ZIPs to the user's device
- **Next.js Dynamic Imports** – For client-side only components (ChromePicker)

---

## 🖱 Usage

- **Upload Template** – Click the file input and choose your certificate background image.
- **Add Name Field** – Click "Add Name Field" to place a text box; drag and resize it as needed.
- **Font Customize Font** – Use the font size input and color picker to style your text.
- **Enter Names** – Add each recipient name on a new line in the text area.
- **Generate** – Click "Generate Certificates" to download a ZIP with all images.

## ⚠️ Notes

- For best results, use high-resolution templates to avoid blurry outputs.
- The generated images are PNG format with transparent backgrounds outside the certificate area.
- Name text positioning will be applied consistently for all generated certificates.
