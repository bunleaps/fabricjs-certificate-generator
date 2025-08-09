import { StaticCanvas, FabricImage, Textbox } from "fabric";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function generateCertificates(names, fabricCanvas, setLoading) {
  setLoading(true);
  try {
    const backgroundObject = fabricCanvas.getObjects()[0];
    const textObject = fabricCanvas.getObjects()[1];
    const img = new Image();
    img.src = backgroundObject._element.src;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const nameList = names.split("\n").filter((n) => n.trim());
    const zip = new JSZip();

    for (const name of nameList) {
      const tempCanvas = new StaticCanvas(null, {
        width: fabricCanvas.width,
        height: fabricCanvas.height,
      });

      const bg = new FabricImage(img, {
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
      tempCanvas.add(bg);

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

      const dataURL = tempCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
      });
      const blob = await fetch(dataURL).then((res) => res.blob());
      zip.file(`${name.replace(/\s+/g, "_")}_certificate.png`, blob);
      tempCanvas.dispose();
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "certificates.zip");
  } catch (err) {
    console.error("Error generating certificates:", err);
  } finally {
    setLoading(false);
  }
}
