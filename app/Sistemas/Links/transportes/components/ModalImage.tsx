import { FC } from "react";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  imageUrl: string;
}

const ModalImage: FC<ModalProps> = ({ show, onClose, title, imageUrl }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/80">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-4 relative">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        >
          ✕
        </button>
        <object
          data={imageUrl}
          type="image/jpeg"
          className="w-full h-[70vh] border"
        >
          <p>No se puede mostrar la imagen. <a href={imageUrl} target="_blank">Descargar</a></p>
        </object>
      </div>
    </div>
  );
};

export default ModalImage;
