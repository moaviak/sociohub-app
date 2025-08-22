import React from "react";
import { Image, View } from "react-native";

interface DocumentIconProps {
  filename: string;
  size?: number;
  color?: string;
}

export const DocumentIcon: React.FC<DocumentIconProps> = ({
  filename,
  size = 32,
  color = "#6B7280",
}) => {
  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  const getIconForExtension = (extension: string) => {
    switch (extension) {
      case "pdf":
        return (
          <Image
            source={require("@/assets/icons/PDF.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "doc":
        return (
          <Image
            source={require("@/assets/icons/DOC.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "docx":
        return (
          <Image
            source={require("@/assets/icons/DOCX.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "xls":
      case "xlsx":
        return (
          <Image
            source={require("@/assets/icons/XSL.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "ppt":
      case "pptx":
        return (
          <Image
            source={require("@/assets/icons/PPT.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "txt":
      case "md":
        return (
          <Image
            source={require("@/assets/icons/TXT.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "zip":
      case "7z":
        return (
          <Image
            source={require("@/assets/icons/ZIP.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "ai":
        return (
          <Image
            source={require("@/assets/icons/AI.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "avi":
        return (
          <Image
            source={require("@/assets/icons/AVI.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "bmp":
        return (
          <Image
            source={require("@/assets/icons/BMP.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "crd":
        return (
          <Image
            source={require("@/assets/icons/CRD.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "csv":
        return (
          <Image
            source={require("@/assets/icons/CSV.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "dll":
        return (
          <Image
            source={require("@/assets/icons/DLL.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "dwg":
        return (
          <Image
            source={require("@/assets/icons/DWG.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "eps":
        return (
          <Image
            source={require("@/assets/icons/EPS.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "exe":
        return (
          <Image
            source={require("@/assets/icons/EXE.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "flv":
        return (
          <Image
            source={require("@/assets/icons/FLV.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "giff":
        return (
          <Image
            source={require("@/assets/icons/GIFF.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "html":
        return (
          <Image
            source={require("@/assets/icons/HTML.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "iso":
        return (
          <Image
            source={require("@/assets/icons/ISO.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "java":
        return (
          <Image
            source={require("@/assets/icons/JAVA.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "jpg":
      case "jpeg":
        return (
          <Image
            source={require("@/assets/icons/JPG.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "mdb":
        return (
          <Image
            source={require("@/assets/icons/MDB.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "mid":
        return (
          <Image
            source={require("@/assets/icons/MID.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "mov":
        return (
          <Image
            source={require("@/assets/icons/MOV.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "mp3":
        return (
          <Image
            source={require("@/assets/icons/MP3.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "mp4":
        return (
          <Image
            source={require("@/assets/icons/MP4.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "mpeg":
        return (
          <Image
            source={require("@/assets/icons/MPEG.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "png":
        return (
          <Image
            source={require("@/assets/icons/PNG.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "ps":
        return (
          <Image
            source={require("@/assets/icons/PS.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "psd":
        return (
          <Image
            source={require("@/assets/icons/PSD.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "pub":
        return (
          <Image
            source={require("@/assets/icons/PUB.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "rar":
        return (
          <Image
            source={require("@/assets/icons/RAR.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "raw":
        return (
          <Image
            source={require("@/assets/icons/RAW.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "rss":
        return (
          <Image
            source={require("@/assets/icons/RSS.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "svg":
        return (
          <Image
            source={require("@/assets/icons/SVG.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "tiff":
        return (
          <Image
            source={require("@/assets/icons/PUB.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "wav":
        return (
          <Image
            source={require("@/assets/icons/WAV.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "wma":
        return (
          <Image
            source={require("@/assets/icons/WMA.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      case "xml":
        return (
          <Image
            source={require("@/assets/icons/XML.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
      default:
        return (
          <Image
            source={require("@/assets/icons/FILE.png")}
            resizeMode="contain"
            style={{ width: size, height: size }}
          />
        );
    }
  };

  const extension = getFileExtension(filename);

  return (
    <View className="flex-shrink-0" style={{ flexShrink: 0 }}>
      {getIconForExtension(extension)}
    </View>
  );
};
