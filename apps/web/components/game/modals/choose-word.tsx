import { Modal } from "../../ui/Modal";

interface ChooseWordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChooseWordModal({
  onClose,
  isOpen,
}: ChooseWordModalProps) {
  return <Modal isOpen={isOpen} onClose={onClose}></Modal>;
}
