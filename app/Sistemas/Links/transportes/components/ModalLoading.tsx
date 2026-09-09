interface ModalLoadingProps {
  show: boolean;
}

const ModalLoading: React.FC<ModalLoadingProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-lg font-semibold">Cargando...</p>
      </div>
    </div>
  );
};

export default ModalLoading;