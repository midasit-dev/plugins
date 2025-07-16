import { useState } from "react";

export const useImageUpload = () => {
  const [imageBase64, setImageBase64] = useState<string>("");

  const handleImageSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png";

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImageBase64(result);
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  };

  return {
    imageBase64,
    handleImageSelect,
    setImageBase64,
  };
};
